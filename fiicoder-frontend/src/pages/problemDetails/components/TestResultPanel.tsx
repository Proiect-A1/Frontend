import { motion } from 'framer-motion';
import type { DoneSubtaskEvent } from '../types/problemDetails';

type Props = {
    evalStatus: string;
    evalError?: string | null;
    evalSummary?: any;
    evalTests: any[];
    evalSubtasks: DoneSubtaskEvent[];
    lang: string;
};

export default function TestResultPanel({ evalStatus, evalError, evalSummary, evalTests, evalSubtasks, lang }: Props) {
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
                    <p className="text-xs text-(--text-muted)">{lang === 'RO' ? 'Se trimite...' : 'Submitting...'}</p>
                </div>
            )}

            {evalStatus === 'error' && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <p className="text-xs text-red-400 font-bold">{evalError}</p>
                </div>
            )}

            {(evalStatus === 'evaluating' || evalStatus === 'done') && (
                <div className="space-y-4">
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
                                    {evalSummary.score >= evalSummary.maxScore ? 'Accepted' : 'Partial'}
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

                    {evalSubtasks.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-muted) px-1">
                                {lang === 'RO' ? 'Subtask-uri' : 'Subtasks'}
                            </p>
                            {evalSubtasks.map((st) => {
                                const full = st.score >= st.maxScore;
                                const partial = st.score > 0 && !full;
                                const color = full
                                    ? 'border-green-500/40 bg-green-500/10 text-green-300'
                                    : partial
                                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                    : 'border-red-500/40 bg-red-500/10 text-red-300';
                                const maxMemKB = st.max_memory ? (st.max_memory / 1024).toFixed(0) : '—';
                                const maxTimeMs = st.max_time ? (st.max_time / 1_000_000).toFixed(0) : '—';
                                return (
                                    <motion.div
                                        key={st.subtaskId}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: st.subtaskId * 0.05 }}
                                        className={`flex items-center gap-3 p-2.5 rounded-xl border ${color}`}
                                    >
                                        <span className="text-[10px] font-mono font-bold w-16 shrink-0">
                                            Subtask #{st.subtaskId}
                                        </span>
                                        <span className="text-[10px] font-black ml-auto shrink-0">
                                            {st.score}/{st.maxScore}
                                        </span>
                                        <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 w-14 text-right">
                                            {maxTimeMs}ms
                                        </span>
                                        <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 w-16 text-right">
                                            {maxMemKB}KB
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

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
                                        <span className="text-[10px] font-mono font-bold text-(--text-subtle) w-6 text-center shrink-0">#{t.testId}</span>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${color} shrink-0`}>{t.verdict}</span>
                                        <span className="text-[10px] font-bold text-(--text-muted) ml-auto shrink-0">{t.score}/{t.maxScore}</span>
                                        <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 w-14 text-right">{timeMs}ms</span>
                                        <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 w-16 text-right">{memKB}KB</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
