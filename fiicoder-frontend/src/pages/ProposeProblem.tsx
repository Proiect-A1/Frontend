import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { proposeProblemService, saveDraft, loadDraft, clearDraft } from '../services/proposeProblemService';
import type { ProposeProblemForm, ProblemProposalResponse } from '../types/proposeProblem';

import GeneralTab from '../components/ProposeProblem/GeneralTab';
import StatementTab from '../components/ProposeProblem/StatementTab';
import FilesTab from '../components/ProposeProblem/AttachmentsTab';
import TestsTab from '../components/ProposeProblem/TestsTab';
import GeneratorTab from '../components/ProposeProblem/GeneratorTab';
import { pageVariants } from '../utils/motionConfig';
import { useLanguage } from '../language/Language';

const defaultValues: ProposeProblemForm = {
    title: '',
    difficulty: 'medium',
    timeLimit: 1,
    memoryLimit: 256,
    tags: [],
    statement: '',
    sourceUrl: '',
    generatorScript: '',
    tests: [],
    subtasks: [],
    files: [],
    attachments: [],
    visibility: 'private',
    allowedUsers: [],
    allowedGroups: [],
};

const tabs = [
    { id: 'general', labelRO: 'General', labelEN: 'General' },
    { id: 'statement', labelRO: 'Enunț', labelEN: 'Statement' },
    { id: 'files', labelRO: 'Fișiere', labelEN: 'Files' },
    { id: 'tests', labelRO: 'Teste Manuale', labelEN: 'Manual Tests' },
    { id: 'generator', labelRO: 'Script Generator', labelEN: 'Generator Script' },
];

export default function ProposeProblem() {
    const { proposalId } = useParams<{ proposalId?: string }>();
    const navigate = useNavigate();
    const { lang } = useLanguage();

    const isEditMode = Boolean(proposalId);

    const [activeTab, setActiveTab] = useState('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [hasDraft, setHasDraft] = useState(false);
    const [showDraftBanner, setShowDraftBanner] = useState(false);
    const [myProposals, setMyProposals] = useState<ProblemProposalResponse[]>([]);
    const [showMyProposals, setShowMyProposals] = useState(false);
    const [loadingProposals, setLoadingProposals] = useState(false);

    const methods = useForm<ProposeProblemForm>({
        defaultValues,
        mode: 'onChange',
    });

    // ── Load proposal for editing ──
    useEffect(() => {
        if (!proposalId) return;

        let cancelled = false;
        setIsLoading(true);

        proposeProblemService.getProposalForm(proposalId)
            .then((data) => {
                if (!cancelled) {
                    methods.reset(data);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setSubmitStatus('error');
                    setErrorMessage(
                        `Nu s-a putut încărca propunerea: ${err instanceof Error ? err.message : 'Eroare necunoscută'}`
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, [proposalId, methods]);

    // ── Check for saved draft (new proposals only) ──
    useEffect(() => {
        if (isEditMode) return;

        const draft = loadDraft();
        if (draft && draft.title) {
            setHasDraft(true);
            setShowDraftBanner(true);
        }
    }, [isEditMode]);

    // ── Load my proposals list ──
    useEffect(() => {
        if (isEditMode) return;
        setLoadingProposals(true);
        proposeProblemService.getMyProposals(1, 20)
            .then((data) => setMyProposals(data))
            .catch(() => setMyProposals([]))
            .finally(() => setLoadingProposals(false));
    }, [isEditMode]);

    // ── Auto-save draft every 30s (new proposals only) ──
    const draftTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isEditMode) return;

        draftTimerRef.current = setInterval(() => {
            const currentValues = methods.getValues();
            // Only save if user has started filling out the form
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

    // ── Submit / Update ──
    const onSubmit = async (data: ProposeProblemForm) => {
        setIsSubmitting(true);
        setSubmitStatus('idle');
        try {
            if (isEditMode && proposalId) {
                await proposeProblemService.updateProposal(proposalId, data);
            } else {
                await proposeProblemService.submitProposal(data);
                clearDraft();
            }
            setSubmitStatus('success');
        } catch (error) {
            setSubmitStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraftManual = () => {
        saveDraft(methods.getValues());
        // Show brief confirmation
        setSubmitStatus('idle');
        setErrorMessage('');
    };

    if (isLoading) {
        return (
            <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
                <div className="w-full max-w-7xl rounded-2xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm px-5 py-6 md:px-8 md:py-8 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <div className="animate-spin text-3xl">⏳</div>
                        <p className="text-(--text-muted)">Se încarcă propunerea...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
            <motion.div
                className="w-full max-w-7xl rounded-2xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm px-5 py-6 md:px-8 md:py-8 h-auto overflow-visible xl:h-full xl:overflow-y-auto custom-scrollbar"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Edit Mode Banner */}
                {isEditMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-xl border border-blue-500/30 bg-blue-950/20 flex items-center justify-between flex-wrap gap-2"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-blue-400 text-lg">✏️</span>
                            <div>
                                <p className="text-sm text-blue-300 font-semibold">Mod editare</p>
                                <p className="text-xs text-blue-400/70">
                                    Editezi propunerea <span className="font-mono">{proposalId}</span>. Modificările vor crea o versiune nouă.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/propose')}
                            className="text-xs px-3 py-1 rounded-lg border border-blue-500/30 text-blue-300 hover:bg-blue-500/15 transition-colors"
                        >
                            ← Propunere Nouă
                        </button>
                    </motion.div>
                )}

                {/* Draft Banner */}
                <AnimatePresence>
                    {!isEditMode && showDraftBanner && hasDraft && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 overflow-hidden"
                        >
                            <div className="p-3 rounded-xl border border-yellow-500/30 bg-yellow-950/15 flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-400 text-lg">📝</span>
                                    <p className="text-sm text-yellow-300">
                                        Ai o ciornă salvată. Vrei să o restaurezi?
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleRestoreDraft}
                                        className="text-xs px-3 py-1 rounded-lg border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/15 transition-colors font-semibold"
                                    >
                                        ✓ Restaurează
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDiscardDraft}
                                        className="text-xs px-3 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/15 transition-colors"
                                    >
                                        ✗ Renunță
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-(--text-h)">
                            {isEditMode ? 'Editează Propunerea' : 'Propune o Problemă'}
                        </h1>
                        {/* My Proposals toggle (new mode only) */}
                        {!isEditMode && (
                            <button
                                type="button"
                                onClick={() => setShowMyProposals(!showMyProposals)}
                                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-semibold border border-(--accent)/40 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors text-(--text-h)"
                            >
                                📋 Propunerile Mele
                                {myProposals.length > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-(--accent)/25 text-[10px]">
                                        {myProposals.length}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const baseClasses =
                                'px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center cursor-pointer outline-none';

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${baseClasses} ${
                                        isActive
                                            ? 'bg-(--accent)/25 border-(--accent) text-(--text-h)'
                                            : 'bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) hover:-translate-y-0.5'
                                    }`}
                                >
                                    {lang === 'RO' ? tab.labelRO : tab.labelEN}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="page-line-horizontal mb-6" />

                {/* My Proposals Panel */}
                <AnimatePresence>
                    {!isEditMode && showMyProposals && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="rounded-xl border border-(--accent)/25 overflow-hidden">
                                <div className="px-4 py-2.5 bg-(--surface-muted) border-b border-(--accent)/15 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-(--text-h)">📋 Propunerile Mele</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowMyProposals(false)}
                                        className="text-xs text-(--text-muted) hover:text-(--text-h) transition-colors"
                                    >✕ Închide</button>
                                </div>

                                {loadingProposals ? (
                                    <div className="p-6 text-center text-(--text-muted) text-sm">Se încarcă...</div>
                                ) : myProposals.length === 0 ? (
                                    <div className="p-6 text-center text-(--text-muted) text-sm italic">Nu ai propuneri anterioare.</div>
                                ) : (
                                    <div className="divide-y divide-(--accent)/10">
                                        {myProposals.map((p) => (
                                            <div
                                                key={p.id}
                                                className="flex items-center justify-between px-4 py-2.5 hover:bg-(--accent)/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className={`shrink-0 w-2 h-2 rounded-full ${
                                                        p.status === 'approved' ? 'bg-green-400' :
                                                        p.status === 'rejected' ? 'bg-red-400' : 'bg-yellow-400'
                                                    }`} />
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-(--text) truncate font-semibold">{p.title}</p>
                                                        <p className="text-xs text-(--text-muted)">
                                                            {p.status === 'approved' ? '✓ Aprobată' :
                                                             p.status === 'rejected' ? '✗ Respinsă' : '⏳ În așteptare'}
                                                            {' · '}
                                                            {new Date(p.submittedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/propose/${p.id}`)}
                                                    className="shrink-0 text-xs px-3 py-1 rounded-lg border border-(--accent)/30 text-(--text-h) hover:bg-(--accent)/15 transition-colors font-semibold"
                                                >
                                                    ✏️ Editează
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl border border-green-500/30 bg-green-950/20"
                    >
                        <p className="text-sm text-green-400 font-semibold">
                            ✓ {isEditMode
                                ? 'Propunerea a fost actualizată cu succes!'
                                : 'Propunerea ta a fost trimisă cu succes! Vei fi notificat când va fi revizuită.'}
                        </p>
                    </motion.div>
                )}
                {submitStatus === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-950/20"
                    >
                        <p className="text-sm text-red-400">✗ {errorMessage}</p>
                    </motion.div>
                )}

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Tabs Content */}
                        <div>
                            {activeTab === 'general' && <GeneralTab />}
                            {activeTab === 'statement' && <StatementTab />}
                            {activeTab === 'files' && <FilesTab />}
                            {activeTab === 'tests' && <TestsTab />}
                            {activeTab === 'generator' && <GeneratorTab />}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end pt-3 flex-wrap">
                            {/* Save Draft (new only) */}
                            {!isEditMode && (
                                <button
                                    type="button"
                                    onClick={handleSaveDraftManual}
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/30 text-(--text-muted) hover:bg-(--accent)/10 transition-colors"
                                >
                                    💾 Salvează Ciornă
                                </button>
                            )}

                            {/* Reset */}
                            <button
                                type="button"
                                onClick={() => {
                                    methods.reset(isEditMode ? undefined : defaultValues);
                                    if (!isEditMode) clearDraft();
                                }}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                            >
                                Resetează
                            </button>

                            {/* Submit / Update */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? 'Se trimite...'
                                    : isEditMode
                                      ? '📤 Actualizează Propunerea'
                                      : '📤 Trimite Propunere'}
                            </button>
                        </div>
                    </form>
                </FormProvider>
            </motion.div>
        </div>
    );
}
