import { ACCEPTED_SCORE } from '../../../services/profileService';
import type { ProblemSubmissionDTO } from '../types/problemDetails';

type Props = {
    isAuthenticated: boolean;
    recentSubmissions: ProblemSubmissionDTO[];
    lang: string;
};

function verdictFor(sub: ProblemSubmissionDTO): 'ACCEPTED' | 'REJECTED' | 'PENDING' {
    if (sub.status === 'PENDING') return 'PENDING';
    return sub.Score >= ACCEPTED_SCORE ? 'ACCEPTED' : 'REJECTED';
}

function verdictLabel(verdict: 'ACCEPTED' | 'REJECTED' | 'PENDING', lang: string) {
    if (verdict === 'ACCEPTED') return lang === 'RO' ? 'Admis' : 'Accepted';
    if (verdict === 'PENDING') return lang === 'RO' ? 'În așteptare' : 'Pending';
    return lang === 'RO' ? 'Respins' : 'Rejected';
}

function verdictClasses(verdict: 'ACCEPTED' | 'REJECTED' | 'PENDING') {
    if (verdict === 'ACCEPTED') return 'border-green-500/40 bg-green-500/10 text-green-300';
    if (verdict === 'PENDING') return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
    return 'border-red-500/40 bg-red-500/10 text-red-300';
}

export default function SubmissionsPanel({ isAuthenticated, recentSubmissions, lang }: Props) {
    return (
        <div className="h-full p-6 bg-(--surface-card) overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
                {!isAuthenticated ? (
                    <p className="text-sm text-(--text-muted) italic">
                        {lang === 'RO' ? 'Autentifică-te pentru istoricul tău.' : 'Log in to see history.'}
                    </p>
                ) : recentSubmissions.length > 0 ? (
                    recentSubmissions.map((sub, idx) => {
                        const verdict = verdictFor(sub);
                        return (
                            <div
                                key={idx}
                                className="p-3 rounded-2xl border-2 border-(--accent)/20 bg-(--accent)/5 flex items-center justify-between gap-3"
                            >
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-(--text-h)">{new Date(sub.submissiondate).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-(--text-muted) font-mono">Score: {sub.Score}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-2 ${verdictClasses(verdict)}`}>
                                    {verdictLabel(verdict, lang)}
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-(--text-muted) italic">{lang === 'RO' ? 'Nu ai încă submisii.' : 'No submissions yet.'}</p>
                )}
            </div>
        </div>
    );
}
