import { ACCEPTED_SCORE, isAcceptedSubmission, type RecentSubmissionDTO } from '../../services/profileService';

export type SubmissionVerdict = 'ACCEPTED' | 'PARTIAL' | 'REJECTED' | 'PENDING';

export const submissionVerdictLabels: Record<SubmissionVerdict, { ro: string; en: string }> = {
    ACCEPTED: { ro: 'Admis', en: 'Accepted' },
    PARTIAL: { ro: 'Parțial', en: 'Partial' },
    REJECTED: { ro: 'Respins', en: 'Rejected' },
    PENDING: { ro: 'În așteptare', en: 'Queued' },
};

export function submissionVerdict(submission: Pick<RecentSubmissionDTO, 'status' | 'score'>): SubmissionVerdict {
    if (submission.status === 'PENDING') return 'PENDING';
    if (isAcceptedSubmission(submission)) return 'ACCEPTED';
    if (submission.score > 0 && submission.score < ACCEPTED_SCORE) return 'PARTIAL';
    return 'REJECTED';
}

export function generateHeatmapFromSubmissions(
    submissions: RecentSubmissionDTO[] | undefined,
): number[] {
    if (!submissions || submissions.length === 0) {
        return Array(84).fill(0);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const heatmap = Array(84).fill(0);
    const submissionCounts: Record<string, number> = {};

    submissions.forEach((submission) => {
        const submissionDate = new Date(submission.submissionDate);
        submissionDate.setHours(0, 0, 0, 0);

        const daysAgo = Math.floor(
            (today.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysAgo >= 0 && daysAgo < 84) {
            const dateKey = submissionDate.toISOString().split('T')[0];
            if (isAcceptedSubmission(submission)) {
                submissionCounts[dateKey] = (submissionCounts[dateKey] || 0) + 1;
            }
        }
    });

    Object.keys(submissionCounts).forEach((dateKey) => {
        const submissionDate = new Date(dateKey);
        const daysAgo = Math.floor(
            (today.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const index = 83 - daysAgo;
        const count = submissionCounts[dateKey];
        heatmap[index] = Math.min(4, Math.ceil(count / 2));
    });

    return heatmap;
}

export function getHeatmapStyle(level: number) {
    const baseAccent = 'var(--accent)';

    switch (level) {
        case 0:
            return { backgroundColor: `color-mix(in srgb, ${baseAccent} 8%, transparent)` };
        case 1:
            return { backgroundColor: `color-mix(in srgb, ${baseAccent} 30%, transparent)` };
        case 2:
            return { backgroundColor: `color-mix(in srgb, ${baseAccent} 60%, transparent)` };
        case 3:
            return { backgroundColor: baseAccent };
        case 4:
            return {
                backgroundColor: `color-mix(in srgb, ${baseAccent} 85%, white 15%)`,
                boxShadow: `0 0 10px color-mix(in srgb, ${baseAccent} 70%, transparent)`,
            };
        default:
            return { backgroundColor: `color-mix(in srgb, ${baseAccent} 8%, transparent)` };
    }
}

export function formatPercent(value: number) {
    const normalized = value <= 1 ? value * 100 : value;
    return `${normalized.toFixed(normalized % 1 === 0 ? 0 : 1)}%`;
}
