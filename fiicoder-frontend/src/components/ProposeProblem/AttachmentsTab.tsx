import { useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import type { ProposeProblemForm, ProblemFile, FileCategory } from '../../types/proposeProblem';
import { itemVariants, staggerConfig } from '../../utils/motionConfig';
import { useTheme } from '../../services/ThemeContext';

// Monaco theme palettes (shared)
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

const categories: { id: FileCategory; label: string; icon: string; description: string }[] = [
    { id: 'sources', label: 'Surse Oficiale', icon: '📄', description: 'Soluțiile corecte ale autorului (main.cpp, brute.cpp etc.)' },
    { id: 'checkers', label: 'Checkere', icon: '✅', description: 'Verifică dacă output-ul concurentului este corect' },
    { id: 'validators', label: 'Validatoare', icon: '🔍', description: 'Verifică dacă input-ul generat este valid' },
    { id: 'generators', label: 'Generatoare', icon: '⚙️', description: 'Programe C++ folosite de scriptul de generare' },
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

export default function FilesTab() {
    const { watch, setValue } = useFormContext<ProposeProblemForm>();
    const { theme } = useTheme();
    const files = watch('files') || [];

    const [activeCategory, setActiveCategory] = useState<FileCategory>('sources');
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const categoryFiles = files.filter((f) => f.category === activeCategory);

    const handleEditorMount: OnMount = (_editor, monaco) => {
        applyMonacoTheme(monaco, theme);
    };

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
    };

    const updateFileContent = (fileId: string, content: string) => {
        setValue(
            'files',
            files.map((f) => (f.id === fileId ? { ...f, content } : f)),
        );
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
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles) Array.from(droppedFiles).forEach(addFile);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.currentTarget.files;
        if (selectedFiles) Array.from(selectedFiles).forEach(addFile);
        e.target.value = '';
    };

    const activeCat = categories.find((c) => c.id === activeCategory)!;

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
                                setEditingFileId(null);
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center gap-1.5 cursor-pointer outline-none ${
                                isActive
                                    ? 'bg-(--accent)/25 border-(--accent) text-(--text-h)'
                                    : 'bg-transparent border-(--accent)/40 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h)'
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
            <motion.div
                variants={itemVariants}
                className="p-3 bg-(--surface-muted) rounded-xl border border-(--accent)/20"
            >
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
                        dragActive
                            ? 'border-(--accent) bg-(--accent)/15'
                            : 'border-(--accent)/40 hover:border-(--accent)/70'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-3xl mb-1">📤</span>
                        <p className="text-sm text-(--text) font-semibold">
                            Trage fișierele aici sau fă clic
                        </p>
                        <p className="text-xs text-(--text-muted) mt-0.5">
                            .cpp, .c, .h, .py, .java, .txt
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Files List */}
            {categoryFiles.length > 0 && (
                <motion.div variants={itemVariants} className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-(--text)">
                        {activeCat.label} ({categoryFiles.length})
                    </h3>
                    {categoryFiles.map((file) => (
                        <div key={file.id}>
                            <div
                                className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                                    editingFileId === file.id
                                        ? 'bg-(--accent)/10 border-(--accent)/40'
                                        : 'bg-(--surface-muted) border-(--accent)/20 hover:bg-(--surface-muted)/70'
                                }`}
                                onDoubleClick={() =>
                                    setEditingFileId(editingFileId === file.id ? null : file.id)
                                }
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-lg shrink-0">📄</span>
                                    <div className="min-w-0">
                                        <p className="text-sm text-(--text) truncate font-mono">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-(--text-muted)">
                                            {formatFileSize(file.size)} · {file.language}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingFileId(
                                                editingFileId === file.id ? null : file.id,
                                            );
                                        }}
                                        className="p-1.5 text-(--text-muted) hover:text-(--text-h) hover:bg-(--accent)/15 rounded transition-colors text-xs"
                                        title="Editează"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(file.id);
                                        }}
                                        className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors text-xs"
                                        title="Șterge"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

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
                                        <div className="mt-1 rounded-xl border border-(--accent)/25 overflow-hidden">
                                            <div className="flex items-center justify-between px-3 py-1.5 bg-(--surface-muted) border-b border-(--accent)/15">
                                                <span className="text-xs text-(--text-muted) font-mono">
                                                    {file.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingFileId(null)}
                                                    className="text-xs text-(--text-muted) hover:text-(--text-h) transition-colors"
                                                >
                                                    ✕ Închide
                                                </button>
                                            </div>
                                            <div style={{ height: '300px' }}>
                                                <Editor
                                                    height="100%"
                                                    language={file.language || 'plaintext'}
                                                    theme="fiicoder-dark"
                                                    value={file.content}
                                                    onChange={(val) =>
                                                        updateFileContent(file.id, val || '')
                                                    }
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
                    ))}
                </motion.div>
            )}

            {categoryFiles.length === 0 && (
                <motion.div
                    variants={itemVariants}
                    className="text-center py-8 text-(--text-muted) text-sm"
                >
                    Niciun fișier în categoria „{activeCat.label}". Uploadează fișiere mai sus.
                </motion.div>
            )}

            {/* Stats */}
            <motion.div
                variants={itemVariants}
                className="p-4 bg-(--surface-muted) rounded-xl border border-(--accent)/25"
            >
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
                    <strong>Total:</strong> {files.length} fișiere ·{' '}
                    {formatFileSize(files.reduce((s, f) => s + f.size, 0))}
                </p>
            </motion.div>
        </motion.div>
    );
}
