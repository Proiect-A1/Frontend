import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProfileResponseDTO } from '../../../services/profileService';
import { translations } from '../../../language/Language';

type Props = {
    profile: ProfileResponseDTO;
    lang: 'RO' | 'EN';
    isOpen: boolean;
    onClose: () => void;
};

type Achievement = {
    id: string;
    icon: string;
    label: { ro: string; en: string };
    desc: { ro: string; en: string };
    unlocked: boolean;
    progress?: { current: number; target: number; unit: { ro: string; en: string } };
    hint?: { ro: string; en: string };
};

export function computeAchievements(profile: ProfileResponseDTO): Achievement[] {
    const solved = profile.problemsSolved;
    const streak = profile.streak;
    const submissions = profile.submissions;
    const acceptance = profile.acceptanceRate <= 1 ? profile.acceptanceRate * 100 : profile.acceptanceRate;
    const hasHard = profile.rankHard > 0;
    const hasContest = profile.rankContest > 0;
    const hasProposal = profile.role === 'PROFESSOR' || profile.role === 'ADMIN';
    const hasSkills = profile.skillBreakdownTags.length > 0;
    const langCount = profile.mostUsedLanguages.length;

    return [
        {
            id: 'first_blood',
            icon: '🩸',
            label: { ro: 'First Blood', en: 'First Blood' },
            desc: { ro: 'Prima problemă rezolvată', en: 'First problem solved' },
            unlocked: solved >= 1,
            progress: { current: Math.min(solved, 1), target: 1, unit: { ro: 'probleme', en: 'problems' } },
        },
        {
            id: 'rookie',
            icon: '🌱',
            label: { ro: 'Rookie', en: 'Rookie' },
            desc: { ro: '5 probleme rezolvate', en: '5 problems solved' },
            unlocked: solved >= 5,
            progress: { current: Math.min(solved, 5), target: 5, unit: { ro: 'probleme', en: 'problems' } },
        },
        {
            id: 'solver',
            icon: '⚡',
            label: { ro: 'Solver', en: 'Solver' },
            desc: { ro: '25 probleme rezolvate', en: '25 problems solved' },
            unlocked: solved >= 25,
            progress: { current: Math.min(solved, 25), target: 25, unit: { ro: 'probleme', en: 'problems' } },
        },
        {
            id: 'centurion',
            icon: '💯',
            label: { ro: 'Centurion', en: 'Centurion' },
            desc: { ro: '100 probleme rezolvate', en: '100 problems solved' },
            unlocked: solved >= 100,
            progress: { current: Math.min(solved, 100), target: 100, unit: { ro: 'probleme', en: 'problems' } },
        },
        {
            id: 'streak_3',
            icon: '🔥',
            label: { ro: 'Stabil', en: 'Steady' },
            desc: { ro: '3 zile consecutive cu submisii', en: '3-day submission streak' },
            unlocked: streak >= 3,
            progress: { current: Math.min(streak, 3), target: 3, unit: { ro: 'zile', en: 'days' } },
        },
        {
            id: 'streak_7',
            icon: '🚀',
            label: { ro: 'Săptămânal', en: 'Weekly' },
            desc: { ro: '7 zile consecutive cu submisii', en: '7-day submission streak' },
            unlocked: streak >= 7,
            progress: { current: Math.min(streak, 7), target: 7, unit: { ro: 'zile', en: 'days' } },
        },
        {
            id: 'streak_30',
            icon: '🏅',
            label: { ro: 'Lunar', en: 'Monthly' },
            desc: { ro: '30 zile consecutive cu submisii', en: '30-day submission streak' },
            unlocked: streak >= 30,
            progress: { current: Math.min(streak, 30), target: 30, unit: { ro: 'zile', en: 'days' } },
        },
        {
            id: 'persistent',
            icon: '🔨',
            label: { ro: 'Persistent', en: 'Persistent' },
            desc: { ro: '50 de submisii trimise', en: '50 submissions sent' },
            unlocked: submissions >= 50,
            progress: { current: Math.min(submissions, 50), target: 50, unit: { ro: 'submisii', en: 'submissions' } },
        },
        {
            id: 'sharpshooter',
            icon: '🎯',
            label: { ro: 'Țintaș', en: 'Sharpshooter' },
            desc: { ro: 'Rată acceptare ≥ 80% (min. 5 submisii)', en: 'Acceptance rate ≥ 80% (min. 5 submissions)' },
            unlocked: acceptance >= 80 && submissions >= 5,
            hint: {
                ro: `Rată actuală: ${acceptance.toFixed(1)}% — îți trebuie ≥ 80% cu cel puțin 5 submisii`,
                en: `Current rate: ${acceptance.toFixed(1)}% — need ≥ 80% with at least 5 submissions`,
            },
        },
        {
            id: 'polyglot',
            icon: '💬',
            label: { ro: 'Poliglot', en: 'Polyglot' },
            desc: { ro: 'Folosit ≥ 2 limbaje de programare', en: 'Used ≥ 2 programming languages' },
            unlocked: langCount >= 2,
            progress: { current: Math.min(langCount, 2), target: 2, unit: { ro: 'limbaje', en: 'languages' } },
        },
        {
            id: 'specialist',
            icon: '🧩',
            label: { ro: 'Specialist', en: 'Specialist' },
            desc: { ro: 'Rezolvă ≥ 5 probleme cu același tag', en: 'Solve ≥ 5 problems sharing a tag' },
            unlocked: hasSkills,
            hint: {
                ro: 'Rezolvă cel puțin 5 probleme care au același tag',
                en: 'Solve at least 5 problems sharing the same tag',
            },
        },
        {
            id: 'hard_hitter',
            icon: '🏔️',
            label: { ro: 'Alpinist', en: 'Hard Hitter' },
            desc: { ro: 'Obține scor maxim la o problemă HARD', en: 'Get full score on a HARD problem' },
            unlocked: hasHard,
            hint: {
                ro: 'Găsește o problemă de dificultate HARD și obține 100 puncte',
                en: 'Find a HARD difficulty problem and score 100 points',
            },
        },
        {
            id: 'contestant',
            icon: '🏆',
            label: { ro: 'Contestant', en: 'Contestant' },
            desc: { ro: 'Rezolvat o problemă CONTEST', en: 'Solved a CONTEST problem' },
            unlocked: hasContest,
            hint: {
                ro: 'Rezolvă o problemă din categoria CONTEST',
                en: 'Solve a problem from the CONTEST category',
            },
        },
        {
            id: 'contributor',
            icon: '📦',
            label: { ro: 'Contributor', en: 'Contributor' },
            desc: { ro: 'Cont Profesor sau Admin — poți propune probleme', en: 'Professor or Admin account — can propose problems' },
            unlocked: hasProposal,
            hint: {
                ro: 'Disponibil doar pentru conturi de Profesor sau Admin',
                en: 'Only available for Professor or Admin accounts',
            },
        },
    ];
}

export default function ProfileAchievementsModal({ profile, lang, isOpen, onClose }: Props) {
    const t = translations[lang];
    const achievements = computeAchievements(profile);
    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);
    const pct = Math.round((unlocked.length / achievements.length) * 100);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Panel — slide from left, matches AdminSidebar aesthetic */}
                    <motion.aside
                        className="fixed z-50 inset-y-0 left-0 w-full max-w-sm bg-(--surface-card) border-r-2 border-(--accent) flex flex-col shadow-2xl"
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 p-6 pb-4 border-b border-(--accent)/20 shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-(--text-h)">
                                    {t.achievementsTitle}
                                </h2>
                                <p className="text-xs text-(--text-muted) font-semibold mt-1">
                                    {unlocked.length}/{achievements.length} {t.achievementsUnlockedCount}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-10 h-10 rounded-full border-2 border-(--accent)/50 bg-(--accent)/10 flex items-center justify-center text-(--text-h) hover:bg-(--accent)/20 transition-all active:scale-95 shrink-0 cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Global progress */}
                        <div className="px-6 py-4 border-b border-(--accent)/10 shrink-0">
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-(--text-muted) font-semibold uppercase tracking-widest">
                                    {t.achievementsProgress}
                                </span>
                                <span className="font-black text-(--accent)">{pct}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-(--accent)/10">
                                <motion.div
                                    className="h-2 rounded-full bg-(--accent)"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
                                />
                            </div>
                        </div>

                        {/* Achievement list */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">

                            {/* Unlocked section */}
                            {unlocked.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
                                        ✓ {t.achievementsUnlockedSection}
                                    </p>
                                    {unlocked.map((a, i) => (
                                        <motion.div
                                            key={a.id}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-4 flex items-center gap-4"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-2xl shrink-0">
                                                {a.icon}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-(--text-h)">
                                                    {lang === 'RO' ? a.label.ro : a.label.en}
                                                </p>
                                                <p className="text-[11px] text-(--text-muted) mt-0.5 leading-relaxed">
                                                    {lang === 'RO' ? a.desc.ro : a.desc.en}
                                                </p>
                                            </div>
                                            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                                                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Locked section */}
                            {locked.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-(--text-muted) uppercase tracking-widest mb-3 mt-5">
                                        🔒 {t.achievementsLockedSection}
                                    </p>
                                    {locked.map((a) => {
                                        const barPct = a.progress
                                            ? Math.round((a.progress.current / a.progress.target) * 100)
                                            : 0;
                                        return (
                                            <div
                                                key={a.id}
                                                className="rounded-2xl border border-(--accent)/15 bg-(--accent)/5 p-4 flex flex-col gap-3"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-(--accent)/10 flex items-center justify-center text-2xl shrink-0 grayscale opacity-50">
                                                        {a.icon}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-(--text-muted)">
                                                            {lang === 'RO' ? a.label.ro : a.label.en}
                                                        </p>
                                                        <p className="text-[11px] text-(--text-subtle) mt-0.5 leading-relaxed">
                                                            {lang === 'RO' ? a.desc.ro : a.desc.en}
                                                        </p>
                                                    </div>
                                                    {a.progress && (
                                                        <span className="text-xs font-black font-mono text-(--text-muted) shrink-0">
                                                            {a.progress.current}<span className="opacity-40">/{a.progress.target}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Numeric progress bar */}
                                                {a.progress && (
                                                    <div className="pl-16">
                                                        <div className="h-1.5 w-full rounded-full bg-(--accent)/10 mb-1">
                                                            <div
                                                                className="h-1.5 rounded-full bg-(--accent)/35 transition-all duration-500"
                                                                style={{ width: `${barPct}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-(--text-subtle)">
                                                            {lang === 'RO'
                                                                ? `${a.progress.current} din ${a.progress.target} ${a.progress.unit.ro}`
                                                                : `${a.progress.current} of ${a.progress.target} ${a.progress.unit.en}`}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Hint for non-numeric */}
                                                {a.hint && !a.progress && (
                                                    <div className="pl-16">
                                                        <p className="text-[10px] text-(--text-subtle) italic leading-relaxed">
                                                            💡 {lang === 'RO' ? a.hint.ro : a.hint.en}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
