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
import type { ProposeProblemForm } from '../types/proposeProblem';
import { validateGeneratorScript } from '../utils/generatorValidator';
import { useTabParam } from '../../../hooks/useTabParam';
import { useT } from '../../../language/Language';

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

    // Check the api-error shape (status/body) before the generic Error branch:
    // apiClient now rejects with ApiError, which is itself an Error, so the
    // structural check must come first to keep the status-specific messages.
    if (isApiError(err)) {
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

    if (err instanceof Error) return `Eroare la generarea pachetului: ${err.message}`;
    return 'Eroare neașteptată. Încearcă din nou.';
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
    const t = useT();

    const [activeTab, setActiveTab] = useTabParam('general', {
        validValues: ['general', 'statement', 'files', 'tests', 'generator'],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'pending-review' | 'checked'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [submitPhase, setSubmitPhase] = useState<'idle' | 'uploading' | 'verifying'>('idle');
    const [hasDraft, setHasDraft] = useState(false);
    const [showDraftBanner, setShowDraftBanner] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const draftTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // Snapshot of the proposal as loaded, used to diff metadata vs file changes
    // when saving an edit.
    const originalFormRef = useRef<ProposeProblemForm | null>(null);

    useEffect(() => {
        if (!proposalId) return;

        let cancelled = false;
        setIsLoading(true);

        proposeProblemService
            .getProblemFormDetails(proposalId)
            .then((data) => {
                if (!cancelled) {
                    methods.reset(data);
                    originalFormRef.current = data;
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
            setSubmitPhase('uploading');

            // Validate generator script before any network calls.
            if (!data.generatorScript?.trim()) {
                setActiveTab('generator');
                const msg = t.generatorScriptEmpty;
                setSubmitStatus('error');
                setErrorMessage(msg);
                methods.setError('generatorScript', { type: 'required', message: msg });
                toast.error(msg, { duration: 8000 });
                setIsSubmitting(false);
                setSubmitPhase('idle');
                return;
            }
            const genResult = validateGeneratorScript(data.generatorScript);
            if (!genResult.valid) {
                setActiveTab('generator');
                const count = genResult.errors.length;
                const preview = genResult.errors
                    .slice(0, 3)
                    .map(e => `• L${e.line}:${e.col} — ${e.message}`)
                    .join('\n');
                const suffix = count > 3 ? `\n... și încă ${count - 3} ${count - 3 === 1 ? 'eroare' : 'erori'}` : '';
                const summary = `Scriptul de generare are ${count} ${count === 1 ? 'eroare' : 'erori'}. Corectează-le înainte de a trimite.`;
                setSubmitStatus('error');
                setErrorMessage(summary);
                toast.error(summary, {
                    description: preview + suffix,
                    duration: 10000,
                });
                setIsSubmitting(false);
                setSubmitPhase('idle');
                return;
            }

            try {
                if (isEditMode && proposalId) {
                    const original = originalFormRef.current;

                    // Warn if a file-change edit would silently reset a non-private visibility.
                    if (original && original.visibility !== 'private') {
                        const filesChanged =
                            JSON.stringify(data.files) !== JSON.stringify(original.files) ||
                            JSON.stringify(data.tests) !== JSON.stringify(original.tests) ||
                            data.generatorScript !== original.generatorScript;
                        if (filesChanged) {
                            toast.warning(
                                'Vizibilitatea problemei va fi resetată la Privat după re-verificare.',
                                { duration: 7000 },
                            );
                        }
                    }

                    if (!original) {
                        const msg = 'Propunerea originală nu este încărcată. Reîncarcă pagina și încearcă din nou.';
                        setSubmitStatus('error');
                        setErrorMessage(msg);
                        toast.error(msg, { duration: 8000 });
                        return;
                    }

                    const result = await proposeProblemService.updateProposal(proposalId, data, original);
                    // Diff future edits against the state we just saved.
                    originalFormRef.current = data;

                    if (result.status === 'rejected') {
                        setSubmitStatus('error');
                        const msg = 'Versiunea editată a fost respinsă automat la verificare. Verifică structura fișierelor din ZIP și încearcă din nou.';
                        setErrorMessage(msg);
                        toast.error(msg, { duration: 10000 });
                    } else if (result.status === 'pending') {
                        setSubmitStatus('pending-review');
                        toast.info(
                            'Modificările au fost trimise. Verificarea automată e încă în curs — vezi „Propunerile mele" peste câteva momente.',
                            { duration: 9000 },
                        );
                    } else {
                        setSubmitStatus('success');
                        toast.success('Propunerea a fost actualizată cu succes.');
                    }
                } else {
                    setSubmitPhase('verifying');
                    const result = await proposeProblemService.submitProposal(data);
                    clearDraft();

                    if (result.status === 'rejected') {
                        setSubmitStatus('error');
                        const msg = 'Propunerea a fost respinsă automat la verificare. Verifică structura fișierelor din ZIP și încearcă din nou.';
                        setErrorMessage(msg);
                        toast.error(msg, { duration: 10000 });
                    } else if (result.status === 'checked' || result.status === 'approved') {
                        setSubmitStatus('checked');
                        toast.success('Propunere verificată automat! Așteaptă aprobarea unui admin.', { duration: 8000 });
                    } else {
                        // still 'pending' after polling timed out
                        setSubmitStatus('pending-review');
                        toast.info(
                            'Propunerea a fost trimisă. Verificarea automată e încă în curs — vezi „Propunerile mele" peste câteva momente.',
                            { duration: 9000 },
                        );
                    }
                }
            } catch (error) {
                if (isApiError(error) && error.message === 'NO_CHANGES') {
                    setSubmitStatus('idle');
                    setErrorMessage('');
                    toast.info('Nu ai modificat nimic — nu este nimic de salvat.');
                    return;
                }
                setSubmitStatus('error');
                const message = parseSubmitError(error);
                setErrorMessage(message);
                toast.error(message, { duration: 8000 });
            } finally {
                setIsSubmitting(false);
                setSubmitPhase('idle');
            }
        },
        [isEditMode, proposalId, setActiveTab],
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
        submitPhase,
        errorMessage,
        hasDraft,
        showDraftBanner,
        handleRestoreDraft,
        handleDiscardDraft,
        handleSubmit,
        handleSaveDraftManual,
        handleResetForm,
        handleGoToNewProposal,
        handleExport,
        handleImport,
        isImporting,
    };
}
