// framer-motion not required here
import { formatScore } from '../utils/textUtils';

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
        <div className="hidden xl:flex h-[4.5rem] shrink-0 bg-(--surface-card) border-2 border-(--accent) rounded-2xl items-center justify-between px-6">
            <div className="flex items-center gap-6">
                <button className="text-[15px] font-black text-(--text-muted) hover:text-(--accent) flex items-center gap-3 uppercase tracking-tighter transition-colors group">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity"
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
                <div className="w-px h-6 bg-(--accent)/20" />
                <div className="flex items-center gap-3">
                    <div
                        className={`w-3 h-3 rounded-full ${
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
                    <span className="text-[15px] font-bold text-(--text-subtle) uppercase tracking-widest">
                        {evalStatus === 'connecting'
                            ? lang === 'RO' ? 'Conectare...' : 'Connecting...'
                            : evalStatus === 'evaluating'
                              ? lang === 'RO'
                                  ? `Test ${evalTests.length}...`
                                  : `Test ${evalTests.length}...`
                              : evalStatus === 'done' && evalSummary
                                ? `${formatScore(evalSummary.score)}/${formatScore(evalSummary.maxScore)}`
                                : evalStatus === 'error'
                                  ? 'Error'
                                  : lang === 'RO' ? 'Sistem Activ' : 'System Ready'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <kbd className="hidden lg:flex items-center gap-1.5 text-[13px] font-bold text-(--text-muted) opacity-50">
                    <span className="px-1.5 py-1 rounded border border-(--accent)/30 bg-(--surface-muted) font-mono">Ctrl</span>
                    <span>+</span>
                    <span className="px-1.5 py-1 rounded border border-(--accent)/30 bg-(--surface-muted) font-mono">↵</span>
                </kbd>
                <button
                    onClick={handleSubmit}
                    disabled={status === 'pending'}
                    className="px-9 py-2.5 rounded-lg bg-(--accent) border-2 border-(--accent) text-[15px] font-black text-(--surface-card) hover:bg-transparent hover:text-(--accent) transition-all flex items-center gap-2 group"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 group-hover:scale-110 transition-transform"
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
