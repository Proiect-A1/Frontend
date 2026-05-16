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
import type { ProposeProblemForm, ProblemProposalResponse } from '../types/proposeProblem';

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
                    setErrorMessage(
                        `Nu s-a putut încărca propunerea: ${err instanceof Error ? err.message : 'Eroare necunoscută'}`,
                    );
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
                const message = error instanceof Error ? error.message : 'An error occurred';
                setErrorMessage(message);
                toast.error(message);
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
    };
}
