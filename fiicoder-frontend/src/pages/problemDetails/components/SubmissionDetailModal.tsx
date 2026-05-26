import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatScore } from '../utils/textUtils';
import type { ProblemSubmissionDTO, SubmissionStatus, SubmissionSubtaskDTO } from '../types/problemDetails';
import { submissionVerdictLabels, submissionVerdict, type SubmissionVerdict } from '../../profile/profileUtils';
import { applyMonacoTheme } from '../../../utils/monacoTheme';
import { submissionService } from '../services/submissionService';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    submission: ProblemSubmissionDTO | null;
    lang: string;
};

const verdictClasses: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'border-green-500/40 bg-green-500/10 text-green-300',
    PARTIAL:  'border-amber-500/40 bg-amber-500/10 text-amber-300',
    PENDING:  'border-sky-500/40 bg-sky-500/10 text-sky-300',
    REJECTED: 'border-red-500/40 bg-red-500/10 text-red-300',
};

const subtaskBadgeClasses: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'border-green-500/50 bg-green-500/20 text-green-300',
    PARTIAL:  'border-amber-500/50 bg-amber-500/20 text-amber-300',
    PENDING:  'border-sky-500/50 bg-sky-500/20 text-sky-300',
    REJECTED: 'border-red-500/50 bg-red-500/20 text-red-300',
};

const testVerdictColors: Record<string, string> = {
    OK:   'border-green-500/40 bg-green-500/10 text-green-300',
    WA:   'border-red-500/40 bg-red-500/10 text-red-300',
    TLE:  'border-amber-500/40 bg-amber-500/10 text-amber-300',
    MLE:  'border-amber-500/40 bg-amber-500/10 text-amber-300',
    RTE:  'border-red-500/40 bg-red-500/10 text-red-300',
    CPE:  'border-purple-500/40 bg-purple-500/10 text-purple-300',
    FAIL: 'border-red-500/40 bg-red-500/10 text-red-300',
    SKIP: 'border-gray-500/40 bg-gray-500/10 text-gray-300',
    ILE:  'border-amber-500/40 bg-amber-500/10 text-amber-300',
};

function stVerdict(st: SubmissionSubtaskDTO): SubmissionVerdict {
    if (st.score >= st.maxScore) return 'ACCEPTED';
    if (st.score > 0) return 'PARTIAL';
    return 'REJECTED';
}

function ResultsPanel({ subtasks, lang }: { subtasks: SubmissionSubtaskDTO[]; lang: string }) {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const toggle = (idx: number) => setExpanded(prev => {
        const next = new Set(prev);
        next.has(idx) ? next.delete(idx) : next.add(idx);
        return next;
    });

    return (
        <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-muted) px-1 mb-2">
                {lang === 'RO' ? 'Subtask-uri' : 'Subtasks'}
            </p>
            {subtasks.map(st => {
                const verdict = stVerdict(st);
                const isExpanded = expanded.has(st.index);
                const maxTimeMs = st.tests.length
                    ? (Math.max(...st.tests.map(t => t.time)) / 1_000_000).toFixed(0)
                    : '-';
                const maxMemKB = st.tests.length
                    ? (Math.max(...st.tests.map(t => t.memory)) / 1024).toFixed(0)
                    : '-';

                return (
                    <div key={st.index}>
                        <div
                            className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none ${verdictClasses[verdict]}`}
                            onClick={() => toggle(st.index)}
                        >
                            <svg
                                className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-[10px] font-mono font-bold w-16 shrink-0">
                                Subtask #{st.index}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${subtaskBadgeClasses[verdict]} shrink-0`}>
                                {submissionVerdictLabels[verdict][lang === 'RO' ? 'ro' : 'en']}
                            </span>
                            <span className="text-[10px] font-black ml-auto shrink-0">
                                {formatScore(st.score)}/{formatScore(st.maxScore)}
                            </span>
                            <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 w-12 text-right">{maxTimeMs}ms</span>
                            <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 w-14 text-right">{maxMemKB}KB</span>
                        </div>

                        <AnimatePresence initial={false}>
                            {isExpanded && st.tests.length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pl-4 pt-1 pb-0.5 space-y-1">
                                        {st.tests.map(t => {
                                            const color = testVerdictColors[t.verdict] ?? 'border-(--accent)/30 bg-(--accent)/10 text-(--text-muted)';
                                            const timeMs = (t.time / 1_000_000).toFixed(0);
                                            const memKB = (t.memory / 1024).toFixed(0);
                                            return (
                                                <div
                                                    key={t.index}
                                                    className="flex items-center gap-2 p-1.5 rounded-lg border border-(--accent)/10 bg-(--accent)/5"
                                                >
                                                    <span className="text-[10px] font-mono font-bold text-(--text-subtle) w-5 text-center shrink-0">#{t.index}</span>
                                                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase border ${color} shrink-0`}>{t.verdict}</span>
                                                    <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 ml-auto w-12 text-right">{timeMs}ms</span>
                                                    <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 w-14 text-right">{memKB}KB</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}

export default function SubmissionDetailModal({ isOpen, onClose, submission, lang }: Props) {
    const { theme, customColors } = useTheme();
    const [results, setResults] = useState<SubmissionStatus | null>(null);
    const [loadingResults, setLoadingResults] = useState(false);

    useEffect(() => {
        if (!isOpen || !submission?.id) return;
        setResults(null);
        setLoadingResults(true);
        submissionService.getStatus(submission.id)
            .then(data => setResults(data))
            .catch(() => setResults(null))
            .finally(() => setLoadingResults(false));
    }, [isOpen, submission?.id]);

    if (!submission) return null;

    const verdict = submissionVerdict({ status: submission.status, score: submission.Score });
    const verdictLabel = submissionVerdictLabels[verdict][lang === 'RO' ? 'ro' : 'en'];
    const languageName = typeof submission.language === 'string'
        ? submission.language
        : (submission.language as any)?.name || 'Unknown';

    let editorLang = 'plaintext';
    const langLower = languageName.toLowerCase();
    if (langLower.includes('c++') || langLower.includes('cpp') || langLower.includes('c')) editorLang = 'cpp';
    else if (langLower.includes('py')) editorLang = 'python';
    else if (langLower.includes('java')) editorLang = 'java';
    else if (langLower.includes('js') || langLower.includes('node') || langLower.includes('javascript')) editorLang = 'javascript';
    else if (langLower.includes('ts') || langLower.includes('typescript')) editorLang = 'typescript';

    const hasSubtasks = results?.subtasks && results.subtasks.length > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-[min(90vw,1100px)] md:h-[80vh] bg-(--surface-card) border-2 border-(--accent) rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-(--accent)/20 bg-(--surface-muted) shrink-0">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div>
                                    <h3 className="text-lg font-bold text-(--text-h)">
                                        {lang === 'RO' ? 'Detalii Submisie' : 'Submission Details'}
                                    </h3>
                                    <p className="text-xs text-(--text-muted)">
                                        {new Date(submission.submissiondate).toLocaleString(lang === 'RO' ? 'ro-RO' : 'en-US')}
                                    </p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-2 ${verdictClasses[verdict]}`}>
                                    {verdictLabel}
                                </span>
                                <span className="text-sm font-bold text-(--text-h)">
                                    Scor: {formatScore(submission.Score)}
                                </span>
                                <span className="text-xs px-2 py-1 bg-(--accent)/10 text-(--accent) rounded-md border border-(--accent)/20">
                                    {languageName}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-(--accent)/10 text-(--text-muted) hover:text-(--accent) transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-h-0 flex">
                            {/* Editor */}
                            <div className="flex-1 min-w-0 relative bg-(--surface-card)">
                                <Editor
                                    height="100%"
                                    language={editorLang}
                                    value={submission.code}
                                    onMount={(_editor, monaco) => {
                                        applyMonacoTheme(monaco, theme, { customColors });
                                    }}
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        fontSize: 14,
                                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Ubuntu Mono', 'DejaVu Sans Mono', 'Cascadia Code', monospace",
                                        fontLigatures: true,
                                    }}
                                />
                                <button
                                    onClick={() => navigator.clipboard.writeText(submission.code)}
                                    className="absolute bottom-4 right-6 p-2 rounded-xl bg-(--surface-card) border-2 border-(--accent)/50 text-(--text-muted) hover:text-(--accent) hover:border-(--accent) shadow-lg transition-all z-10"
                                    title="Copy code"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                            </div>

                            {/* Results panel */}
                            <div className="w-72 shrink-0 border-l border-(--accent)/20 flex flex-col">
                                <div className="px-4 py-3 border-b border-(--accent)/10 shrink-0">
                                    <p className="text-xs font-bold text-(--text-h)">
                                        {lang === 'RO' ? 'Rezultate' : 'Results'}
                                    </p>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                    {loadingResults ? (
                                        <div className="flex items-center justify-center h-32">
                                            <div className="animate-spin w-5 h-5 border-2 border-(--accent)/30 border-t-(--accent) rounded-full" />
                                        </div>
                                    ) : hasSubtasks ? (
                                        <ResultsPanel subtasks={results!.subtasks} lang={lang} />
                                    ) : submission.status === 'PENDING' ? (
                                        <p className="text-xs text-(--text-muted) italic text-center mt-8">
                                            {lang === 'RO' ? 'În evaluare...' : 'Evaluating...'}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-(--text-muted) italic text-center mt-8">
                                            {lang === 'RO' ? 'Nu există rezultate.' : 'No results available.'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
