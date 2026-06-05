import { useForm, FormProvider } from 'react-hook-form';
import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProposeProblemForm } from './types/proposeProblem';
import GeneralTab from './components/GeneralTab';
import StatementTab from './components/StatementTab';
import FilesTab from './components/AttachmentsTab';
import TestsTab from './components/TestsTab';
import GeneratorTab from './components/GeneratorTab';
import { pageVariants } from '../../utils/motionConfig';
import { useLanguage, useT, getEditModeDesc } from '../../language/Language';
import { useProposeProblem } from './hooks/useProposeProblem';
import ZipFormatModal from './components/ZipFormatModal';

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
};

const tabs = [
    { id: 'general', fields: ['title', 'difficulty', 'timeLimit', 'memoryLimit', 'tags', 'visibility'] as const },
    { id: 'statement', fields: ['statement'] as const },
    { id: 'files', fields: ['files', 'attachments'] as const },
    { id: 'tests', fields: ['tests', 'subtasks'] as const },
    { id: 'generator', fields: ['generatorScript'] as const },
] as const;

export default function ProposeProblem() {
    const { proposalId } = useParams<{ proposalId?: string }>();
    const navigate = useNavigate();
    const { lang } = useLanguage();
    const t = useT();

    const tabLabels: Record<string, string> = {
        general: t.proposeTabGeneral,
        statement: t.proposeTabStatement,
        files: t.proposeTabFiles,
        tests: t.proposeTabTests,
        generator: t.proposeTabGenerator,
    };

    const methods = useForm<ProposeProblemForm>({
        defaultValues,
        mode: 'onChange',
    });

    const importInputRef = useRef<HTMLInputElement>(null);

    const {
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
        handleResetForm,
        handleExport,
        handleImport,
        isImporting,
    } = useProposeProblem({
        proposalId,
        navigate,
        methods,
        defaultValues,
    });

    if (isLoading) {
        return (
                <div className="w-full max-w-7xl mx-auto rounded-2xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm px-5 py-6 md:px-8 md:py-8 flex items-center justify-center xl:flex-1 xl:min-h-0">
                    <div className="text-center space-y-3">
                        <div className="flex justify-center">
                            <svg className="animate-spin h-8 w-8 text-(--accent)" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <p className="text-(--text-muted) font-medium">{t.proposeLoading}</p>
                    </div>
                </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <motion.div
                className="w-full max-w-7xl mx-auto rounded-3xl border-2 border-(--accent) bg-(--surface-card) card-glow xl:flex-1 xl:min-h-0 h-full flex overflow-hidden relative"
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
                                                <p className="text-sm font-semibold" style={{ color: 'var(--status-info)' }}>{t.proposeEditMode}</p>
                                                <p className="text-xs" style={{ color: 'var(--status-info)', opacity: 0.8 }}>{getEditModeDesc(lang, proposalId ?? '')}</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => navigate('/propose')} style={{ borderColor: 'var(--status-info)', color: 'var(--status-info)' }} className="text-xs px-3 py-1 rounded-2xl border hover:bg-black/5 transition-colors">
                                            {t.proposeNewProposal}
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
                                                        {t.proposeDraftBanner}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={handleRestoreDraft} style={{ borderColor: 'var(--status-warning)', color: 'var(--status-warning)' }} className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-2xl border hover:bg-black/5 transition-colors font-semibold">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                        {t.proposeDraftRestore}
                                                    </button>
                                                    <button type="button" onClick={handleDiscardDraft} style={{ borderColor: 'var(--status-error)', color: 'var(--status-error)' }} className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-2xl border hover:bg-black/5 transition-colors">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        {t.proposeDraftDiscard}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div
                                    style={{
                                        borderColor: 'var(--status-warning)',
                                        backgroundColor: 'var(--status-warning-bg)',
                                    }}
                                    className="mb-4 p-3 rounded-2xl border text-xs leading-relaxed"
                                >
                                    <p style={{ color: 'var(--status-warning)' }}>
                                        {lang === 'RO' ? (
                                            <>
                                                <span className="font-bold">Notă:</span> la trimitere
                                                se face o verificare automată. Dacă fișierele nu sunt
                                                aranjate corect (vezi formatul ZIP), propunerea va fi
                                                <span className="font-bold"> respinsă automat</span>.
                                                După verificare, problema mai are nevoie de
                                                <span className="font-bold"> aprobarea unui admin</span>.
                                                {isEditMode && (
                                                    <> La editare, modificările doar de metadate se
                                                    aplică imediat; dacă schimbi fișierele, problema
                                                    trece din nou prin verificarea automată.</>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <span className="font-bold">Note:</span> submission
                                                triggers an automated check. If files are not arranged
                                                correctly (see the ZIP format), the proposal is
                                                <span className="font-bold"> auto-rejected</span>.
                                                After the check, the problem still needs
                                                <span className="font-bold"> admin approval</span>.
                                                {isEditMode && (
                                                    <> When editing, metadata-only changes apply
                                                    immediately; changing the files sends the problem
                                                    back through automated verification.</>
                                                )}
                                            </>
                                        )}
                                    </p>
                                </div>

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                                    <h1 className="text-3xl font-bold text-(--text-h)">{isEditMode ? t.proposeEditTitle : t.proposePageTitle}</h1>
                                    <div className="flex flex-wrap gap-2 lg:justify-end">
                                        {tabs.map((tab) => {
                                            const isActive = activeTab === tab.id;
                                            const hasError = tab.fields.some(f => f in methods.formState.errors);
                                            const baseClasses = 'relative px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center gap-1.5 cursor-pointer outline-none';
                                            return (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`${baseClasses} ${isActive ? 'bg-(--accent)/25 border-(--accent) text-(--text-h)' : 'bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) hover:-translate-y-0.5'}`}
                                                >
                                                    {tabLabels[tab.id]}
                                                    {hasError && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" aria-label="errors" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="page-line-horizontal mb-6" />

                                {(submitStatus === 'success' || submitStatus === 'checked') && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ borderColor: 'var(--status-success)', backgroundColor: 'var(--status-success-bg)' }} className="mb-6 p-4 rounded-2xl border">
                                        <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--status-success)' }}>
                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                            {isEditMode
                                                ? t.proposeSuccessUpdated
                                                : submitStatus === 'checked'
                                                  ? t.proposeSuccessChecked
                                                  : t.proposeSuccessSubmitted}
                                        </p>
                                    </motion.div>
                                )}

                                {submitStatus === 'pending-review' && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ borderColor: 'var(--status-info)', backgroundColor: 'var(--status-info-bg)' }} className="mb-6 p-4 rounded-2xl border">
                                        <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--status-info)' }}>
                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {t.proposePendingReview}
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

                                {isSubmitting && submitPhase === 'verifying' && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ borderColor: 'var(--status-info)', backgroundColor: 'var(--status-info-bg)' }} className="mb-6 p-4 rounded-2xl border">
                                        <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--status-info)' }}>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                            {t.proposeVerifying}
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

                        <div className="px-6 py-4 md:px-8 rounded-b-2xl flex items-center gap-3 justify-end flex-wrap z-10">
                            <input
                                ref={importInputRef}
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImport(file);
                                    e.target.value = '';
                                }}
                            />

                            <ZipFormatModal onNavigateToGeneratorDocs={() => setActiveTab('generator')} />
                            <button type="button" onClick={() => importInputRef.current?.click()} disabled={isImporting} className="inline-flex items-center gap-1.5 justify-center px-3 py-1.5 text-sm rounded-full font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors disabled:opacity-50">
                                {isImporting
                                    ? <div className="w-4 h-4 border-2 border-(--text-h) border-t-transparent rounded-full animate-spin" />
                                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                }
                                {isImporting ? t.proposeImporting : t.proposeImportZip}
                            </button>

                            <button type="button" onClick={handleExport} className="inline-flex items-center gap-1.5 justify-center px-3 py-1.5 text-sm rounded-full font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                {t.proposeExportZip}
                            </button>

                            <button type="button" onClick={handleResetForm} className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors">
                                {t.proposeReset}
                            </button>

                            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors">
                                {isSubmitting ? <div className="w-4 h-4 border-2 border-(--text-h) border-t-transparent rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                                {isSubmitting ? t.proposeSubmitting : isEditMode ? t.proposeUpdateBtn : t.proposeSubmitBtn}
                            </button>
                        </div>
                    </form>
                </motion.div>
        </FormProvider>
    );
}
