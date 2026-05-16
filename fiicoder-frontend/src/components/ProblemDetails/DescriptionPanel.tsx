import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

type Props = {
    problem: any;
    processedDescription: string;
    lang: string;
};

export default function DescriptionPanel({ problem, processedDescription, lang }: Props) {
    return (
        <div className="h-full p-6 overflow-y-auto custom-scrollbar bg-(--surface-card) text-(--text)">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--accent)">
                {lang === 'RO' ? 'Problemă: ' : 'Problem: '} {problem.title}
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
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    children={processedDescription}
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
                        p: ({ ...props }) => <p className="mb-4 whitespace-pre-wrap" {...props} />,
                        ul: ({ ...props }) => (
                            <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
                        ),
                        ol: ({ ...props }) => (
                            <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
                        ),
                        li: ({ ...props }) => <li className="ml-2" {...props} />,
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
