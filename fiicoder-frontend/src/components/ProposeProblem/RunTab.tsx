import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProposeProblemForm, RunResult, SubtaskRunResult } from '../../types/proposeProblem';
import { itemVariants, staggerConfig } from '../../utils/motionConfig';

type RunStatus = 'idle' | 'running' | 'done' | 'error';

// Mock run results generator
function generateMockResults(sourceFile: string): RunResult {
    const subtasks: SubtaskRunResult[] = [
        {
            subtaskId: 'st_1', name: 'Subtask 1 — Brute Force', scored: 30, maxPoints: 30,
            tests: [
                { testId: '000', verdict: 'AC', time: 0.02, memory: 4.2, points: 10, maxPoints: 10 },
                { testId: '001', verdict: 'AC', time: 0.05, memory: 4.5, points: 10, maxPoints: 10 },
                { testId: '002', verdict: 'AC', time: 0.01, memory: 3.8, points: 10, maxPoints: 10 },
            ],
        },
        {
            subtaskId: 'st_2', name: 'Subtask 2 — Optimizat', scored: sourceFile.includes('main') ? 70 : 14, maxPoints: 70,
            tests: [
                { testId: '003', verdict: sourceFile.includes('main') ? 'AC' : 'WA', time: 0.03, memory: 5.1, points: sourceFile.includes('main') ? 14 : 0, maxPoints: 14 },
                { testId: '004', verdict: 'AC', time: 0.12, memory: 6.2, points: 14, maxPoints: 14 },
                { testId: '005', verdict: sourceFile.includes('main') ? 'AC' : 'TLE', time: sourceFile.includes('main') ? 0.45 : 2.1, memory: 12.3, points: sourceFile.includes('main') ? 14 : 0, maxPoints: 14 },
                { testId: '006', verdict: sourceFile.includes('main') ? 'AC' : 'WA', time: 0.22, memory: 8.0, points: sourceFile.includes('main') ? 14 : 0, maxPoints: 14 },
                { testId: '007', verdict: sourceFile.includes('main') ? 'AC' : 'MLE', time: 0.33, memory: sourceFile.includes('main') ? 15 : 280, points: sourceFile.includes('main') ? 14 : 0, maxPoints: 14 },
            ],
        },
    ];

    const totalScore = subtasks.reduce((s, st) => s + st.scored, 0);
    const maxScore = subtasks.reduce((s, st) => s + st.maxPoints, 0);

    return { sourceFile, totalScore, maxScore, subtasks, timestamp: new Date().toISOString() };
}

const verdictColors: Record<string, string> = {
    AC: 'text-green-400',
    WA: 'text-red-400',
    TLE: 'text-yellow-400',
    MLE: 'text-orange-400',
    RE: 'text-purple-400',
    CE: 'text-gray-400',
    PENDING: 'text-(--text-muted)',
};

const verdictLabels: Record<string, string> = {
    AC: 'Accepted',
    WA: 'Wrong Answer',
    TLE: 'Time Limit',
    MLE: 'Memory Limit',
    RE: 'Runtime Error',
    CE: 'Compile Error',
    PENDING: 'Pending',
};

export default function RunTab() {
    const { watch } = useFormContext<ProposeProblemForm>();
    const files = watch('files') || [];
    const generatorScript = watch('generatorScript') || '';

    const sources = files.filter((f) => f.category === 'sources');

    const [selectedSource, setSelectedSource] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [runStatus, setRunStatus] = useState<RunStatus>('idle');
    const [result, setResult] = useState<RunResult | null>(null);
    const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());
    const [errorMessage, setErrorMessage] = useState('');

    const toggleSubtask = (id: string) => {
        setExpandedSubtasks((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleRun = async () => {
        if (!selectedSource) return;
        if (!generatorScript.trim()) {
            setRunStatus('error');
            setErrorMessage('Validează mai întâi scriptul de generare în tab-ul „Generator".');
            return;
        }

        setRunStatus('running');
        setResult(null);
        setErrorMessage('');

        try {
            // Mock API call
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const mockResult = generateMockResults(selectedSource);
            setResult(mockResult);
            setRunStatus('done');
            // Expand all subtasks by default
            setExpandedSubtasks(new Set(mockResult.subtasks.map((s) => s.subtaskId)));
        } catch {
            setRunStatus('error');
            setErrorMessage('Eroare la comunicarea cu serverul.');
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: staggerConfig } }}
            className="space-y-6"
        >
            {/* Source Selection + Run Button */}
            <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
                {/* Source Dropdown */}
                <div className="flex-1 w-full sm:w-auto">
                    <label className="text-(--text) font-semibold text-sm mb-1.5 block">
                        Sursă Oficială
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            disabled={sources.length === 0}
                            className="w-full flex items-center justify-between rounded-xl border border-(--accent)/30 bg-(--surface-input) px-3 py-2 text-sm text-(--text) outline-none transition hover:border-(--accent) disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className={selectedSource ? 'text-(--text)' : 'text-(--text-muted)'}>
                                {selectedSource || (sources.length === 0 ? 'Nicio sursă uploadată' : 'Selectează o sursă...')}
                            </span>
                            <motion.span animate={{ rotate: isDropdownOpen ? 180 : 0 }}>▼</motion.span>
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && sources.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute z-50 mt-1 w-full bg-(--surface-dropdown) border border-(--accent)/30 rounded-xl shadow-2xl overflow-hidden"
                                >
                                    {sources.map((src) => (
                                        <button
                                            key={src.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedSource(src.name);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-(--accent)/20 transition-colors font-mono ${
                                                selectedSource === src.name ? 'bg-(--accent)/15 text-(--text-h)' : 'text-(--text)'
                                            }`}
                                        >
                                            {src.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Run Button */}
                <div className="sm:pt-6">
                    <button
                        type="button"
                        onClick={handleRun}
                        disabled={!selectedSource || runStatus === 'running'}
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm rounded-xl font-bold border border-(--accent)/50 bg-(--accent)/15 hover:bg-(--accent)/25 transition-colors text-(--text-h) disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {runStatus === 'running' ? (
                            <>
                                <span className="animate-spin">⏳</span> Se rulează...
                            </>
                        ) : (
                            <>▶ Rulează</>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* No sources warning */}
            {sources.length === 0 && (
                <motion.div
                    variants={itemVariants}
                    className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-950/15"
                >
                    <p className="text-sm text-yellow-400">
                        ⚠ Nu ai uploadat nicio sursă oficială. Mergi la tab-ul „Fișiere" → „Surse Oficiale" pentru a adăuga soluțiile tale.
                    </p>
                </motion.div>
            )}

            {/* Error message */}
            {runStatus === 'error' && errorMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-red-500/30 bg-red-950/20"
                >
                    <p className="text-sm text-red-400">✗ {errorMessage}</p>
                </motion.div>
            )}

            {/* Results */}
            {result && runStatus === 'done' && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    {/* Score Summary */}
                    <div className="p-4 rounded-xl border border-(--accent)/25 bg-(--surface-muted)">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <p className="text-sm text-(--text-muted)">Sursă:</p>
                                <p className="text-(--text-h) font-mono font-semibold">{result.sourceFile}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-(--text-muted)">Punctaj Total</p>
                                <p className={`text-3xl font-bold ${
                                    result.totalScore === result.maxScore ? 'text-green-400' :
                                    result.totalScore >= result.maxScore * 0.5 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                    {result.totalScore}/{result.maxScore}
                                </p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3 h-2 rounded-full bg-(--surface-card) overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(result.totalScore / result.maxScore) * 100}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full ${
                                    result.totalScore === result.maxScore ? 'bg-green-500' :
                                    result.totalScore >= result.maxScore * 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            />
                        </div>
                    </div>

                    {/* Subtask Dropdowns */}
                    <div className="space-y-2">
                        {result.subtasks.map((subtask) => {
                            const isExpanded = expandedSubtasks.has(subtask.subtaskId);
                            const isPerfect = subtask.scored === subtask.maxPoints;

                            return (
                                <div
                                    key={subtask.subtaskId}
                                    className="rounded-xl border border-(--accent)/20 overflow-hidden"
                                >
                                    {/* Subtask Header */}
                                    <button
                                        type="button"
                                        onClick={() => toggleSubtask(subtask.subtaskId)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-(--surface-muted) hover:bg-(--accent)/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.span
                                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                                transition={{ duration: 0.15 }}
                                                className="text-(--text-muted) text-xs"
                                            >
                                                ▶
                                            </motion.span>
                                            <span className="font-semibold text-sm text-(--text-h)">
                                                {subtask.name}
                                            </span>
                                        </div>
                                        <span className={`font-bold text-sm ${isPerfect ? 'text-green-400' : 'text-red-400'}`}>
                                            {subtask.scored}/{subtask.maxPoints}p
                                        </span>
                                    </button>

                                    {/* Subtask Tests */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-t border-(--accent)/15">
                                                            <th className="text-left text-(--text-muted) font-medium py-2 px-4 text-xs">Test</th>
                                                            <th className="text-left text-(--text-muted) font-medium py-2 px-4 text-xs">Verdict</th>
                                                            <th className="text-left text-(--text-muted) font-medium py-2 px-4 text-xs">Timp</th>
                                                            <th className="text-left text-(--text-muted) font-medium py-2 px-4 text-xs">Memorie</th>
                                                            <th className="text-right text-(--text-muted) font-medium py-2 px-4 text-xs">Puncte</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {subtask.tests.map((test) => (
                                                            <tr
                                                                key={test.testId}
                                                                className="border-t border-(--accent)/10 hover:bg-(--surface-muted)/50 transition-colors"
                                                            >
                                                                <td className="py-2 px-4 font-mono text-xs text-(--text)">#{test.testId}</td>
                                                                <td className="py-2 px-4">
                                                                    <span className={`font-bold text-xs ${verdictColors[test.verdict]}`}>
                                                                        {test.verdict}
                                                                    </span>
                                                                    <span className="text-xs text-(--text-muted) ml-1.5">
                                                                        {verdictLabels[test.verdict]}
                                                                    </span>
                                                                </td>
                                                                <td className="py-2 px-4 text-xs text-(--text) font-mono">
                                                                    {test.time?.toFixed(2)}s
                                                                </td>
                                                                <td className="py-2 px-4 text-xs text-(--text) font-mono">
                                                                    {test.memory?.toFixed(1)} MB
                                                                </td>
                                                                <td className="py-2 px-4 text-right">
                                                                    <span className={`text-xs font-bold ${test.points === test.maxPoints ? 'text-green-400' : 'text-red-400'}`}>
                                                                        {test.points}/{test.maxPoints}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Idle hint */}
            {runStatus === 'idle' && sources.length > 0 && (
                <motion.div
                    variants={itemVariants}
                    className="p-4 bg-(--surface-muted) rounded-xl border border-(--accent)/20"
                >
                    <p className="text-sm text-(--text-muted)">
                        <strong>Cum funcționează:</strong> Selectează o sursă oficială din dropdown și apasă „Rulează". 
                        Sistemul va genera testele din scriptul de generare, va rula sursa pe ele, și va returna punctajele per subtask.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
