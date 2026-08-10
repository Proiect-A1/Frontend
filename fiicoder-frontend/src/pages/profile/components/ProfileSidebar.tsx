import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { ProfileResponseDTO } from '../../../services/profileService';
import { itemVariants } from '../../../utils/motionConfig';
import { getGravatarUrl, getDiceBearUrl } from '../../../utils/gravatar';
import ProfileAchievementsModal, { computeAchievements } from './ProfileAchievements';
import { computeXp, computeLevel } from '../profileUtils';
import { translations } from '../../../language/Language';
import { useGamificationCelebration } from '../../../hooks/useGamificationCelebration';

type ProfileSidebarProps = {
    profile: ProfileResponseDTO;
    username: string | null;
    lang: 'RO' | 'EN';
    isOwnProfile: boolean;
};

export default function ProfileSidebar({ profile, username, lang, isOwnProfile }: ProfileSidebarProps) {
    const t = translations[lang];
    const [src, setSrc] = useState(() => getGravatarUrl(profile.email));
    const [failed, setFailed] = useState(false);
    const [achievementsOpen, setAchievementsOpen] = useState(false);
    const { checkAndCelebrate, LevelUpOverlayElement } = useGamificationCelebration();

    const handleError = () => {
        if (src === getGravatarUrl(profile.email)) setSrc(getDiceBearUrl(profile.email));
        else setFailed(true);
    };

    const roleLabel =
        profile.role === 'ADMIN'
            ? t.roleAdmin
            : profile.role === 'PROFESSOR'
              ? t.roleProfessor
              : t.roleStudent;

    const achievements = computeAchievements(profile);
    const unlocked = achievements.filter(a => a.unlocked);
    const lockedCount = achievements.length - unlocked.length;
    // Afișăm max 6 iconițe în preview
    const previewIcons = unlocked.slice(0, 6);

    const xp = computeXp(profile, unlocked.length);
    const gamification = computeLevel(xp);

    // Stable string key (not the array reference, which is rebuilt every render)
    // so the celebration effect below only re-runs when unlock state actually changes.
    const unlockedIdsKey = unlocked.map(a => a.id).join(',');

    // Fires confetti/toasts for newly unlocked achievements and level-ups, but only
    // for the viewer's own profile — read-only when someone else's profile is shown
    // (e.g. a professor viewing a student), with zero storage/toast/confetti side effects.
    useEffect(() => {
        checkAndCelebrate(profile, isOwnProfile);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile.id, unlockedIdsKey, gamification.level, isOwnProfile]);

    return (
        <>
            <ProfileAchievementsModal
                profile={profile}
                lang={lang}
                isOpen={achievementsOpen}
                onClose={() => setAchievementsOpen(false)}
            />

            {LevelUpOverlayElement}

            <motion.div
                variants={itemVariants}
                className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm card-glow flex flex-col items-center lg:items-start text-center lg:text-left"
            >
                <div className="relative group mb-4">
                    {!failed ? (
                        <img
                            src={src}
                            alt="avatar"
                            className="w-24 h-24 rounded-full shadow-lg outline-4 outline-offset-4 outline-(--accent) shrink-0"
                            onError={handleError}
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-linear-to-br from-(--accent) to-(--accent-secondary) flex items-center justify-center text-4xl font-bold text-white uppercase shadow-lg outline-4 outline-offset-4 outline-(--accent) shrink-0">
                            {(profile.username || username || profile.firstName).charAt(0).toUpperCase()}
                        </div>
                    )}
                    <a
                        href="https://gravatar.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title={t.changePhotoOnGravatar}
                    >
                        <span className="text-white text-xs font-semibold text-center leading-tight px-1">
                            {t.changePhoto}
                        </span>
                    </a>
                </div>
                <h1 className="text-2xl font-bold text-(--text-h)">
                    {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-(--text-subtle) font-mono text-sm mb-4">@{profile.username}</p>

                <div className="w-full" title={`${xp} XP`}>
                    <div className="flex items-center justify-between text-xs mb-1 gap-2">
                        <span className="font-bold text-(--text-h)">
                            {t.levelLabel} {gamification.level} · {lang === 'RO' ? gamification.title.ro : gamification.title.en}
                        </span>
                        <span className="text-(--text-muted) font-mono text-[11px]">
                            {gamification.xpIntoLevel}/{gamification.xpForNextLevel} XP
                        </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-(--accent)/10">
                        <div
                            className="h-1.5 rounded-full bg-(--accent) transition-all duration-500"
                            style={{ width: `${Math.min(100, gamification.progressPct)}%` }}
                        />
                    </div>
                </div>

                <div className="w-full border-t border-(--accent)/20 my-2"></div>

                <div className="w-full flex flex-col gap-2 mt-2 text-sm text-(--text)">
                    <div className="flex justify-between items-center gap-4">
                        <span className="font-semibold text-(--text-muted)">Email</span>
                        <span className="truncate text-right">{profile.email}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <span className="font-semibold text-(--text-muted)">
                            {t.memberSince}
                        </span>
                        <span>
                            {new Date(profile.createdAt).toLocaleDateString(
                                t.dateLocale,
                                { year: 'numeric', month: 'long', day: 'numeric' },
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 gap-4">
                        <span className="font-semibold text-(--text-muted)">
                            {t.roleLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-2xl text-[10px] font-bold uppercase border border-(--accent)/30 bg-(--accent)/10 text-(--text)">
                            {roleLabel}
                        </span>
                    </div>
                </div>

                {/* Achievements strip */}
                <div className="w-full border-t border-(--accent)/20 mt-4 pt-4">
                    <button
                        type="button"
                        onClick={() => setAchievementsOpen(true)}
                        className="w-full group flex items-center justify-between gap-2 cursor-pointer"
                    >
                        <div className="flex items-center gap-1.5">
                            {unlocked.length === 0 ? (
                                <span className="text-xs text-(--text-muted) italic">
                                    {t.noAchievementsYet}
                                </span>
                            ) : (
                                <>
                                    {previewIcons.map(a => (
                                        <span key={a.id} className="text-lg leading-none">{a.icon}</span>
                                    ))}
                                    {lockedCount > 0 && (
                                        <span className="text-[10px] font-bold text-(--text-muted) ml-1">
                                            +{lockedCount} 🔒
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                        <span className="text-[10px] font-bold text-(--accent) group-hover:underline underline-offset-2 shrink-0 flex items-center gap-1">
                            {unlocked.length}/{achievements.length}
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </button>
                </div>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm card-glow"
            >
                <h2 className="text-sm font-bold text-(--text-h) mb-4 uppercase tracking-wider">
                    {t.communityStats}
                </h2>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-(--text-muted)">
                            {t.totalSubmissions}
                        </span>
                        <span className="font-bold text-(--text-h)">{profile.submissions}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-(--text-muted)">
                            {t.acceptanceRate}
                        </span>
                        <span className="font-bold text-(--text-h)">
                            {(profile.acceptanceRate <= 1 ? profile.acceptanceRate * 100 : profile.acceptanceRate).toFixed(1).replace(/\.0$/, '')}%
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-(--text-muted)">
                            {t.dailyStreak}
                        </span>
                        <span className="font-bold text-orange-400 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                                {profile.streak}
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c0 0-5 5-5 10a5 5 0 0010 0C17 7 12 2 12 2zm0 13a2 2 0 110-4 2 2 0 010 4z" /></svg>
                            </span>
                            {profile.streakCapped && (
                                <span className="rounded-full border border-orange-400/40 bg-orange-400/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-orange-200">
                                    {t.streakCapped}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) backdrop-blur-sm card-glow"
            >
                <div className="mb-6">
                    <h2 className="text-sm font-bold text-(--text-h) mb-3 uppercase tracking-wider">
                        {t.languagesLabel}
                    </h2>
                    {profile.mostUsedLanguages.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {profile.mostUsedLanguages.map((language) => (
                                <span
                                    key={language}
                                    className="px-3 py-1 rounded-full text-xs font-semibold border border-(--accent)/20 bg-(--accent)/5 text-(--text-h)"
                                >
                                    {language}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-(--text-muted) italic">
                            {t.languagesEmpty}
                        </p>
                    )}
                </div>

                <div>
                    <h2 className="text-sm font-bold text-(--text-h) mb-3 uppercase tracking-wider">
                        {t.skillsLabel}
                    </h2>
                    {profile.skillBreakdownTags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {profile.skillBreakdownTags.map((skill) => (
                                <span
                                    key={skill}
                                    className="px-2.5 py-1 rounded-full text-xs font-semibold border border-(--accent)/30 bg-(--accent)/10 text-(--text) hover:bg-(--accent)/20 transition-colors cursor-pointer"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-(--text-muted) italic">
                            {t.skillsEmpty}
                        </p>
                    )}
                </div>
            </motion.div>
        </>
    );
}
