import type { ProblemSubmissionDTO } from '../types/problemDetails';
import {
    submissionVerdict,
    submissionVerdictLabels,
    type SubmissionVerdict,
} from '../../profile/profileUtils';
import { formatScore } from '../utils/textUtils';
import { useState } from 'react';
import SubmissionDetailModal from './SubmissionDetailModal';

type Props = {
    isAuthenticated: boolean;
    recentSubmissions: ProblemSubmissionDTO[];
    lang: string;
};

function verdictFor(sub: ProblemSubmissionDTO): SubmissionVerdict {
    return submissionVerdict({ status: sub.status, score: sub.Score });
}

function verdictLabel(verdict: SubmissionVerdict, lang: string) {
    const label = submissionVerdictLabels[verdict];
    return lang === 'RO' ? label.ro : label.en;
}

const verdictClasses: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'border-green-500/40 bg-green-500/10 text-green-300',
    PARTIAL: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    PENDING: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    REJECTED: 'border-red-500/40 bg-red-500/10 text-red-300',
};

export default function SubmissionsPanel({ isAuthenticated, recentSubmissions, lang }: Props) {
    const [selectedSubmission, setSelectedSubmission] = useState<ProblemSubmissionDTO | null>(null);

    return (
        <div className="h-full p-6 bg-(--surface-card) overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
                {!isAuthenticated ? (
                    <p className="text-sm text-(--text-muted) italic">
                        {lang === 'RO' ? 'Autentifică-te pentru istoricul tău.' : 'Log in to see history.'}
                    </p>
                ) : recentSubmissions.length > 0 ? (
                    recentSubmissions
                    .slice()
                    .sort((a, b) => new Date(b.submissiondate).getTime() - new Date(a.submissiondate).getTime())
                    .map((sub, idx) => {
                        const verdict = verdictFor(sub);
                        return (
                            <div
                                key={idx}
                                onClick={() => setSelectedSubmission(sub)}
                                className="p-3 rounded-2xl border-2 border-(--accent)/20 bg-(--accent)/5 flex items-center justify-between gap-3 cursor-pointer hover:bg-(--accent)/10 transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-(--text-h)">
                                        {new Date(sub.submissiondate).toLocaleString(lang === 'RO' ? 'ro-RO' : 'en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <p className="text-[10px] text-(--text-muted) font-mono">Score: {formatScore(sub.Score)}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-2 ${verdictClasses[verdict]}`}>
                                    {verdictLabel(verdict, lang)}
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-(--text-muted) italic">{lang === 'RO' ? 'Nu ai încă submisii.' : 'No submissions yet.'}</p>
                )}
            </div>

            <SubmissionDetailModal
                isOpen={!!selectedSubmission}
                onClose={() => setSelectedSubmission(null)}
                submission={selectedSubmission}
                lang={lang}
            />
        </div>
    );
}
