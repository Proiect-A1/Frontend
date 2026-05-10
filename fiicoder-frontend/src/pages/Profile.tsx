import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useLanguage } from '../language/Language';
import { useTheme } from '../services/ThemeContext';
import { pageVariants } from '../utils/motionConfig';
import {
    profileService,
    type ProfileResponseDTO,
    type RecentSubmissionDTO,
} from '../services/profileService';

const generateHeatmapFromSubmissions = (submissions: RecentSubmissionDTO[] | undefined): number[] => {
    if (!submissions || submissions.length === 0) {
        return Array(84).fill(0);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const heatmap = Array(84).fill(0);
    const submissionCounts: Record<string, number> = {};

    submissions.forEach((sub) => {
        const subDate = new Date(sub.submissionDate);
        subDate.setHours(0, 0, 0, 0);

        const daysAgo = Math.floor((today.getTime() - subDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysAgo >= 0 && daysAgo < 84) {
            const dateKey = subDate.toISOString().split('T')[0];
            if (sub.status === 'OK') {
                submissionCounts[dateKey] = (submissionCounts[dateKey] || 0) + 1;
            }
        }
    });

    Object.keys(submissionCounts).forEach((dateKey) => {
        const subDate = new Date(dateKey);
        const daysAgo = Math.floor((today.getTime() - subDate.getTime()) / (1000 * 60 * 60 * 24));
        const index = 83 - daysAgo;
        const count = submissionCounts[dateKey];
        heatmap[index] = Math.min(4, Math.ceil(count / 2));
    });

    return heatmap;
};

const getHeatmapStyle = (level: number) => {
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
};

const submissionStatusLabels: Record<RecentSubmissionDTO['status'], { ro: string; en: string }> = {
    OK: { ro: 'Admis', en: 'Accepted' },
    PA: { ro: 'Parțial', en: 'Partial' },
    TLE: { ro: 'Depășire timp', en: 'Time limit' },
    MLE: { ro: 'Memorie depășită', en: 'Memory limit' },
    WA: { ro: 'Greșit', en: 'Wrong answer' },
    RTE: { ro: 'Eroare rulare', en: 'Runtime error' },
    CPE: { ro: 'Eroare compilare', en: 'Compile error' },
    FAIL: { ro: 'Eșuat', en: 'Failed' },
    SKIP: { ro: 'Sărit', en: 'Skipped' },
    ILE: { ro: 'Limită internă', en: 'Internal limit' },
    NONE: { ro: 'Nicio trimitere', en: 'No submission' },
    IDLE: { ro: 'În așteptare', en: 'Queued' },
};

export default function Profile() {
    const { username, isAdmin } = useAuth();
    const { lang } = useLanguage();
    const { theme } = useTheme();

    const [profile, setProfile] = useState<ProfileResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isLightTheme = theme === 'cream' || theme === 'sage';

    useEffect(() => {
        let active = true;

        async function loadProfile() {
            try {
                setLoading(true);
                setError(null);
                const data = await profileService.getMyProfile();
                if (active) {
                    setProfile(data);
                }
            } catch {
                if (active) {
                    setError(
                        lang === 'RO'
                            ? 'Nu am putut încărca profilul. Încearcă din nou.'
                            : 'Could not load profile. Please try again.',
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        void loadProfile();

        return () => {
            active = false;
        };
    }, [lang]);

    const formatJoinDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(lang === 'RO' ? 'ro-RO' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatSubmissionDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(lang === 'RO' ? 'ro-RO' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatPercent = (value: number) => {
        const normalized = value <= 1 ? value * 100 : value;
        return `${normalized.toFixed(normalized % 1 === 0 ? 0 : 1)}%`;
    };

    const formatStatus = (status: RecentSubmissionDTO['status']) => {
        const label = submissionStatusLabels[status];
        return lang === 'RO' ? label.ro : label.en;
    };

    const displayProfile = profile;
    const heatmap = useMemo(
        () => generateHeatmapFromSubmissions(displayProfile?.recentSubmissions?.content),
        [displayProfile?.recentSubmissions?.content]
    );

    if (!displayProfile) {
        return (
            <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
                <motion.div
                    className="w-full max-w-7xl rounded-2xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm px-5 py-6 md:px-8 md:py-8"
                    variants={pageVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-4 text-sm text-(--text-muted)">
                        {loading
                            ? lang === 'RO'
                                ? 'Se încarcă profilul...'
                                : 'Loading profile...'
                            : error ??
                              (lang === 'RO'
                                  ? 'Profil indisponibil momentan.'
                                  : 'Profile is currently unavailable.')}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
            <motion.div
                className="w-full max-w-7xl rounded-2xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm px-5 py-6 md:px-8 md:py-8 h-auto overflow-visible xl:h-full xl:overflow-y-auto custom-scrollbar"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
            >
                <>
                    {isAdmin && (
                        <div className="mb-4 flex justify-end">
                            <Link
                                to="/admin"
                                className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center cursor-pointer bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) hover:-translate-y-0.5"
                            >
                                {lang === 'RO' ? 'Panou Administrare' : 'Admin Dashboard'}
                            </Link>
                        </div>
                    )}

                    <div className="w-full grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6">
                        <div className="flex flex-col gap-6 min-w-0">
                            <div className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-card) backdrop-blur-sm flex flex-col items-center lg:items-start text-center lg:text-left">
                                <div className="w-24 h-24 mb-4 rounded-full bg-linear-to-br from-(--accent) to-purple-500 flex items-center justify-center text-4xl font-bold text-white uppercase shadow-lg outline-4 outline-offset-4 outline-(--accent) overflow-hidden shrink-0">
                                    {(displayProfile.username || username || displayProfile.firstName)
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                                <h1 className="text-2xl font-bold text-(--text-h)">
                                    {displayProfile.firstName} {displayProfile.lastName}
                                </h1>
                                <p className="text-(--text-subtle) font-mono text-sm mb-4">
                                    @{displayProfile.username}
                                </p>

                                <div className="w-full border-t border-(--accent)/20 my-2"></div>

                                <div className="w-full flex flex-col gap-2 mt-2 text-sm text-(--text)">
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="font-semibold text-(--text-muted)">Email</span>
                                        <span className="truncate text-right">{displayProfile.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="font-semibold text-(--text-muted)">
                                            {lang === 'RO' ? 'Membru din' : 'Joined'}
                                        </span>
                                        <span>{formatJoinDate(displayProfile.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 gap-4">
                                        <span className="font-semibold text-(--text-muted)">
                                            {lang === 'RO' ? 'Rol' : 'Role'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border border-(--accent)/30 bg-(--accent)/10 text-(--text)">
                                            {displayProfile.username === 'GolderbergPrivate' ? 'Admin' : (lang === 'RO' ? (displayProfile.submissions > 50 ? 'Veteran' : 'Elev') : (displayProfile.submissions > 50 ? 'Veteran' : 'Student'))}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-card) backdrop-blur-sm card-glow">
                                <h2 className="text-sm font-bold text-(--text-h) mb-4 uppercase tracking-wider">
                                    {lang === 'RO' ? 'Statistici' : 'Community Stats'}
                                </h2>
                                {loading && (
                                    <p className="mb-3 text-xs text-(--text-subtle)">
                                        {lang === 'RO' ? 'Se încarcă profilul...' : 'Loading profile...'}
                                    </p>
                                )}
                                {error && <p className="mb-3 text-xs text-amber-300">{error}</p>}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-(--text-muted)">
                                            {lang === 'RO' ? 'Total Submisii' : 'Total Submissions'}
                                        </span>
                                        <span className="font-bold text-(--text-h)">
                                            {displayProfile.submissions}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-(--text-muted)">
                                            {lang === 'RO' ? 'Rată de Acceptare' : 'Acceptance Rate'}
                                        </span>
                                        <span className="font-bold text-(--text-h)">
                                            {formatPercent(displayProfile.acceptanceRate)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-(--text-muted)">
                                            {lang === 'RO' ? 'Zile Consecutive' : 'Daily Streak'}
                                        </span>
                                        <span className="font-bold text-orange-400 flex items-center gap-2">
                                            <span>{displayProfile.streak} 🔥</span>
                                            {displayProfile.streakCapped && (
                                                <span className="rounded-full border border-orange-400/40 bg-orange-400/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-orange-200">
                                                    {lang === 'RO' ? 'Limitat' : 'Capped'}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-card) backdrop-blur-sm card-glow">
                                <div className="mb-6">
                                    <h2 className="text-sm font-bold text-(--text-h) mb-3 uppercase tracking-wider">
                                        {lang === 'RO' ? 'Limbaje' : 'Languages'}
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {displayProfile.mostUsedLanguages.map((language) => (
                                            <span
                                                key={language}
                                                className="px-3 py-1 rounded-full text-xs font-semibold border border-(--accent)/20 bg-(--accent)/5 text-(--text-h)"
                                            >
                                                {language}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-sm font-bold text-(--text-h) mb-3 uppercase tracking-wider">
                                        Skills
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {displayProfile.skillBreakdownTags.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-2.5 py-1 rounded-full text-xs font-semibold border border-(--accent)/30 bg-(--accent)/10 text-(--text) hover:bg-(--accent)/20 transition-colors cursor-pointer"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 min-w-0 w-full">
                            <div className="p-6 md:p-8 rounded-2xl border border-(--accent)/50 bg-(--surface-card) backdrop-blur-sm card-glow grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-8 items-center min-w-0">
                                <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-(--accent)/20 pb-6 md:pb-0 md:pr-6">
                                    <span className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mb-2">
                                        {lang === 'RO' ? 'Probleme Rezolvate' : 'Problems Solved'}
                                    </span>
                                    <span className="text-6xl font-black text-(--accent) drop-shadow-md">
                                        {displayProfile.problemsSolved}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <div className="flex items-center justify-between text-xs mb-1 gap-4">
                                            <span
                                                className={`font-semibold ${isLightTheme ? 'text-emerald-700' : 'text-emerald-400'}`}
                                            >
                                                {lang === 'RO' ? 'Ușoare' : 'Easy'}
                                            </span>
                                            <span
                                                className={`font-bold ${isLightTheme ? 'text-emerald-600' : 'text-emerald-300'}`}
                                            >
                                                {formatPercent(displayProfile.rankEasy)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-emerald-500/10 rounded-full h-2">
                                            <div
                                                className="bg-emerald-400 h-2 rounded-full"
                                                style={{ width: formatPercent(displayProfile.rankEasy) }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-xs mb-1 gap-4">
                                            <span
                                                className={`font-semibold ${isLightTheme ? 'text-amber-700' : 'text-amber-400'}`}
                                            >
                                                {lang === 'RO' ? 'Mediu' : 'Medium'}
                                            </span>
                                            <span
                                                className={`font-bold ${isLightTheme ? 'text-amber-600' : 'text-amber-300'}`}
                                            >
                                                {formatPercent(displayProfile.rankMedium)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-amber-500/10 rounded-full h-2">
                                            <div
                                                className="bg-amber-400 h-2 rounded-full"
                                                style={{ width: formatPercent(displayProfile.rankMedium) }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-xs mb-1 gap-4">
                                            <span
                                                className={`font-semibold ${isLightTheme ? 'text-red-700' : 'text-red-400'}`}
                                            >
                                                {lang === 'RO' ? 'Grele' : 'Hard'}
                                            </span>
                                            <span
                                                className={`font-bold ${isLightTheme ? 'text-red-600' : 'text-red-300'}`}
                                            >
                                                {formatPercent(displayProfile.rankHard)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-red-500/10 rounded-full h-2">
                                            <div
                                                className="bg-red-400 h-2 rounded-full"
                                                style={{ width: formatPercent(displayProfile.rankHard) }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-xs mb-1 gap-4">
                                            <span
                                                className={`font-semibold ${isLightTheme ? 'text-purple-700' : 'text-purple-400'}`}
                                            >
                                                {lang === 'RO' ? 'Concurs' : 'Contest'}
                                            </span>
                                            <span
                                                className={`font-bold ${isLightTheme ? 'text-purple-600' : 'text-purple-300'}`}
                                            >
                                                {formatPercent(displayProfile.rankContest)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-purple-500/10 rounded-full h-2">
                                            <div
                                                className="bg-purple-400 h-2 rounded-full"
                                                style={{ width: formatPercent(displayProfile.rankContest) }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-0">
                                {[
                                    {
                                        label: lang === 'RO' ? 'Rezolvate' : 'Solved',
                                        value: String(displayProfile.problemsSolved),
                                    },
                                    {
                                        label: lang === 'RO' ? 'Submisii' : 'Submissions',
                                        value: String(displayProfile.submissions),
                                    },
                                    {
                                        label: lang === 'RO' ? 'Acceptare' : 'Acceptance',
                                        value: formatPercent(displayProfile.acceptanceRate),
                                    },
                                    {
                                        label: lang === 'RO' ? 'Serie' : 'Streak',
                                        value: `${displayProfile.streak}${displayProfile.streakCapped ? '+' : ''}`,
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="p-3 rounded-2xl border border-(--accent)/50 bg-(--surface-card) backdrop-blur-sm hover:-translate-y-1 transition-transform cursor-pointer text-center"
                                    >
                                        <div className="text-[10px] uppercase tracking-widest text-(--text-subtle) font-bold">
                                            {item.label}
                                        </div>
                                        <div className="mt-1 text-sm font-bold text-(--text-h)">
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-card) backdrop-blur-sm card-glow min-w-0">
                                <h2 className="text-sm font-bold text-(--text-h) mb-4 uppercase tracking-wider">
                                    {lang === 'RO' ? 'Activitate pe zile' : 'Activity by Day'}
                                </h2>
                                <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                                    <div className="flex flex-col gap-1.5 min-w-max">
                                        <div className="flex gap-1.5">
                                            {heatmap.map((level, index) => {
                                                const daysAgo = 83 - index;
                                                const date = new Date();
                                                date.setDate(date.getDate() - daysAgo);
                                                const dateStr = date.toLocaleDateString();
                                                return (
                                                    <div
                                                        key={index}
                                                        className="w-4 h-4 rounded-[3px] transition-transform hover:scale-125 cursor-pointer border border-(--accent)/5 shrink-0"
                                                        style={getHeatmapStyle(level)}
                                                        title={`${dateStr}: ${level > 0 ? level * 2 + '+' : 0} submissions`}
                                                    />
                                                );
                                            })}
                                        </div>

                                        <div className="flex gap-1.5">
                                            {heatmap.map((_, index) => {
                                                let dayLabel = '';
                                                if (index % 14 === 0) dayLabel = '1';
                                                else if (index % 14 === 7) dayLabel = '14';

                                                return (
                                                    <div
                                                        key={`label-${index}`}
                                                        className="w-4 text-[9px] font-semibold text-(--text-subtle) text-center shrink-0 flex items-start justify-center"
                                                    >
                                                        {dayLabel}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 flex items-center justify-end gap-2 text-xs text-(--text-subtle) font-semibold">
                                    <span>Less</span>
                                    <div className="w-3 h-3 rounded-xs" style={getHeatmapStyle(0)} />
                                    <div className="w-3 h-3 rounded-xs" style={getHeatmapStyle(1)} />
                                    <div className="w-3 h-3 rounded-xs" style={getHeatmapStyle(2)} />
                                    <div className="w-3 h-3 rounded-xs" style={getHeatmapStyle(3)} />
                                    <div className="w-3 h-3 rounded-xs" style={getHeatmapStyle(4)} />
                                    <span>More</span>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-card) backdrop-blur-sm card-glow mb-8 min-w-0">
                                <h2 className="text-sm font-bold text-(--text-h) mb-4 uppercase tracking-wider">
                                    {lang === 'RO' ? 'Submisii Recente' : 'Recent Submissions'}
                                </h2>
                                {displayProfile.recentSubmissions.content.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {displayProfile.recentSubmissions.content.map((submission) => {
                                            const isAccepted = submission.status === 'OK';

                                            const badgeClasses = isAccepted
                                                ? isLightTheme
                                                    ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40'
                                                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                                : isLightTheme
                                                  ? 'bg-red-500/20 text-red-700 border-red-500/40'
                                                  : 'bg-red-500/10 text-red-300 border-red-500/30';

                                            return (
                                                <div
                                                    key={`${submission.problemTitle}-${submission.submissionDate}`}
                                                    className="p-3 md:p-4 rounded-xl border border-(--accent)/20 bg-(--accent)/5 flex justify-between items-center gap-3 transition-colors hover:bg-(--accent)/10"
                                                >
                                                    <div className="min-w-0 pr-2">
                                                        <Link
                                                            to={`/problems/${submission.problemTitle}`}
                                                            className="text-sm md:text-base font-bold text-(--text-h) hover:text-(--accent) hover:underline underline-offset-2 transition-colors line-clamp-1 truncate block"
                                                        >
                                                            {submission.problemTitle}
                                                        </Link>
                                                        <p className="mt-1 text-[11px] text-(--text-subtle)">
                                                            {formatSubmissionDate(submission.submissionDate)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0 ml-2 flex-wrap justify-end">
                                                        <span className="text-[11px] font-mono text-(--text-subtle) hidden sm:inline-block">
                                                            Score: {submission.score}
                                                        </span>
                                                        <span
                                                            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap border ${badgeClasses}`}
                                                        >
                                                            {formatStatus(submission.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-(--text-subtle)">
                                        {lang === 'RO'
                                            ? 'Nu există submisii recente.'
                                            : 'No recent submissions.'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            </motion.div>
        </div>
    );
}