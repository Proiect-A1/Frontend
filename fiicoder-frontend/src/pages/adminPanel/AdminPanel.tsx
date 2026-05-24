import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useLanguage } from '../../language/Language';
import { useAuth } from '../../contexts/AuthContext';
import { pageVariants, containerVariants } from '../../utils/motionConfig';

// Hooks
import { useAdminOverview } from './hooks/useAdminOverview';
import { useAdminUsers } from './hooks/useAdminUsers';
import { useAdminProposals } from './hooks/useAdminProposals';
import { useAdminAnnouncements } from './hooks/useAdminAnnouncements';
import { useAdminTags } from './hooks/useAdminTags';
import { useAdminAudit } from './hooks/useAdminAudit';
import { useAdminGroups } from './hooks/useAdminGroups';

// Components
import UserTab from './components/UserTab';
import ProposalsTab from './components/ProposalsTab';
import TagsTab from './components/TagsTab';
import AnnouncementsTab from './components/AnnouncementsTab';
import AuditLogTab from './components/AuditLogTab';
import GroupsTab from './components/GroupsTab';
import AdminSidebar from './components/AdminSidebar';

const tabs = [
    { id: 'users', labelRO: 'Utilizatori', labelEN: 'Users' },
    { id: 'problems', labelRO: 'Probleme', labelEN: 'Problems' },
    { id: 'tags', labelRO: 'Tag-uri', labelEN: 'Tags' },
    { id: 'announcements', labelRO: 'Anunțuri', labelEN: 'Announcements' },
    { id: 'groups', labelRO: 'Grupe', labelEN: 'Groups' },
    { id: 'audit', labelRO: 'Audit', labelEN: 'Audit Log' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function AdminPanel() {
    const { lang } = useLanguage();
    const { isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState<TabId>('users');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Data Hooks
    const { overview } = useAdminOverview(isAdmin);
    const usersState = useAdminUsers(isAdmin, activeTab);
    const proposalsState = useAdminProposals(isAdmin, activeTab);
    const announcementsState = useAdminAnnouncements(isAdmin, activeTab);
    const tagsState = useAdminTags(isAdmin, activeTab);
    const auditState = useAdminAudit(isAdmin, activeTab);
    const groupsState = useAdminGroups(isAdmin, activeTab);

    if (!isAdmin) return <Navigate to="/" replace />;

    return (
        <motion.div
            className="w-full max-w-7xl mx-auto rounded-3xl border-2 border-(--accent) bg-(--surface-card) xl:flex-1 xl:min-h-0 h-full flex overflow-hidden relative"
            initial="hidden"
            animate="visible"
            variants={pageVariants}
        >
                <div className="flex-1 h-full flex flex-col overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8">
                        <div className="w-full">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="w-10 h-10 rounded-full border-2 border-(--accent)/50 bg-(--accent)/10 flex items-center justify-center text-(--text-h) hover:bg-(--accent)/20 transition-all active:scale-95"
                                        title={lang === 'RO' ? 'Deschide Rezumat' : 'Open Overview'}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                                        </svg>
                                    </button>
                                    <h1 className="text-3xl font-bold text-(--text-h)">Admin Panel</h1>
                                </div>
                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                    {tabs.map((tab) => {
                                        const isActive = activeTab === tab.id;
                                        const baseClasses = 'px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center cursor-pointer outline-none';
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
                                    {activeTab === 'users' && <UserTab {...usersState} />}
                                    {activeTab === 'problems' && <ProposalsTab {...proposalsState} />}
                                    {activeTab === 'tags' && <TagsTab {...tagsState} />}
                                    {activeTab === 'announcements' && <AnnouncementsTab {...announcementsState} />}
                                    {activeTab === 'groups' && <GroupsTab {...groupsState} />}
                                    {activeTab === 'audit' && <AuditLogTab {...auditState} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isSidebarOpen && (
                        <AdminSidebar
                            overview={overview}
                            onClose={() => setIsSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>
        </motion.div>
    );
}
