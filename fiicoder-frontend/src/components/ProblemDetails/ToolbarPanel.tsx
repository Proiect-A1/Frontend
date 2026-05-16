// framer-motion not required here

type Props = {
    evalStatus: string;
    evalSummary?: any;
    evalTests: any[];
    lang: string;
    handleSubmit: (e?: any) => void;
    status: null | 'pending' | 'valid' | 'invalid';
};

export default function ToolbarPanel({ evalStatus, evalSummary, evalTests, lang, handleSubmit, status }: Props) {
    return (
        <div className="hidden xl:flex h-12 shrink-0 bg-(--surface-card) border-2 border-(--accent) rounded-2xl items-center justify-between px-4">
            <div className="flex items-center gap-4">
                <button className="text-[10px] font-black text-(--text-muted) hover:text-(--accent) flex items-center gap-2 uppercase tracking-tighter transition-colors group">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    {lang === 'RO' ? 'Consolă' : 'Console'}
                </button>
                <div className="w-px h-4 bg-(--accent)/20" />
                <div className="flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${
                            evalStatus === 'evaluating' || evalStatus === 'connecting'
                                ? 'bg-amber-500 animate-pulse'
                                : evalStatus === 'done'
                                  ? evalSummary && evalSummary.score >= evalSummary.maxScore
                                      ? 'bg-green-500'
                                      : 'bg-amber-500'
                                  : evalStatus === 'error'
                                    ? 'bg-red-500'
                                    : 'bg-green-500'
                        }`}
                    />
                    <span className="text-[10px] font-bold text-(--text-subtle) uppercase tracking-widest">
                        {evalStatus === 'connecting'
                            ? lang === 'RO' ? 'Conectare...' : 'Connecting...'
                            : evalStatus === 'evaluating'
                              ? lang === 'RO'
                                  ? `Test ${evalTests.length}...`
                                  : `Test ${evalTests.length}...`
                              : evalStatus === 'done' && evalSummary
                                ? `${evalSummary.score}/${evalSummary.maxScore}`
                                : evalStatus === 'error'
                                  ? 'Error'
                                  : lang === 'RO' ? 'Sistem Activ' : 'System Ready'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={status === 'pending'}
                    className="px-6 py-1.5 rounded-lg bg-(--accent) border-2 border-(--accent) text-[10px] font-black text-(--surface-card) hover:bg-transparent hover:text-(--accent) transition-all flex items-center gap-2 group self-end"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
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
