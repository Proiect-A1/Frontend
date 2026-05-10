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
    isInteractive: false,
    tags: [],
    statement: '',
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
    const [showSidebar, setShowSidebar] = useState(false);
    const [myProposals, setMyProposals] = useState<ProblemProposalResponse[]>([]);
    const [isLoadingProposals, setIsLoadingProposals] = useState(false);

    const methods = useForm<ProposeProblemForm>({
        defaultValues,
        mode: 'onChange',
    });

    // ── Load proposal for editing ──
    useEffect(() => {
        if (!proposalId) return;

        let cancelled = false;
        setIsLoading(true);

        proposeProblemService.getProblemFormDetails(proposalId)
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
    // Fetch my proposals on mount
    useEffect(() => {
        const fetchProposals = async () => {
            setIsLoadingProposals(true);
            try {
                const data = await proposeProblemService.getMyProposals();
                setMyProposals(data);
            } catch (err) {
                console.error("Failed to fetch proposals", err);
            } finally {
                setIsLoadingProposals(false);
            }
        };
        fetchProposals();
    }, []);

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
                        <div className="flex justify-center">
                            <svg className="animate-spin h-8 w-8 text-(--accent)" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <p className="text-(--text-muted) font-medium">Se încarcă propunerea...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <div className="w-full flex justify-center h-full xl:flex-1 xl:min-h-0 p-4 md:p-6">
                <motion.div
                    className="w-full max-w-7xl rounded-2xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm h-full flex overflow-hidden relative shadow-2xl"
                    initial="hidden"
                    animate="visible"
                    variants={pageVariants}
                >
                    {/* Floating Sidebar (Overlay) */}
                    <AnimatePresence>
                        {showSidebar && (
                            <>
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowSidebar(false)}
                                    className="absolute inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                                />
                                <motion.aside
                                    initial={{ x: -340, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -340, opacity: 0 }}
                                    className="absolute z-50 left-0 top-0 w-80 h-full bg-(--surface-card) border-r-2 border-(--accent) flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.3)]"
                                >
                                    <div className="p-4 border-b-2 border-(--accent)/20 flex items-center justify-between">
                                        <h3 className="font-bold text-(--text-h) flex items-center gap-2">
                                            <svg className="w-4 h-4 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                            Propunerile mele
                                        </h3>
                                        <button 
                                            onClick={() => setShowSidebar(false)}
                                            className="p-1.5 hover:bg-(--accent)/10 rounded-lg text-(--text-muted) transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                        {isLoadingProposals ? (
                                            <div className="p-8 flex flex-col items-center gap-2 text-(--text-muted) text-sm">
                                                <div className="w-5 h-5 border-2 border-(--accent) border-t-transparent rounded-full animate-spin" />
                                                <span>Se încarcă...</span>
                                            </div>
                                        ) : myProposals.length === 0 ? (
                                            <div className="p-8 text-center text-(--text-muted) text-sm">
                                                Nicio propunere găsită.
                                            </div>
                                        ) : (
                                            myProposals.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => {
                                                        navigate(`/propose/${p.id}`);
                                                        setShowSidebar(false);
                                                    }}
                                                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                                                        proposalId === p.id 
                                                        ? 'border-(--accent) bg-(--accent)/10' 
                                                        : 'border-transparent bg-(--surface-muted)/50 hover:border-(--accent)/30 hover:bg-(--accent)/5'
                                                    }`}
                                                >
                                                    <div className="font-bold text-sm text-(--text-h) truncate">{p.title}</div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border uppercase tracking-wider font-bold ${
                                                            p.status === 'approved' ? 'border-green-500/40 text-green-400 bg-green-500/5' :
                                                            p.status === 'rejected' ? 'border-red-500/40 text-red-400 bg-red-500/5' :
                                                            'border-amber-500/40 text-amber-400 bg-amber-500/5'
                                                        }`}>
                                                            {p.status}
                                                        </span>
                                                        <span className="text-[10px] text-(--text-muted)">
                                                            {new Date(p.submittedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </motion.aside>
                            </>
                        )}
                    </AnimatePresence>

                    <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-5 md:p-8">
                        <div className="w-full">
                            {/* Edit Mode Banner */}
                            {isEditMode && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 rounded-xl border border-blue-500/30 bg-blue-950/20 flex items-center justify-between flex-wrap gap-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-300">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-blue-300">Mod editare</p>
                                            <p className="text-xs text-blue-400/70">Editezi problema {proposalId}. Salvările vor trimite un nou pachet.</p>
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
                                                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-yellow-500/20 text-yellow-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </div>
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
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowSidebar(!showSidebar)}
                                        className={`p-2.5 rounded-xl border-2 transition-all ${
                                            showSidebar 
                                            ? 'bg-(--accent) text-white border-(--accent)' 
                                            : 'bg-(--accent)/10 border-(--accent)/20 text-(--accent) hover:bg-(--accent)/20'
                                        }`}
                                        title={showSidebar ? "Ascunde propunerile" : "Vezi propunerile mele"}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    </button>
                                    <h1 className="text-3xl font-bold text-(--text-h)">
                                        {isEditMode ? 'Editează Propunerea' : 'Propune o Problemă'}
                                    </h1>
                                </div>

                                {/* Tabs Navigation */}
                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                    {tabs.map((tab) => {
                                        const isActive = activeTab === tab.id;
                                    const baseClasses =
                                        'px-4 py-2 rounded-full text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center cursor-pointer outline-none';

                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
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

                            {/* Status Messages */}
                            {submitStatus === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 rounded-xl border-2 border-green-500/30 bg-green-950/20"
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
                                    className="mb-6 p-4 rounded-xl border-2 border-red-500/30 bg-red-950/20"
                                >
                                    <p className="text-sm text-red-400 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {errorMessage}
                                    </p>
                                </motion.div>
                            )}

                            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Tabs Content */}
                                <div className="w-full">
                                    {activeTab === 'general' && <GeneralTab />}
                                    {activeTab === 'statement' && <StatementTab />}
                                    {activeTab === 'files' && <FilesTab />}
                                    {activeTab === 'tests' && <TestsTab />}
                                    {activeTab === 'generator' && <GeneratorTab />}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 justify-end pt-3 flex-wrap">
                                    {!isEditMode && (
                                        <button
                                            type="button"
                                            onClick={handleSaveDraftManual}
                                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/30 text-(--text-muted) hover:bg-(--accent)/10 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                            Salvează Ciornă
                                        </button>
                                    )}

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

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-4 h-4 border-2 border-(--text) border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        )}
                                        {isSubmitting
                                            ? 'Se trimite...'
                                            : isEditMode
                                              ? 'Actualizează Propunerea'
                                              : 'Trimite Propunere'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </FormProvider>
    );
}
