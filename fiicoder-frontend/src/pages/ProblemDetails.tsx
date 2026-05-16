import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FlexLayout from 'flexlayout-react';
import DescriptionPanel from '../components/ProblemDetails/DescriptionPanel';
import EditorPanel from '../components/ProblemDetails/EditorPanel';
import TestResultPanel from '../components/ProblemDetails/TestResultPanel';
import SubmissionsPanel from '../components/ProblemDetails/SubmissionsPanel';
import TestcasePanel from '../components/ProblemDetails/TestcasePanel';
import ToolbarPanel from '../components/ProblemDetails/ToolbarPanel';
import 'flexlayout-react/style/dark.css';
import { useProblemDetails } from './problemDetails/useProblemDetails';

export default function ProblemDetails() {
    const {
        lang,
        t,
        isAuthenticated,
        problem,
        loading,
        error,
        code,
        setCode,
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
        evalSummary,
        evalStatus,
        evalError,
        processedDescription,
        model,
        handleEditorMount,
        handleSubmit,
        monacoLanguageMap,
    } = useProblemDetails();

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

    // Render panels via dedicated components

    const factory = (node: FlexLayout.TabNode) => {
        const component = node.getComponent();

        switch (component) {
            case 'description':
                return <DescriptionPanel problem={problem} processedDescription={processedDescription} lang={lang} />;
            case 'editor':
                return (
                    <EditorPanel
                        isAuthenticated={isAuthenticated}
                        t={t}
                        code={code}
                        setCode={setCode}
                        language={language}
                        setLanguage={setLanguage}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        availableLanguages={availableLanguages}
                        setSelectedLanguageId={setSelectedLanguageId}
                        handleEditorMount={handleEditorMount}
                        handleSubmit={handleSubmit}
                        monacoLanguageMap={monacoLanguageMap}
                    />
                );
            case 'testcase':
                return <TestcasePanel />;
            case 'testresult':
                return (
                    <TestResultPanel
                        evalStatus={evalStatus}
                        evalError={evalError}
                        evalSummary={evalSummary}
                        evalTests={evalTests}
                        lang={lang}
                    />
                );
            case 'submissions':
                return (
                    <SubmissionsPanel
                        isAuthenticated={isAuthenticated}
                        recentSubmissions={recentSubmissions}
                        lang={lang}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full flex flex-col gap-6 h-[calc(100svh-5rem)]">
            {/* Desktop Workspace: FlexLayout */}
            <div className="hidden xl:block relative flex-1 min-h-0 overflow-hidden">
                <FlexLayout.Layout model={model} factory={factory} />
            </div>

            {/* Workspace Toolbar (Status Bar) - Only on Desktop for now */}
            <ToolbarPanel
                evalStatus={evalStatus}
                evalSummary={evalSummary}
                evalTests={evalTests}
                lang={lang}
                handleSubmit={handleSubmit}
                status={status}
            />

            {/* Mobile View: Standard Stacked Grid */}
            <div className="xl:hidden flex flex-col gap-4">
                <div className="p-6 bg-(--surface-card) border-2 border-(--accent) rounded-3xl">
                    <DescriptionPanel problem={problem} processedDescription={processedDescription} lang={lang} />
                </div>
                <div className="p-6 bg-(--surface-card) border-2 border-(--accent) rounded-3xl min-h-100 flex flex-col">
                    <EditorPanel
                        isAuthenticated={isAuthenticated}
                        t={t}
                        code={code}
                        setCode={setCode}
                        language={language}
                        setLanguage={setLanguage}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        availableLanguages={availableLanguages}
                        setSelectedLanguageId={setSelectedLanguageId}
                        handleEditorMount={handleEditorMount}
                        handleSubmit={handleSubmit}
                        monacoLanguageMap={monacoLanguageMap}
                    />
                </div>
                <div className="p-6 bg-(--surface-card) border-2 border-(--accent) rounded-3xl mb-4">
                    <div className="flex items-center gap-4 mb-4 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('testcase')}
                            className={`text-xs font-bold pb-1 border-b-2 ${activeTab === 'testcase' ? 'border-(--accent)' : 'border-transparent opacity-50'}`}
                        >
                            Testcase
                        </button>
                        <button
                            onClick={() => setActiveTab('testresult')}
                            className={`text-xs font-bold pb-1 border-b-2 ${activeTab === 'testresult' ? 'border-(--accent)' : 'border-transparent opacity-50'}`}
                        >
                            Result
                        </button>
                        <button
                            onClick={() => setActiveTab('submissions')}
                            className={`text-xs font-bold pb-1 border-b-2 ${activeTab === 'submissions' ? 'border-(--accent)' : 'border-transparent opacity-50'}`}
                        >
                            Submissions
                        </button>
                    </div>
                    {activeTab === 'testcase' && (
                        <textarea
                            className="w-full bg-(--surface-input) border border-(--accent)/20 rounded-2xl p-3 text-xs"
                            rows={4}
                            placeholder="Input..."
                        />
                    )}
                    {activeTab === 'testresult' && (
                        <div className="min-h-[120px]">
                            {evalStatus === 'idle' && (
                                <div className="py-8 text-center text-xs text-(--text-muted) italic">
                                    {lang === 'RO' ? 'Trimite codul pentru rezultate.' : 'Submit code for results.'}
                                </div>
                            )}
                            {(evalStatus === 'connecting' || (evalStatus === 'evaluating' && evalTests.length === 0)) && (
                                <div className="py-8 flex flex-col items-center gap-3">
                                    <div className="animate-spin w-6 h-6 border-2 border-(--accent)/30 border-t-(--accent) rounded-full" />
                                    <span className="text-xs text-(--text-muted)">{lang === 'RO' ? 'Se evaluează...' : 'Evaluating...'}</span>
                                </div>
                            )}
                            {evalStatus === 'error' && (
                                <div className="py-8 text-center text-xs text-red-400 font-bold">{evalError}</div>
                            )}
                            {(evalStatus === 'evaluating' || evalStatus === 'done') && evalTests.length > 0 && (
                                <div className="space-y-3">
                                    {evalSummary && (
                                        <div className={`p-3 rounded-2xl border-2 flex items-center justify-between ${
                                            evalSummary.score >= evalSummary.maxScore
                                                ? 'border-green-500/40 bg-green-500/10' : 'border-amber-500/40 bg-amber-500/10'
                                        }`}>
                                            <span className={`text-lg font-black ${evalSummary.score >= evalSummary.maxScore ? 'text-green-400' : 'text-amber-400'}`}>
                                                {evalSummary.score}/{evalSummary.maxScore}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                                evalSummary.score >= evalSummary.maxScore
                                                    ? 'border-green-500/50 text-green-300' : 'border-amber-500/50 text-amber-300'
                                            }`}>
                                                {evalSummary.score >= evalSummary.maxScore ? 'Accepted' : 'Partial'}
                                            </span>
                                        </div>
                                    )}
                                    {!evalSummary && (
                                        <div className="p-2 rounded-xl border border-(--accent)/20 bg-(--accent)/5 flex items-center gap-2">
                                            <div className="animate-spin w-3 h-3 border-2 border-(--accent)/30 border-t-(--accent) rounded-full" />
                                            <span className="text-[10px] font-bold text-(--text-muted)">
                                                {lang === 'RO' ? `Evaluare... (${evalTests.length})` : `Evaluating... (${evalTests.length})`}
                                            </span>
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        {evalTests.map((t, idx) => {
                                            const vc: Record<string, string> = {
                                                OK: 'border-green-500/40 bg-green-500/10 text-green-300',
                                                WA: 'border-red-500/40 bg-red-500/10 text-red-300',
                                                TLE: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
                                                MLE: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
                                                RTE: 'border-red-500/40 bg-red-500/10 text-red-300',
                                                CPE: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
                                            };
                                            return (
                                                <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                    className="flex items-center gap-2 p-2 rounded-lg border border-(--accent)/10 bg-(--accent)/5 text-[10px]">
                                                    <span className="font-mono font-bold text-(--text-subtle) w-5">#{t.testId}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${vc[t.verdict] || 'border-(--accent)/30 text-(--text-muted)'}`}>
                                                        {t.verdict}
                                                    </span>
                                                    <span className="font-bold text-(--text-muted) ml-auto">{t.score}/{t.maxScore}</span>
                                                    <span className="font-mono text-(--text-subtle)">{(t.time / 1_000_000).toFixed(0)}ms</span>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'submissions' && (
                        <div className="space-y-2">
                            {recentSubmissions.map((s, i) => (
                                <div
                                    key={i}
                                    className="text-xs p-2 bg-(--accent)/5 rounded-2xl border border-(--accent)/10 flex justify-between"
                                >
                                    <span>{s.status}</span>
                                    <span>{s.score}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={status === 'pending'}
                        className="px-6 py-1.5 rounded-xl bg-(--accent) border-2 border-(--accent) text-xs text-(--surface-card) hover:bg-transparent hover:text-(--accent) transition-all flex items-center gap-2 group ml-auto mt-4"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {status === 'pending'
                            ? lang === 'RO'
                                ? 'Trimitere...'
                                : 'Submitting...'
                            : lang === 'RO'
                              ? 'Trimite'
                              : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
