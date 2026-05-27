import type { ProblemSubmissionDTO } from '../types/problemDetails';
import {
    submissionVerdict,
    submissionVerdictLabels,
    type SubmissionVerdict,
} from '../../profile/profileUtils';
import { formatScore } from '../utils/textUtils';
import { useState } from 'react';
import SubmissionDetailModal from './SubmissionDetailModal';
import { translations, getLoadMoreLabel } from '../../../language/Language';

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
    return lang === 'RO' || lang === 'ro' ? label.ro : label.en;
}

const verdictClasses: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'border-green-500/40 bg-green-500/10 text-green-300',
    PARTIAL: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    PENDING: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    REJECTED: 'border-red-500/40 bg-red-500/10 text-red-300',
};

const PAGE_SIZE = 10;

export default function SubmissionsPanel({ isAuthenticated, recentSubmissions, lang }: Props) {
    const [selectedSubmission, setSelectedSubmission] = useState<ProblemSubmissionDTO | null>(null);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const t = translations[lang as 'RO' | 'EN'] ?? translations.RO;

    const sorted = recentSubmissions
        .slice()
        .sort((a, b) => new Date(b.submissiondate).getTime() - new Date(a.submissiondate).getTime());

    return (
        <div className="h-full p-6 bg-(--surface-card) overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
                {!isAuthenticated ? (
                    <p className="text-sm text-(--text-muted) italic">
                        {t.loginToSeeHistory}
                    </p>
                ) : sorted.length > 0 ? (
                    sorted
                    .slice(0, visibleCount)
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
                                        {new Date(sub.submissiondate).toLocaleString(t.dateLocale, {
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
                    <p className="text-sm text-(--text-muted) italic">{t.noSubmissionsYet}</p>
                )}
                {isAuthenticated && visibleCount < sorted.length && (
                    <button
                        onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                        className="w-full mt-2 py-1.5 rounded-xl border border-(--accent)/30 bg-(--accent)/5 text-xs font-bold text-(--text-muted) hover:bg-(--accent)/15 hover:text-(--text-h) transition-colors"
                    >
                        {getLoadMoreLabel(lang as 'RO' | 'EN', sorted.length - visibleCount)}
                    </button>
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
