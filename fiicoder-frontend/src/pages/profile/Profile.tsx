import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, translations } from '../../language/Language';
import { useTheme } from '../../contexts/ThemeContext';
import { containerVariants, pageVariants } from '../../utils/motionConfig';
import { profileService } from '../../services/profileService';
import { proposeProblemService } from '../proposeProblem/services/proposeProblemService';
import type { ProblemProposalResponse } from '../proposeProblem/types/proposeProblem';
import { problemService } from '../../services/problemService';
import { toast } from 'sonner';
import ProfileSidebar from './components/ProfileSidebar';
import ProfileOverviewContent from './components/ProfileOverviewContent';
import ProfileProposalsPanel from './components/ProfileProposalsPanel';
import ProfileHomeworkPanel from './components/ProfileHomeworkPanel';
import { useTabParam } from '../../hooks/useTabParam';

export default function Profile() {
    const { username: usernameParam } = useParams<{ username?: string }>();
    const { username, userId, isAdmin, isProfessor, updateAvatar } = useAuth();
    const { lang } = useLanguage();
    const t = translations[lang];
    const { theme } = useTheme();
    const queryClient = useQueryClient();

    const viewingUsername = usernameParam ?? username;
    const isOwnProfile = !usernameParam || usernameParam === username;
    const canViewProposals = isOwnProfile && (isAdmin || isProfessor);

    const [activeTab, setActiveTab] = useTabParam<'overview' | 'proposals' | 'homework'>(
        'overview',
        { validValues: ['overview', 'proposals', 'homework'] },
    );
    const [togglingTitle, setTogglingTitle] = useState<string | null>(null);

    const profileQuery = useQuery({
        queryKey: ['profile', viewingUsername],
        queryFn: () => profileService.getProfile(viewingUsername!, 0, 200),
        enabled: !!viewingUsername,
    });

    const proposalsQuery = useQuery({
        queryKey: ['profile', 'proposals', userId],
        queryFn: () => proposeProblemService.getMyProposals(),
        enabled: canViewProposals && activeTab === 'proposals',
    });

    const profile = profileQuery.data ?? null;
    const loading = profileQuery.isPending;
    const error = profileQuery.isError ? t.profileError : null;
    const proposals = proposalsQuery.data ?? [];
    const loadingProposals = proposalsQuery.isPending;

    const handleDeleteProposal = async (title: string) => {
        try {
            await proposeProblemService.deleteProblem(title);
            await queryClient.invalidateQueries({ queryKey: ['profile', 'proposals'] });
            toast.success(t.proposalDeleted);
        } catch {
            toast.error(t.proposalDeleteError);
        }
    };

    const handleToggleVisibility = async (
        title: string,
        currentVisibility: 'public' | 'private',
    ) => {
        const newVisibility = currentVisibility === 'public' ? 'PRIVATE' : 'PUBLIC';
        const newVisibilityLower = newVisibility.toLowerCase() as 'public' | 'private';
        setTogglingTitle(title);

        const queryKey = ['profile', 'proposals', userId];
        const previous = queryClient.getQueryData(queryKey);
        queryClient.setQueryData<ProblemProposalResponse[]>(
            queryKey,
            old => old?.map(p => p.title === title ? { ...p, visibility: newVisibilityLower } : p),
        );

        try {
            await problemService.changeVisibility(title, newVisibility);
            toast.success(t.visibilityUpdated);
        } catch {
            queryClient.setQueryData(queryKey, previous);
            toast.error(t.visibilityUpdateError);
        } finally {
            setTogglingTitle(null);
        }
    };

    useEffect(() => {
        if ((!canViewProposals && activeTab === 'proposals') || (!isOwnProfile && activeTab === 'homework')) {
            setActiveTab('overview');
        }
    }, [activeTab, canViewProposals, isOwnProfile]);

    useEffect(() => {
        if (!isOwnProfile || !profile) return;
        if (profile.email) updateAvatar(profile.email);
    }, [profile, isOwnProfile]);

    if (!profile && loading) {
        return (
            <motion.div
                className="w-full max-w-7xl mx-auto px-5 py-10 md:px-8 md:py-12"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="text-center text-(--text-muted) text-sm italic">
                    {t.profileLoading}
                </div>
            </motion.div>
        );
    }

    if (!profile) {
        return (
            <motion.div
                className="w-full max-w-7xl mx-auto rounded-2xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm px-5 py-6 md:px-8 md:py-8"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-4 text-sm text-(--text-muted)">
                    {error ?? t.profileUnavailable}
                </div>
            </motion.div>
        );
    }

    const navButtonBase =
        'px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center cursor-pointer outline-none';
    const navButtonActive = 'bg-(--accent)/25 border-(--accent) text-(--text-h)';
    const navButtonIdle =
        'bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) hover:-translate-y-0.5';

    return (
        <motion.div
            className="w-full max-w-7xl mx-auto rounded-3xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm px-5 py-6 md:px-8 md:py-8 h-auto overflow-visible xl:h-full xl:overflow-y-auto custom-scrollbar xl:flex-1 xl:min-h-0"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="min-w-0 space-y-6">
                {/* Header curat, doar cu titlul paginii */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-(--text-h) flex items-center gap-3">
                            {isOwnProfile
                                ? t.profileTitle
                                : (profile?.username ?? viewingUsername)}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => setActiveTab('overview')}
                            className={`${navButtonBase} ${activeTab === 'overview' ? navButtonActive : navButtonIdle}`}
                        >
                            {t.profileTabOverview}
                        </button>
                        {canViewProposals && (
                            <button
                                type="button"
                                onClick={() => setActiveTab('proposals')}
                                className={`${navButtonBase} ${activeTab === 'proposals' ? navButtonActive : navButtonIdle}`}
                            >
                                {t.myProposals}
                            </button>
                        )}
                        {isOwnProfile && (
                            <button
                                type="button"
                                onClick={() => setActiveTab('homework')}
                                className={`${navButtonBase} ${activeTab === 'homework' ? navButtonActive : navButtonIdle}`}
                            >
                                {t.homeworkPanelTitle}
                            </button>
                        )}

                    </div>
                </div>

                <motion.div
                    className="w-full grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="flex flex-col gap-6 min-w-0">
                        <ProfileSidebar profile={profile} username={username} lang={lang} />
                    </div>

                    <div className="flex flex-col gap-6 min-w-0 w-full">
                        {activeTab === 'overview' ? (
                            <ProfileOverviewContent profile={profile} lang={lang} theme={theme} />
                        ) : activeTab === 'proposals' ? (
                            <ProfileProposalsPanel
                                proposals={proposals}
                                loading={loadingProposals}
                                lang={lang}
                                onToggleVisibility={handleToggleVisibility}
                                togglingTitle={togglingTitle}
                                onDelete={handleDeleteProposal}
                            />
                        ) : (
                            <ProfileHomeworkPanel lang={lang} />
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
