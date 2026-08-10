import { motion } from 'framer-motion';
import { isAcceptedSubmission, type ProfileResponseDTO } from '../../../services/profileService';
import { containerVariants, itemVariants } from '../../../utils/motionConfig';
import { translations } from '../../../language/Language';

type ActivityQuestsProps = {
    profile: ProfileResponseDTO;
    lang: 'RO' | 'EN';
};

type Quest = {
    id: string;
    group: 'daily' | 'weekly';
    label: { ro: string; en: string };
    current: number;
    target: number;
};

// Mirrors the exact date-bucketing logic used for the activity heatmap in
// ProfileOverviewContent (getSubmissionCounts) — plain local Date, no timezone lib.
const dateKey = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Everything here is derived live from profile.recentSubmissions (a fixed 7-day
// backend window) and profile.streak — nothing persisted, recalculated every render.
export function computeQuests(profile: ProfileResponseDTO): Quest[] {
    const content = profile.recentSubmissions?.content ?? [];
    const todayKey = dateKey(new Date().toISOString());

    const todaysSubmissions = content.filter((s) => dateKey(s.submissionDate) === todayKey);
    const todaysAccepted = todaysSubmissions.filter((s) => isAcceptedSubmission(s));

    const acceptedDayKeys = new Set<string>();
    content.forEach((s) => {
        if (isAcceptedSubmission(s)) acceptedDayKeys.add(dateKey(s.submissionDate));
    });

    return [
        {
            id: 'daily_submission',
            group: 'daily',
            label: { ro: 'O submisie azi', en: 'One submission today' },
            current: todaysSubmissions.length,
            target: 1,
        },
        {
            id: 'daily_accepted',
            group: 'daily',
            label: { ro: 'O soluție acceptată azi', en: 'One accepted solution today' },
            current: todaysAccepted.length,
            target: 1,
        },
        {
            id: 'weekly_distinct_days',
            group: 'weekly',
            label: { ro: 'Rezolvă în 3 zile diferite', en: 'Solve on 3 different days' },
            current: acceptedDayKeys.size,
            target: 3,
        },
        {
            id: 'weekly_streak',
            group: 'weekly',
            label: { ro: '3+ zile de streak activ', en: '3+ day active streak' },
            current: Math.min(profile.streak, 3),
            target: 3,
        },
    ];
}

function QuestRow({ quest, lang }: { quest: Quest; lang: 'RO' | 'EN' }) {
    const completed = quest.current >= quest.target;
    const barPct = Math.min(100, Math.round((quest.current / quest.target) * 100));

    return (
        <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 rounded-xl border border-(--accent)/15 bg-(--accent)/5 p-3"
        >
            <div className="min-w-0 flex-1">
                <p
                    className={`text-xs font-bold ${completed ? 'text-(--text-h)' : 'text-(--text-muted)'}`}
                >
                    {lang === 'RO' ? quest.label.ro : quest.label.en}
                </p>
                {!completed && (
                    <div className="h-1.5 w-full rounded-full bg-(--accent)/10 mt-2">
                        <div
                            className="h-1.5 rounded-full bg-(--accent)/35 transition-all duration-500"
                            style={{ width: `${barPct}%` }}
                        />
                    </div>
                )}
            </div>

            {completed ? (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            ) : (
                <span className="text-xs font-black font-mono text-(--text-muted) shrink-0">
                    {quest.current}<span className="opacity-40">/{quest.target}</span>
                </span>
            )}
        </motion.div>
    );
}

export default function ActivityQuests({ profile, lang }: ActivityQuestsProps) {
    const t = translations[lang];
    const quests = computeQuests(profile);
    const dailyQuests = quests.filter((q) => q.group === 'daily');
    const weeklyQuests = quests.filter((q) => q.group === 'weekly');

    return (
        <motion.div
            variants={itemVariants}
            className="p-4 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm card-glow min-w-0"
        >
            <h2 className="text-sm font-bold text-(--text-h) mb-3 uppercase tracking-wider">
                {t.questsTitle}
            </h2>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-(--text-subtle) uppercase tracking-widest mb-1">
                        {t.questsGroupDaily}
                    </p>
                    {dailyQuests.map((quest) => (
                        <QuestRow key={quest.id} quest={quest} lang={lang} />
                    ))}
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-(--text-subtle) uppercase tracking-widest mb-1">
                        {t.questsGroupWeekly}
                    </p>
                    {weeklyQuests.map((quest) => (
                        <QuestRow key={quest.id} quest={quest} lang={lang} />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
