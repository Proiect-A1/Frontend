import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, translations } from '../language/Language';
import { useAuth } from '../services/AuthContext';
import { adminService, type Announcement } from '../services/adminService';
import { itemVariants, staggerConfig } from '../utils/motionConfig';
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

    const isHighPriority = announcement.priority === 'high';
    const isMediumPriority = announcement.priority === 'medium';

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
                        className="fixed inset-0 z-9998 bg-black/25 backdrop-blur-sm"
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
                            className={`pointer-events-auto w-full max-w-lg rounded-2xl border-2 backdrop-blur-sm p-6 md:p-8 ${
                                isHighPriority
                                    ? 'border-(--accent) bg-(--surface-card)'
                                    : isMediumPriority
                                      ? 'border-(--accent)/50 bg-(--surface-card)'
                                      : 'border-(--accent)/40 bg-(--surface-card)'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="text-4xl shrink-0">{announcement.icon}</div>
                                {isHighPriority && (
                                    <span className="shrink-0 px-3 py-1 rounded-full bg-(--accent) text-(--text-h) text-xs font-bold border border-(--accent)/60">
                                        URGENT
                                    </span>
                                )}
                                {isMediumPriority && (
                                    <span className="shrink-0 px-3 py-1 rounded-full bg-(--accent)/20 text-(--accent) text-xs font-bold border border-(--accent)/40">
                                        {lang === 'RO' ? 'IMPORTANT' : 'IMPORTANT'}
                                    </span>
                                )}
                            </div>
                            <h2
                                className={`text-2xl font-bold mb-4 ${
                                    isHighPriority ? 'text-(--accent)' : 'text-(--text-h)'
                                }`}
                            >
                                {announcement.title}
                            </h2>
                            <div className="text-sm text-(--text) leading-relaxed mb-6 whitespace-pre-wrap max-h-96 overflow-y-auto [overflow-wrap:anywhere]">
                                {announcement.content}
                            </div>
                            <div
                                className={`flex items-center justify-between pt-4 border-t ${
                                    isHighPriority ? 'border-(--accent)/30' : 'border-(--accent)/20'
                                }`}
                            >
                                <span className="text-xs uppercase tracking-widest text-(--text-subtle) font-bold">
                                    {announcement.createdAt}
                                </span>
                                <button
                                    onClick={onClose}
                                    className={`px-4 py-2 rounded-full border text-xs font-bold transition-colors ${
                                        isHighPriority
                                            ? 'border-(--accent)/60 bg-(--accent)/20 text-(--accent) hover:bg-(--accent)/30'
                                            : 'border-(--accent)/40 bg-(--accent)/10 text-(--text-h) hover:bg-(--accent)/20'
                                    }`}
                                >
                                    {lang === 'RO' ? 'Închide' : 'Close'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body, // randat direct in body, complet in afara oricarui transform
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
    const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

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
                className="w-full max-w-7xl rounded-2xl border-2 border-(--accent) bg-(--surface-card) px-0 py-0 h-full overflow-hidden xl:h-full relative flex flex-col"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="w-full rounded-2xl px-5 py-6 md:px-8 md:py-8 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Hero Section */}
                    <div className="text-center mt-6 mb-8 md:mb-12 relative">
                        <motion.div variants={itemVariants} className="mb-4">
                            <img
                                src={logoSrc}
                                alt="FiiCoder"
                                className="theme-logo h-20 w-20 md:h-24 md:w-24 mx-auto theme-logo-glow"
                            />
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl md:text-6xl font-black text-(--text-h) mb-3 tracking-tighter"
                        >
                            {t.welcomeTitle}{' '}
                            <span className="text-(--accent)">{`<_FiiCoder>`}</span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-base md:text-xl text-(--text-muted) max-w-2xl mx-auto mb-8"
                        >
                            {t.welcomeDesc}
                        </motion.p>

                        {/* Stats Section - Moved up */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10"
                        >
                            {[
                                { num: '5k+', label: t.activeStudents },
                                { num: '500+', label: t.problemsCount },
                                { num: '150+', label: t.contestsCount },
                                { num: '98%', label: t.satisfactionRate },
                            ].map((stat, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className="text-xl md:text-2xl font-black text-(--accent)">
                                        {stat.num}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                to="/problems"
                                className="px-8 py-3 rounded-xl bg-(--accent) border-2 border-(--accent) text-(--surface-card) font-black text-sm transition-all duration-200 hover:bg-transparent hover:text-(--accent) hover:-translate-y-1 active:translate-y-0"
                            >
                                {t.viewProblems}
                            </Link>

                            {!isAuthenticated && (
                                <Link
                                    to="/login"
                                    className="px-8 py-3 rounded-xl bg-transparent border-2 border-(--accent) text-(--accent) font-black text-sm transition-all duration-200 hover:bg-(--accent) hover:text-(--surface-card) hover:-translate-y-1 active:translate-y-0"
                                >
                                    {t.authenticateBtn}
                                </Link>
                            )}
                        </motion.div>
                    </div>

                    {/* Announcements Section */}
                    <motion.div variants={itemVariants} className="mt-4 mb-12">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h2 className="text-2xl font-black text-(--text-h) tracking-tight">
                                {t.announcementsTitle}
                            </h2>
                            {announcements.length > 3 && (
                                <button 
                                    onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
                                    className="text-xs font-bold text-(--accent) hover:underline"
                                >
                                    {showAllAnnouncements 
                                        ? (lang === 'RO' ? 'Vezi mai puțin' : 'Show less') 
                                        : (lang === 'RO' ? 'Vezi toate' : 'View all')}
                                </button>
                            )}
                        </div>
                        
                        <div className="grid gap-4 lg:grid-cols-3">
                            {announcements.length > 0 ? (
                                announcements
                                    .slice(0, showAllAnnouncements ? undefined : 3)
                                    .map((ann) => (
                                    <motion.div
                                        key={ann.id}
                                        variants={itemVariants}
                                        onClick={() => handleOpenAnnouncement(ann)}
                                        className={`p-4 rounded-2xl border-2 backdrop-blur-sm cursor-pointer transition-all duration-200 group relative ${
                                            ann.priority === 'high'
                                                ? 'border-(--accent) bg-(--accent)/10 hover:bg-(--accent)/15'
                                                : ann.priority === 'medium'
                                                  ? 'border-(--accent)/50 bg-(--surface-muted) hover:border-(--accent)'
                                                  : 'border-(--accent)/20 bg-(--surface-muted) hover:border-(--accent)/40'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl shrink-0 group-hover:rotate-12 transition-transform duration-300">
                                                {ann.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3
                                                        className={`font-bold text-sm line-clamp-1 ${
                                                            ann.priority === 'high'
                                                                ? 'text-(--accent)'
                                                                : 'text-(--text-h)'
                                                        }`}
                                                    >
                                                        {ann.title}
                                                    </h3>
                                                    {ann.priority === 'high' && (
                                                        <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-(--accent) text-(--surface-card) text-[8px] font-black uppercase">
                                                            !
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-(--text-muted) mb-2 line-clamp-2">
                                                    {ann.content}
                                                </p>
                                                <div className="text-[10px] text-(--text-subtle) font-bold uppercase tracking-wider">
                                                    {ann.createdAt}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8">
                                    <p className="text-(--text-muted) text-sm italic">
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
                    <div className="grid md:grid-cols-3 gap-6 mt-8 mb-12">
                        {[
                            {
                                icon: '📚',
                                title: t.newProblems,
                                desc: t.newProblemsDesc,
                                color: 'bg-emerald-500/10'
                            },
                            {
                                icon: '🏆',
                                title: t.dailyContests,
                                desc: t.dailyContestsDesc,
                                color: 'bg-amber-500/10'
                            },
                            {
                                icon: '💻',
                                title: t.advancedEditor,
                                desc: t.advancedEditorDesc,
                                color: 'bg-blue-500/10'
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className={`p-6 rounded-2xl border-2 border-(--accent)/30 bg-(--surface-card) transition-all duration-300 group hover:border-(--accent)`}
                            >
                                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-105 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-black text-(--text-h) mb-2 tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-(--text-muted) leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
