import { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import type { ProposeProblemForm } from '../types/proposeProblem';
import { itemVariants, staggerConfig } from '../../../utils/motionConfig';
import { useTheme } from '../../../contexts/ThemeContext';
import { registerGeneratorLanguage, LANGUAGE_ID } from '../utils/generatorLanguage';
import { applyMonacoTheme, getEffectivePalette } from '../../../utils/monacoTheme';
import { useGeneratorValidation } from '../hooks/useGeneratorValidation';
import ScriptDocumentation from './ScriptDocumentation';
import { useMonacoContextMenu } from '../../../hooks/useMonacoContextMenu';
import { useLanguage, useT, getGeneratorErrorLabel, getGeneratorWarningLabel } from '../../../language/Language';

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

// validation status handled by hook

export default function GeneratorTab() {
    const { watch, setValue, clearErrors } = useFormContext<ProposeProblemForm>();
    const { theme, customColors } = useTheme();
    const { lang } = useLanguage();
    const t = useT();
    const monacoRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generatorScript = watch('generatorScript') || '';

    const { status, errors, warnings, handleSave } = useGeneratorValidation(generatorScript);
    const [showDocsPanel, setShowDocsPanel] = useState(false);
    const { setupContextMenu, contextMenuEl } = useMonacoContextMenu();

    const buildGeneratorRules = () => {
        const palette = getEffectivePalette(theme, customColors);
        return [
            { token: 'keyword.directive', foreground: palette.accent.replace('#', ''), fontStyle: 'bold' },
            { token: 'string.filename', foreground: 'e0c97b', fontStyle: 'underline' },
            { token: 'operator.copy', foreground: '66bb6a', fontStyle: 'bold' },
            { token: 'operator.generator', foreground: '42a5f5', fontStyle: 'bold' },
            { token: 'identifier', foreground: palette.text.replace('#', '') },
            { token: 'invalid', foreground: 'ff5252', fontStyle: 'bold' },
        ];
    };

    // `handleSave` from hook handles validation and Ctrl+S binding

    const handleEditorMount: OnMount = (_editor, monaco) => {
        monacoRef.current = monaco;
        registerGeneratorLanguage(monaco);
        applyMonacoTheme(monaco, theme, {
            themeId: 'fiicoder-gen-theme',
            customColors,
            extraRules: buildGeneratorRules(),
        });
        setupContextMenu(_editor);
    };

    // Reactively update Monaco theme when app theme changes
    useEffect(() => {
        if (monacoRef.current) {
            applyMonacoTheme(monacoRef.current, theme, {
                themeId: 'fiicoder-gen-theme',
                customColors,
                extraRules: buildGeneratorRules(),
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme, customColors]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;
            setValue('generatorScript', content);
            if (content?.trim()) clearErrors('generatorScript');
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const insertExample = () => {
        setValue('generatorScript', EXAMPLE_SCRIPT);
        clearErrors('generatorScript');
    };

    const statusConfig = {
        idle: { icon: '', text: '', className: '' },
        validating: { icon: <div className="w-3.5 h-3.5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />, text: t.generatorValidating, className: 'text-yellow-400' },
        success: { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>, text: t.generatorValid, className: 'text-green-400' },
        error: { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>, text: t.generatorErrorsFound, className: 'text-red-400' },
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
                    <h2 className="text-lg font-bold text-(--text-h)">{t.generatorTitle}</h2>

                    {/* Info icon -> toggle full documentation */}
                    <button
                        type="button"
                        onClick={() => setShowDocsPanel(!showDocsPanel)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full font-semibold border transition-all ${
                            showDocsPanel
                                ? 'border-(--accent) bg-(--accent) text-(--surface-card)'
                                : 'border-(--accent)/40 bg-(--accent)/10 text-(--text-h) hover:bg-(--accent)/20'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        {showDocsPanel ? t.generatorHideDocs : t.generatorShowDocs}
                    </button>
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full font-semibold border border-(--accent)/40 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors text-(--text-h)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> {t.generatorExample}
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full font-semibold border border-(--accent)/40 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors text-(--text-h)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> {t.generatorUpload}
                    </button>

                    {/* Save */}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={status === 'validating'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full font-semibold border border-(--accent)/40 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors text-(--text-h) disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg> {t.generatorSave}
                        <span className="text-xs text-(--text-muted) ml-1">(Ctrl+S)</span>
                    </button>
                </div>
            </motion.div>

            {/* Documentation Panel */}
            {showDocsPanel && (
                <motion.div variants={itemVariants}>
                    <ScriptDocumentation />
                </motion.div>
            )}

            {/* Monaco Editor with custom language */}
            <motion.div variants={itemVariants}>
                <div
                    className="relative bg-(--surface-card) rounded-2xl border border-(--accent)/25 overflow-hidden"
                    style={{ height: errors.length > 0 ? '50vh' : '65vh' }}
                >
                    <Editor
                        height="100%"
                        language={LANGUAGE_ID}
                        theme="fiicoder-gen-theme"
                        value={generatorScript}
                        onChange={(val) => {
                            setValue('generatorScript', val || '');
                            if (val?.trim()) clearErrors('generatorScript');
                        }}
                        onMount={handleEditorMount}
                        options={{
                            minimap: { enabled: false },
                            wordWrap: 'on',
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            fontSize: 14,
                            tabSize: 4,
                            renderWhitespace: 'selection',
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Ubuntu Mono', 'DejaVu Sans Mono', 'Cascadia Code', monospace",
                            fontLigatures: true,
                            contextmenu: false,
                        }}
                    />
                    {contextMenuEl}
                </div>
            </motion.div>

            {/* Errors Panel */}
            {errors.length > 0 && (
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border-2 border-red-500/50 bg-red-950/20 overflow-hidden"
                >
                    <div className="px-4 py-3 bg-red-950/50 border-b border-red-500/30 flex items-center justify-between">
                        <span className="text-red-400 font-bold text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                            {getGeneratorErrorLabel(lang, errors.length)} — {t.generatorCannotSubmit}
                        </span>
                        <span className="text-xs text-red-400/60 font-mono">{t.generatorSaveHint}</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar divide-y divide-red-500/10">
                        {errors.map((err, i) => (
                            <div
                                key={i}
                                className="px-4 py-3 hover:bg-red-950/30 transition-colors flex items-start gap-3"
                            >
                                <span className="text-xs text-red-400/80 font-mono shrink-0 mt-0.5 min-w-[60px]">
                                    {err.line > 0 ? `L${err.line}:${err.col}` : '—'}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm text-red-300 leading-snug">{err.message}</span>
                                </div>
                                <span className="shrink-0 text-xs text-red-500/50 font-bold">#{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Warnings Panel */}
            {warnings.length > 0 && (
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border-2 border-yellow-500/40 bg-yellow-950/20 overflow-hidden"
                >
                    <div className="px-4 py-3 bg-yellow-950/40 border-b border-yellow-500/20 flex items-center justify-between">
                        <span className="text-yellow-400 font-bold text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                            {getGeneratorWarningLabel(lang, warnings.length)}
                        </span>
                    </div>
                    <div className="max-h-40 overflow-y-auto custom-scrollbar divide-y divide-yellow-500/10">
                        {warnings.map((w, i) => (
                            <div key={i} className="px-4 py-3 hover:bg-yellow-950/30 transition-colors flex items-start gap-3">
                                <span className="text-xs text-yellow-400/80 font-mono shrink-0 mt-0.5 min-w-[60px]">
                                    {w.line > 0 ? `L${w.line}:${w.col}` : '—'}
                                </span>
                                <span className="text-sm text-yellow-300 leading-snug">{w.message}</span>
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
                    className="p-4 rounded-2xl border border-green-500/30 bg-green-950/20"
                >
                    <p className="text-sm text-green-400 font-semibold flex items-center gap-1.5">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        {t.generatorSyntaxOk}
                    </p>
                    <p className="mt-1 text-xs text-green-400/80">
                        {t.generatorRuntimeNote}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
