import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import * as FlexLayout from 'flexlayout-react';
import DescriptionPanel from './components/DescriptionPanel';
import EditorPanel from './components/EditorPanel';
import TestResultPanel from './components/TestResultPanel';
import SubmissionsPanel from './components/SubmissionsPanel';
import SubmissionDetailModal from './components/SubmissionDetailModal';
import ToolbarPanel from './components/ToolbarPanel';
import 'flexlayout-react/style/dark.css';
import { useProblemDetails } from './hooks/useProblemDetails';
import type { ProblemSubmissionDTO } from './types/problemDetails';

/** Tracks whether the viewport is >= 1280px (xl breakpoint).
 *  Uses MediaQueryList — no polling, instant on resize. */
function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches,
    );
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1280px)');
        const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    return isDesktop;
}

export default function ProblemDetails() {
    const isDesktop = useIsDesktop();
    const [selectedSubmission, setSelectedSubmission] = useState<ProblemSubmissionDTO | null>(null);

    const {
        lang,
        t,
        isAuthenticated,
        problem,
        loading,
        error,
        language,
        setLanguage,
        isOpen,
        setIsOpen,
        status,
        availableLanguages,
        setSelectedLanguageId,
        recentSubmissions,
        activeTab,
        setActiveTab,
        evalTests,
        evalSubtasks,
        evalSummary,
        evalStatus,
        evalError,
        processedDescription,
        model,
        handleCodeChange,
        handleEditorMount,
        handleSubmit,
        handleLayoutAction,
        handleLayoutSave,
        resetLayout,
        problemTests,
        codeRef,
    } = useProblemDetails();

    // Open latest submission modal directly (toolbar shortcut)
    const handleGoToLastSubmission = useCallback(() => {
        const latest = recentSubmissions
            .slice()
            .sort((a, b) => new Date(b.submissiondate).getTime() - new Date(a.submissiondate).getTime())[0];
        if (latest) {
            setSelectedSubmission(latest);
            return;
        }
        // No submissions yet — fall back to switching tab so the user sees the empty state
        setActiveTab('submissions');
        const traverse = (node: FlexLayout.Node): string | undefined => {
            if (node.getType() === 'tab' && (node as FlexLayout.TabNode).getComponent() === 'submissions') {
                return node.getId();
            }
            for (const child of node.getChildren()) {
                const found = traverse(child);
                if (found) return found;
            }
            return undefined;
        };
        const submissionsId = traverse(model.getRootRow());
        if (submissionsId) {
            model.doAction(FlexLayout.Actions.selectTab(submissionsId));
        }
    }, [model, recentSubmissions, setActiveTab, setSelectedSubmission]);

    if (loading) {
        return (
            <div className="w-full flex justify-center items-center h-[calc(100svh-11rem)]">
                <div className="animate-spin w-12 h-12 border-4 border-(--accent)/30 border-t-(--accent) rounded-full" />
            </div>
        );
    }

    if (error || !problem) {
        return (
            <div className="w-full text-center p-8 text-red-400 bg-(--surface-card) border-2 border-red-500/30 rounded-2xl">
                <h2 className="text-xl font-bold mb-2">Eroare</h2>
                <p>{error || 'Problema nu a fost găsită.'}</p>
                <Link to="/problems" className="text-(--accent) underline mt-4 inline-block">
                    Înapoi la lista de probleme
                </Link>
            </div>
        );
    }

    // Shared editor props — identical for both layouts
    const editorProps = {
        isAuthenticated,
        t,
        language,
        setLanguage,
        isOpen,
        setIsOpen,
        availableLanguages,
        setSelectedLanguageId,
        handleCodeChange,
        handleEditorMount,
        handleSubmit,
        showClipboardButtons: true,
        // When switching layouts, the new Monaco instance picks up the current code
        defaultCode: codeRef.current,
    } as const;

    // FlexLayout factory — editor instance lives here on desktop
    const factory = (node: FlexLayout.TabNode) => {
        switch (node.getComponent()) {
            case 'description':
                return <DescriptionPanel problem={problem} processedDescription={processedDescription} lang={lang} />;
            case 'editor':
                return <EditorPanel {...editorProps} />;
            case 'testresult':
                return (
                    <TestResultPanel
                        evalStatus={evalStatus}
                        evalError={evalError}
                        evalSummary={evalSummary}
                        evalTests={evalTests}
                        evalSubtasks={evalSubtasks}
                        lang={lang}
                        problemTests={problemTests}
                    />
                );
            case 'submissions':
                return <SubmissionsPanel isAuthenticated={isAuthenticated} recentSubmissions={recentSubmissions} lang={lang} onSelectSubmission={setSelectedSubmission} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full flex flex-col gap-6 h-[calc(100svh-5rem)]">
            {isDesktop ? (
                /* ── Desktop: FlexLayout workspace + toolbar ── */
                <>
                    <div className="relative flex-1 min-h-0 overflow-hidden">
                        <FlexLayout.Layout
                            model={model}
                            factory={factory}
                            onAction={handleLayoutAction}
                            onModelChange={handleLayoutSave}
                        />
                    </div>
                    <ToolbarPanel
                        evalStatus={evalStatus}
                        evalSummary={evalSummary}
                        evalTests={evalTests}
                        lang={lang}
                        handleSubmit={handleSubmit}
                        status={status}
                        resetLayout={resetLayout}
                        onStatusClick={handleGoToLastSubmission}
                    />
                </>
            ) : (
                /* ── Mobile: stacked layout ── */
                <div className="flex flex-col gap-4">
                    <div className="overflow-hidden bg-(--surface-card) border-2 border-(--accent) rounded-3xl">
                        <DescriptionPanel problem={problem} processedDescription={processedDescription} lang={lang} />
                    </div>

                    <div className="overflow-hidden bg-(--surface-card) border-2 border-(--accent) rounded-3xl min-h-[50svh] flex flex-col">
                        <EditorPanel {...editorProps} />
                    </div>

                    <div className="bg-(--surface-card) border-2 border-(--accent) rounded-3xl mb-4 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-4 px-6 pt-6 pb-2 mb-2 bg-(--surface-card) overflow-x-auto border-b border-(--accent)/10">
                            <button
                                onClick={() => setActiveTab('testresult')}
                                className={`text-xs font-bold pb-1 border-b-2 whitespace-nowrap ${activeTab === 'testresult' ? 'border-(--accent)' : 'border-transparent opacity-50'}`}
                            >
                                {lang === 'RO' ? 'Rezultat' : 'Result'}
                            </button>
                            <button
                                onClick={() => setActiveTab('submissions')}
                                className={`text-xs font-bold pb-1 border-b-2 whitespace-nowrap ${activeTab === 'submissions' ? 'border-(--accent)' : 'border-transparent opacity-50'}`}
                            >
                                {lang === 'RO' ? 'Submisii' : 'Submissions'}
                            </button>
                        </div>
                        <div className="flex-1">
                            {activeTab === 'testresult' && (
                                <TestResultPanel
                                    evalStatus={evalStatus}
                                    evalError={evalError}
                                    evalSummary={evalSummary}
                                    evalTests={evalTests}
                                    evalSubtasks={evalSubtasks}
                                    lang={lang}
                                    problemTests={problemTests}
                                />
                            )}
                            {activeTab === 'submissions' && (
                                <SubmissionsPanel isAuthenticated={isAuthenticated} recentSubmissions={recentSubmissions} lang={lang} onSelectSubmission={setSelectedSubmission} />
                            )}
                        </div>
                        <div className="px-6 pb-6 bg-(--surface-card)">
                            <button
                                onClick={handleSubmit}
                                disabled={status === 'pending'}
                                className="px-6 py-1.5 rounded-xl bg-(--accent) border-2 border-(--accent) text-xs text-(--surface-card) hover:bg-transparent hover:text-(--accent) transition-all flex items-center gap-2 group ml-auto mt-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                {status === 'pending'
                                    ? lang === 'RO' ? 'Trimitere...' : 'Submitting...'
                                    : lang === 'RO' ? 'Trimite' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <SubmissionDetailModal
                isOpen={!!selectedSubmission}
                onClose={() => setSelectedSubmission(null)}
                submission={selectedSubmission}
                lang={lang}
            />
        </div>
    );
}
