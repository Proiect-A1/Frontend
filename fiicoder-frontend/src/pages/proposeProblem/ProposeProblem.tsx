import { useForm, FormProvider } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProposeProblemForm } from './types/proposeProblem';
import GeneralTab from './components/GeneralTab';
import StatementTab from './components/StatementTab';
import FilesTab from './components/AttachmentsTab';
import TestsTab from './components/TestsTab';
import GeneratorTab from './components/GeneratorTab';
import { pageVariants } from '../../utils/motionConfig';
import { useLanguage } from '../../language/Language';
import { useProposeProblem } from './hooks/useProposeProblem';

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
] as const;

export default function ProposeProblem() {
    const { proposalId } = useParams<{ proposalId?: string }>();
    const navigate = useNavigate();
    const { lang } = useLanguage();

    const methods = useForm<ProposeProblemForm>({
        defaultValues,
        mode: 'onChange',
    });

    const {
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
    } = useProposeProblem({
        proposalId,
        navigate,
        methods,
        defaultValues,
    });

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
            <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
                <motion.div
                    className="w-full max-w-7xl rounded-3xl border-2 border-(--accent) bg-(--surface-card) h-full flex overflow-hidden relative"
                    initial="hidden"
                    animate="visible"
                    variants={pageVariants}
                >
                    <form onSubmit={methods.handleSubmit(handleSubmit)} className="flex-1 h-full flex flex-col overflow-hidden relative">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8">
                            <div className="w-full">
                                {isEditMode && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{ borderColor: 'var(--status-info)', backgroundColor: 'var(--status-info-bg)' }}
                                        className="mb-4 p-3 rounded-2xl border flex items-center justify-between flex-wrap gap-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div style={{ backgroundColor: 'color-mix(in srgb, var(--status-info) 20%, transparent)', color: 'var(--status-info)' }} className="w-8 h-8 flex items-center justify-center rounded-lg">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: 'var(--status-info)' }}>Mod editare</p>
                                                <p className="text-xs" style={{ color: 'var(--status-info)', opacity: 0.8 }}>Editezi problema {proposalId}. Salvările vor trimite un nou pachet.</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => navigate('/propose')} style={{ borderColor: 'var(--status-info)', color: 'var(--status-info)' }} className="text-xs px-3 py-1 rounded-2xl border hover:bg-black/5 transition-colors">
                                            ← Propunere Nouă
                                        </button>
                                    </motion.div>
                                )}

                                <AnimatePresence>
                                    {!isEditMode && showDraftBanner && hasDraft && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                                            <div style={{ borderColor: 'var(--status-warning)', backgroundColor: 'var(--status-warning-bg)' }} className="p-3 rounded-2xl border flex items-center justify-between flex-wrap gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div style={{ backgroundColor: 'color-mix(in srgb, var(--status-warning) 20%, transparent)', color: 'var(--status-warning)' }} className="w-8 h-8 flex items-center justify-center rounded-lg">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    </div>
                                                    <p className="text-sm" style={{ color: 'var(--status-warning)' }}>
                                                        Ai o ciornă salvată. Vrei să o restaurezi?
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={handleRestoreDraft} style={{ borderColor: 'var(--status-warning)', color: 'var(--status-warning)' }} className="text-xs px-3 py-1 rounded-2xl border hover:bg-black/5 transition-colors font-semibold">
                                                        ✓ Restaurează
                                                    </button>
                                                    <button type="button" onClick={handleDiscardDraft} style={{ borderColor: 'var(--status-error)', color: 'var(--status-error)' }} className="text-xs px-3 py-1 rounded-2xl border hover:bg-black/5 transition-colors">
                                                        ✗ Renunță
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                                    <h1 className="text-3xl font-bold text-(--text-h)">{isEditMode ? 'Editează Propunerea' : 'Propune o Problemă'}</h1>
                                    <div className="flex flex-wrap gap-2 lg:justify-end">
                                        {tabs.map((tab) => {
                                            const isActive = activeTab === tab.id;
                                            const baseClasses = 'px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center cursor-pointer outline-none';
                                            return (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`${baseClasses} ${isActive ? 'bg-(--accent)/25 border-(--accent) text-(--text-h)' : 'bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) hover:-translate-y-0.5'}`}
                                                >
                                                    {lang === 'RO' ? tab.labelRO : tab.labelEN}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="page-line-horizontal mb-6" />

                                {submitStatus === 'success' && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ borderColor: 'var(--status-success)', backgroundColor: 'var(--status-success-bg)' }} className="mb-6 p-4 rounded-2xl border">
                                        <p className="text-sm font-semibold" style={{ color: 'var(--status-success)' }}>
                                            ✓ {isEditMode ? 'Propunerea a fost actualizată cu succes!' : 'Propunerea ta a fost trimisă cu succes! Vei fi notificat când va fi revizuită.'}
                                        </p>
                                    </motion.div>
                                )}

                                {submitStatus === 'error' && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ borderColor: 'var(--status-error)', backgroundColor: 'var(--status-error-bg)' }} className="mb-6 p-4 rounded-2xl border-2">
                                        <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--status-error)' }}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {errorMessage}
                                        </p>
                                    </motion.div>
                                )}

                                <div className="w-full space-y-6 pb-12">
                                    {activeTab === 'general' && <GeneralTab />}
                                    {activeTab === 'statement' && <StatementTab />}
                                    {activeTab === 'files' && <FilesTab />}
                                    {activeTab === 'tests' && <TestsTab />}
                                    {activeTab === 'generator' && <GeneratorTab />}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 md:px-8 rounded-b-2xl flex gap-3 justify-end flex-wrap z-10">
                            {!isEditMode && (
                                <button type="button" onClick={handleSaveDraftManual} className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                    Salvează Ciornă
                                </button>
                            )}

                            <button type="button" onClick={handleResetForm} className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors">
                                Resetează
                            </button>

                            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors">
                                {isSubmitting ? <div className="w-4 h-4 border-2 border-(--text-h) border-t-transparent rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                                {isSubmitting ? 'Se trimite...' : isEditMode ? 'Actualizează Propunerea' : 'Trimite Propunere'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </FormProvider>
    );
}

