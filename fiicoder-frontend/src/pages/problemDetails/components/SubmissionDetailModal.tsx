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

const verdictBorderClasses: Record<SubmissionVerdict, string> = {
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

const summaryScoreClasses: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'text-green-400',
    PARTIAL:  'text-amber-400',
    PENDING:  'text-sky-400',
    REJECTED: 'text-red-400',
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

function ResultsTab({ subtasks, score, maxScore, lang }: {
    subtasks: SubmissionSubtaskDTO[];
    score: number;
    maxScore: number;
    lang: string;
}) {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const toggle = (idx: number) => setExpanded(prev => {
        const next = new Set(prev);
        next.has(idx) ? next.delete(idx) : next.add(idx);
        return next;
    });

    const overallVerdict = submissionVerdict({ status: 'FINISHED', score });

    return (
        <div className="space-y-4">
            {/* Summary card */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border-2 ${verdictBorderClasses[overallVerdict]}`}>
                <div className="flex items-center gap-3">
                    <span className={`text-3xl font-black ${summaryScoreClasses[overallVerdict]}`}>
                        {formatScore(score)}<span className="text-lg font-bold opacity-60">/{formatScore(maxScore)}</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted)">
                        {lang === 'RO' ? 'puncte' : 'points'}
                    </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 ${verdictBorderClasses[overallVerdict]}`}>
                    {submissionVerdictLabels[overallVerdict][lang === 'RO' ? 'ro' : 'en']}
                </span>
            </div>

            {/* Subtasks */}
            <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-(--text-muted) px-1">
                    {lang === 'RO' ? 'Subtask-uri' : 'Subtasks'}
                </p>
                {[...subtasks].sort((a, b) => a.index - b.index).map(st => {
                    const verdict = stVerdict(st);
                    const isExpanded = expanded.has(st.index);
                    const sortedTests = [...st.tests].sort((a, b) => a.index - b.index);
                    const allTimes = sortedTests.map(t => t.time).filter(t => t > 0);
                    const allMems  = sortedTests.map(t => t.memory).filter(m => m > 0);
                    const maxTimeMs = allTimes.length ? (Math.max(...allTimes) / 1_000_000).toFixed(0) : '-';
                    const maxMemKB  = allMems.length  ? (Math.max(...allMems)  / 1024).toFixed(0)      : '-';

                    return (
                        <div key={st.index} className="rounded-xl overflow-hidden border border-(--accent)/15">
                            {/* Subtask header row */}
                            <button
                                onClick={() => toggle(st.index)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-(--accent)/5 ${verdictBorderClasses[verdict]} border-0 bg-transparent`}
                            >
                                <svg
                                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} text-(--text-muted)`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>

                                <span className="text-sm font-bold text-(--text-h) w-24 shrink-0">
                                    Subtask #{st.index}
                                </span>

                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${subtaskBadgeClasses[verdict]} shrink-0`}>
                                    {submissionVerdictLabels[verdict][lang === 'RO' ? 'ro' : 'en']}
                                </span>

                                <span className="text-sm font-black text-(--text-h) ml-auto shrink-0">
                                    {formatScore(st.score)}/{formatScore(st.maxScore)}
                                </span>

                                <div className="flex gap-4 shrink-0 text-right">
                                    <span className="text-xs font-mono text-(--text-muted) w-16">{maxTimeMs}ms</span>
                                    <span className="text-xs font-mono text-(--text-muted) w-16">{maxMemKB}KB</span>
                                </div>
                            </button>

                            {/* Tests */}
                            <AnimatePresence initial={false}>
                                {isExpanded && st.tests.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-(--accent)/10 divide-y divide-(--accent)/10">
                                            {/* Column headers */}
                                            <div className="flex items-center gap-3 px-4 py-1.5 bg-(--accent)/5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) w-8">Test</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) w-14">Verdict</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) ml-auto w-16 text-right">Timp</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) w-16 text-right">Memorie</span>
                                            </div>
                                            {sortedTests.map(t => {
                                                const color = testVerdictColors[t.verdict] ?? 'border-(--accent)/30 bg-(--accent)/5 text-(--text-muted)';
                                                const timeMs = t.time   > 0 ? `${(t.time   / 1_000_000).toFixed(0)}ms` : '-';
                                                const memKB  = t.memory > 0 ? `${(t.memory / 1024).toFixed(0)}KB`      : '-';
                                                return (
                                                    <div key={t.index} className="flex items-center gap-3 px-4 py-2 hover:bg-(--accent)/5 transition-colors">
                                                        <span className="text-xs font-mono font-bold text-(--text-subtle) w-8">#{t.index}</span>
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border w-14 text-center ${color}`}>
                                                            {t.verdict}
                                                        </span>
                                                        {t.message && (
                                                            <span className="text-[10px] text-(--text-muted) truncate flex-1">{t.message}</span>
                                                        )}
                                                        <span className="text-xs font-mono text-(--text-muted) ml-auto w-16 text-right">{timeMs}</span>
                                                        <span className="text-xs font-mono text-(--text-muted) w-16 text-right">{memKB}</span>
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
        </div>
    );
}

export default function SubmissionDetailModal({ isOpen, onClose, submission, lang }: Props) {
    const { theme, customColors } = useTheme();
    const [activeTab, setActiveTab] = useState<'code' | 'results'>('code');
    const [results, setResults] = useState<SubmissionStatus | null>(null);
    const [loadingResults, setLoadingResults] = useState(false);

    useEffect(() => {
        if (!isOpen || !submission?.id) return;
        setResults(null);
        setActiveTab('code');
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
    const tabs = [
        { id: 'code'    as const, label: lang === 'RO' ? 'Cod' : 'Code' },
        { id: 'results' as const, label: lang === 'RO' ? 'Rezultate' : 'Results' },
    ];

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
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-[min(90vw,900px)] md:h-[85vh] bg-(--surface-card) border-2 border-(--accent) rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-(--accent)/20 bg-(--surface-muted) shrink-0">
                            <div className="flex items-center gap-3 flex-wrap min-w-0">
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-(--text-h)">
                                        {lang === 'RO' ? 'Detalii Submisie' : 'Submission Details'}
                                    </h3>
                                    <p className="text-xs text-(--text-muted)">
                                        {new Date(submission.submissiondate).toLocaleString(lang === 'RO' ? 'ro-RO' : 'en-US')}
                                    </p>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border-2 shrink-0 ${verdictBorderClasses[verdict]}`}>
                                    {verdictLabel}
                                </span>
                                <span className="text-sm font-bold text-(--text-h) shrink-0">
                                    {lang === 'RO' ? 'Scor' : 'Score'}: {formatScore(submission.Score)}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-(--accent)/10 text-(--accent) rounded-md border border-(--accent)/20 shrink-0">
                                    {languageName}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="ml-3 w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-(--accent)/10 text-(--text-muted) hover:text-(--accent) transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-1 px-5 border-b border-(--accent)/15 bg-(--surface-muted) shrink-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative px-3 py-2.5 text-xs font-bold transition-colors ${
                                        activeTab === tab.id
                                            ? 'text-(--accent)'
                                            : 'text-(--text-muted) hover:text-(--text-h)'
                                    }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="modal-tab-indicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--accent) rounded-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-h-0">
                            {activeTab === 'code' && (
                                <div className="h-full relative">
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
                                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Ubuntu Mono', 'Cascadia Code', monospace",
                                            fontLigatures: true,
                                        }}
                                    />
                                    <button
                                        onClick={() => navigator.clipboard.writeText(submission.code)}
                                        className="absolute bottom-4 right-6 p-2 rounded-xl bg-(--surface-card) border-2 border-(--accent)/50 text-(--text-muted) hover:text-(--accent) hover:border-(--accent) shadow-lg transition-all z-10"
                                        title={lang === 'RO' ? 'Copiază codul' : 'Copy code'}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {activeTab === 'results' && (
                                <div className="h-full overflow-y-auto custom-scrollbar p-5">
                                    {loadingResults ? (
                                        <div className="flex items-center justify-center h-40 gap-3">
                                            <div className="animate-spin w-6 h-6 border-2 border-(--accent)/30 border-t-(--accent) rounded-full" />
                                            <span className="text-sm text-(--text-muted)">
                                                {lang === 'RO' ? 'Se încarcă...' : 'Loading...'}
                                            </span>
                                        </div>
                                    ) : hasSubtasks ? (
                                        <ResultsTab
                                            subtasks={results!.subtasks}
                                            score={submission.Score}
                                            maxScore={results!.subtasks.reduce((s, st) => s + st.maxScore, 0)}
                                            lang={lang}
                                        />
                                    ) : submission.status === 'PENDING' ? (
                                        <div className="flex flex-col items-center justify-center h-40 gap-2 text-(--text-muted)">
                                            <div className="animate-spin w-6 h-6 border-2 border-(--accent)/30 border-t-(--accent) rounded-full" />
                                            <p className="text-sm">{lang === 'RO' ? 'În evaluare...' : 'Evaluating...'}</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-40 gap-2 text-(--text-muted)">
                                            <p className="text-sm italic">{lang === 'RO' ? 'Nu există rezultate disponibile.' : 'No results available.'}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
