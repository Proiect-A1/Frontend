import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useLanguage } from '../../language/Language';
import { useAuth } from '../../contexts/AuthContext';
import { pageVariants, containerVariants, itemVariants } from '../../utils/motionConfig';

// Hooks
import { useAdminOverview } from './hooks/useAdminOverview';
import { useAdminUsers } from './hooks/useAdminUsers';
import { useAdminProposals } from './hooks/useAdminProposals';
import { useAdminAnnouncements } from './hooks/useAdminAnnouncements';
import { useAdminTags } from './hooks/useAdminTags';
import { useAdminAudit } from './hooks/useAdminAudit';

// Components
import UserTab from './components/UserTab';
import ProposalsTab from './components/ProposalsTab';
import TagsTab from './components/TagsTab';
import AnnouncementsTab from './components/AnnouncementsTab';
import AuditLogTab from './components/AuditLogTab';

const tabs = [
    { id: 'dashboard', labelRO: 'Rezumat', labelEN: 'Dashboard' },
    { id: 'users', labelRO: 'Utilizatori', labelEN: 'Users' },
    { id: 'proposals', labelRO: 'Propuneri', labelEN: 'Proposals' },
    { id: 'tags', labelRO: 'Tag-uri', labelEN: 'Tags' },
    { id: 'announcements', labelRO: 'Anunțuri', labelEN: 'Announcements' },
    { id: 'audit', labelRO: 'Audit', labelEN: 'Audit Log' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function AdminPanel() {
    const { lang } = useLanguage();
    const { isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

    // Data Hooks
    const { overview, isLoading: isOverviewLoading } = useAdminOverview(isAdmin);
    const usersState = useAdminUsers(isAdmin, activeTab);
    const proposalsState = useAdminProposals(isAdmin, activeTab);
    const announcementsState = useAdminAnnouncements(isAdmin, activeTab);
    const tagsState = useAdminTags(isAdmin, activeTab);
    const auditState = useAdminAudit(isAdmin, activeTab);

    if (!isAdmin) return <Navigate to="/" replace />;

    return (
        <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
            <motion.div
                className="w-full max-w-7xl rounded-3xl border-2 border-(--accent) bg-(--surface-card) h-full flex overflow-hidden relative"
                initial="hidden"
                animate="visible"
                variants={pageVariants}
            >
                <div className="flex-1 h-full flex flex-col overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8">
                        <div className="w-full">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                                <h1 className="text-3xl font-bold text-(--text-h)">
                                    Admin <span className="text-(--accent)">Panel</span>
                                </h1>

                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                    {tabs.map((tab) => {
                                        const isActive = activeTab === tab.id;
                                        const baseClasses = 'px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center cursor-pointer outline-none uppercase tracking-widest';
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`${baseClasses} ${isActive ? 'bg-(--accent)/25 border-(--accent) text-(--text-h)' : 'bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) hover:-translate-y-0.5'}`}
                                            >
                                                {lang === 'RO' ? tab.labelRO : tab.labelEN}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="page-line-horizontal mb-6" />

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={containerVariants}
                                    className="min-h-0 flex-1"
                                >
                                    {activeTab === 'dashboard' && (
                                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                            {[
                                                { label: lang === 'RO' ? 'Utilizatori' : 'Users', value: overview?.users, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                                                { label: lang === 'RO' ? 'Probleme' : 'Problems', value: overview?.problems, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
                                                { label: lang === 'RO' ? 'Submisii' : 'Submissions', value: overview?.submissions, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                                                { label: lang === 'RO' ? 'Clase' : 'Classes', value: overview?.classes, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                                                { label: lang === 'RO' ? 'Teme' : 'Assignments', value: overview?.assignments, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                                                { label: lang === 'RO' ? 'Propuneri' : 'Pending', value: overview?.pendingProposals, icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
                                            ].map((stat, i) => (
                                                <motion.div
                                                    key={stat.label}
                                                    variants={itemVariants}
                                                    className="p-6 rounded-3xl border border-(--accent)/20 bg-(--accent)/5 flex items-center gap-4 group hover:bg-(--accent)/10 transition-all duration-300"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-(--accent)/10 flex items-center justify-center text-(--accent) group-hover:scale-110 transition-transform">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs uppercase tracking-widest text-(--text-muted) font-bold">{stat.label}</p>
                                                        <p className="text-2xl font-black text-(--text-h)">{isOverviewLoading ? '...' : stat.value}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                    {activeTab === 'users' && <UserTab {...usersState} />}
                                    {activeTab === 'proposals' && <ProposalsTab {...proposalsState} />}
                                    {activeTab === 'tags' && <TagsTab {...tagsState} />}
                                    {activeTab === 'announcements' && <AnnouncementsTab {...announcementsState} />}
                                    {activeTab === 'audit' && <AuditLogTab {...auditState} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
