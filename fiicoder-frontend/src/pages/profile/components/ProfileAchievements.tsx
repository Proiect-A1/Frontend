import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProfileResponseDTO } from '../../../services/profileService';

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
    // For numeric progress (e.g. 8/25 problems)
    progress?: { current: number; target: number; unit: { ro: string; en: string } };
    // For non-numeric hints on locked achievements
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
            desc: { ro: 'Rată de acceptare ≥ 80% (min. 5 submisii)', en: 'Acceptance rate ≥ 80% (min. 5 submissions)' },
            unlocked: acceptance >= 80 && submissions >= 5,
            hint: {
                ro: `Rată actuală: ${acceptance.toFixed(1)}% — îți trebuie ≥ 80% și cel puțin 5 submisii`,
                en: `Current rate: ${acceptance.toFixed(1)}% — need ≥ 80% and at least 5 submissions`,
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
            desc: { ro: 'Profil de skills format (rezolvă ≥ 5 probleme cu același tag)', en: 'Skill profile built (solve ≥ 5 problems sharing a tag)' },
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
            desc: { ro: 'Rezolvat cel puțin o problemă HARD', en: 'Solved at least one HARD problem' },
            unlocked: hasHard,
            hint: {
                ro: 'Găsește o problemă de dificultate HARD și obține scor maxim',
                en: 'Find a HARD difficulty problem and get full score',
            },
        },
        {
            id: 'contestant',
            icon: '🏆',
            label: { ro: 'Contestant', en: 'Contestant' },
            desc: { ro: 'Rezolvat o problemă de tip CONTEST', en: 'Solved a CONTEST problem' },
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
            desc: { ro: 'Cont de Profesor sau Admin — poți propune probleme', en: 'Professor or Admin account — can propose problems' },
            unlocked: hasProposal,
            hint: {
                ro: 'Disponibil doar pentru conturi de Profesor sau Admin',
                en: 'Available only for Professor or Admin accounts',
            },
        },
    ];
}

export default function ProfileAchievementsModal({ profile, lang, isOpen, onClose }: Props) {
    const achievements = computeAchievements(profile);
    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Lock body scroll
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-(--surface-card) border-l border-(--accent)/30 shadow-2xl flex flex-col"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-(--accent)/20 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-(--text-h)">
                                    {lang === 'RO' ? 'Realizări' : 'Achievements'}
                                </h2>
                                <p className="text-xs text-(--text-muted) mt-0.5">
                                    {unlocked.length}/{achievements.length} {lang === 'RO' ? 'deblocate' : 'unlocked'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center border border-(--accent)/30 bg-(--accent)/5 hover:bg-(--accent)/15 text-(--text-muted) hover:text-(--text-h) transition-colors cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Progress bar global */}
                        <div className="px-6 py-4 border-b border-(--accent)/10 shrink-0">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-(--text-muted)">{lang === 'RO' ? 'Progres total' : 'Overall progress'}</span>
                                <span className="font-bold text-(--accent)">{Math.round(unlocked.length / achievements.length * 100)}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-(--accent)/10">
                                <motion.div
                                    className="h-2 rounded-full bg-(--accent)"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${unlocked.length / achievements.length * 100}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-3">
                            {/* Unlocked */}
                            {unlocked.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">
                                        ✓ {lang === 'RO' ? 'Deblocate' : 'Unlocked'}
                                    </p>
                                    <div className="space-y-2">
                                        {unlocked.map(a => (
                                            <motion.div
                                                key={a.id}
                                                initial={{ opacity: 0, x: 16 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5"
                                            >
                                                <span className="text-2xl leading-none shrink-0">{a.icon}</span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-(--text-h)">
                                                        {lang === 'RO' ? a.label.ro : a.label.en}
                                                    </p>
                                                    <p className="text-[11px] text-(--text-muted) mt-0.5">
                                                        {lang === 'RO' ? a.desc.ro : a.desc.en}
                                                    </p>
                                                </div>
                                                <svg className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Locked */}
                            {locked.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-muted) mb-2 mt-4">
                                        🔒 {lang === 'RO' ? 'Nedeblocate' : 'Locked'}
                                    </p>
                                    <div className="space-y-2">
                                        {locked.map(a => {
                                            const pct = a.progress
                                                ? Math.round((a.progress.current / a.progress.target) * 100)
                                                : 0;
                                            return (
                                                <div
                                                    key={a.id}
                                                    className="flex flex-col gap-2 p-3 rounded-xl border border-(--accent)/15 bg-(--accent)/3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl leading-none shrink-0 grayscale opacity-50">{a.icon}</span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-bold text-(--text-muted)">
                                                                {lang === 'RO' ? a.label.ro : a.label.en}
                                                            </p>
                                                            <p className="text-[11px] text-(--text-subtle) mt-0.5">
                                                                {lang === 'RO' ? a.desc.ro : a.desc.en}
                                                            </p>
                                                        </div>
                                                        {a.progress && (
                                                            <span className="text-[11px] font-bold font-mono text-(--text-muted) shrink-0">
                                                                {a.progress.current}/{a.progress.target}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Progress bar pentru achievements numerice */}
                                                    {a.progress && (
                                                        <div className="pl-9">
                                                            <div className="h-1.5 w-full rounded-full bg-(--accent)/10">
                                                                <div
                                                                    className="h-1.5 rounded-full bg-(--accent)/40 transition-all duration-500"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-[10px] text-(--text-subtle) mt-1">
                                                                {lang === 'RO'
                                                                    ? `${a.progress.current} din ${a.progress.target} ${a.progress.unit.ro}`
                                                                    : `${a.progress.current} of ${a.progress.target} ${a.progress.unit.en}`}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Hint pentru achievements non-numerice */}
                                                    {a.hint && !a.progress && (
                                                        <div className="pl-9">
                                                            <p className="text-[10px] text-(--text-subtle) italic">
                                                                💡 {lang === 'RO' ? a.hint.ro : a.hint.en}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
