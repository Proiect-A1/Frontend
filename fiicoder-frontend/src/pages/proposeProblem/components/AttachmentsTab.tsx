import { useState, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import type { ProposeProblemForm, FileCategory } from '../types/proposeProblem';
import { itemVariants, staggerConfig } from '../../../utils/motionConfig';
import { useTheme } from '../../../contexts/ThemeContext';
import { applyMonacoTheme } from '../../../utils/monacoTheme';
import { useSourceRunState } from '../hooks/useSourceRunState';
import { useFileManagement } from '../hooks/useFileManagement';

// Reordered per team request: Generatoare, Validatoare, Interactoare, Checkere, Surse
const allCategories: { id: FileCategory; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'generators', label: 'Generatoare', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, description: 'Programe C++ folosite de scriptul de generare' },
    { id: 'validators', label: 'Validatoare', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, description: 'Verifică dacă input-ul generat este valid' },
    { id: 'interactors', label: 'Interactoare', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>, description: 'Programe de interacțiune pentru probleme interactive' },
    { id: 'checkers', label: 'Checkere', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, description: 'Verifică dacă output-ul concurentului este corect' },
    { id: 'sources', label: 'Surse', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, description: 'Soluțiile oficiale — rulează-le pentru a vedea punctajul' },
];

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

const verdictColors: Record<string, string> = {
    AC: 'text-green-400',
    WA: 'text-red-400',
    TLE: 'text-yellow-400',
    MLE: 'text-orange-400',
    RE: 'text-purple-400',
    CE: 'text-gray-400',
};

export default function AttachmentsTab() {
    const { watch, setValue } = useFormContext<ProposeProblemForm>();
    const { theme, customColors } = useTheme();
    const files = watch('files') || [];
    const isInteractive = watch('isInteractive');

    const categories = isInteractive ? allCategories : allCategories.filter((c) => c.id !== 'interactors');

    const [activeCategory, setActiveCategory] = useState<FileCategory>('generators');
    const monacoRef = useRef<any>(null);

    // Extract file management state to hook
    const fileManagement = useFileManagement({
        files,
        onFilesChange: (newFiles) => setValue('files', newFiles),
        activeCategory,
    });

    // Extract run state to hook
    const runState = useSourceRunState();

    const categoryFiles = files.filter((f) => f.category === activeCategory);

    const handleEditorMount: OnMount = (_editor, monaco) => {
        monacoRef.current = monaco;
        applyMonacoTheme(monaco, theme, { customColors });
    };

    useEffect(() => {
        if (monacoRef.current) {
            applyMonacoTheme(monacoRef.current, theme, { customColors });
        }
    }, [theme, customColors]);

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
                            onClick={() => {
                                setActiveCategory(cat.id);
                                fileManagement.setEditingFileId(null);
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center gap-1.5 cursor-pointer outline-none ${
                                isActive
                                    ? 'bg-(--accent)/25 border-(--accent) text-(--text-h)'
                                    : 'bg-(--accent)/10 border-(--accent)/40 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h)'
                            }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                            {count > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-(--accent)/20 text-xs">
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </motion.div>

            {/* Category Description */}
            <motion.div variants={itemVariants} className="p-3 bg-(--surface-muted) rounded-2xl border border-(--accent)/20">
                <p className="text-sm text-(--text-muted)">
                    <strong>{activeCat.icon} {activeCat.label}:</strong> {activeCat.description}
                </p>
            </motion.div>

            {/* Upload Zone */}
            <motion.div variants={itemVariants}>
                <div
                    onDragEnter={fileManagement.handleDrag}
                    onDragLeave={fileManagement.handleDrag}
                    onDragOver={fileManagement.handleDrag}
                    onDrop={fileManagement.handleDrop}
                    className={`relative p-6 border-2 border-dashed rounded-2xl transition-colors cursor-pointer ${
                        fileManagement.dragActive
                            ? 'border-(--accent) bg-(--accent)/15'
                            : 'border-(--accent)/40 hover:border-(--accent)/70'
                    }`}
                    onClick={() => fileManagement.fileInputRef.current?.click()}
                >
                    <input
                        ref={fileManagement.fileInputRef}
                        type="file"
                        multiple
                        onChange={fileManagement.handleFileInput}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center text-center">
                        <svg
                            className="w-10 h-10 mb-2 text-(--accent)/60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                        </svg>
                        <p className="text-sm text-(--text) font-semibold">Trage fișierele aici sau fă clic</p>
                        <p className="text-xs text-(--text-muted) mt-0.5">.cpp, .c, .h, .py, .java, .txt</p>
                    </div>
                </div>
            </motion.div>

            {/* Files List */}
            {categoryFiles.length > 0 && (
                <motion.div variants={itemVariants} className="space-y-2">
                    <h3 className="text-sm font-semibold text-(--text)">
                        {activeCat.label} ({categoryFiles.length})
                    </h3>
                    {categoryFiles.map((file) => {
                        const history = runState.runHistory[file.id];
                        const isRunning = runState.runningFileId === file.id;
                        const isResultsExpanded = runState.expandedResults.has(file.id);

                        return (
                            <div key={file.id} className="space-y-1">
                                {/* File Card */}
                                <div
                                    className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                                        fileManagement.editingFileId === file.id
                                            ? 'bg-(--accent)/10 border-(--accent)/40'
                                            : 'bg-(--surface-muted) border-(--accent)/20 hover:bg-(--surface-muted)/70'
                                    }`}
                                >
                                    <div
                                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                                        onDoubleClick={() =>
                                            fileManagement.setEditingFileId(
                                                fileManagement.editingFileId === file.id ? null : file.id,
                                            )
                                        }
                                    >
                                        <svg
                                            className="w-5 h-5 text-(--text-muted) shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <div className="min-w-0">
                                            <p className="text-sm text-(--text) truncate font-mono">{file.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-(--text-muted)">
                                                    {formatFileSize(file.size)} · {file.language}
                                                </span>
                                                {isSources && history && (
                                                    <span className={`text-xs font-bold ${history.score === history.maxScore ? 'text-green-400' : 'text-yellow-400'}`}>
                                                        {history.score}/{history.maxScore}p
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isSources && (
                                            <button
                                                type="button"
                                                onClick={() => runState.handleRunSource(file.id, file.name)}
                                                disabled={isRunning}
                                                className="px-3 py-1 rounded-full text-xs font-semibold bg-(--accent)/20 text-(--accent) hover:bg-(--accent)/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isRunning ? 'Rulează...' : 'Run'}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => fileManagement.removeFile(file.id)}
                                            className="p-1 rounded-full text-(--text-muted) hover:text-red-400 transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Run Results */}
                                {isSources && history && (
                                    <AnimatePresence>
                                        {isResultsExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className="overflow-hidden bg-(--surface-muted) rounded-2xl border border-(--accent)/20 p-3 space-y-2 text-xs"
                                            >
                                                {history.subtasks.map((st) => {
                                                    const key = `${file.id}_${st.subtaskId}`;
                                                    const isStExpanded = runState.expandedSubtasks.has(key);
                                                    const isPerfect = st.scored === st.maxPoints;
                                                    return (
                                                        <div key={st.subtaskId}>
                                                            <button
                                                                type="button"
                                                                onClick={() => runState.toggleSubtask(key)}
                                                                className="w-full text-left flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-(--accent)/10 transition-colors"
                                                            >
                                                                <span className="text-(--text) font-semibold">
                                                                    {st.name}
                                                                </span>
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
                                                                                    <tr
                                                                                        key={t.testId}
                                                                                        className="border-t border-(--accent)/5 hover:bg-(--surface-muted)/40 transition-colors"
                                                                                    >
                                                                                        <td className="py-1 px-4 font-mono text-(--text-muted)">
                                                                                            #{t.testId}
                                                                                        </td>
                                                                                        <td className="py-1 px-2">
                                                                                            <span
                                                                                                className={`font-bold ${verdictColors[t.verdict] || 'text-(--text)'}`}
                                                                                            >
                                                                                                {t.verdict}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="py-1 px-2 font-mono text-(--text-muted)">
                                                                                            {t.time?.toFixed(2)}s
                                                                                        </td>
                                                                                        <td className="py-1 px-2 font-mono text-(--text-muted)">
                                                                                            {t.memory?.toFixed(1)}MB
                                                                                        </td>
                                                                                        <td className="py-1 px-2 text-right">
                                                                                            <span
                                                                                                className={`font-bold ${t.points === t.maxPoints ? 'text-green-400' : 'text-red-400'}`}
                                                                                            >
                                                                                                {t.points}/{t.maxPoints}
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
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                )}

                                {/* Inline Editor */}
                                <AnimatePresence>
                                    {fileManagement.editingFileId === file.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="rounded-2xl border border-(--accent)/25 overflow-hidden">
                                                <div className="flex items-center justify-between px-3 py-1.5 bg-(--surface-muted) border-b border-(--accent)/15">
                                                    <span className="text-xs text-(--text-muted) font-mono">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => fileManagement.setEditingFileId(null)}
                                                        className="inline-flex items-center gap-1 text-xs text-(--text-muted) hover:text-(--text-h) transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        Închide
                                                    </button>
                                                </div>
                                                <div style={{ height: '300px' }}>
                                                    <Editor
                                                        height="100%"
                                                        language={file.language || 'plaintext'}
                                                        theme="fiicoder-dark"
                                                        value={file.content}
                                                        onChange={(val) => fileManagement.updateFileContent(file.id, val || '')}
                                                        onMount={handleEditorMount}
                                                        options={{
                                                            minimap: { enabled: false },
                                                            wordWrap: 'on',
                                                            lineNumbers: 'on',
                                                            scrollBeyondLastLine: false,
                                                            fontSize: 13,
                                                        }}
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
            )}
        </motion.div>
    );
}

