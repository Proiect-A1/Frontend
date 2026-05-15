import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useLanguage } from '../language/Language';
import { useTheme } from '../services/ThemeContext';
import { containerVariants, pageVariants } from '../utils/motionConfig';
import { profileService, type ProfileResponseDTO } from '../services/profileService';
import { proposeProblemService } from '../services/proposeProblemService';
import type { ProblemProposalResponse } from '../types/proposeProblem';
import ProfileSidebar from './profile/ProfileSidebar';
import ProfileOverviewContent from './profile/ProfileOverviewContent';
import ProfileProposalsPanel from './profile/ProfileProposalsPanel';

export default function Profile() {
    const { username, isAdmin, isProfessor } = useAuth();
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const canViewProposals = isAdmin || isProfessor;

    const [profile, setProfile] = useState<ProfileResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'proposals'>('overview');
    const [proposals, setProposals] = useState<ProblemProposalResponse[] | null>(null);
    const [loadingProposals, setLoadingProposals] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadProfile() {
            try {
                setLoading(true);
                setError(null);
                const data = await profileService.getMyProfile();
                if (active) {
                    setProfile(data);
                }
            } catch {
                if (active) {
                    setError(
                        lang === 'RO'
                            ? 'Nu am putut încărca profilul. Încearcă din nou.'
                            : 'Could not load profile. Please try again.',
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        void loadProfile();

        return () => {
            active = false;
        };
    }, [lang]);

    useEffect(() => {
        if (!canViewProposals && activeTab === 'proposals') {
            setActiveTab('overview');
        }
    }, [activeTab, canViewProposals]);

    useEffect(() => {
        let mounted = true;

        async function loadProposals() {
            setLoadingProposals(true);
            try {
                const data = await proposeProblemService.getMyProposals();
                if (mounted) {
                    setProposals(data);
                }
            } catch {
                if (mounted) {
                    setProposals([]);
                }
            } finally {
                if (mounted) {
                    setLoadingProposals(false);
                }
            }
        }

        if (canViewProposals && activeTab === 'proposals') {
            void loadProposals();
        }

        return () => {
            mounted = false;
        };
    }, [activeTab, canViewProposals]);

    if (!profile) {
        return (
            <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
                <motion.div
                    className="w-full max-w-7xl rounded-2xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm px-5 py-6 md:px-8 md:py-8"
                    variants={pageVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-4 text-sm text-(--text-muted)">
                        {loading
                            ? lang === 'RO'
                                ? 'Se încarcă profilul...'
                                : 'Loading profile...'
                            : (error ??
                              (lang === 'RO'
                                  ? 'Profil indisponibil momentan.'
                                  : 'Profile is currently unavailable.'))}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
            <motion.div
                className="w-full max-w-7xl rounded-3xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm px-5 py-6 md:px-8 md:py-8 h-auto overflow-visible xl:h-full xl:overflow-y-auto custom-scrollbar"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="min-w-0 space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-(--text-h) flex items-center gap-3">
                                {lang === 'RO' ? 'Profil' : 'Profile'}
                            </h1>
                        </div>

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center cursor-pointer bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) hover:-translate-y-0.5 w-fit"
                            >
                                {lang === 'RO' ? 'Panou Administrare' : 'Admin Dashboard'}
                            </Link>
                        )}
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
                            {canViewProposals ? (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('overview')}
                                            className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all duration-150 ${activeTab === 'overview' ? 'bg-(--accent)/15 border-(--accent) text-(--text-h)' : 'bg-transparent border-(--accent)/30 text-(--text-muted)'}`}
                                        >
                                            {lang === 'RO' ? 'Prezentare' : 'Overview'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('proposals')}
                                            className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all duration-150 ${activeTab === 'proposals' ? 'bg-(--accent)/15 border-(--accent) text-(--text-h)' : 'bg-transparent border-(--accent)/30 text-(--text-muted)'}`}
                                        >
                                            {lang === 'RO' ? 'Propunerile Mele' : 'My Proposals'}
                                        </button>
                                    </div>

                                    {activeTab === 'overview' ? (
                                        <ProfileOverviewContent profile={profile} lang={lang} theme={theme} />
                                    ) : (
                                        <ProfileProposalsPanel
                                            proposals={proposals}
                                            loading={loadingProposals}
                                            lang={lang}
                                        />
                                    )}
                                </>
                            ) : (
                                <ProfileOverviewContent profile={profile} lang={lang} theme={theme} />
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
