import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import * as FlexLayout from 'flexlayout-react';
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

    const problemContent = (
        <>
            <p className="text-xs font-semibold uppercase tracking-wider text-(--accent)">
                {lang === 'RO' ? 'Problemă: ' : 'Problem: '} {problem.title}
            </p>
            <h1 className="text-3xl font-bold text-(--text) mb-2">{problem.title}</h1>
            {problem.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                    {problem.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-(--accent)/25 bg-(--accent)/10 text-(--text-muted)"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
            <div className="page-line-horizontal" />
            <div className="text-(--text) leading-relaxed">
                <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    children={processedDescription}
                    components={{
                        h1: ({ ...props }) => (
                            <h1
                                className="text-2xl font-bold text-(--text) mt-6 mb-3 border-b border-(--accent)/20 pb-1"
                                {...props}
                            />
                        ),
                        h2: ({ ...props }) => (
                            <h2 className="text-xl font-bold text-(--text) mt-5 mb-2" {...props} />
                        ),
                        p: ({ ...props }) => <p className="mb-4 whitespace-pre-wrap" {...props} />,
                        ul: ({ ...props }) => (
                            <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
                        ),
                        ol: ({ ...props }) => (
                            <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
                        ),
                        li: ({ ...props }) => <li className="ml-2" {...props} />,
                        span: ({ className, children, ...props }: any) => {
                            if (className && className.includes('katex')) {
                                return (
                                    <span className={`${className} text-(--accent)`} {...props}>
                                        {children}
                                    </span>
                                );
                            }
                            return (
                                <span className={className} {...props}>
                                    {children}
                                </span>
                            );
                        },
                        code: ({ className, children, ...props }: any) => (
                            <code
                                className={`text-(--accent) font-mono ${className || ''}`}
                                {...props}
                            >
                                {children}
                            </code>
                        ),
                        pre: ({ children, ...props }: any) => (
                            <div className="relative group my-4">
                                <pre
                                    className="bg-(--surface-input) p-4 rounded-xl border border-(--accent)/20 overflow-x-auto text-sm text-(--text) shadow-inner"
                                    {...props}
                                >
                                    {children}
                                </pre>
                            </div>
                        ),
                    }}
                />
            </div>
        </>
    );

    const editorContent = isAuthenticated ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <h2 className="text-xl font-bold text-(--text)">{t.submitTitle}</h2>
                <div className="relative w-32">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full flex items-center justify-between bg-(--surface-input) border border-(--accent)/30 rounded-xl px-4 py-2 text-sm text-(--text-h) outline-none transition hover:border-(--accent)"
                    >
                        {language}
                        <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>▼</motion.span>
                    </button>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.12 }}
                                className="absolute z-50 w-full bg-(--surface-dropdown) border border-(--accent)/40 rounded-xl shadow-2xl overflow-hidden"
                            >
                                {availableLanguages.map((langItem) => (
                                    <button
                                        key={langItem.id}
                                        onClick={() => {
                                            setSelectedLanguageId(langItem.id);
                                            setLanguage(langItem.name);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-(--text-h) hover:bg-(--accent)/20 transition-colors"
                                    >
                                        {langItem.name}{' '}
                                        {langItem.version && `(${langItem.version})`}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="relative flex-1 rounded-2xl overflow-hidden border border-(--accent)/20 bg-(--surface-editor) min-h-0">
                    <Editor
                        height="100%"
                        language={monacoLanguageMap[language] || 'cpp'}
                        value={code}
                        onChange={(val) => setCode(val || '')}
                        theme="fiicoder-dark"
                        onMount={handleEditorMount}
                        loading={
                            <div className="animate-spin w-8 h-8 border border-(--accent)/50 border-t-(--accent) rounded-full" />
                        }
                        options={{
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                            fontLigatures: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            padding: { top: 16, bottom: 16 },
                            lineNumbersMinChars: 3,
                            renderLineHighlight: 'gutter',
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on',
                            bracketPairColorization: { enabled: true },
                            automaticLayout: true,
                            wordWrap: 'on',
                        }}
                    />
                </div>
            </form>
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center h-full gap-5 py-12">
            <div className="shrink-0 w-16 h-16 rounded-full bg-(--accent)/10 border border-(--accent)/50 flex items-center justify-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-(--accent)/70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                </svg>
            </div>
            <div className="text-center">
                <h3 className="text-lg font-bold text-(--text) mb-1">
                    {lang === 'RO' ? 'Trimite soluții' : 'Submit Solutions'}
                </h3>
                <p className="text-sm text-(--text-muted) max-w-xs">
                    {lang === 'RO'
                        ? 'Trebuie să te autentifici pentru a trimite rezolvări.'
                        : 'You need to log in to submit solutions.'}
                </p>
            </div>
            <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl border border-(--accent)/50 bg-(--accent)/20 text-sm font-bold text-(--text-h) transition hover:border-(--accent) hover:bg-(--accent)/30"
            >
                {lang === 'RO' ? 'Autentifică-te' : 'Log In'}
            </Link>
        </div>
    );

    const factory = (node: FlexLayout.TabNode) => {
        const component = node.getComponent();

        switch (component) {
            case 'description':
                return (
                    <div className="h-full p-6 overflow-y-auto custom-scrollbar bg-(--surface-card) text-(--text)">
                        {problemContent}
                    </div>
                );
            case 'editor':
                return (
                    <div className="h-full p-6 flex flex-col bg-(--surface-card) overflow-hidden">
                        {editorContent}
                    </div>
                );
            case 'testcase':
                return (
                    <div className="h-full p-6 bg-(--surface-card) overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                {['Case 1', 'Case 2', 'Case 3'].map((c, i) => (
                                    <button
                                        key={i}
                                        className="px-3 py-1 rounded-lg bg-(--accent)/10 border border-(--accent)/20 text-[10px] font-bold text-(--text-muted) hover:text-(--accent)"
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase text-(--accent) tracking-tighter">
                                    Input =
                                </p>
                                <textarea
                                    className="w-full bg-(--surface-input) border-2 border-(--accent)/20 rounded-xl p-3 outline-none text-xs font-mono text-(--text) focus:border-(--accent)/50 transition-all"
                                    placeholder="Ex: 2 3"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'testresult':
                return (
                    <div className="h-full p-6 bg-(--surface-card) overflow-y-auto custom-scrollbar">
                        {evalStatus === 'idle' && (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 rounded-full bg-(--accent)/5 border-2 border-dashed border-(--accent)/20 flex items-center justify-center mb-3">
                                    <span className="text-xl opacity-30">▶</span>
                                </div>
                                <p className="text-xs text-(--text-muted) italic">
                                    {lang === 'RO'
                                        ? 'Trimite codul pentru a vedea rezultatele.'
                                        : 'Submit your code to see results.'}
                                </p>
                            </div>
                        )}

                        {evalStatus === 'connecting' && (
                            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                                <div className="animate-spin w-8 h-8 border-2 border-(--accent)/30 border-t-(--accent) rounded-full" />
                                <p className="text-xs text-(--text-muted)">
                                    {lang === 'RO' ? 'Se trimite...' : 'Submitting...'}
                                </p>
                            </div>
                        )}

                        {evalStatus === 'error' && (
                            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                                    <span className="text-xl text-red-400">✕</span>
                                </div>
                                <p className="text-xs text-red-400 font-bold">{evalError}</p>
                            </div>
                        )}

                        {(evalStatus === 'evaluating' || evalStatus === 'done') && (
                            <div className="space-y-4">
                                {/* Summary header */}
                                {evalSummary ? (
                                    <div className={`p-4 rounded-2xl border-2 ${
                                        evalSummary.score >= evalSummary.maxScore
                                            ? 'border-green-500/40 bg-green-500/10'
                                            : 'border-amber-500/40 bg-amber-500/10'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-2xl font-black ${
                                                    evalSummary.score >= evalSummary.maxScore
                                                        ? 'text-green-400'
                                                        : 'text-amber-400'
                                                }`}>
                                                    {evalSummary.score}/{evalSummary.maxScore}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted)">
                                                    {lang === 'RO' ? 'puncte' : 'points'}
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 ${
                                                evalSummary.score >= evalSummary.maxScore
                                                    ? 'border-green-500/50 bg-green-500/20 text-green-300'
                                                    : 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                                            }`}>
                                                {evalSummary.score >= evalSummary.maxScore
                                                    ? 'Accepted'
                                                    : 'Partial'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-2xl border-2 border-(--accent)/20 bg-(--accent)/5 flex items-center gap-3">
                                        <div className="animate-spin w-4 h-4 border-2 border-(--accent)/30 border-t-(--accent) rounded-full" />
                                        <span className="text-xs font-bold text-(--text-muted)">
                                            {lang === 'RO'
                                                ? `Evaluare... (${evalTests.length} teste)`
                                                : `Evaluating... (${evalTests.length} tests)`}
                                        </span>
                                    </div>
                                )}

                                {/* Test results table */}
                                {evalTests.length > 0 && (
                                    <div className="space-y-1.5">
                                        {evalTests.map((t, idx) => {
                                            const verdictColors: Record<string, string> = {
                                                OK: 'border-green-500/40 bg-green-500/10 text-green-300',
                                                WA: 'border-red-500/40 bg-red-500/10 text-red-300',
                                                TLE: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
                                                MLE: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
                                                RTE: 'border-red-500/40 bg-red-500/10 text-red-300',
                                                CPE: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
                                                FAIL: 'border-red-500/40 bg-red-500/10 text-red-300',
                                                SKIP: 'border-gray-500/40 bg-gray-500/10 text-gray-300',
                                                ILE: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
                                            };
                                            const color = verdictColors[t.verdict] || 'border-(--accent)/30 bg-(--accent)/10 text-(--text-muted)';
                                            const timeMs = (t.time / 1_000_000).toFixed(0);
                                            const memKB = (t.memory / 1024).toFixed(0);

                                            return (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                                                    className="flex items-center gap-3 p-2.5 rounded-xl border border-(--accent)/10 bg-(--accent)/5 hover:bg-(--accent)/10 transition-colors"
                                                >
                                                    <span className="text-[10px] font-mono font-bold text-(--text-subtle) w-6 text-center shrink-0">
                                                        #{t.testId}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${color} shrink-0`}>
                                                        {t.verdict}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-(--text-muted) ml-auto shrink-0">
                                                        {t.score}/{t.maxScore}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 w-14 text-right">
                                                        {timeMs}ms
                                                    </span>
                                                    <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 w-16 text-right">
                                                        {memKB}KB
                                                    </span>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'submissions':
                return (
                    <div className="h-full p-6 bg-(--surface-card) overflow-y-auto custom-scrollbar">
                        <div className="space-y-3">
                            {!isAuthenticated ? (
                                <p className="text-sm text-(--text-muted) italic">
                                    {lang === 'RO'
                                        ? 'Autentifică-te pentru istoricul tău.'
                                        : 'Log in to see history.'}
                                </p>
                            ) : recentSubmissions.length > 0 ? (
                                recentSubmissions.map((sub, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-2xl border-2 border-(--accent)/20 bg-(--accent)/5 flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-(--text-h)">
                                                {new Date(sub.submissionDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-[10px] text-(--text-muted) font-mono">
                                                Score: {sub.score}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-2 ${sub.status === 'OK' ? 'border-green-500/40 bg-green-500/10 text-green-300' : 'border-red-500/40 bg-red-500/10 text-red-300'}`}
                                        >
                                            {sub.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-(--text-muted) italic">
                                    {lang === 'RO' ? 'Nu ai încă submisii.' : 'No submissions yet.'}
                                </p>
                            )}
                        </div>
                    </div>
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
            <div className="hidden xl:flex h-12 shrink-0 bg-(--surface-card) border-2 border-(--accent) rounded-2xl items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button className="text-[10px] font-black text-(--text-muted) hover:text-(--accent) flex items-center gap-2 uppercase tracking-tighter transition-colors group">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        {lang === 'RO' ? 'Consolă' : 'Console'}
                    </button>
                    <div className="w-px h-4 bg-(--accent)/20" />
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                evalStatus === 'evaluating' || evalStatus === 'connecting'
                                    ? 'bg-amber-500 animate-pulse'
                                    : evalStatus === 'done'
                                      ? evalSummary && evalSummary.score >= evalSummary.maxScore
                                          ? 'bg-green-500'
                                          : 'bg-amber-500'
                                      : evalStatus === 'error'
                                        ? 'bg-red-500'
                                        : 'bg-green-500'
                            }`}
                        />
                        <span className="text-[10px] font-bold text-(--text-subtle) uppercase tracking-widest">
                            {evalStatus === 'connecting'
                                ? lang === 'RO' ? 'Conectare...' : 'Connecting...'
                                : evalStatus === 'evaluating'
                                  ? lang === 'RO'
                                      ? `Test ${evalTests.length}...`
                                      : `Test ${evalTests.length}...`
                                  : evalStatus === 'done' && evalSummary
                                    ? `${evalSummary.score}/${evalSummary.maxScore}`
                                    : evalStatus === 'error'
                                      ? 'Error'
                                      : lang === 'RO' ? 'Sistem Activ' : 'System Ready'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={status === 'pending'}
                        className="px-6 py-1.5 rounded-lg bg-(--accent) border-2 border-(--accent) text-[10px] font-black text-(--surface-card) hover:bg-transparent hover:text-(--accent) transition-all flex items-center gap-2 group self-end"
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

            {/* Mobile View: Standard Stacked Grid */}
            <div className="xl:hidden flex flex-col gap-4">
                <div className="p-6 bg-(--surface-card) border-2 border-(--accent) rounded-3xl">
                    {problemContent}
                </div>
                <div className="p-6 bg-(--surface-card) border-2 border-(--accent) rounded-3xl min-h-100 flex flex-col">
                    {editorContent}
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
