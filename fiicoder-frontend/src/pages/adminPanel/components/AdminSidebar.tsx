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
        { label: lang === 'RO' ? 'Utilizatori' : 'Users', value: overview?.users },
        { label: lang === 'RO' ? 'Probleme' : 'Problems', value: overview?.problems },
        { label: lang === 'RO' ? 'Submisii' : 'Submissions', value: overview?.submissions },
        { label: lang === 'RO' ? 'Clase' : 'Classes', value: overview?.classes },
        { label: lang === 'RO' ? 'Teme' : 'Homework', value: overview?.assignments },
        {
            label: lang === 'RO' ? 'Propuneri pending' : 'Pending proposals',
            value: overview?.pendingProposals,
            highlight: true,
        },
    ];

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 z-40 bg-black/15 backdrop-blur-[2px]"
            />
            <motion.aside
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                className="absolute z-50 left-0 top-0 w-80 h-full bg-(--surface-card) border-r-2 border-(--accent) flex flex-col"
            >
                <div className="h-full overflow-y-auto custom-scrollbar p-5 border-r-2 border-transparent">
                    <div className="flex items-start justify-between gap-3 mb-5">
                        <div>
                            <h2 className="text-xl font-bold text-(--text-h) flex items-center gap-2">
                                <svg
                                    className="h-5 w-5 text-(--accent)"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 19h16M4 15h4M4 11h10M4 7h16"
                                    />
                                </svg>
                                {lang === 'RO' ? 'Rezumat' : 'Overview'}
                            </h2>
                            <p className="text-sm text-(--text-muted) mt-1">
                                {lang === 'RO'
                                    ? 'Statistici live ale panoului de administrare.'
                                    : 'Live admin panel statistics.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-(--accent)/30 bg-(--accent)/10 p-2 text-(--text-h) hover:bg-(--accent)/20 transition-colors"
                            aria-label={lang === 'RO' ? 'Ascunde rezumatul' : 'Hide overview'}
                            title={lang === 'RO' ? 'Ascunde rezumatul' : 'Hide overview'}
                        >
                            <svg
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 6l12 12M18 6L6 18"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {overviewCards.map((stat) => (
                            <div
                                key={stat.label}
                                className={`rounded-2xl border p-4 text-center ${
                                    stat.highlight
                                        ? 'border-amber-400/50 bg-amber-500/10'
                                        : 'border-(--accent)/20 bg-black/15'
                                }`}
                            >
                                <span
                                    className={`block text-3xl font-black mb-1 ${
                                        stat.highlight ? 'text-amber-300' : 'text-(--accent)'
                                    }`}
                                >
                                    {stat.value ?? '—'}
                                </span>
                                <span className="text-[10px] uppercase tracking-tighter font-black text-(--text-muted)">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
