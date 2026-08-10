import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../../../language/Language';

type Props = {
    level: number;
    title: { ro: string; en: string };
    lang: 'RO' | 'EN';
    isOpen: boolean;
    onClose: () => void;
};

// Momentary, full-screen celebration shown once when a user levels up.
// Auto-dismisses on its own — deps intentionally only [isOpen] so that a
// parent re-render (which recreates onClose) never resets the timer.
const AUTO_DISMISS_MS = 2800;

export default function LevelUpOverlay({ level, title, lang, isOpen, onClose }: Props) {
    const t = translations[lang];

    useEffect(() => {
        if (!isOpen) return;
        const timer = window.setTimeout(() => onClose(), AUTO_DISMISS_MS);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Centered celebratory panel */}
                    <div className="fixed inset-0 z-[61] flex items-center justify-center px-4 pointer-events-none">
                        <motion.div
                            className="pointer-events-auto rounded-3xl border-2 border-(--accent) bg-(--surface-card) shadow-2xl px-10 py-9 flex flex-col items-center text-center max-w-sm card-glow"
                            initial={{ scale: 0.6, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.6, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
                        >
                            <div className="text-5xl mb-3">🎉</div>
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-(--accent)">
                                {t.levelUpTitle}
                            </p>
                            <p className="text-4xl font-black text-(--text-h) mt-2">
                                {t.levelLabel} {level}
                            </p>
                            <p className="text-sm font-semibold text-(--text-muted) mt-1">
                                {lang === 'RO' ? title.ro : title.en}
                            </p>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
