import { motion } from 'framer-motion';
import { useLanguage } from '../../../language/Language';
import type { AdminOverview } from '../services/adminService';

type Props = {
    overview: AdminOverview | undefined;
    onClose: () => void;
};

export default function AdminSidebar({ overview, onClose }: Props) {
    const { lang } = useLanguage();

    const overviewCards = [
        { label: lang === 'RO' ? 'Utilizatori' : 'Users', value: overview?.users, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { label: lang === 'RO' ? 'Probleme' : 'Problems', value: overview?.problems, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { label: lang === 'RO' ? 'Submisii' : 'Submissions', value: overview?.submissions, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: lang === 'RO' ? 'Clase' : 'Classes', value: overview?.classes, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { label: lang === 'RO' ? 'Teme' : 'Homework', value: overview?.assignments, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        {
            label: lang === 'RO' ? 'Propuneri' : 'Proposals',
            value: overview?.pendingProposals,
            highlight: true,
            icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
        },
    ];

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
            />
            <motion.aside
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                className="absolute z-50 left-0 top-0 w-80 h-full bg-(--surface-card) border-r-2 border-(--accent) flex flex-col"
            >
                <div className="h-full overflow-y-auto custom-scrollbar p-6">
                    <div className="flex items-center justify-between gap-3 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-(--text-h)">
                                {lang === 'RO' ? 'Rezumat' : 'Overview'}
                            </h2>
                            <p className="text-xs text-(--text-muted) font-semibold mt-1">
                                {lang === 'RO' ? 'STATISTICI LIVE' : 'LIVE STATISTICS'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-10 h-10 rounded-full border-2 border-(--accent)/50 bg-(--accent)/10 flex items-center justify-center text-(--text-h) hover:bg-(--accent)/20 transition-all active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {overviewCards.map((stat) => (
                            <div
                                key={stat.label}
                                className={`rounded-3xl border p-5 flex items-center gap-4 transition-all ${
                                    stat.highlight
                                        ? 'border-amber-400/50 bg-amber-400/10'
                                        : 'border-(--accent)/20 bg-(--accent)/5 hover:bg-(--accent)/10'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.highlight ? 'bg-amber-400/20 text-amber-500' : 'bg-(--accent)/20 text-(--accent)'}`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-(--text-muted) uppercase tracking-widest">{stat.label}</p>
                                    <p className={`text-2xl font-black ${stat.highlight ? 'text-amber-500' : 'text-(--text-h)'}`}>
                                        {overview === undefined ? '...' : stat.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
