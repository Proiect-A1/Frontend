import { ACCEPTED_SCORE, isAcceptedSubmission, type ProfileResponseDTO, type RecentSubmissionDTO } from '../../services/profileService';

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

// ─── XP & Level (derivat, nu persistat) ──────────────────────────────────────
// Nu există niciun câmp de XP în backend. Nivelul e calculat din statistici deja
// reale ale profilului (problemsSolved, streak, acceptanceRate, nr. de achievement-uri
// deblocate), recalculat la fiecare încărcare de profil — la fel ca achievements.
// Benzile de nivel/titlu urmează planul de gamification (implementation_plan_front.md).

export interface GamificationStats {
    xp: number;
    level: number;
    title: { ro: string; en: string };
    xpIntoLevel: number;
    xpForNextLevel: number;
    progressPct: number;
}

interface XpBand {
    minLevel: number;
    maxLevel: number;
    minXp: number;
    maxXp: number;
    title: { ro: string; en: string };
}

const XP_BANDS: XpBand[] = [
    { minLevel: 1, maxLevel: 5, minXp: 0, maxXp: 500, title: { ro: 'Începător', en: 'Beginner' } },
    { minLevel: 6, maxLevel: 10, minXp: 500, maxXp: 2000, title: { ro: 'Ucenic', en: 'Apprentice' } },
    { minLevel: 11, maxLevel: 20, minXp: 2000, maxXp: 5000, title: { ro: 'Rezolvitor', en: 'Solver' } },
    { minLevel: 21, maxLevel: 30, minXp: 5000, maxXp: 12000, title: { ro: 'Expert', en: 'Expert' } },
    { minLevel: 31, maxLevel: 40, minXp: 12000, maxXp: 25000, title: { ro: 'Maestru', en: 'Master' } },
    { minLevel: 41, maxLevel: 50, minXp: 25000, maxXp: 50000, title: { ro: 'Mare Maestru', en: 'Grandmaster' } },
];
const LEGEND_TITLE = { ro: 'Legendă', en: 'Legend' };
const LEGEND_XP_PER_LEVEL = 5000; // planul nu definește benzi peste nivelul 50, deci pas fix

export function computeXp(
    profile: Pick<ProfileResponseDTO, 'problemsSolved' | 'streak' | 'acceptanceRate'>,
    unlockedAchievements: number,
): number {
    const acceptancePct = profile.acceptanceRate <= 1 ? profile.acceptanceRate * 100 : profile.acceptanceRate;
    return Math.round(
        profile.problemsSolved * 50 +
        profile.streak * 15 +
        unlockedAchievements * 30 +
        acceptancePct * 2,
    );
}

export function computeLevel(xp: number): GamificationStats {
    const band = XP_BANDS.find((b) => xp < b.maxXp);
    if (band) {
        const levelSpan = band.maxLevel - band.minLevel + 1;
        const xpPerLevel = (band.maxXp - band.minXp) / levelSpan;
        const xpIntoBand = xp - band.minXp;
        const levelWithinBand = Math.min(levelSpan - 1, Math.floor(xpIntoBand / xpPerLevel));
        const xpIntoLevel = xpIntoBand - levelWithinBand * xpPerLevel;
        return {
            xp,
            level: band.minLevel + levelWithinBand,
            title: band.title,
            xpIntoLevel: Math.round(xpIntoLevel),
            xpForNextLevel: Math.round(xpPerLevel),
            progressPct: Math.round((xpIntoLevel / xpPerLevel) * 100),
        };
    }

    const xpPastCap = xp - 50000;
    const levelsPastCap = Math.floor(xpPastCap / LEGEND_XP_PER_LEVEL);
    const xpIntoLevel = xpPastCap - levelsPastCap * LEGEND_XP_PER_LEVEL;
    return {
        xp,
        level: 50 + levelsPastCap,
        title: LEGEND_TITLE,
        xpIntoLevel,
        xpForNextLevel: LEGEND_XP_PER_LEVEL,
        progressPct: Math.round((xpIntoLevel / LEGEND_XP_PER_LEVEL) * 100),
    };
}
