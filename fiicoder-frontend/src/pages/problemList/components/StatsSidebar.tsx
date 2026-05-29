import { motion } from 'framer-motion';
import { useT } from '../../../language/Language';
import { itemVariants, staggerConfig } from '../../../utils/motionConfig';

const MOCK_TOP_SOLVERS = [
    { username: 'GolderbergPrivate', solved: 142, rank: 1, avatar: 'GP' },
    { username: 'algo_master', solved: 128, rank: 2, avatar: 'AM' },
    { username: 'cpp_wizard', solved: 95, rank: 3, avatar: 'CW' },
    { username: 'theorist', solved: 84, rank: 4, avatar: 'TH' },
    { username: 'newbie_coder', solved: 67, rank: 5, avatar: 'NC' },
];

const MOCK_POPULAR_PROBLEMS = [
    { title: 'A+B Problem', solved: 1250, difficulty: 'EASY' },
    { title: 'Dijkstra on Steroids', solved: 450, difficulty: 'HARD' },
    { title: 'Knapsack 0/1', solved: 890, difficulty: 'MEDIUM' },
];

export default function StatsSidebar() {
    const t = useT();

    return (
        <aside className="hidden xl:flex flex-col gap-6">
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="p-5 rounded-3xl border-2 border-(--accent) bg-(--surface-card) card-glow overflow-y-auto custom-scrollbar max-h-[calc(100svh-8.5rem)]"
            >
                <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: staggerConfig } }}>
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <h2 className="text-m font-bold text-(--text-h) uppercase tracking-widest">
                        {t.topSolvers}
                    </h2>
                    <span className="text-xs     bg-(--accent)/10 text-(--accent) px-2 py-0.5 rounded-full font-bold">
                        GLOBAL
                    </span>
                </motion.div>
                <div className="page-line-horizontal" />
                <motion.div variants={{ visible: { transition: staggerConfig } }} initial="hidden" animate="visible" className="space-y-4">
                    {MOCK_TOP_SOLVERS.map((user, idx) => (
                        <motion.div variants={itemVariants} key={user.username} className="flex items-center justify-between group p-3 rounded-2xl border border-(--accent)/30 bg-(--accent)/5 hover:border-(--accent)/60 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${
                                    idx === 0 ? 'bg-amber-500/20 border-amber-500 text-amber-500' :
                                    idx === 1 ? 'bg-slate-400/20 border-slate-400 text-slate-400' :
                                    idx === 2 ? 'bg-orange-700/20 border-orange-700 text-orange-700' :
                                    'bg-(--accent)/10 border-(--accent) text-(--accent)'
                                }`}>
                                    {user.avatar}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-(--text-h) truncate group-hover:text-(--accent) transition-colors">
                                        {user.username}
                                    </p>
                                    <p className="text-[10px] text-(--text-muted)">
                                        {user.solved} {t.solvedLabel}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-black italic opacity-20">#{user.rank}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, ease: "easeOut", delay: 0.07 }}
                className="p-5 rounded-3xl border-2 border-(--accent) bg-(--surface-card) card-glow"
            >
                <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: staggerConfig } }}>
                <motion.h2 variants={itemVariants} className="text-m font-bold text-(--text-h) uppercase tracking-widest">
                    {t.popularProblems}
                </motion.h2>
                <div className="page-line-horizontal" />
                <motion.div variants={{ visible: { transition: staggerConfig } }} initial="hidden" animate="visible" className="space-y-4">
                    {MOCK_POPULAR_PROBLEMS.map((prob) => (
                        <motion.div variants={itemVariants} key={prob.title} className="p-3 rounded-2xl border border-(--accent)/30 bg-(--accent)/5 hover:bg-(--accent)/10 transition-colors cursor-pointer">
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
                        </motion.div>
                    ))}
                </motion.div>
                </motion.div>
            </motion.div>
        </aside>
    );
}
