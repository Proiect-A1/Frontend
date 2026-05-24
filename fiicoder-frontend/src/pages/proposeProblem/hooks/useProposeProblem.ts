import { useCallback, useEffect, useRef, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import {
    proposeProblemService,
    saveDraft,
    loadDraft,
    clearDraft,
} from '../services/proposeProblemService';
import { createProblemZip } from '../utils/zipHelper';
import { ZipImportError } from '../utils/unzipHelper';
import type { ProposeProblemForm, ProblemProposalResponse } from '../types/proposeProblem';

interface ApiError { status: number; body: { message?: string; violations?: { message: string }[] } | null; message: string; }

function isApiError(e: unknown): e is ApiError {
    return typeof e === 'object' && e !== null && 'status' in e;
}

const BACKEND_MSG_MAP: Record<string, string> = {
    'Title is mandatory': 'Titlul este obligatoriu.',
    'Title must not exceed 100 characters': 'Titlul nu poate depăși 100 de caractere.',
    'Description is mandatory': 'Enunțul problemei este obligatoriu.',
    'Difficulty level is mandatory': 'Dificultatea este obligatorie.',
    'Time limit must be at least 0.1 seconds': 'Limita de timp trebuie să fie cel puțin 0.1 secunde.',
    'Time limit must not exceed 30 seconds': 'Limita de timp nu poate depăși 30 de secunde.',
    'Memory limit must be at least 16 MB': 'Limita de memorie trebuie să fie cel puțin 16 MB.',
    'Memory limit must not exceed 1024 MB': 'Limita de memorie nu poate depăși 1024 MB.',
    'Tag title cannot be blank': 'Etichetele nu pot fi goale.',
};

function parseSubmitError(err: unknown): string {
    if (err instanceof TypeError) return 'Eroare de rețea. Verifică conexiunea și încearcă din nou.';
    if (err instanceof Error) return `Eroare la generarea pachetului: ${err.message}`;
    if (!isApiError(err)) return 'Eroare neașteptată. Încearcă din nou.';

    if (err.message === 'ZIP_UPLOAD_FAILED') return 'Eroare la încărcarea arhivei ZIP pe server. URL-ul de upload a expirat sau serverul a refuzat fișierul — încearcă din nou.';

    const backendMsg = err.body?.message ?? '';

    if (err.status === 409) {
        const titleMatch = backendMsg.match(/title\s+(.+?)\s+is already in use/i);
        const title = titleMatch ? `„${titleMatch[1]}"` : 'acest titlu';
        return `Există deja o problemă cu ${title}. Alege un alt titlu.`;
    }
    if (err.status === 400) {
        const violations = err.body?.violations;
        if (violations?.length) return BACKEND_MSG_MAP[violations[0].message] ?? violations[0].message;
        return BACKEND_MSG_MAP[backendMsg] ?? backendMsg ?? 'Datele introduse nu sunt valide. Verifică toate câmpurile.';
    }
    if (err.status === 403) return 'Nu ai permisiunea să propui probleme. Necesită rol de Profesor.';
    if (err.status === 401) return 'Sesiunea a expirat. Autentifică-te din nou.';
    if (err.status === 404) return 'Una sau mai multe etichete selectate nu există pe platformă.';
    if (err.status === 413) return 'Arhiva ZIP depășește limita de dimensiune a serverului.';
    if (err.status === 0 || err.status === undefined) return 'Eroare de rețea. Verifică conexiunea și încearcă din nou.';
    return backendMsg || `Eroare server (${err.status}). Încearcă din nou.`;
}

function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

type UseProposeProblemOptions = {
    proposalId?: string;
    navigate: NavigateFunction;
    methods: UseFormReturn<ProposeProblemForm>;
    defaultValues: ProposeProblemForm;
};

export function useProposeProblem({ proposalId, navigate, methods, defaultValues }: UseProposeProblemOptions) {
    const isEditMode = Boolean(proposalId);

    const [activeTab, setActiveTab] = useState('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [hasDraft, setHasDraft] = useState(false);
    const [showDraftBanner, setShowDraftBanner] = useState(false);
    const [proposals, setProposals] = useState<ProblemProposalResponse[] | null>(null);
    const [loadingProposals, setLoadingProposals] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const draftTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!proposalId) return;

        let cancelled = false;
        setIsLoading(true);

        proposeProblemService
            .getProblemFormDetails(proposalId)
            .then((data) => {
                if (!cancelled) {
                    methods.reset(data);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setSubmitStatus('error');
                    const detail = err instanceof Error ? err.message : parseSubmitError(err);
                    setErrorMessage(`Nu s-a putut încărca propunerea: ${detail}`);
                    toast.error(`Nu s-a putut încărca propunerea: ${detail}`, { duration: 8000 });
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [proposalId, methods]);

    useEffect(() => {
        if (isEditMode) return;

        const draft = loadDraft();
        if (draft && draft.title) {
            setHasDraft(true);
            setShowDraftBanner(true);
        }
    }, [isEditMode]);

    useEffect(() => {
        if (isEditMode) return;

        draftTimerRef.current = setInterval(() => {
            const currentValues = methods.getValues();
            if (currentValues.title || currentValues.statement || currentValues.generatorScript) {
                saveDraft(currentValues);
            }
        }, 30000);

        return () => {
            if (draftTimerRef.current) clearInterval(draftTimerRef.current);
        };
    }, [isEditMode, methods]);

    useEffect(() => {
        let mounted = true;

        async function loadProposals() {
            setLoadingProposals(true);
            try {
                const data = await proposeProblemService.getMyProposals();
                if (mounted) setProposals(data);
            } catch {
                if (mounted) setProposals([]);
            } finally {
                if (mounted) setLoadingProposals(false);
            }
        }

        if (activeTab === 'proposals') {
            void loadProposals();
        }

        return () => {
            mounted = false;
        };
    }, [activeTab]);

    const handleRestoreDraft = useCallback(() => {
        const draft = loadDraft();
        if (draft) {
            methods.reset(draft);
            setShowDraftBanner(false);
        }
    }, [methods]);

    const handleDiscardDraft = useCallback(() => {
        clearDraft();
        setShowDraftBanner(false);
        setHasDraft(false);
    }, []);

    const handleSubmit = useCallback(
        async (data: ProposeProblemForm) => {
            setIsSubmitting(true);
            setSubmitStatus('idle');

            try {
                if (isEditMode && proposalId) {
                    await proposeProblemService.updateProposal(proposalId, data);
                    toast.success('Propunerea a fost actualizată cu succes.');
                } else {
                    await proposeProblemService.submitProposal(data);
                    clearDraft();
                    toast.success('Propunerea a fost trimisă cu succes.');
                }
                setSubmitStatus('success');
            } catch (error) {
                setSubmitStatus('error');
                const message = parseSubmitError(error);
                setErrorMessage(message);
                toast.error(message, { duration: 8000 });
            } finally {
                setIsSubmitting(false);
            }
        },
        [isEditMode, proposalId],
    );

    const handleSaveDraftManual = useCallback(() => {
        saveDraft(methods.getValues());
        setSubmitStatus('idle');
        setErrorMessage('');
    }, [methods]);

    const handleResetForm = useCallback(() => {
        methods.reset(isEditMode ? undefined : defaultValues);
        if (!isEditMode) clearDraft();
    }, [defaultValues, isEditMode, methods]);

    const handleGoToNewProposal = useCallback(() => {
        navigate('/propose');
    }, [navigate]);

    const handleExport = useCallback(async () => {
        try {
            const formData = methods.getValues();
            const blob = await createProblemZip(formData);
            triggerDownload(blob, `${formData.title || 'problem'}.zip`);
        } catch {
            toast.error('Eroare la generarea zip-ului.');
        }
    }, [methods]);

    const handleImport = useCallback(async (file: File) => {
        const MAX_ZIP_MB = 200;
        if (file.size > MAX_ZIP_MB * 1024 * 1024) {
            toast.error(`Arhiva depășește limita de ${MAX_ZIP_MB} MB.`);
            return;
        }

        setIsImporting(true);
        try {
            const [{ extractProblemZipFromBlob }, { tagService }] = await Promise.all([
                import('../utils/unzipHelper'),
                import('../../../services/tagService'),
            ]);
            const availableTags = await tagService.getAllTags().catch(() => null);
            const availableTagTitles = availableTags?.map(t => t.title) ?? undefined;

            const { form, warnings } = await extractProblemZipFromBlob(file, availableTagTitles);
            methods.reset(form);
            toast.success('ZIP importat cu succes.');
            for (const w of warnings) {
                toast.warning(w.message, { duration: 7000 });
            }
        } catch (err) {
            if (err instanceof ZipImportError) {
                toast.error(err.message, { duration: 10000 });
            } else {
                console.error('[handleImport] failed:', err);
                toast.error('Eroare neașteptată la parsarea ZIP-ului.');
            }
        } finally {
            setIsImporting(false);
        }
    }, [methods]);

    return {
        isEditMode,
        activeTab,
        setActiveTab,
        isSubmitting,
        isLoading,
        submitStatus,
        errorMessage,
        hasDraft,
        showDraftBanner,
        handleRestoreDraft,
        handleDiscardDraft,
        handleSubmit,
        handleSaveDraftManual,
        handleResetForm,
        handleGoToNewProposal,
        proposals,
        loadingProposals,
        handleExport,
        handleImport,
        isImporting,
    };
}
