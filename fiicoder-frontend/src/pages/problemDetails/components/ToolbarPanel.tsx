import { formatScore } from '../utils/textUtils';

type Props = {
    evalStatus: string;
    evalSummary?: any;
    evalTests: any[];
    lang: string;
    handleSubmit: (e?: any) => void;
    status: null | 'pending' | 'valid' | 'invalid';
    resetLayout: () => void;
    onStatusClick?: () => void;
};

export default function ToolbarPanel({ evalStatus, evalSummary, evalTests, lang, handleSubmit, status, resetLayout, onStatusClick }: Props) {
    return (
        <div className="hidden xl:flex h-14 shrink-0 bg-(--surface-card) border-2 border-(--accent) rounded-full items-center justify-between px-5">
            <div className="flex items-center gap-5">
                <button
                    onClick={resetLayout}
                    title={lang === 'RO' ? 'Resetează layout-ul la valorile implicite' : 'Reset layout to default'}
                    className="text-[11px] font-black text-(--text-muted) opacity-50 hover:opacity-100 flex items-center gap-2 uppercase tracking-tighter group transition-opacity"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 group-hover:scale-110 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    {lang === 'RO' ? 'Reset' : 'Reset'}
                </button>
                <div className="w-px h-6 bg-(--accent)/20" />
                {(() => {
                    const isClickable = onStatusClick && evalStatus !== 'connecting' && evalStatus !== 'evaluating';
                    const dotColor = evalStatus === 'evaluating' || evalStatus === 'connecting'
                        ? 'bg-amber-500 animate-pulse'
                        : evalStatus === 'done'
                          ? evalSummary && evalSummary.score >= evalSummary.maxScore
                              ? 'bg-green-500'
                              : 'bg-amber-500'
                          : evalStatus === 'error'
                            ? 'bg-red-500'
                            : 'bg-green-500';
                    const label = evalStatus === 'connecting'
                        ? lang === 'RO' ? 'Conectare...' : 'Connecting...'
                        : evalStatus === 'evaluating'
                          ? `Test ${evalTests.length}...`
                          : evalStatus === 'done' && evalSummary
                            ? `${formatScore(evalSummary.score)}/${formatScore(evalSummary.maxScore)}`
                            : evalStatus === 'error'
                              ? 'Error'
                              : lang === 'RO' ? 'Sistem Activ' : 'System Ready';
                    const content = (
                        <>
                            <div className={`w-3 h-3 rounded-full shrink-0 ${dotColor}`} />
                            <span className="text-[11px] font-bold text-(--text-subtle) uppercase tracking-widest">
                                {label}
                            </span>
                        </>
                    );
                    return isClickable ? (
                        <button
                            onClick={onStatusClick}
                            title={lang === 'RO' ? 'Mergi la ultima submisie' : 'Go to last submission'}
                            className="flex items-center gap-3 hover:opacity-70 transition-opacity cursor-pointer"
                        >
                            {content}
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">{content}</div>
                    );
                })()}
            </div>

            <div className="flex items-center gap-4">
                <kbd className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-(--text-muted) opacity-50">
                    <span className="px-1.5 py-0.5 rounded border border-(--accent)/30 bg-(--surface-muted) font-mono">Ctrl</span>
                    <span>+</span>
                    <span className="px-1.5 py-0.5 rounded border border-(--accent)/30 bg-(--surface-muted) font-mono">↵</span>
                </kbd>
                <button
                    onClick={handleSubmit}
                    disabled={status === 'pending'}
                    className="px-6 py-2 rounded-full bg-(--accent) border-2 border-(--accent) text-sm font-black text-(--surface-card) hover:bg-transparent hover:text-(--accent) transition-all flex items-center gap-2 group"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 group-hover:scale-110 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {status === 'pending'
                        ? lang === 'RO'
                            ? 'Trimitere...'
                            : 'Submitting...'
                        : lang === 'RO'
                          ? 'Trimite'
                          : 'Submit'}
                </button>
            </div>
        </div>
    );
}
