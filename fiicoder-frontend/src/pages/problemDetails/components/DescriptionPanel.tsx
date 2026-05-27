import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { translations } from '../../../language/Language';

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

    return (
        <div className="h-full p-6 overflow-y-auto custom-scrollbar bg-(--surface-card) text-(--text)">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--accent)">
                {t.problemLabel} {problem.title}
            </p>
            <h1 className="text-3xl font-bold text-(--text) mb-2">{problem.title}</h1>
            {problem.tags && problem.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                    {problem.tags.map((tag: string) => (
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
                            <div className="relative group my-4">
                                <pre
                                    className="bg-(--surface-input) p-4 rounded-xl border border-(--accent)/20 overflow-x-auto text-sm text-(--text) shadow-inner"
                                    {...props}
                                >
                                    {children}
                                </pre>
                            </div>
                        ),
                    }}
                />
            </div>
        </div>
    );
}