import { motion } from 'framer-motion';
import { useLanguage } from '../language/Language';

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
    const { lang } = useLanguage();

    return (
        <aside className="hidden xl:flex flex-col gap-6">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-2xl border-2 border-(--accent)/30 bg-(--surface-card) backdrop-blur-sm shadow-lg"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-(--text-h) uppercase tracking-widest">
                        {lang === 'RO' ? 'Top Rezolvitori' : 'Top Solvers'}
                    </h2>
                    <span className="text-[10px] bg-(--accent)/10 text-(--accent) px-2 py-0.5 rounded-full font-bold">
                        GLOBAL
                    </span>
                </div>

                <div className="space-y-4">
                    {MOCK_TOP_SOLVERS.map((user, idx) => (
                        <div key={user.username} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                                    idx === 0 ? 'bg-amber-500/20 border-amber-500 text-amber-200' :
                                    idx === 1 ? 'bg-slate-400/20 border-slate-400 text-slate-200' :
                                    idx === 2 ? 'bg-orange-700/20 border-orange-700 text-orange-200' :
                                    'bg-(--accent)/10 border-(--accent)/30 text-(--text-muted)'
                                }`}>
                                    {user.avatar}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-(--text-h) truncate group-hover:text-(--accent) transition-colors">
                                        {user.username}
                                    </p>
                                    <p className="text-[10px] text-(--text-muted)">
                                        {user.solved} {lang === 'RO' ? 'rezolvate' : 'solved'}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-black italic opacity-20">#{user.rank}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl border-2 border-(--accent)/30 bg-(--surface-card) backdrop-blur-sm shadow-lg"
            >
                <h2 className="text-sm font-bold text-(--text-h) mb-4 uppercase tracking-widest">
                    {lang === 'RO' ? 'Probleme Populare' : 'Popular Problems'}
                </h2>
                <div className="space-y-3">
                    {MOCK_POPULAR_PROBLEMS.map((prob) => (
                        <div key={prob.title} className="p-3 rounded-xl border border-(--accent)/10 bg-(--accent)/5 hover:bg-(--accent)/10 transition-all cursor-pointer">
                            <h3 className="text-xs font-bold text-(--text-h) mb-1">{prob.title}</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] text-(--text-muted) font-semibold uppercase">
                                    {prob.solved} {lang === 'RO' ? 'încercări' : 'attempts'}
                                </span>
                                <span className={`text-[8px] font-black ${
                                    prob.difficulty === 'EASY' ? 'text-emerald-400' :
                                    prob.difficulty === 'MEDIUM' ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                    {prob.difficulty}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </aside>
    );
}