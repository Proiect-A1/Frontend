import { Controller, useFormContext } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { OnMount } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import type { ProposeProblemForm } from '../../types/proposeProblem';
import { itemVariants, staggerConfig } from '../../utils/motionConfig';
import { useTheme } from '../../services/ThemeContext';

const monacoThemes: Record<
    string,
    {
        accent: string;
        text: string;
        textMuted: string;
        textSubtle: string;
        editorBg: string;
        codeBg: string;
        accentSecondary: string;
    }
> = {
    rose: {
        accent: '#ff5eb6',
        accentSecondary: '#a78bfa',
        text: '#ffe8f6',
        textMuted: '#b39aad',
        textSubtle: '#8a7099',
        editorBg: '#0a0812',
        codeBg: '#120e1c',
    },
    nord: {
        accent: '#88c0d0',
        accentSecondary: '#5e81ac',
        text: '#eceff4',
        textMuted: '#7b88a1',
        textSubtle: '#616e88',
        editorBg: '#242933',
        codeBg: '#2e3440',
    },
    cream: {
        accent: '#d4a574',
        accentSecondary: '#b76857',
        text: '#f5f1e8',
        textMuted: '#a89080',
        textSubtle: '#8a7560',
        editorBg: '#1a1612',
        codeBg: '#2a2420',
    },
    sage: {
        accent: '#7a9e7e',
        accentSecondary: '#5a7e78',
        text: '#e8ebe7',
        textMuted: '#7a8f7c',
        textSubtle: '#667069',
        editorBg: '#1a1e1a',
        codeBg: '#242823',
    },
};

function applyMonacoTheme(monaco: any, themeName: string) {
    const palette = monacoThemes[themeName] || monacoThemes.rose;

    monaco.editor.defineTheme('fiicoder-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            {
                token: 'comment',
                foreground: palette.textMuted.replace('#', ''),
                fontStyle: 'italic',
            },
            { token: 'keyword', foreground: palette.accent.replace('#', '') },
            { token: 'string', foreground: palette.accentSecondary.replace('#', '') },
            { token: 'number', foreground: palette.accent.replace('#', '') },
            { token: 'type', foreground: palette.accentSecondary.replace('#', '') },
            { token: 'function', foreground: palette.accent.replace('#', '') },
            { token: 'variable', foreground: palette.text.replace('#', '') },
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
            'editor.selectionHighlightBackground': `${palette.accent}33`,
            'editorBracketMatch.background': `${palette.accent}40`,
            'editorBracketMatch.border': `${palette.accent}99`,
            'scrollbarSlider.background': `${palette.accent}26`,
            'scrollbarSlider.hoverBackground': `${palette.accent}4d`,
            'scrollbarSlider.activeBackground': `${palette.accent}80`,
        },
    });
    monaco.editor.setTheme('fiicoder-dark');
}

// Utility to fix database indentation issues for Markdown
function unindent(str: string): string {
    if (!str) return '';
    const lines = str.split('\n');

    let minIndent = Infinity;
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim().length > 0) {
            const match = lines[i].match(/^[ \t]*/);
            if (match) {
                minIndent = Math.min(minIndent, match[0].length);
            }
        }
    }

    if (minIndent === Infinity || minIndent === 0) return str;

    return lines
        .map((line, index) => {
            if (index === 0) return line;
            if (line.trim().length === 0) return '';
            const regex = new RegExp(`^[ \\t]{1,${minIndent}}`);
            return line.replace(regex, '');
        })
        .join('\n');
}

export default function StatementTab() {
    const { control } = useFormContext<ProposeProblemForm>();
    const { theme } = useTheme();
    const [showPreview, setShowPreview] = useState(true);
    const monacoRef = useRef<any>(null);

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

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: staggerConfig } }}
            className="space-y-6"
        >
            {/* Source URL */}
            <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-(--text) font-semibold text-sm">URL Sursă (opțional)</label>
                <Controller
                    name="sourceUrl"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            placeholder="ex: https://codeforces.com/problemset/problem/1/A"
                            className="w-full px-4 py-2 bg-(--surface-muted) border border-(--accent)/25 rounded-xl text-(--text) placeholder:text-(--text-muted) focus:outline-none transition-all"
                        />
                    )}
                />
            </motion.div>

            {/* Preview Toggle */}
            <motion.div variants={itemVariants} className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                >
                    {showPreview ? 'Ascunde Preview' : 'Arăta Preview'}
                </button>
            </motion.div>

            {/* Editor & Preview Layout */}
            <motion.div
                variants={itemVariants}
                className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}
            >
                {/* Monaco Editor */}
                <div className="space-y-1">
                    <label className="text-(--text) text-sm font-semibold">Markdown Enunț</label>
                    <Controller
                        name="statement"
                        control={control}
                        rules={{ required: 'Enunțul este obligatoriu' }}
                        render={({ field }) => (
                            <div className="bg-(--surface-card) rounded-xl border border-(--accent)/25 overflow-hidden h-96">
                                <Editor
                                    height="100%"
                                    defaultLanguage="markdown"
                                    theme="fiicoder-dark"
                                    value={field.value}
                                    onChange={(val) => field.onChange(val || '')}
                                    onMount={handleEditorMount}
                                    options={{
                                        minimap: { enabled: false },
                                        wordWrap: 'on',
                                        lineNumbers: 'on',
                                        scrollBeyondLastLine: false,
                                    }}
                                />
                            </div>
                        )}
                    />
                    <p className="text-xs text-(--text-muted)">
                        Folosește <strong>Markdown</strong> pentru formatare. Poți folosi și{' '}
                        <strong>LaTeX</strong> cu $...$ pentru ecuații.
                    </p>
                </div>

                {/* Live Preview */}
                {showPreview && (
                    <div className="space-y-1">
                        <label className="text-(--text) text-sm font-semibold">
                            Previzualizare
                        </label>
                        <Controller
                            name="statement"
                            control={control}
                            render={({ field }) => (
                                <div className="border border-(--accent)/25 rounded-xl p-4 h-96 overflow-y-auto bg-(--surface-muted) custom-scrollbar text-(--text) leading-relaxed">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            // Titluri
                                            h1: ({ ...props }) => (
                                                <h1
                                                    className="text-2xl font-bold text-(--accent) mt-6 mb-3 border-b border-(--accent)/30 pb-1"
                                                    {...props}
                                                />
                                            ),
                                            h2: ({ ...props }) => (
                                                <h2
                                                    className="text-xl font-bold text-(--accent) mt-5 mb-2"
                                                    {...props}
                                                />
                                            ),
                                            h3: ({ ...props }) => (
                                                <h3
                                                    className="text-lg font-bold text-(--accent) mt-4 mb-1"
                                                    {...props}
                                                />
                                            ),

                                            // Paragrafe
                                            p: ({ ...props }) => (
                                                <p
                                                    className="mb-4 whitespace-pre-wrap"
                                                    {...props}
                                                />
                                            ),

                                            // Liste
                                            ul: ({ ...props }) => (
                                                <ul
                                                    className="list-disc pl-6 mb-4 space-y-1"
                                                    {...props}
                                                />
                                            ),
                                            ol: ({ ...props }) => (
                                                <ol
                                                    className="list-decimal pl-6 mb-4 space-y-1"
                                                    {...props}
                                                />
                                            ),
                                            li: ({ ...props }) => (
                                                <li className="ml-2" {...props} />
                                            ),

                                            // Formule matematice inline
                                            span: ({ className, children, ...props }: any) => {
                                                if (className && className.includes('katex')) {
                                                    return (
                                                        <span
                                                            className={`${className} text-(--accent)`}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <span className={className} {...props}>
                                                        {children}
                                                    </span>
                                                );
                                            },

                                            // Cod inline
                                            code: ({ className, children, ...props }: any) => {
                                                if (className) {
                                                    // Cod în bloc (cu pre)
                                                    return (
                                                        <code
                                                            className={`${className} text-(--accent) font-mono`}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                                // Cod inline
                                                return (
                                                    <code
                                                        className="text-(--accent) font-mono bg-(--accent)/10 px-1.5 py-0.5 rounded text-sm"
                                                        {...props}
                                                    >
                                                        {children}
                                                    </code>
                                                );
                                            },

                                            // Blocuri de cod
                                            pre: ({ children, ...props }: any) => (
                                                <div className="relative group my-4">
                                                    <pre
                                                        className="bg-(--surface-card) p-4 rounded-xl border border-(--accent)/30 overflow-x-auto text-sm text-(--text) shadow-inner [&>code]:text-(--text)"
                                                        {...props}
                                                    >
                                                        {children}
                                                    </pre>
                                                </div>
                                            ),

                                            // Citate
                                            blockquote: ({ ...props }) => (
                                                <blockquote
                                                    className="border-l-4 border-(--accent) pl-4 italic text-(--text-muted) my-4"
                                                    {...props}
                                                />
                                            ),

                                            // Link-uri
                                            a: ({ ...props }) => (
                                                <a
                                                    className="text-(--accent) hover:opacity-80 underline"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    {...props}
                                                />
                                            ),
                                        }}
                                    >
                                        {unindent(field.value || '*Enunțul tău va apărea aici...*')}
                                    </ReactMarkdown>
                                </div>
                            )}
                        />
                    </div>
                )}
            </motion.div>

            {/* Template Helper */}
            <motion.div
                variants={itemVariants}
                className="p-4 bg-(--surface-muted) rounded-xl border border-(--accent)/25 space-y-2"
            >
                <h4 className="font-semibold text-(--accent)">Template Rapid:</h4>
                <pre className="text-xs text-(--text) overflow-x-auto bg-(--surface-muted) p-3 rounded">
                    {`# Descrierea Problemei

## Cerință
Descrie ce trebuie să facă soluția...

## Restricții
- $1 \\leq n \\leq 10^5$
- $0 \\leq a_i \\leq 10^9$

## Exemple

### Exemplul 1
**Input:**
\`\`\`
3
1 2 3
\`\`\`
**Output:**
\`\`\`
6
\`\`\``}
                </pre>
            </motion.div>
        </motion.div>
    );
}
