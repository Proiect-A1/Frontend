import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { ProfileResponseDTO } from '../services/profileService';
import { computeAchievements, RARITY_STYLES } from '../pages/profile/components/ProfileAchievements';
import LevelUpOverlay from '../pages/profile/components/LevelUpOverlay';
import { computeXp, computeLevel } from '../pages/profile/profileUtils';
import { useLanguage, translations } from '../language/Language';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { celebrateBadgeUnlock, celebrateLevelUp } from '../utils/celebrations';

type Rarity = keyof typeof RARITY_STYLES;

// Not exported from ProfileAchievements.tsx (kept local there), so this is a
// small, intentionally duplicated bilingual label map just for the toast pill.
const RARITY_PILL_LABELS: Record<Rarity, { ro: string; en: string }> = {
    common: { ro: 'Comun', en: 'Common' },
    rare: { ro: 'Rar', en: 'Rare' },
    epic: { ro: 'Epic', en: 'Epic' },
    legendary: { ro: 'Legendar', en: 'Legendary' },
};

/**
 * Owns the gamification "celebration" side effects — badge-unlock toasts,
 * confetti, and the level-up overlay — so they can be triggered from any
 * number of call sites (Profile page, Problem Details page after a
 * submission is judged, …) without duplicating the toast/confetti markup.
 *
 * `checkAndCelebrate` is a synchronous function, not a useEffect: callers
 * decide *when* to invoke it (e.g. on a query-driven useEffect, or straight
 * out of a "submission judged" callback). The very last thing it does is
 * unconditionally persist the current unlocked-ids/level snapshot to
 * localStorage, which is what keeps two close-together calls (e.g. solving a
 * problem while the Profile page also happens to be mounted) from double
 * firing — whichever call runs first consumes the new-unlock delta and
 * persists it, so a second call right after diffs against the now-updated
 * snapshot and finds nothing new.
 */
export function useGamificationCelebration() {
    const { lang } = useLanguage();
    const t = translations[lang];
    const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
    const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; title: { ro: string; en: string } } | null>(null);

    const checkAndCelebrate = useCallback((profile: ProfileResponseDTO, enabled: boolean) => {
        if (!enabled) return;

        const achievements = computeAchievements(profile);
        const unlocked = achievements.filter(a => a.unlocked);
        const xp = computeXp(profile, unlocked.length);
        const gamification = computeLevel(xp);

        // Raw key presence, not `unlockedIds.length === 0` — a brand-new user's
        // legitimate first snapshot IS an empty array, and that must still be
        // treated as "has a baseline now" so their actual first unlock celebrates.
        const isFirstLoad = storage.get(STORAGE_KEYS.seenGamificationState(profile.id)) === null;
        const previous = storage.getJson(
            STORAGE_KEYS.seenGamificationState(profile.id),
            { unlockedIds: [] as string[], level: 1 },
        );
        const newlyUnlocked = unlocked.filter(a => !previous.unlockedIds.includes(a.id));

        if (!isFirstLoad) {
            if (newlyUnlocked.length > 0) {
                const toShow = newlyUnlocked.slice(0, 3);
                toShow.forEach(a => {
                    celebrateBadgeUnlock(a.rarity);
                    const rs = RARITY_STYLES[a.rarity];
                    toast.custom(() => (
                        <div className={`flex items-center gap-3 rounded-2xl border ${rs.border} ${rs.bg} bg-(--surface-card) backdrop-blur-sm p-3 pr-4 shadow-lg`}>
                            <div className={`w-10 h-10 rounded-xl ${rs.ring} flex items-center justify-center text-xl shrink-0`}>
                                {a.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-wide">
                                    {t.achievementUnlockedToast}
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-(--text-h) truncate">
                                        {lang === 'RO' ? a.label.ro : a.label.en}
                                    </p>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${rs.ring} rounded-full px-1.5 py-0.5 text-(--text-h)`}>
                                        {lang === 'RO' ? RARITY_PILL_LABELS[a.rarity].ro : RARITY_PILL_LABELS[a.rarity].en}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ), { duration: 4000 });
                });

                if (newlyUnlocked.length > 3) {
                    const extra = newlyUnlocked.length - 3;
                    toast.custom(() => (
                        <div className="rounded-2xl border border-(--accent)/40 bg-(--surface-card) backdrop-blur-sm p-3 px-4 shadow-lg text-sm font-bold text-(--text-h)">
                            {lang === 'RO' ? `+${extra} realizări noi deblocate` : `+${extra} more achievements unlocked`}
                        </div>
                    ), { duration: 4000 });
                }
            }

            if (gamification.level > previous.level) {
                celebrateLevelUp();
                setLevelUpInfo({ level: gamification.level, title: gamification.title });
                setIsLevelUpOpen(true);
            }
        }

        storage.setJson(
            STORAGE_KEYS.seenGamificationState(profile.id),
            { unlockedIds: unlocked.map(a => a.id), level: gamification.level },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang, t]);

    const LevelUpOverlayElement = (
        <LevelUpOverlay
            level={levelUpInfo?.level ?? 1}
            title={levelUpInfo?.title ?? { ro: '', en: '' }}
            lang={lang}
            isOpen={isLevelUpOpen}
            onClose={() => setIsLevelUpOpen(false)}
        />
    );

    return { checkAndCelebrate, LevelUpOverlayElement };
}
