import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { translations } from '../../../language/Language';

function CodeBlock({ children, lang, ...props }: any) {
    const [copied, setCopied] = useState(false);
    const preRef = useRef<HTMLPreElement>(null);

    const handleCopy = () => {
        const text = preRef.current?.innerText ?? '';
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const t = translations[lang as 'RO' | 'EN'] ?? translations.RO;

    return (
        <div className="relative my-4">
            <pre
                ref={preRef}
                className="bg-(--surface-input) p-4 rounded-xl border border-(--accent)/20 overflow-x-auto text-sm text-(--text) shadow-inner"
                {...props}
            >
                {children}
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold border border-(--accent)/20 bg-(--surface-card) text-(--text-muted) hover:text-(--text) hover:border-(--accent)/40 transition-colors"
            >
                {copied ? t.descCopied : t.descCopy}
            </button>
        </div>
    );
}

type Props = {
    problem: any;
    processedDescription: string;
    lang: string;
};

export default function DescriptionPanel({ problem, processedDescription, lang }: Props) {
    const t = translations[lang as 'RO' | 'EN'] ?? translations.RO;
    // Normalize `** text **` → `**text**` so that backend-generated bold with
    // extra spaces (invalid CommonMark) still renders correctly.
    const normalized = processedDescription.replace(/\*\* ?(.+?) ?\*\*/g, '**$1**');

    // Backend sends snake_case; accept camelCase too for forward-compatibility
    const timeLimit: number = problem.time_limit ?? problem.timeLimit ?? 0;
    const memoryLimit: number = problem.memory_limit ?? problem.memoryLimit ?? 0;
    const tags: string[] = Array.isArray(problem.tags) ? problem.tags : [];

    return (
        <div className="h-full p-6 overflow-y-auto custom-scrollbar bg-(--surface-card) text-(--text)">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--accent)">
                {t.problemLabel} {problem.title}
            </p>
            <h1 className="text-3xl font-bold text-(--text) mb-2">{problem.title}</h1>
            {/* Constraints row */}
            {(timeLimit > 0 || memoryLimit > 0) && (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    {timeLimit > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-(--accent)/25 bg-(--surface-muted) text-(--text-muted)">
                            <svg className="w-3.5 h-3.5 shrink-0 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                            </svg>
                            {t.timeLabel}:&nbsp;
                            <span className="font-mono text-(--text-h)">
                                {timeLimit % 1 === 0 ? timeLimit : timeLimit}s
                            </span>
                        </span>
                    )}
                    {memoryLimit > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-(--accent)/25 bg-(--surface-muted) text-(--text-muted)">
                            <svg className="w-3.5 h-3.5 shrink-0 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
                            </svg>
                            {t.memoryLabel}:&nbsp;
                            <span className="font-mono text-(--text-h)">{memoryLimit} MB</span>
                        </span>
                    )}
                </div>
            )}

            {tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                    {tags.map((tag: string) => (
                        <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-(--accent)/25 bg-(--accent)/10 text-(--text-muted)"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
            <div className="page-line-horizontal" />
            <div className="text-(--text) leading-relaxed">
                <ReactMarkdown
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeKatex]}
                    children={normalized}
                    components={{
                        h1: ({ ...props }) => (
                            <h1
                                className="text-2xl font-bold text-(--text) mt-6 mb-3 border-b border-(--accent)/20 pb-1"
                                {...props}
                            />
                        ),
                        h2: ({ ...props }) => (
                            <h2 className="text-xl font-bold text-(--text) mt-5 mb-2" {...props} />
                        ),
                        h3: ({ ...props }) => (
                            <h3 className="text-lg font-bold text-(--text) mt-4 mb-1.5" {...props} />
                        ),
                        h4: ({ ...props }) => (
                            <h4 className="text-base font-bold text-(--text) mt-3 mb-1" {...props} />
                        ),
                        p: ({ ...props }) => <p className="mb-4 whitespace-pre-wrap" {...props} />,
                        strong: ({ ...props }) => (
                            <strong className="font-bold text-(--text-h)" {...props} />
                        ),
                        ul: ({ ...props }) => (
                            <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
                        ),
                        ol: ({ ...props }) => (
                            <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
                        ),
                        li: ({ ...props }) => <li className="ml-2" {...props} />,

                        // ── GFM table ─────────────────────────────────────────
                        table: ({ ...props }) => (
                            <div className="overflow-x-auto my-4">
                                <table
                                    className="w-full text-sm border-collapse border border-(--accent)/20 rounded-xl overflow-hidden"
                                    {...props}
                                />
                            </div>
                        ),
                        thead: ({ ...props }) => (
                            <thead className="bg-(--accent)/10" {...props} />
                        ),
                        tbody: ({ ...props }) => <tbody {...props} />,
                        tr: ({ ...props }) => (
                            <tr
                                className="border-b border-(--accent)/10 even:bg-(--accent)/5"
                                {...props}
                            />
                        ),
                        th: ({ ...props }) => (
                            <th
                                className="px-4 py-2 text-left font-bold text-(--text-h) border-r last:border-r-0 border-(--accent)/15"
                                {...props}
                            />
                        ),
                        td: ({ ...props }) => (
                            <td
                                className="px-4 py-2 text-(--text) border-r last:border-r-0 border-(--accent)/10"
                                {...props}
                            />
                        ),

                        span: ({ className, children, ...props }: any) => {
                            if (className && className.includes('katex')) {
                                return (
                                    <span className={`${className} text-(--accent)`} {...props}>
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
                        code: ({ className, children, ...props }: any) => (
                            <code
                                className={`text-(--accent) font-mono ${className || ''}`}
                                {...props}
                            >
                                {children}
                            </code>
                        ),
                        pre: ({ children, ...props }: any) => (
                            <CodeBlock lang={lang} {...props}>{children}</CodeBlock>
                        ),
                    }}
                />
            </div>
        </div>
    );
}