import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ProfileResponseDTO, RecentSubmissionDTO } from '../../services/profileService';
import { containerVariants, itemVariants } from '../../utils/motionConfig';
import {
    formatPercent,
    generateHeatmapFromSubmissions,
    getHeatmapStyle,
    submissionStatusLabels,
} from './profileUtils';

type ProfileOverviewContentProps = {
    profile: ProfileResponseDTO;
    lang: 'RO' | 'EN';
    theme: string;
};

export default function ProfileOverviewContent({ profile, lang, theme }: ProfileOverviewContentProps) {
    const isLightTheme = theme === 'cream' || theme === 'sage';
    const heatmap = generateHeatmapFromSubmissions(profile.recentSubmissions?.content);
    const performanceItems = [
        { label: lang === 'RO' ? 'Ușoare' : 'Easy', value: profile.rankEasy, cls: 'emerald' },
        { label: lang === 'RO' ? 'Mediu' : 'Medium', value: profile.rankMedium, cls: 'amber' },
        { label: lang === 'RO' ? 'Grele' : 'Hard', value: profile.rankHard, cls: 'red' },
        { label: lang === 'RO' ? 'Concurs' : 'Contest', value: profile.rankContest, cls: 'purple' },
    ] as const;

    type PerformanceKey = (typeof performanceItems)[number]['cls'];

    const performanceStyles: Record<
        PerformanceKey,
        { label: string; value: string; bg: string; bar: string }
    > = {
        emerald: isLightTheme
            ? { label: 'text-emerald-700', value: 'text-emerald-600', bg: 'bg-emerald-500/10', bar: 'bg-emerald-400' }
            : { label: 'text-emerald-400', value: 'text-emerald-300', bg: 'bg-emerald-500/10', bar: 'bg-emerald-400' },
        amber: isLightTheme
            ? { label: 'text-amber-700', value: 'text-amber-600', bg: 'bg-amber-500/10', bar: 'bg-amber-400' }
            : { label: 'text-amber-400', value: 'text-amber-300', bg: 'bg-amber-500/10', bar: 'bg-amber-400' },
        red: isLightTheme
            ? { label: 'text-red-700', value: 'text-red-600', bg: 'bg-red-500/10', bar: 'bg-red-400' }
            : { label: 'text-red-400', value: 'text-red-300', bg: 'bg-red-500/10', bar: 'bg-red-400' },
        purple: isLightTheme
            ? { label: 'text-purple-700', value: 'text-purple-600', bg: 'bg-purple-500/10', bar: 'bg-purple-400' }
            : { label: 'text-purple-400', value: 'text-purple-300', bg: 'bg-purple-500/10', bar: 'bg-purple-400' },
    };

    const statsCards = [
        { label: lang === 'RO' ? 'Rezolvate' : 'Solved', value: String(profile.problemsSolved) },
        { label: lang === 'RO' ? 'Submisii' : 'Submissions', value: String(profile.submissions) },
        { label: lang === 'RO' ? 'Acceptare' : 'Acceptance', value: formatPercent(profile.acceptanceRate) },
        {
            label: lang === 'RO' ? 'Serie' : 'Streak',
            value: `${profile.streak}${profile.streakCapped ? '+' : ''}`,
        },
    ];

    const formatSubmissionDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(lang === 'RO' ? 'ro-RO' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatStatus = (status: RecentSubmissionDTO['status']) => {
        const label = submissionStatusLabels[status];
        return lang === 'RO' ? label.ro : label.en;
    };

    return (
        <>
            <motion.div
                variants={itemVariants}
                className="p-6 md:p-8 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm card-glow grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-8 items-center min-w-0"
            >
                <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-(--accent)/20 pb-6 md:pb-0 md:pr-6">
                    <span className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mb-2">
                        {lang === 'RO' ? 'Probleme Rezolvate' : 'Problems Solved'}
                    </span>
                    <span className="text-6xl font-black text-(--accent) drop-shadow-md">
                        {profile.problemsSolved}
                    </span>
                </div>

                <div className="flex flex-col gap-4">
                    {performanceItems.map((item) => (
                        <div key={item.label}>
                            <div className="flex items-center justify-between text-xs mb-1 gap-4">
                                <span className={`font-semibold ${performanceStyles[item.cls].label}`}>
                                    {item.label}
                                </span>
                                <span className={`font-bold ${performanceStyles[item.cls].value}`}>
                                    {formatPercent(item.value)}
                                </span>
                            </div>
                            <div className={`w-full rounded-full h-2 ${performanceStyles[item.cls].bg}`}>
                                <div
                                    className={`h-2 rounded-full ${performanceStyles[item.cls].bar}`}
                                    style={{ width: formatPercent(item.value) }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-0"
            >
                {statsCards.map((item) => (
                    <motion.div
                        key={item.label}
                        variants={itemVariants}
                        className="p-3 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) transition-colors cursor-pointer text-center"
                    >
                        <div className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold">
                            {item.label}
                        </div>
                        <div className="mt-1 text-sm font-bold text-(--text-h)">{item.value}</div>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm card-glow min-w-0"
            >
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
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm card-glow mb-8 min-w-0"
            >
                <h2 className="text-sm font-bold text-(--text-h) mb-4 uppercase tracking-wider">
                    {lang === 'RO' ? 'Submisii Recente' : 'Recent Submissions'}
                </h2>
                {profile.recentSubmissions.content.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-2"
                    >
                        {profile.recentSubmissions.content.map((submission) => {
                            const isAccepted = submission.status === 'OK';
                            const badgeClasses = isAccepted
                                ? isLightTheme
                                    ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40'
                                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : isLightTheme
                                  ? 'bg-red-500/20 text-red-700 border-red-500/40'
                                  : 'bg-red-500/10 text-red-300 border-red-500/30';

                            return (
                                <motion.div
                                    key={`${submission.problemTitle}-${submission.submissionDate}`}
                                    variants={itemVariants}
                                    className="p-3 md:p-4 rounded-2xl border border-(--accent)/20 bg-(--accent)/5 flex justify-between items-center gap-3 transition-colors hover:bg-(--accent)/10"
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
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <p className="text-sm text-(--text-subtle)">
                        {lang === 'RO'
                            ? 'Nu există submisii recente.'
                            : 'No recent submissions.'}
                    </p>
                )}
            </motion.div>
        </>
    );
}
