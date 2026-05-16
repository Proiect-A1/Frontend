import { Controller, useFormContext } from 'react-hook-form';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { OnMount } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import type { ProposeProblemForm } from '../types/proposeProblem';
import { itemVariants, staggerConfig } from '../../../utils/motionConfig';
import { useTheme } from '../../../contexts/ThemeContext';
import { applyMonacoTheme, getEffectivePalette } from '../../../utils/monacoTheme';
import { useMonacoTheming } from '../hooks/useMonacoTheming';

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
    const { theme, customColors } = useTheme();
    const [showPreview, setShowPreview] = useState(true);
    const monacoRef = useRef<any>(null);

    const buildStatementRules = (themeName: string) => {
        const palette = getEffectivePalette(themeName, customColors);
        return [
            { token: 'type', foreground: palette.accentSecondary.replace('#', '') },
            { token: 'function', foreground: palette.accent.replace('#', '') },
            { token: 'variable', foreground: palette.text.replace('#', '') },
        ];
    };

    const handleEditorMount: OnMount = (_editor, monaco) => {
        monacoRef.current = monaco;
        applyMonacoTheme(monaco, theme, { customColors, extraRules: buildStatementRules(theme) });
    };

    // Apply theme reactively when theme changes (hook)
    useMonacoTheming(monacoRef, theme, buildStatementRules, customColors);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: staggerConfig } }}
            className="space-y-3"
        >


            {/* Preview Toggle */}
            <motion.div variants={itemVariants} className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
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
                    <label className="text-(--text) text-sm font-semibold">Enunț</label>
                    <Controller
                        name="statement"
                        control={control}
                        rules={{ required: 'Enunțul este obligatoriu' }}
                        render={({ field }) => (
                            <div className="bg-(--surface-card) rounded-2xl border border-(--accent)/25 overflow-hidden h-96">
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
                    <div className="">
                        <label className="text-(--text) text-sm font-semibold">
                            Previzualizare
                        </label>
                        <Controller
                            name="statement"
                            control={control}
                            render={({ field }) => (
                                <div className="border border-(--accent)/25 rounded-2xl p-4 h-96 overflow-y-auto bg-(--surface-muted) custom-scrollbar text-(--text) leading-relaxed">
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
                                                        className="bg-(--surface-card) p-4 rounded-2xl border border-(--accent)/30 overflow-x-auto text-sm text-(--text) shadow-inner [&>code]:text-(--text)"
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
                className="p-4 bg-(--surface-muted) rounded-2xl border border-(--accent)/25 space-y-2"
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

