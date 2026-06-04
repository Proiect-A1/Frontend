import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useT } from '../../../language/Language';
import { itemVariants, staggerConfig } from '../../../utils/motionConfig';
import { useAuth } from '../../../contexts/AuthContext';
import UserAvatar from '../../../components/UserAvatar';
import { leaderboardService, type LeaderboardEntry } from '../../leaderboard/services/leaderboardService';

const TOP_SOLVERS_COUNT = 5;

function solverInitials(entry: LeaderboardEntry): string {
    const { firstName, lastName, username } = entry.user;
    const combined = `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.trim();
    return (combined || username.charAt(0) || '?').toUpperCase();
}

const MOCK_POPULAR_PROBLEMS = [
    { title: 'Componente conexe', solved: 14, difficulty: 'EASY' },
    { title: 'Drumuri', solved: 9, difficulty: 'MEDIUM' },
    { title: 'Bloxorz', solved: 4, difficulty: 'HARD' },
];

export default function StatsSidebar() {
    const t = useT();
    const { isAuthenticated } = useAuth();

    const topSolversQuery = useQuery({
        queryKey: ['leaderboard-top', TOP_SOLVERS_COUNT],
        queryFn: () => leaderboardService.getLeaderboard(1, TOP_SOLVERS_COUNT),
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
        retry: 0,
        enabled: isAuthenticated,
    });

    const topSolvers = topSolversQuery.data ?? [];

    return (
        <aside className="hidden xl:flex flex-col gap-6">
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="p-5 rounded-3xl border-2 border-(--accent) bg-(--surface-card) card-glow overflow-y-auto custom-scrollbar max-h-[calc(100svh-8.5rem)]"
            >
                <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: staggerConfig } }}>
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <h2 className="text-m font-bold text-(--text-h) uppercase tracking-widest">
                        {t.topSolvers}
                    </h2>
                    <Link to="/leaderboard" className="text-xs bg-(--accent)/10 text-(--accent) px-2 py-0.5 rounded-full font-bold hover:bg-(--accent)/20 transition-colors">
                        {t.statsViewAll}
                    </Link>
                </motion.div>
                <div className="page-line-horizontal" />
                <motion.div variants={{ visible: { transition: staggerConfig } }} initial="hidden" animate="visible" className="space-y-4">
                    {!isAuthenticated && (
                        <p className="text-xs text-(--text-muted) p-3 rounded-2xl border border-(--accent)/20 bg-(--accent)/5">
                            {t.statsLoginLeaderboard}
                        </p>
                    )}

                    {isAuthenticated && topSolversQuery.isPending && (
                        Array.from({ length: TOP_SOLVERS_COUNT }).map((_, i) => (
                            <div key={i} className="h-[58px] rounded-2xl border border-(--accent)/20 bg-(--accent)/5 animate-pulse" />
                        ))
                    )}

                    {isAuthenticated && !topSolversQuery.isPending && topSolvers.length === 0 && (
                        <p className="text-xs text-(--text-muted) p-3 rounded-2xl border border-(--accent)/20 bg-(--accent)/5">
                            {t.statsNoSolvers}
                        </p>
                    )}

                    {topSolvers.map((entry, idx) => (
                        <motion.div variants={itemVariants} key={entry.user.id}>
                        <Link
                            to={`/profile/${encodeURIComponent(entry.user.username)}`}
                            className="flex items-center justify-between group p-3 rounded-2xl border border-(--accent)/30 bg-(--accent)/5 hover:border-(--accent)/60 transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <UserAvatar
                                    email={entry.user.email}
                                    fallback={solverInitials(entry)}
                                    className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${
                                        idx === 0 ? 'bg-amber-500/20 border-amber-500 text-amber-500' :
                                        idx === 1 ? 'bg-slate-400/20 border-slate-400 text-slate-400' :
                                        idx === 2 ? 'bg-orange-700/20 border-orange-700 text-orange-700' :
                                        'bg-(--accent)/10 border-(--accent) text-(--accent)'
                                    }`}
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-(--text-h) truncate group-hover:text-(--accent) transition-colors">
                                        {entry.user.username}
                                    </p>
                                    <p className="text-[10px] text-(--text-muted)">
                                        {entry.solvedCount} {t.solvedLabel}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-black italic opacity-20">#{entry.rank}</span>
                        </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                className="p-5 rounded-3xl border-2 border-(--accent) bg-(--surface-card) card-glow"
            >
                <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: staggerConfig } }}>
                <motion.h2 variants={itemVariants} className="text-m font-bold text-(--text-h) uppercase tracking-widest">
                    {t.popularProblems}
                </motion.h2>
                <div className="page-line-horizontal" />
                <motion.div variants={{ visible: { transition: staggerConfig } }} initial="hidden" animate="visible" className="space-y-4">
                    {MOCK_POPULAR_PROBLEMS.map((prob) => (
                        <motion.div variants={itemVariants} key={prob.title}>
                            <Link to={`/problems/${encodeURIComponent(prob.title)}`} className="block p-3 rounded-2xl border border-(--accent)/30 bg-(--accent)/5 hover:bg-(--accent)/10 transition-colors cursor-pointer">
                                <h3 className="text-xs font-bold text-(--text-h) mb-1">{prob.title}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-(--text-muted) font-semibold uppercase">
                                        {prob.solved} {t.attemptsLabel}
                                    </span>
                                    <span className={`text-[8px] font-black ${
                                        prob.difficulty === 'EASY' ? 'text-emerald-400' :
                                        prob.difficulty === 'MEDIUM' ? 'text-amber-400' : 'text-red-400'
                                    }`}>
                                        {prob.difficulty}
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
                </motion.div>
            </motion.div>
        </aside>
    );
}
