// React import not required with automatic JSX runtime

type Props = {
    isAuthenticated: boolean;
    recentSubmissions: any[];
    lang: string;
};

export default function SubmissionsPanel({ isAuthenticated, recentSubmissions, lang }: Props) {
    return (
        <div className="h-full p-6 bg-(--surface-card) overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
                {!isAuthenticated ? (
                    <p className="text-sm text-(--text-muted) italic">
                        {lang === 'RO' ? 'Autentifică-te pentru istoricul tău.' : 'Log in to see history.'}
                    </p>
                ) : recentSubmissions.length > 0 ? (
                    recentSubmissions.map((sub, idx) => (
                        <div
                            key={idx}
                            className="p-3 rounded-2xl border-2 border-(--accent)/20 bg-(--accent)/5 flex items-center justify-between gap-3"
                        >
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-(--text-h)">{new Date(sub.submissiondate).toLocaleDateString()}</p>
                                <p className="text-[10px] text-(--text-muted) font-mono">Score: {sub.Score}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-2 ${sub.status === 'OK' ? 'border-green-500/40 bg-green-500/10 text-green-300' : 'border-red-500/40 bg-red-500/10 text-red-300'}`}>
                                {sub.status}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-(--text-muted) italic">{lang === 'RO' ? 'Nu ai încă submisii.' : 'No submissions yet.'}</p>
                )}
            </div>
        </div>
    );
}
