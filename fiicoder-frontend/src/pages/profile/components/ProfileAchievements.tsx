import { motion } from 'framer-motion';
import { itemVariants } from '../../../utils/motionConfig';
import type { ProfileResponseDTO } from '../../../services/profileService';

type Props = {
    profile: ProfileResponseDTO;
    lang: 'RO' | 'EN';
};

type Achievement = {
    id: string;
    icon: string;
    label: { ro: string; en: string };
    desc: { ro: string; en: string };
    unlocked: boolean;
};

function computeAchievements(profile: ProfileResponseDTO): Achievement[] {
    const solved = profile.problemsSolved;
    const streak = profile.streak;
    const submissions = profile.submissions;
    const acceptance = profile.acceptanceRate <= 1 ? profile.acceptanceRate * 100 : profile.acceptanceRate;
    const hasHard = profile.rankHard > 0;
    const hasContest = profile.rankContest > 0;
    const hasProposal = profile.role === 'PROFESSOR' || profile.role === 'ADMIN';
    const hasSkills = profile.skillBreakdownTags.length > 0;
    const hasLanguages = profile.mostUsedLanguages.length > 0;

    return [
        {
            id: 'first_blood',
            icon: '🩸',
            label: { ro: 'First Blood', en: 'First Blood' },
            desc: { ro: 'Prima problemă rezolvată', en: 'First problem solved' },
            unlocked: solved >= 1,
        },
        {
            id: 'rookie',
            icon: '🌱',
            label: { ro: 'Rookie', en: 'Rookie' },
            desc: { ro: '5 probleme rezolvate', en: '5 problems solved' },
            unlocked: solved >= 5,
        },
        {
            id: 'solver',
            icon: '⚡',
            label: { ro: 'Solver', en: 'Solver' },
            desc: { ro: '25 probleme rezolvate', en: '25 problems solved' },
            unlocked: solved >= 25,
        },
        {
            id: 'centurion',
            icon: '💯',
            label: { ro: 'Centurion', en: 'Centurion' },
            desc: { ro: '100 probleme rezolvate', en: '100 problems solved' },
            unlocked: solved >= 100,
        },
        {
            id: 'streak_3',
            icon: '🔥',
            label: { ro: 'Stabil', en: 'Steady' },
            desc: { ro: '3 zile consecutive', en: '3-day streak' },
            unlocked: streak >= 3,
        },
        {
            id: 'streak_7',
            icon: '🚀',
            label: { ro: 'Săptămânal', en: 'Weekly' },
            desc: { ro: '7 zile consecutive', en: '7-day streak' },
            unlocked: streak >= 7,
        },
        {
            id: 'streak_30',
            icon: '🏅',
            label: { ro: 'Lunar', en: 'Monthly' },
            desc: { ro: '30 zile consecutive', en: '30-day streak' },
            unlocked: streak >= 30,
        },
        {
            id: 'sharpshooter',
            icon: '🎯',
            label: { ro: 'Țintaș', en: 'Sharpshooter' },
            desc: { ro: 'Rată de acceptare ≥ 80%', en: 'Acceptance rate ≥ 80%' },
            unlocked: acceptance >= 80 && submissions >= 5,
        },
        {
            id: 'hard_hitter',
            icon: '🏔️',
            label: { ro: 'Alpinist', en: 'Hard Hitter' },
            desc: { ro: 'Ai rezolvat o problemă HARD', en: 'Solved a HARD problem' },
            unlocked: hasHard,
        },
        {
            id: 'contestant',
            icon: '🏆',
            label: { ro: 'Contestant', en: 'Contestant' },
            desc: { ro: 'Ai rezolvat o problemă de concurs', en: 'Solved a Contest problem' },
            unlocked: hasContest,
        },
        {
            id: 'contributor',
            icon: '📦',
            label: { ro: 'Contributor', en: 'Contributor' },
            desc: { ro: 'Ai propus o problemă', en: 'Proposed a problem' },
            unlocked: hasProposal,
        },
        {
            id: 'specialist',
            icon: '🧩',
            label: { ro: 'Specialist', en: 'Specialist' },
            desc: { ro: 'Profil de skills format', en: 'Skill profile built' },
            unlocked: hasSkills,
        },
        {
            id: 'polyglot',
            icon: '💬',
            label: { ro: 'Poliglot', en: 'Polyglot' },
            desc: { ro: 'Ai folosit mai multe limbaje', en: 'Used multiple languages' },
            unlocked: hasLanguages && profile.mostUsedLanguages.length >= 2,
        },
        {
            id: 'persistent',
            icon: '🔨',
            label: { ro: 'Persistent', en: 'Persistent' },
            desc: { ro: '50 de submisii trimise', en: '50 submissions sent' },
            unlocked: submissions >= 50,
        },
    ];
}

export default function ProfileAchievements({ profile, lang }: Props) {
    const achievements = computeAchievements(profile);
    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);

    return (
        <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm card-glow min-w-0"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-(--text-h) uppercase tracking-wider">
                    {lang === 'RO' ? 'Realizări' : 'Achievements'}
                </h2>
                <span className="text-xs font-bold text-(--accent) bg-(--accent)/10 px-2 py-0.5 rounded-full border border-(--accent)/20">
                    {unlocked.length}/{achievements.length}
                </span>
            </div>

            {/* Unlocked */}
            {unlocked.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {unlocked.map(a => (
                        <div
                            key={a.id}
                            title={lang === 'RO' ? a.desc.ro : a.desc.en}
                            className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-(--accent)/30 bg-(--accent)/10 cursor-default"
                        >
                            <span className="text-base leading-none">{a.icon}</span>
                            <span className="text-xs font-bold text-(--text-h)">
                                {lang === 'RO' ? a.label.ro : a.label.en}
                            </span>
                            {/* Tooltip */}
                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-(--surface-card) border border-(--accent)/30 text-[10px] text-(--text-muted) whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                                {lang === 'RO' ? a.desc.ro : a.desc.en}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Locked */}
            {locked.length > 0 && (
                <>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-muted) mb-2">
                        {lang === 'RO' ? 'Nedeblocate' : 'Locked'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {locked.map(a => (
                            <div
                                key={a.id}
                                title={lang === 'RO' ? a.desc.ro : a.desc.en}
                                className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-(--accent)/10 bg-(--accent)/3 cursor-default opacity-40 grayscale"
                            >
                                <span className="text-base leading-none">{a.icon}</span>
                                <span className="text-xs font-bold text-(--text-muted)">
                                    {lang === 'RO' ? a.label.ro : a.label.en}
                                </span>
                                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-(--surface-card) border border-(--accent)/30 text-[10px] text-(--text-muted) whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                                    {lang === 'RO' ? a.desc.ro : a.desc.en}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {unlocked.length === 0 && (
                <p className="text-xs text-(--text-muted) italic">
                    {lang === 'RO'
                        ? 'Rezolvă prima problemă pentru a debloca realizări.'
                        : 'Solve your first problem to unlock achievements.'}
                </p>
            )}
        </motion.div>
    );
}
