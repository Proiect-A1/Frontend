import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { getMonacoLanguageId } from '../../../utils/monacoTheme';

type Props = {
    isAuthenticated: boolean;
    t: any;
    code: string;
    setCode: (s: string) => void;
    language: string;
    setLanguage: (s: string) => void;
    isOpen: boolean;
    setIsOpen: (b: boolean) => void;
    availableLanguages: any[];
    setSelectedLanguageId: (id: string) => void;
    handleEditorMount: any;
    handleSubmit: (e: React.FormEvent) => void;
};

export default function EditorPanel({
    isAuthenticated,
    t,
    code,
    setCode,
    language,
    setLanguage,
    isOpen,
    setIsOpen,
    availableLanguages,
    setSelectedLanguageId,
    handleEditorMount,
    handleSubmit,
}: Props) {

    if (isAuthenticated) {
        return (
            <div className="h-full p-6 flex flex-col bg-(--surface-card) overflow-hidden">
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
                            language={getMonacoLanguageId(language)}
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            theme="vs-dark"
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
        );
    }

    return (
        <div className="h-full p-6 flex flex-col bg-(--surface-card) overflow-hidden items-center justify-center gap-5 py-12">
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
                    {t.submitTitle}
                </h3>
                <p className="text-sm text-(--text-muted)">
                    {t.submitAuthHelpful}
                </p>
            </div>
            <a
                href="/login"
                className="px-6 py-2.5 rounded-xl border border-(--accent)/50 bg-(--accent)/20 text-sm font-bold text-(--text-h) transition hover:border-(--accent) hover:bg-(--accent)/30"
            >
                {t.loginTitle}
            </a>
        </div>
    );
}