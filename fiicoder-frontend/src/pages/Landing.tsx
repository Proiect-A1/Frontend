import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, translations } from '../language/Language';
import { useAuth } from '../services/AuthContext';
import { adminService, type Announcement } from '../services/adminService';
import { hoverTransition, itemVariants, staggerConfig } from '../utils/motionConfig';
import { useTheme } from '../services/ThemeContext';
import { createPortal } from 'react-dom';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: staggerConfig,
    },
};

interface AnnouncementWithPriority extends Announcement {
    priority: 'high' | 'medium' | 'low';
    icon: string;
}

function getPriorityFromTitle(title: string): 'high' | 'medium' | 'low' {
    const titleLower = title.toLowerCase();
    if (
        titleLower.includes('urgent') ||
        titleLower.includes('mentenanță') ||
        titleLower.includes('maintenance')
    ) {
        return 'high';
    }
    if (titleLower.includes('concurs') || titleLower.includes('contest')) {
        return 'medium';
    }
    return 'low';
}

function getIconForAnnouncement(title: string): string {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('concurs') || titleLower.includes('contest')) return '🚀';
    if (titleLower.includes('problemă') || titleLower.includes('problem')) return '📈';
    if (
        titleLower.includes('tutorial') ||
        titleLower.includes('curs') ||
        titleLower.includes('course')
    )
        return '🎓';
    return '📢';
}

interface AnnouncementModalProps {
    announcement: AnnouncementWithPriority | null;
    isOpen: boolean;
    onClose: () => void;
    lang: 'EN' | 'RO';
}

function AnnouncementModal({ announcement, isOpen, onClose, lang }: AnnouncementModalProps) {
    if (!announcement) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* backdrop - fixed pe viewport real, nu pe parinte cu transform */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-9998 bg-black/60 backdrop-blur-sm"
                    />
                    {/* modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                        className="fixed inset-0 z-9999 flex items-center justify-center px-4 pointer-events-none"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className={`pointer-events-auto w-full max-w-lg rounded-2xl border-2 backdrop-blur-lg p-6 md:p-8 shadow-2xl ${
                                announcement.priority === 'high'
                                    ? 'border-red-500/40 bg-red-500/10'
                                    : 'border-pink-500/40 theme-surface-card'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="text-4xl shrink-0">{announcement.icon}</div>
                                {announcement.priority === 'high' && (
                                    <span className="shrink-0 px-3 py-1 rounded-full bg-red-500/30 text-red-300 text-xs font-bold">
                                        URGENT
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-pink-100 mb-4">
                                {announcement.title}
                            </h2>
                            <div className="text-sm text-pink-200/80 leading-relaxed mb-6 whitespace-pre-wrap max-h-96 overflow-y-auto">
                                {announcement.content}
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-pink-500/20">
                                <span className="text-xs uppercase tracking-widest text-pink-300/50 font-bold">
                                    {announcement.createdAt}
                                </span>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-full border border-pink-400/40 bg-pink-500/10 text-pink-100 text-xs font-bold hover:bg-pink-500/20 transition-colors"
                                >
                                    {lang === 'RO' ? 'Închide' : 'Close'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body  // randat direct in body, complet in afara oricarui transform
    );
}

export default function Landing() {
    const { lang } = useLanguage();
    const t = translations[lang];
    const { isAuthenticated } = useAuth();
    const { theme } = useTheme();
    
    const themeLogo: Record<string, string> = {
        rose: '/logo.svg',
        nord: '/logo_nord.svg',
        cream: '/logo_cream.svg',
        sage: '/logo_sage.svg',
    };
    const logoSrc = themeLogo[theme] || '/logo.svg';

    const [announcements, setAnnouncements] = useState<AnnouncementWithPriority[]>([]);
    const [selectedAnnouncement, setSelectedAnnouncement] =
        useState<AnnouncementWithPriority | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function loadAnnouncements() {
            const data = await adminService.getAnnouncements();
            const enrichedAnnouncements: AnnouncementWithPriority[] = data.map((announcement) => ({
                ...announcement,
                priority: getPriorityFromTitle(announcement.title),
                icon: getIconForAnnouncement(announcement.title),
            }));
            setAnnouncements(enrichedAnnouncements);
        }
        void loadAnnouncements();
    }, []);

    const handleOpenAnnouncement = (announcement: AnnouncementWithPriority) => {
        setSelectedAnnouncement(announcement);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedAnnouncement(null), 200);
    };

    return (
        <div className="w-full flex justify-center h-auto xl:h-full">
            <motion.div
                className="w-full max-w-7xl rounded-2xl border-2 border-pink-500/30 theme-surface-card px-0 py-0 card-glow h-full overflow-hidden xl:h-full relative flex flex-col"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="w-full rounded-2xl backdrop-blur-lg px-5 py-6 md:px-8 md:py-8 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Hero Section */}
                    <div className="text-center mb-8 md:mb-10">
                        <motion.div variants={itemVariants} className="mb-4">
                            <img
                                src={logoSrc}
                                alt="FiiCoder"
                                className="theme-logo h-20 w-20 md:h-28 md:w-28 mx-auto theme-logo-glow"
                            />
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl md:text-5xl font-black text-pink-100 mb-3 tracking-tight"
                        >
                            {t.welcomeTitle} <span className="text-pink-400">{`<_FiiCoder>`}</span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-base md:text-lg text-pink-200/70 max-w-2xl mx-auto mb-6"
                        >
                            {t.welcomeDesc}
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                to="/problems"
                                className="px-6 py-2.5 rounded-full bg-pink-500/20 border-2 border-pink-400/60 text-pink-100 font-bold text-sm transition-all duration-200 hover:bg-pink-500/35 hover:border-pink-400 hover:-translate-y-1"
                            >
                                {t.viewProblems}
                            </Link>

                            {!isAuthenticated && (
                                <Link
                                    to="/login"
                                    className="px-6 py-2.5 rounded-full bg-pink-500/20 border-2 border-pink-400/60 text-pink-100 font-bold text-sm transition-all duration-200 hover:bg-pink-500/35 hover:border-pink-400 hover:-translate-y-1 shadow-lg hover:shadow-pink-500/30"
                                >
                                    {t.authenticateBtn}
                                </Link>
                            )}
                        </motion.div>
                    </div>

                    {/* Announcements Section */}
                    <motion.div variants={itemVariants} className="mt-8 mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-pink-100 mb-6 text-center">
                            {t.announcementsTitle}
                        </h2>
                        <div className="grid gap-4 lg:grid-cols-3">
                            {announcements.length > 0 ? (
                                announcements.map((ann) => (
                                    <motion.div
                                        key={ann.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -4, transition: hoverTransition }}
                                        onClick={() => handleOpenAnnouncement(ann)}
                                        className={`p-4 rounded-2xl border backdrop-blur-sm cursor-pointer transition-colors duration-300 group ${
                                            ann.priority === 'high'
                                                ? 'border-red-500/40 bg-red-500/10 hover:border-red-500/70 hover:bg-red-500/15 shadow-lg shadow-red-500/20'
                                                : ann.priority === 'medium'
                                                  ? 'border-pink-500/30 theme-surface-muted hover:border-pink-500/60 theme-surface-hover'
                                                  : 'border-pink-500/20 theme-surface-muted hover:border-pink-500/40 theme-surface-hover'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl shrink-0 group-hover:scale-110 transition-all duration-300">
                                                {ann.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-pink-100 text-sm mb-1 line-clamp-2">
                                                    {ann.title}
                                                </h3>
                                                <p className="text-xs text-pink-200/70 mb-2 line-clamp-3">
                                                    {ann.content.slice(0, 120)}...
                                                </p>
                                                <div className="text-[10px] text-pink-300/50">
                                                    {ann.createdAt}
                                                </div>
                                            </div>
                                            {ann.priority === 'high' && (
                                                <div className="shrink-0 px-2 py-0.5 rounded-full bg-red-500/30 text-red-300 text-[10px] font-bold">
                                                    {lang === 'RO' ? 'URGENT' : 'URGENT'}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8">
                                    <p className="text-pink-200/60 text-sm">
                                        {lang === 'RO'
                                            ? 'Nu sunt anunțuri disponibile.'
                                            : 'No announcements available.'}
                                    </p>
                                </div>
                            )}
                        </div>
                        <AnnouncementModal
                            announcement={selectedAnnouncement}
                            isOpen={isModalOpen}
                            onClose={handleCloseModal}
                            lang={lang}
                        />
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4 mt-6">
                        {[
                            {
                                icon: '📚',
                                title: t.newProblems,
                                desc: t.newProblemsDesc,
                            },
                            {
                                icon: '🏆',
                                title: t.dailyContests,
                                desc: t.dailyContestsDesc,
                            },
                            {
                                icon: '💻',
                                title: t.advancedEditor,
                                desc: t.advancedEditorDesc,
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="p-5 rounded-xl border border-pink-500/30 theme-surface-card backdrop-blur-sm hover:border-pink-500/60 theme-surface-hover transition-colors duration-300 group"
                            >
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-all duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-base font-bold text-pink-100 mb-1">
                                    {feature.title}
                                </h3>
                                <p className="text-xs text-pink-200/60">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Stats Section */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-8 p-6 rounded-xl border border-pink-500/25 theme-surface-muted backdrop-blur-sm"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            {[
                                { num: '5000+', label: t.activeStudents },
                                { num: '500+', label: t.problemsCount },
                                { num: '150+', label: t.contestsCount },
                                { num: '98%', label: t.satisfactionRate },
                            ].map((stat, idx) => (
                                <motion.div key={idx} variants={itemVariants}>
                                    <div className="text-2xl md:text-3xl font-black text-pink-300 mb-1">
                                        {stat.num}
                                    </div>
                                    <div className="text-xs text-pink-200/60">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
