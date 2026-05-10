import { useState, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import type { ProposeProblemForm, ProblemFile, FileCategory, SubtaskRunResult } from '../../types/proposeProblem';
import { itemVariants, staggerConfig } from '../../utils/motionConfig';
import { useTheme } from '../../services/ThemeContext';

// Monaco theme palettes
const monacoThemes: Record<string, {
    accent: string; text: string; textMuted: string; textSubtle: string;
    editorBg: string; codeBg: string; accentSecondary: string;
}> = {
    rose: { accent: '#ff5eb6', accentSecondary: '#a78bfa', text: '#ffe8f6', textMuted: '#b39aad', textSubtle: '#8a7099', editorBg: '#0a0812', codeBg: '#120e1c' },
    nord: { accent: '#88c0d0', accentSecondary: '#5e81ac', text: '#eceff4', textMuted: '#7b88a1', textSubtle: '#616e88', editorBg: '#242933', codeBg: '#2e3440' },
    cream: { accent: '#d4a574', accentSecondary: '#b76857', text: '#f5f1e8', textMuted: '#a89080', textSubtle: '#8a7560', editorBg: '#1a1612', codeBg: '#2a2420' },
    sage: { accent: '#7a9e7e', accentSecondary: '#5a7e78', text: '#e8ebe7', textMuted: '#7a8f7c', textSubtle: '#667069', editorBg: '#1a1e1a', codeBg: '#242823' },
};

function applyMonacoTheme(monaco: any, themeName: string) {
    const palette = monacoThemes[themeName] || monacoThemes.rose;
    monaco.editor.defineTheme('fiicoder-dark', {
        base: 'vs-dark', inherit: true,
        rules: [
            { token: 'comment', foreground: palette.textMuted.replace('#', ''), fontStyle: 'italic' },
            { token: 'keyword', foreground: palette.accent.replace('#', '') },
            { token: 'string', foreground: palette.accentSecondary.replace('#', '') },
            { token: 'number', foreground: palette.accent.replace('#', '') },
        ],
        colors: {
            'editor.background': palette.editorBg,
            'editor.foreground': palette.text,
            'editor.lineHighlightBackground': palette.codeBg,
            'editor.selectionBackground': `${palette.accent}4d`,
            'editorLineNumber.foreground': palette.textSubtle,
            'editorLineNumber.activeForeground': palette.accent,
            'editorCursor.foreground': palette.accent,
            'scrollbarSlider.background': `${palette.accent}26`,
        },
    });
    monaco.editor.setTheme('fiicoder-dark');
}

// Reordered per team request: Generatoare, Validatoare, Interactoare, Checkere, Surse
const allCategories: { id: FileCategory; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'generators', label: 'Generatoare', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, description: 'Programe C++ folosite de scriptul de generare' },
    { id: 'validators', label: 'Validatoare', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, description: 'Verifică dacă input-ul generat este valid' },
    { id: 'interactors', label: 'Interactoare', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>, description: 'Programe de interacțiune pentru probleme interactive' },
    { id: 'checkers', label: 'Checkere', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, description: 'Verifică dacă output-ul concurentului este corect' },
    { id: 'sources', label: 'Surse', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, description: 'Soluțiile oficiale — rulează-le pentru a vedea punctajul' },
];

function detectLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
        cpp: 'cpp', c: 'c', h: 'cpp', hpp: 'cpp',
        py: 'python', java: 'java', js: 'javascript',
        ts: 'typescript', txt: 'plaintext',
    };
    return map[ext || ''] || 'plaintext';
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ── Mock run results ──
interface SourceRunHistory {
    score: number;
    maxScore: number;
    timestamp: string;
    subtasks: SubtaskRunResult[];
}

function generateMockRunResult(fileName: string): SourceRunHistory {
    const isMain = fileName.toLowerCase().includes('main');
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
            subtaskId: 'st_2', name: 'Subtask 2 — Optimizat', scored: isMain ? 70 : 14, maxPoints: 70,
            tests: [
                { testId: '003', verdict: isMain ? 'AC' : 'WA', time: 0.03, memory: 5.1, points: isMain ? 14 : 0, maxPoints: 14 },
                { testId: '004', verdict: 'AC', time: 0.12, memory: 6.2, points: 14, maxPoints: 14 },
                { testId: '005', verdict: isMain ? 'AC' : 'TLE', time: isMain ? 0.45 : 2.1, memory: 12.3, points: isMain ? 14 : 0, maxPoints: 14 },
                { testId: '006', verdict: isMain ? 'AC' : 'WA', time: 0.22, memory: 8.0, points: isMain ? 14 : 0, maxPoints: 14 },
                { testId: '007', verdict: isMain ? 'AC' : 'MLE', time: 0.33, memory: isMain ? 15 : 280, points: isMain ? 14 : 0, maxPoints: 14 },
            ],
        },
    ];
    return {
        score: subtasks.reduce((s, st) => s + st.scored, 0),
        maxScore: subtasks.reduce((s, st) => s + st.maxPoints, 0),
        timestamp: new Date().toISOString(),
        subtasks,
    };
}

const verdictColors: Record<string, string> = {
    AC: 'text-green-400', WA: 'text-red-400', TLE: 'text-yellow-400',
    MLE: 'text-orange-400', RE: 'text-purple-400', CE: 'text-gray-400',
};

// ════════════════════════════════════════════
// Component
// ════════════════════════════════════════════
export default function FilesTab() {
    const { watch, setValue } = useFormContext<ProposeProblemForm>();
    const { theme } = useTheme();
    const files = watch('files') || [];
    const isInteractive = watch('isInteractive');

    // Filter categories based on isInteractive toggle
    const categories = isInteractive
        ? allCategories
        : allCategories.filter((c) => c.id !== 'interactors');

    const [activeCategory, setActiveCategory] = useState<FileCategory>('generators');
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const monacoRef = useRef<any>(null);

    // ── Run state (Sources only) ──
    const [runningFileId, setRunningFileId] = useState<string | null>(null);
    const [runHistory, setRunHistory] = useState<Record<string, SourceRunHistory>>({});
    const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
    const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());

    const categoryFiles = files.filter((f) => f.category === activeCategory);

    const handleEditorMount: OnMount = (_editor, monaco) => {
        monacoRef.current = monaco;
        applyMonacoTheme(monaco, theme);
    };

    // Reactively update Monaco theme when app theme changes
    useEffect(() => {
        if (monacoRef.current) {
            applyMonacoTheme(monacoRef.current, theme);
        }
    }, [theme]);

    const addFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;
            const newFile: ProblemFile = {
                id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                name: file.name,
                size: file.size,
                category: activeCategory,
                content,
                language: detectLanguage(file.name),
            };
            setValue('files', [...files, newFile]);
        };
        reader.readAsText(file);
    };

    const removeFile = (fileId: string) => {
        if (editingFileId === fileId) setEditingFileId(null);
        setValue('files', files.filter((f) => f.id !== fileId));
        // Clean run history
        setRunHistory((prev) => {
            const next = { ...prev };
            delete next[fileId];
            return next;
        });
    };

    const updateFileContent = (fileId: string, content: string) => {
        setValue('files', files.map((f) => (f.id === fileId ? { ...f, content } : f)));
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files) Array.from(e.dataTransfer.files).forEach(addFile);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files) Array.from(e.currentTarget.files).forEach(addFile);
        e.target.value = '';
    };

    // ── Run source ──
    const handleRunSource = async (fileId: string, fileName: string) => {
        setRunningFileId(fileId);
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const result = generateMockRunResult(fileName);
            setRunHistory((prev) => ({ ...prev, [fileId]: result }));
            setExpandedResults((prev) => new Set(prev).add(fileId));
            setExpandedSubtasks(new Set(result.subtasks.map((s) => `${fileId}_${s.subtaskId}`)));
        } finally {
            setRunningFileId(null);
        }
    };

    const toggleResults = (fileId: string) => {
        setExpandedResults((prev) => {
            const next = new Set(prev);
            if (next.has(fileId)) next.delete(fileId);
            else next.add(fileId);
            return next;
        });
    };

    const toggleSubtask = (key: string) => {
        setExpandedSubtasks((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const activeCat = categories.find((c) => c.id === activeCategory)!;
    const isSources = activeCategory === 'sources';

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: staggerConfig } }}
            className="space-y-4"
        >
            {/* Category Sub-tabs */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                    const count = files.filter((f) => f.category === cat.id).length;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => { setActiveCategory(cat.id); setEditingFileId(null); }}
                            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center gap-1.5 cursor-pointer outline-none ${
                                isActive
                                    ? 'bg-(--accent)/25 border-(--accent) text-(--text-h)'
                                    : 'bg-transparent border-(--accent)/40 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h)'
                            }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                            {count > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-(--accent)/20 text-xs">{count}</span>
                            )}
                        </button>
                    );
                })}
            </motion.div>

            {/* Category Description */}
            <motion.div variants={itemVariants} className="p-3 bg-(--surface-muted) rounded-xl border border-(--accent)/20">
                <p className="text-sm text-(--text-muted)">
                    <strong>{activeCat.icon} {activeCat.label}:</strong> {activeCat.description}
                </p>
            </motion.div>

            {/* Upload Zone */}
            <motion.div variants={itemVariants}>
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative p-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
                        dragActive ? 'border-(--accent) bg-(--accent)/15' : 'border-(--accent)/40 hover:border-(--accent)/70'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input ref={fileInputRef} type="file" multiple onChange={handleFileInput} className="hidden" />
                    <div className="flex flex-col items-center justify-center text-center">
                        <svg className="w-10 h-10 mb-2 text-(--accent)/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <p className="text-sm text-(--text) font-semibold">Trage fișierele aici sau fă clic</p>
                        <p className="text-xs text-(--text-muted) mt-0.5">.cpp, .c, .h, .py, .java, .txt</p>
                    </div>
                </div>
            </motion.div>

            {/* Files List */}
            {categoryFiles.length > 0 ? (
                <motion.div variants={itemVariants} className="space-y-2">
                    <h3 className="text-sm font-semibold text-(--text)">
                        {activeCat.label} ({categoryFiles.length})
                    </h3>
                    {categoryFiles.map((file) => {
                        const history = runHistory[file.id];
                        const isRunning = runningFileId === file.id;
                        const isResultsExpanded = expandedResults.has(file.id);

                        return (
                            <div key={file.id} className="space-y-1">
                                {/* File Card */}
                                <div
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                                        editingFileId === file.id
                                            ? 'bg-(--accent)/10 border-(--accent)/40'
                                            : 'bg-(--surface-muted) border-(--accent)/20 hover:bg-(--surface-muted)/70'
                                    }`}
                                >
                                    <div
                                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                                        onDoubleClick={() => setEditingFileId(editingFileId === file.id ? null : file.id)}
                                    >
                                        <svg className="w-5 h-5 text-(--text-muted) shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        <div className="min-w-0">
                                            <p className="text-sm text-(--text) truncate font-mono">{file.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-(--text-muted)">{formatFileSize(file.size)} · {file.language}</span>
                                                {/* Last run indicator (sources only) */}
                                                {isSources && history && (
                                                    <span
                                                        className={`text-xs font-semibold cursor-pointer hover:underline ${
                                                            history.score === history.maxScore ? 'text-green-400' : 'text-yellow-400'
                                                        }`}
                                                        onClick={(e) => { e.stopPropagation(); toggleResults(file.id); }}
                                                    >
                                                        {history.score}/{history.maxScore}p · {new Date(history.timestamp).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                                {isSources && !history && !isRunning && (
                                                    <span className="text-xs text-(--text-muted) italic">Nicio rulare</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {/* Run button (sources only) */}
                                        {isSources && (
                                            <button
                                                type="button"
                                                onClick={() => handleRunSource(file.id, file.name)}
                                                disabled={isRunning}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-bold border border-(--accent)/40 bg-(--accent)/15 hover:bg-(--accent)/25 transition-colors text-(--text-h) disabled:opacity-40"
                                            >
                                                {isRunning ? <><div className="w-3 h-3 border-2 border-(--text) border-t-transparent rounded-full animate-spin" /> Rulare...</> : <><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg> Rulează</>}
                                            </button>
                                        )}
                                            <button
                                                type="button"
                                                onClick={() => setEditingFileId(editingFileId === file.id ? null : file.id)}
                                                className="p-1.5 text-(--text-muted) hover:text-(--text-h) hover:bg-(--accent)/15 rounded transition-colors text-xs"
                                                title="Editează"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(file.id)}
                                                className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors text-xs"
                                                title="Șterge"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                    </div>
                                </div>

                                {/* Run Results (sources only, expandable) */}
                                <AnimatePresence>
                                    {isSources && history && isResultsExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="ml-4 rounded-xl border border-(--accent)/15 overflow-hidden">
                                                {/* Score bar */}
                                                <div className="px-4 py-2 bg-(--surface-muted) flex items-center justify-between">
                                                    <span className="text-xs text-(--text-muted)">Rezultate</span>
                                                    <span className={`text-sm font-bold ${
                                                        history.score === history.maxScore ? 'text-green-400' :
                                                        history.score >= history.maxScore * 0.5 ? 'text-yellow-400' : 'text-red-400'
                                                    }`}>
                                                        {history.score}/{history.maxScore}p
                                                    </span>
                                                </div>
                                                {/* Progress bar */}
                                                <div className="h-1.5 bg-(--surface-card)">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(history.score / history.maxScore) * 100}%` }}
                                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                                        className={`h-full ${
                                                            history.score === history.maxScore ? 'bg-green-500' :
                                                            history.score >= history.maxScore * 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    />
                                                </div>
                                                {/* Subtask dropdowns */}
                                                {history.subtasks.map((st) => {
                                                    const stKey = `${file.id}_${st.subtaskId}`;
                                                    const isStExpanded = expandedSubtasks.has(stKey);
                                                    const isPerfect = st.scored === st.maxPoints;
                                                    return (
                                                        <div key={st.subtaskId}>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleSubtask(stKey)}
                                                                className="w-full flex items-center justify-between px-4 py-2 hover:bg-(--accent)/8 transition-colors border-t border-(--accent)/10"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <motion.span
                                                                        animate={{ rotate: isStExpanded ? 90 : 0 }}
                                                                        transition={{ duration: 0.15 }}
                                                                        className="text-(--text-muted) text-[10px]"
                                                                    >▶</motion.span>
                                                                    <span className="text-xs font-semibold text-(--text-h)">{st.name}</span>
                                                                </div>
                                                                <span className={`text-xs font-bold ${isPerfect ? 'text-green-400' : 'text-red-400'}`}>
                                                                    {st.scored}/{st.maxPoints}p
                                                                </span>
                                                            </button>
                                                            <AnimatePresence>
                                                                {isStExpanded && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.15 }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <table className="w-full text-xs">
                                                                            <tbody>
                                                                                {st.tests.map((t) => (
                                                                                    <tr key={t.testId} className="border-t border-(--accent)/5 hover:bg-(--surface-muted)/40 transition-colors">
                                                                                        <td className="py-1 px-4 font-mono text-(--text-muted)">#{t.testId}</td>
                                                                                        <td className="py-1 px-2"><span className={`font-bold ${verdictColors[t.verdict] || 'text-(--text)'}`}>{t.verdict}</span></td>
                                                                                        <td className="py-1 px-2 font-mono text-(--text-muted)">{t.time?.toFixed(2)}s</td>
                                                                                        <td className="py-1 px-2 font-mono text-(--text-muted)">{t.memory?.toFixed(1)}MB</td>
                                                                                        <td className="py-1 px-2 text-right"><span className={`font-bold ${t.points === t.maxPoints ? 'text-green-400' : 'text-red-400'}`}>{t.points}/{t.maxPoints}</span></td>
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
                                </AnimatePresence>

                                {/* Inline Editor */}
                                <AnimatePresence>
                                    {editingFileId === file.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="rounded-xl border border-(--accent)/25 overflow-hidden">
                                                <div className="flex items-center justify-between px-3 py-1.5 bg-(--surface-muted) border-b border-(--accent)/15">
                                                    <span className="text-xs text-(--text-muted) font-mono">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingFileId(null)}
                                                        className="text-xs text-(--text-muted) hover:text-(--text-h) transition-colors"
                                                    >✕ Închide</button>
                                                </div>
                                                <div style={{ height: '300px' }}>
                                                    <Editor
                                                        height="100%"
                                                        language={file.language || 'plaintext'}
                                                        theme="fiicoder-dark"
                                                        value={file.content}
                                                        onChange={(val) => updateFileContent(file.id, val || '')}
                                                        onMount={handleEditorMount}
                                                        options={{ minimap: { enabled: false }, wordWrap: 'on', lineNumbers: 'on', scrollBeyondLastLine: false, fontSize: 13 }}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </motion.div>
            ) : (
                <motion.div variants={itemVariants} className="text-center py-8 text-(--text-muted) text-sm">
                    Niciun fișier în categoria „{activeCat.label}". Uploadează fișiere mai sus.
                </motion.div>
            )}

            {/* Stats */}
            <motion.div variants={itemVariants} className="p-4 bg-(--surface-muted) rounded-xl border border-(--accent)/25">
                <div className="flex flex-wrap gap-4 text-sm">
                    {categories.map((cat) => {
                        const count = files.filter((f) => f.category === cat.id).length;
                        return (
                            <span key={cat.id} className="text-(--text-muted)">
                                {cat.icon} <strong>{count}</strong> {cat.label.toLowerCase()}
                            </span>
                        );
                    })}
                </div>
                <p className="text-xs text-(--text-muted) mt-2">
                    <strong>Total:</strong> {files.length} fișiere · {formatFileSize(files.reduce((s, f) => s + f.size, 0))}
                </p>
            </motion.div>
        </motion.div>
    );
}
