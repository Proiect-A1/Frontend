import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useLanguage, translations } from '../../language/Language';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../adminPanel/services/adminService';
import type { Announcement } from '../../types/announcement';
import { itemVariants, staggerConfig } from '../../utils/motionConfig';
import { useTheme } from '../../contexts/ThemeContext';
import { createPortal } from 'react-dom';
import { unpackTranslation, hasTranslation } from '../../utils/translationPacker';
import { formatDateTime } from '../../utils/dateTime';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: staggerConfig,
    },
};

interface AnnouncementWithPriority extends Announcement {
    priority: 'high' | 'medium' | 'low';
    icon: ReactNode;
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
    return 'low';
}

function getIconForAnnouncement(title: string): ReactNode {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('problemă') || titleLower.includes('problem'))
        return (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
            </svg>
        );
    if (
        titleLower.includes('tutorial') ||
        titleLower.includes('curs') ||
        titleLower.includes('course')
    )
        return (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
            </svg>
        );
    return (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            />
        </svg>
    );
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
                                      ? 'border-(--accent-secondary)/60 bg-(--surface-card)'
                                      : 'border-(--accent)/40 bg-(--surface-card)'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="w-9 h-9 shrink-0 text-(--accent)">
                                    {announcement.icon}
                                </div>
                                {isHighPriority && (
                                    <span className="shrink-0 px-3 py-1 rounded-full bg-(--accent) text-(--text-h) text-xs font-bold border border-(--accent)/60">
                                        URGENT
                                    </span>
                                )}
                                {isMediumPriority && (
                                    <span className="shrink-0 px-3 py-1 rounded-full bg-(--accent-secondary)/20 text-(--accent-secondary) text-xs font-bold border border-(--accent-secondary)/40">
                                        {lang === 'RO' ? 'IMPORTANT' : 'IMPORTANT'}
                                    </span>
                                )}
                            </div>
                            <h2
                                className={`text-2xl font-bold mb-4 ${
                                    isHighPriority ? 'text-(--accent)' : 'text-(--text-h)'
                                }`}
                            >
                                {unpackTranslation(announcement.title, lang)}
                            </h2>
                            <div className="text-sm text-(--text) leading-relaxed mb-6 whitespace-pre-wrap max-h-96 overflow-y-auto wrap-anywhere">
                                {unpackTranslation(announcement.content, lang)}
                            </div>
                            <div
                                className={`flex items-center justify-between pt-4 border-t ${
                                    isHighPriority ? 'border-(--accent)/30' : 'border-(--accent-secondary)/25'
                                }`}
                            >
                                <span className="text-xs uppercase tracking-widest text-(--text-subtle) font-bold">
                                    {formatDateTime(announcement.createdAt, lang)}
                                </span>
                                <button
                                    onClick={onClose}
                                    className={`px-4 py-2 rounded-full border text-xs font-bold transition-colors ${
                                        isHighPriority
                                            ? 'border-(--accent)/60 bg-(--accent)/20 text-(--accent) hover:bg-(--accent)/30'
                                            : 'border-(--accent-secondary)/50 bg-(--accent-secondary)/10 text-(--text-h) hover:bg-(--accent-secondary)/20'
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
    const { theme } = useTheme();
    const { lang } = useLanguage();
    const t = translations[lang];
    const { isAuthenticated } = useAuth();

    const logoSrc = useMemo(() => {
        const themeLogo: Record<string, string> = {
            rose: '/logo.svg',
            nord: '/logo_nord.svg',
            cream: '/logo_cream.svg',
            sage: '/logo_sage.svg',
            serika: '/logo_serika.svg',
            eighties: '/logo_eighties.svg',
            'olivia': '/logo_olivia.svg',
            fiicode: '/logo_fiicode.svg',
            fii: '/logo_fii.svg',
            superuser: '/logo_superuser.svg',
            mcdonalds: '/logo.svg',
        };
        return themeLogo[theme] || '/logo.svg';
    }, [theme]);
    const announcementsQuery = useQuery({
        queryKey: ['announcements'],
        queryFn: async () => {
            const data = await adminService.getAnnouncements();
            return data
                .map((announcement) => {
                    const unpackedTitle = unpackTranslation(announcement.title, 'RO');
                    return {
                        ...announcement,
                        priority: getPriorityFromTitle(unpackedTitle),
                        icon: getIconForAnnouncement(unpackedTitle),
                    };
                })
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },
    });

    const announcements = useMemo(() =>
        (announcementsQuery.data ?? []).filter(ann => hasTranslation(ann.title, lang)),
        [announcementsQuery.data, lang]
    );
    const isAnnouncementsLoading = announcementsQuery.isPending;
    const [selectedAnnouncement, setSelectedAnnouncement] =
        useState<AnnouncementWithPriority | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

    // Memoize the features and stats list to avoid recreation on every render
    const features = useMemo(
        () => [
            {
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                    </svg>
                ),
                title: t.newProblems,
                desc: t.newProblemsDesc,
                color: 'bg-emerald-500/10',
                iconColor: 'text-emerald-400',
            },
            {
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                    </svg>
                ),
                title: t.classesMentors,
                desc: t.classesMentorsDesc,
                color: 'bg-amber-500/10',
                iconColor: 'text-amber-400',
            },
            {
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                    </svg>
                ),
                title: t.advancedEditor,
                desc: t.advancedEditorDesc,
                color: 'bg-blue-500/10',
                iconColor: 'text-blue-400',
            },
        ],
        [t],
    );

    const stats = useMemo(
        () => [
            { num: '5k+', label: t.activeStudents },
            { num: '500+', label: t.problemsCount },
            { num: '150+', label: t.contestsCount },
            { num: '98%', label: t.satisfactionRate },
        ],
        [t],
    );

    const handleOpenAnnouncement = async (announcement: AnnouncementWithPriority) => {
        setSelectedAnnouncement(announcement);
        setIsModalOpen(true);
        try {
            const fresh = await adminService.getAnnouncementById(announcement.id);
            const unpackedFreshTitle = unpackTranslation(fresh.title, lang);
            setSelectedAnnouncement({
                ...fresh,
                priority: getPriorityFromTitle(unpackedFreshTitle),
                icon: getIconForAnnouncement(unpackedFreshTitle),
            });
        } catch {
            // keep cached data if fetch fails
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedAnnouncement(null), 200);
    };

    return (
            <motion.div
                className="w-full max-w-7xl mx-auto rounded-3xl border-2 border-(--accent) bg-(--surface-card) h-full overflow-hidden xl:h-full relative flex flex-col"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="w-full rounded-2xl px-5 py-6 md:px-8 md:py-8 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Hero Section */}
                    <div className="text-center mt-4 mb-8 md:mb-10 relative">
                        <motion.div variants={itemVariants} className="mb-3">
                            {theme === 'mcdonalds' ? (
                                <svg
                                    className="theme-logo h-16 w-16 md:h-20 md:w-20 mx-auto"
                                    viewBox="0 0 120 100"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M 15 90 L 15 35 Q 15 12 37 12 Q 60 12 60 38 L 60 60 L 60 38 Q 60 12 83 12 Q 105 12 105 35 L 105 90 L 88 90 L 88 40 Q 88 26 76 26 Q 65 26 65 42 L 65 90 L 55 90 L 55 42 Q 55 26 44 26 Q 32 26 32 40 L 32 90 Z"
                                        fill="#FFC72C"
                                        stroke="#DA291C"
                                        strokeWidth="2.5"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) : theme === 'custom' ? (
                                <svg
                                    className="theme-logo h-16 w-16 md:h-20 md:w-20 mx-auto theme-logo-glow"
                                    viewBox="2.5229450154783466 65.87558809587485 252.37708872055313 121.06515820573098"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        style={{ fill: 'color-mix(in srgb, var(--accent) 65%, white 35%)' }}
                                        fillRule="evenodd"
                                        d="m17.3 109.25c-13.11 9.81-11.44 18.37-3.9 31.5 10.98 19.14 27.93 26.49 49.35 31.28 23.25 5.2 56.87-25.08 73.85-38.63 9.92-7.92 18.84-16.75 27.13-26.28 1.01-1.16 7-5.69 6.74-7.59-1.23-9-21.08-15.19-27.74-17.53-25.2-8.88-67.63-9.77-92.39 0.84-11.77 5.05-26.1 11.77-34.93 21.32-2.89 3.12-6.21 7.03-6.98 11.4-0.13 0.75 0.67 6.65-0.55 5.4"
                                    />
                                    <path
                                        style={{ fill: 'var(--accent)' }}
                                        d="m55.22 98.48c1.9-6.86 15.7-8.67 25.44-9.95 24.97-3.05 49.07 0.62 70.8 10 7.76-0.71 14.7 11.59 37.64 9.2 8.74-0.91 15.88-3.54 21.18-5.5 23.94-8.86 35.47-22.28 38-20.03 3.33 2.98-20.45 22.76-19.1 48.87 0.97 18.99 14.99 30.67 11.14 34.53-3.47 3.48-14.1-6.78-36.5-12.65-18.05-4.73-32.33-3.63-39.8-2.98-13.53 1.17-37.72 5.58-38.26 13.1-0.48 6.64 17.91 10.82 17.04 14.73-0.36 1.6-4.05 3.75-55.12-1.29-24.25-2.39-29.9-3.51-31.67-7.76-4.33-10.29 21.15-22.26 18.88-40.46-1.94-15.46-22.1-21.04-19.67-29.81z"
                                    />
                                    <path
                                        style={{ fill: 'color-mix(in srgb, var(--accent) 55%, black 45%)' }}
                                        d="m227.99 136.58c-7.77-6.17-12.46-6.76-56.22-0.73-30.61 4.22-34.17 5.02-39.81 7.32-19.74 8.07-18.24 15.5-32.1 18.64-11.41 2.57-22.11-0.28-38.2-6.8-4.25 5.07-7.45 9.55-5.69 13.75 7.28 2.15 18.21 5.12 31.67 7.76 2.87 0.56 50.96 9.82 53.15 2.79 1.33-4.26-15.81-9.28-15.07-16.24 1-9.43 34.19-16.1 62.98-13.22 22.99 2.31 40.61 10.45 50.94 16.21-0.72-19.1-8.02-26.61-11.65-29.48z"
                                    />
                                    <path
                                        style={{ fill: 'color-mix(in srgb, var(--accent) 30%, black 70%)' }}
                                        d="m242.42 171.6c-1.86 0.91-4.46 1.31-8 0.21-2.3-0.71-4.86-1.96-8.1-3.53-5.71-2.78-13.55-6.59-24.08-9.35-17.37-4.55-31.1-3.37-37.7-2.8-7.43 0.64-11.97 1.55-20.51 3.34-6.73 1.42-11.05 2.63-11.03 3.99 0.02 0.72 1.28 0.99 5.77 3.34 3.16 1.64 4.74 2.45 5.76 3.32 0.24 0.2 5.21 4.6 4.28 9.03-0.95 4.6-7.59 6.82-10.67 7.25-3.52 0.5-8.25 0.65-14.06 0.46-10.94-0.38-24.61-1.93-37.52-4.27-14.84-2.7-28.85-5.23-45.21-13.49-16.73-8.45-35.69-18.02-38.49-36.23-3.42-22.21 19.84-40.26 28.61-47.05 18.5-14.37 37.62-17.42 44.82-18.57 21.35-3.41 40.52 0.16 52.85 3.76 1.61 0.48 3.02 1.59 3.81 3.21 1.51 3.07 0.24 6.77-2.82 8.28-1.45 0.7-3.04 0.8-4.47 0.38-11.1-3.24-28.35-6.47-47.43-3.43-6.34 1.01-23.19 3.7-39.19 16.12-3.74 2.9-10.7 8.3-16.21 14.99-6.1 7.41-8.71 14.28-7.77 20.43 1.84 11.93 17.1 19.63 31.86 27.08 14.01 7.05 29.13 10.95 44.58 11.51-25.27-3.49-17.18-1.53-2.73 0.86 15.13 2.49 38.34 5.73 38.65 4.13 0.07-0.32-0.86-0.51-2.28-1.58-3.59-2.71-5.76-7.45-5.55-10.35 0.61-8.39 10.99-12.27 18.76-14.43 10.54-2.96 21.91-4.1 25.14-4.37 7.28-0.64 22.44-1.94 41.9 3.15 11.28 2.96 19.55 6.9 25.67 9.86-3.32-6.12-7.5-14.71-8.06-25.45-0.81-15.89 6.72-29.16 12.79-38.26l-3.71 1.85c-4.54 2.26-10.2 5.08-17.2 8.49-13.18 6.41-17.49 8.46-20.55 8.97-13.49 2.26-22.5-4.04-32.93-11.34-2.73-1.91-5.55-3.88-8.68-5.88-0.91-0.57-1.7-1.42-2.22-2.49-1.51-3.06-0.24-6.76 2.82-8.26 2-0.98 4.27-0.79 6.02 0.32 3.38 2.16 6.44 4.3 9.14 6.19 10.33 7.22 15.66 10.63 23.78 9.28 1.74-0.38 8.91-3.87 17.21-7.91 6.95-3.37 12.58-6.18 17.1-8.43 7.11-3.55 11.4-5.69 14.49-6.93 2.32-0.93 7.76-3.12 11.66 0.91 1.53 1.57 3.65 5.09 0.7 10.88-1.07 2.1-2.71 4.48-4.63 7.23-5.64 8.14-14.17 20.44-13.44 34.74 0.47 9.17 4.47 16.39 7.68 22.2 1.43 2.58 2.66 4.81 3.4 6.93 1.88 5.39-0.27 8.64-1.73 10.09-0.6 0.61-1.36 1.17-2.23 1.59q-0.02 0.02-0.05 0.03z"
                                    />
                                    <path
                                        style={{ fill: 'color-mix(in srgb, var(--accent) 30%, black 70%)' }}
                                        d="m145.08 88q0 0 0 0c-1.74 0.85-3.68 0.82-5.31 0.06l-0.49-0.22c-1.25-0.57-2.33-1.56-2.99-2.9-1.5-3.07-0.23-6.77 2.83-8.27 1.72-0.84 3.65-0.81 5.27-0.08l0.57 0.26c1.23 0.57 2.3 1.56 2.95 2.88 1.5 3.07 0.24 6.77-2.83 8.27z"
                                    />
                                    <path
                                        style={{ fill: 'color-mix(in srgb, var(--accent) 30%, black 70%)' }}
                                        d="m48.56 131.24c1.53 0.12 3.17-0.17 4.7-0.92 4.6-2.25 6.5-7.81 4.25-12.4-1.51-3.06-4.48-4.93-7.65-5.16-1.59-0.12-3.22 0.17-4.76 0.92-4.59 2.25-6.49 7.8-4.24 12.4 1.51 3.06 4.47 4.93 7.65 5.16z"
                                    />
                                </svg>
                            ) : (
                                <img
                                    src={logoSrc}
                                    alt="fiicoder_logo"
                                    className="theme-logo h-16 w-16 md:h-20 md:w-20 mx-auto theme-logo-glow"
                                />
                            )}
                        </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-black text-(--text-h) mb-3 tracking-tighter"
                    >
                        {t.welcomeTitle} <span className="text-(--accent)">{`<_fiicoder>`}</span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-sm md:text-base text-(--text-muted) max-w-xl mx-auto mb-6"
                    >
                        {t.welcomeDesc}
                    </motion.p>

                        {/* Stats Section - Compact */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-wrap justify-center gap-6 md:gap-12 mb-6 bg-(--accent)/5 py-3 rounded-2xl border border-(--accent)/10 max-w-3xl mx-auto"
                        >
                            {stats.map((stat, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className="text-lg md:text-xl font-black text-(--accent)">
                                        {stat.num}
                                    </div>
                                    <div className="text-[9px] uppercase tracking-widest text-(--text-muted) font-bold">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-3 justify-center"
                        >
                            <Link
                                to="/problems"
                                className="px-6 py-2.5 rounded-xl font-black text-xs transition-all duration-200 bg-(--accent) border-2 border-(--accent) text-(--surface-card) hover:bg-transparent hover:text-(--accent) hover:-translate-y-1 active:translate-y-0"
                            >
                                {t.viewProblems}
                            </Link>

                            {!isAuthenticated && (
                                <Link
                                    to="/login"
                                    className="px-6 py-2.5 rounded-xl font-black text-xs transition-all duration-200 bg-transparent border-2 border-(--accent) text-(--accent) hover:bg-(--accent) hover:text-(--surface-card) hover:-translate-y-1 active:translate-y-0"
                                >
                                    {t.authenticateBtn}
                                </Link>
                            )}
                        </motion.div>
                    </div>

                {/* Announcements Section */}
                <motion.div variants={itemVariants} className="mt-2 mb-8">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-2xl font-black text-(--text-h) tracking-tight">
                            {t.announcementsTitle}
                        </h2>
                        {announcements.length > 3 && (
                            <button
                                onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
                                className="text-xs font-bold text-(--accent) hover:underline"
                            >
                                {showAllAnnouncements
                                    ? lang === 'RO'
                                        ? 'Vezi mai puțin'
                                        : 'Show less'
                                    : lang === 'RO'
                                      ? 'Vezi toate'
                                      : 'View all'}
                            </button>
                        )}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        {isAnnouncementsLoading ? (
                            <div className="col-span-full text-center py-8">
                                <p className="text-(--text-muted) text-sm italic">
                                    {lang === 'RO'
                                        ? 'Se încarcă anunțurile...'
                                        : 'Loading announcements...'}
                                </p>
                            </div>
                        ) : announcements.length > 0 ? (
                            announcements
                                .slice(0, showAllAnnouncements ? undefined : 3)
                                .map((ann) => (
                                    <motion.div
                                        key={ann.id}
                                        variants={itemVariants}
                                        onClick={() => handleOpenAnnouncement(ann)}
                                        className={`p-4 rounded-2xl border-2 backdrop-blur-sm cursor-pointer transition-colors duration-200 group relative ${
                                            ann.priority === 'high'
                                                ? 'border-(--accent) bg-(--accent)/10 hover:bg-(--accent)/15'
                                                : ann.priority === 'medium'
                                                  ? 'border-(--accent)/50 bg-(--surface-muted) hover:border-(--accent)'
                                                  : 'border-(--accent)/20 bg-(--surface-muted) hover:border-(--accent)/40'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 shrink-0 text-(--accent) group-hover:rotate-12 transition-transform duration-300">
                                                {ann.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                                    <h3
                                                        className={`font-bold text-sm line-clamp-1 ${
                                                            ann.priority === 'high'
                                                                ? 'text-(--accent)'
                                                                : 'text-(--text-h)'
                                                        }`}
                                                    >
                                                        {unpackTranslation(ann.title, lang)}
                                                    </h3>
                                                    {ann.priority === 'high' && (
                                                        <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-(--accent) text-(--surface-card) text-[10px] font-black uppercase">
                                                            !
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-(--text-muted) mb-1.5 line-clamp-2 leading-snug">
                                                    {unpackTranslation(ann.content, lang)}
                                                </p>
                                                <div className="text-xs text-(--text-subtle) font-bold uppercase tracking-wider">
                                                    {formatDateTime(ann.createdAt, lang)}
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

                    {/* Features Grid - Compact */}
                    <div className="grid md:grid-cols-3 gap-4 mt-6 mb-10">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className={`p-4 rounded-2xl border-2 border-(--accent)/20 bg-(--surface-card) transition-colors duration-300 group hover:border-(--accent)`}
                            >
                                <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300 ${feature.iconColor}`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-base font-black text-(--text-h) mb-1 tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-xs text-(--text-muted) leading-snug">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
    );
}
