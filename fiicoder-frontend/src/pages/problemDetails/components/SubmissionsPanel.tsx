import type { ProblemSubmissionDTO } from '../types/problemDetails';
import {
    submissionVerdict,
    submissionVerdictLabels,
    type SubmissionVerdict,
} from '../../profile/profileUtils';
import { formatScore } from '../utils/textUtils';
import { translations } from '../../../language/Language';

type Props = {
    isAuthenticated: boolean;
    recentSubmissions: ProblemSubmissionDTO[];
    lang: string;
    onSelectSubmission: (sub: ProblemSubmissionDTO) => void;
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
    PARTIAL:  'border-amber-500/40 bg-amber-500/10 text-amber-300',
    PENDING:  'border-sky-500/40 bg-sky-500/10 text-sky-300',
    REJECTED: 'border-red-500/40 bg-red-500/10 text-red-300',
};

export default function SubmissionsPanel({ isAuthenticated, recentSubmissions, lang, onSelectSubmission }: Props) {
    const t = translations[lang as 'RO' | 'EN'] ?? translations.RO;

    const sorted = recentSubmissions
        .slice()
        .sort((a, b) => new Date(b.submissiondate).getTime() - new Date(a.submissiondate).getTime());

    return (
        <div className="h-full p-4 bg-(--surface-card) overflow-y-auto custom-scrollbar @container">
            <div className="space-y-2">
                {!isAuthenticated ? (
                    <p className="text-sm text-(--text-muted) italic">
                        {t.loginToSeeHistory}
                    </p>
                ) : sorted.length > 0 ? (
                    sorted.map((sub, idx) => {
                        const verdict = verdictFor(sub);
                        return (
                            <div
                                key={idx}
                                onClick={() => onSelectSubmission(sub)}
                                className="p-3 rounded-2xl border-2 border-(--accent)/20 bg-(--accent)/5 cursor-pointer hover:bg-(--accent)/10 transition-colors flex flex-col gap-1 @[200px]:flex-row @[200px]:items-center @[200px]:justify-between @[200px]:gap-3"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-(--text-h) truncate">
                                        {new Date(sub.submissiondate).toLocaleString(t.dateLocale, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                    <p className="text-[10px] text-(--text-muted) font-mono">Score: {formatScore(sub.Score)}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-2 shrink-0 self-start @[200px]:self-auto ${verdictClasses[verdict]}`}>
                                    {verdictLabel(verdict, lang)}
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-(--text-muted) italic">{t.noSubmissionsYet}</p>
                )}
            </div>
        </div>
    );
}
