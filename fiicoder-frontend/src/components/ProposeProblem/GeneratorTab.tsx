import { useState, useEffect, useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import type { ProposeProblemForm, GeneratorValidationError } from '../../types/proposeProblem';
import { itemVariants, staggerConfig } from '../../utils/motionConfig';
import { useTheme } from '../../services/ThemeContext';
import { registerGeneratorLanguage, LANGUAGE_ID } from '../../utils/generatorLanguage';

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
    monaco.editor.defineTheme('fiicoder-gen-theme', {
        base: 'vs-dark', inherit: true,
        rules: [
            { token: 'comment', foreground: palette.textMuted.replace('#', ''), fontStyle: 'italic' },
            { token: 'keyword.directive', foreground: palette.accent.replace('#', ''), fontStyle: 'bold' },
            { token: 'number', foreground: palette.accentSecondary.replace('#', '') },
            { token: 'string.filename', foreground: 'e0c97b', fontStyle: 'underline' },
            { token: 'operator.copy', foreground: '66bb6a', fontStyle: 'bold' },
            { token: 'operator.generator', foreground: '42a5f5', fontStyle: 'bold' },
            { token: 'identifier', foreground: palette.text.replace('#', '') },
            { token: 'invalid', foreground: 'ff5252', fontStyle: 'bold' },
        ],
        colors: {
            'editor.background': palette.editorBg,
            'editor.foreground': palette.text,
            'editor.lineHighlightBackground': palette.codeBg,
            'editor.selectionBackground': `${palette.accent}4d`,
            'editor.inactiveSelectionBackground': `${palette.accent}26`,
            'editorLineNumber.foreground': palette.textSubtle,
            'editorLineNumber.activeForeground': palette.accent,
            'editorCursor.foreground': palette.accent,
            'editorIndentGuide.background': `${palette.accent}1f`,
            'editorIndentGuide.activeBackground': `${palette.accent}59`,
            'scrollbarSlider.background': `${palette.accent}26`,
            'scrollbarSlider.hoverBackground': `${palette.accent}4d`,
            'scrollbarSlider.activeBackground': `${palette.accent}80`,
        },
    });
    monaco.editor.setTheme('fiicoder-gen-theme');
}

const EXAMPLE_SCRIPT = `#MAIN main
#DEFGRP 10 exemple
#DEFGRP 90 full

#VAL val 100 100 // maxt, maxn
#CHECK check 100 100 10000 // maxt, maxn, max operatii

#IN exemple full
= exemplu.in

#NOTIN exemple
#GEN gen 100 100 // t, n
< gen 34 56
2
3
4
5
`;

type ValidationStatus = 'idle' | 'validating' | 'success' | 'error';

export default function GeneratorTab() {
    const { watch, setValue } = useFormContext<ProposeProblemForm>();
    const { theme } = useTheme();
    const monacoRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generatorScript = watch('generatorScript') || '';

    const [status, setStatus] = useState<ValidationStatus>('idle');
    const [errors, setErrors] = useState<GeneratorValidationError[]>([]);
    const [showDocsTooltip, setShowDocsTooltip] = useState(false);

    const handleSave = useCallback(async () => {
        setStatus('validating');
        setErrors([]);

        try {
            // Mock API call
            await new Promise((resolve) => setTimeout(resolve, 1200));

            const script = watch('generatorScript') || '';
            if (script.trim().length === 0) {
                setStatus('error');
                setErrors([{ line: 1, col: 1, message: 'Scriptul de generare este gol.' }]);
                return;
            }

            const mockSuccess = script.length > 10;
            if (mockSuccess) {
                setStatus('success');
                setErrors([]);
            } else {
                setStatus('error');
                setErrors([
                    { line: 1, col: 1, message: 'Scriptul este prea scurt. Adaugă comenzi de generare.' },
                ]);
            }
        } catch {
            setStatus('error');
            setErrors([{ line: 0, col: 0, message: 'Eroare de conexiune la server.' }]);
        }
    }, [watch]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleSave]);

    const handleEditorMount: OnMount = (_editor, monaco) => {
        monacoRef.current = monaco;
        registerGeneratorLanguage(monaco);
        applyMonacoTheme(monaco, theme);
    };

    // Reactively update Monaco theme when app theme changes
    useEffect(() => {
        if (monacoRef.current) {
            applyMonacoTheme(monacoRef.current, theme);
        }
    }, [theme]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setValue('generatorScript', ev.target?.result as string);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const insertExample = () => {
        setValue('generatorScript', EXAMPLE_SCRIPT);
    };

    const statusConfig = {
        idle: { icon: '', text: '', className: '' },
        validating: { icon: <div className="w-3.5 h-3.5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />, text: 'Se validează...', className: 'text-yellow-400' },
        success: { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>, text: 'Script valid!', className: 'text-green-400' },
        error: { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>, text: 'Erori găsite', className: 'text-red-400' },
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: staggerConfig } }}
            className="space-y-4"
        >
            {/* Toolbar */}
            <motion.div
                variants={itemVariants}
                className="flex items-center justify-between flex-wrap gap-3"
            >
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-(--text-h)">Script Generator</h2>

                    {/* Info icon */}
                    <div className="relative">
                        <button
                            type="button"
                            onMouseEnter={() => setShowDocsTooltip(true)}
                            onMouseLeave={() => setShowDocsTooltip(false)}
                            className="w-7 h-7 flex items-center justify-center rounded-full border-2 border-(--accent)/40 text-(--accent) hover:bg-(--accent)/20 transition-all hover:scale-110"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                        {showDocsTooltip && (
                            <div className="absolute left-10 top-0 z-50 w-80 p-4 bg-(--surface-dropdown) border-2 border-(--accent)/30 rounded-2xl shadow-2xl text-xs text-(--text) backdrop-blur-md">
                                <p className="font-bold text-lg text-(--accent) mb-2">Sintaxă Generator</p>
                                <div className="space-y-2">
                                    <p className="text-(--text-muted) leading-relaxed">
                                        Folosește directivele de mai jos pentru a configura procesul de generare a testelor.
                                    </p>
                                    <pre className="p-3 bg-black/30 rounded-xl text-(--text-muted) whitespace-pre-wrap font-mono text-[11px] leading-relaxed border border-(--accent)/10">
{`#MAIN <sursă>      // Soluția principală
#DEFGRP <puncte> <nume> // Definește subtask
#GEN <gen> <args...> // Rulează generator
#VAL <val> <args...> // Rulează validator
#CHECK <chk> <args...> // Rulează checker

#IN <grupuri...>    // Include în grupuri
#NOTIN <grupuri...> // Exclude din grupuri
#TEST <pct> <args...> // Test individual

= <fișier>    // Copiază test existent
< <gen> <args> // Generator specific test`}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {status !== 'idle' && (
                        <span className={`flex items-center gap-1.5 text-sm font-semibold ${statusConfig[status].className}`}>
                            {statusConfig[status].icon} {statusConfig[status].text}
                        </span>
                    )}

                    {/* Template button */}
                    <button
                        type="button"
                        onClick={insertExample}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl font-semibold border border-(--accent)/40 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors text-(--text-h)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> Exemplu
                    </button>

                    {/* Upload */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".gen,.txt,.script"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl font-semibold border border-(--accent)/40 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors text-(--text-h)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> Încarcă
                    </button>

                    {/* Save */}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={status === 'validating'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl font-semibold border border-(--accent)/40 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors text-(--text-h) disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg> Salvează
                        <span className="text-xs text-(--text-muted) ml-1">(Ctrl+S)</span>
                    </button>
                </div>
            </motion.div>

            {/* Monaco Editor with custom language */}
            <motion.div variants={itemVariants}>
                <div
                    className="bg-(--surface-card) rounded-xl border border-(--accent)/25 overflow-hidden"
                    style={{ height: errors.length > 0 ? '50vh' : '65vh' }}
                >
                    <Editor
                        height="100%"
                        language={LANGUAGE_ID}
                        theme="fiicoder-gen-theme"
                        value={generatorScript}
                        onChange={(val) => setValue('generatorScript', val || '')}
                        onMount={handleEditorMount}
                        options={{
                            minimap: { enabled: false },
                            wordWrap: 'on',
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            fontSize: 14,
                            tabSize: 4,
                            renderWhitespace: 'selection',
                        }}
                    />
                </div>
            </motion.div>

            {/* Errors Panel */}
            {errors.length > 0 && (
                <motion.div
                    variants={itemVariants}
                    className="rounded-xl border border-red-500/30 bg-red-950/20 overflow-hidden"
                >
                    <div className="px-4 py-2 bg-red-950/40 border-b border-red-500/20">
                        <span className="text-red-400 font-semibold text-sm">
                            ✗ {errors.length} {errors.length === 1 ? 'eroare' : 'erori'}
                        </span>
                    </div>
                    <div className="max-h-40 overflow-y-auto custom-scrollbar">
                        {errors.map((err, i) => (
                            <div
                                key={i}
                                className="px-4 py-2 border-b border-red-500/10 last:border-0 hover:bg-red-950/30 transition-colors flex items-start gap-3"
                            >
                                {err.line > 0 && (
                                    <span className="text-xs text-red-400/70 font-mono shrink-0 mt-0.5">
                                        L{err.line}:{err.col}
                                    </span>
                                )}
                                <span className="text-sm text-red-300">{err.message}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Success Panel */}
            {status === 'success' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-green-500/30 bg-green-950/20"
                >
                    <p className="text-sm text-green-400 font-semibold">
                        ✓ Scriptul a fost validat cu succes! Mergi la „Fișiere → Surse" pentru a rula o sursă oficială.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
