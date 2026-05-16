import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useLanguage } from '../../language/Language';
import { useAuth } from '../../contexts/AuthContext';

// Hooks
import { useAdminOverview } from './hooks/useAdminOverview';
import { useAdminUsers } from './hooks/useAdminUsers';
import { useAdminProposals } from './hooks/useAdminProposals';
import { useAdminAnnouncements } from './hooks/useAdminAnnouncements';
import { useAdminTags } from './hooks/useAdminTags';
import { useAdminAudit } from './hooks/useAdminAudit';

// Components
import AdminSidebar from './components/AdminSidebar';
import UserTab from './components/UserTab';
import ProposalsTab from './components/ProposalsTab';
import TagsTab from './components/TagsTab';
import AnnouncementsTab from './components/AnnouncementsTab';
import AuditLogTab from './components/AuditLogTab';

const tabs = [
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
    const [activeTab, setActiveTab] = useState<TabId>('users');
    const [showOverviewSidebar, setShowOverviewSidebar] = useState(false);

    // Data Hooks
    const { overview } = useAdminOverview(isAdmin);
    const usersState = useAdminUsers(isAdmin, activeTab);
    const proposalsState = useAdminProposals(isAdmin, activeTab);
    const announcementsState = useAdminAnnouncements(isAdmin, activeTab);
    const tagsState = useAdminTags(isAdmin, activeTab);
    const auditState = useAdminAudit(isAdmin, activeTab);

    if (!isAdmin) return <Navigate to="/" replace />;

    return (
        <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
            <motion.div
                className="w-full max-w-7xl rounded-3xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm h-auto xl:h-full relative overflow-hidden"
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {showOverviewSidebar && (
                        <AdminSidebar 
                            overview={overview} 
                            onClose={() => setShowOverviewSidebar(false)} 
                        />
                    )}
                </AnimatePresence>

                <div className="h-full flex flex-col relative z-10">
                    <div className="p-4 sm:p-6 border-b border-(--accent)/20 bg-(--surface-card)/80 backdrop-blur-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowOverviewSidebar(true)}
                                    className="p-2 rounded-2xl border-2 border-(--accent)/30 bg-(--accent)/10 text-(--accent) hover:bg-(--accent)/20 transition-all group"
                                    title={lang === 'RO' ? 'Vezi statistici' : 'View stats'}
                                >
                                    <svg className="h-6 w-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M4 15h4M4 11h10M4 7h16" />
                                    </svg>
                                </button>
                                <div>
                                    <h1 className="text-2xl font-black text-(--text-h) tracking-tight">
                                        Admin <span className="text-(--accent)">Panel</span>
                                    </h1>
                                    <p className="text-xs font-bold text-(--text-muted) uppercase tracking-widest">
                                        Control Center
                                    </p>
                                </div>
                            </div>

                            <div className="flex bg-black/20 p-1 rounded-2xl border border-(--accent)/20 overflow-x-auto no-scrollbar">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                            activeTab === tab.id
                                                ? 'bg-(--accent) text-white shadow-lg shadow-(--accent)/20'
                                                : 'text-(--text-muted) hover:text-(--text-h) hover:bg-white/5'
                                        }`}
                                    >
                                        {lang === 'RO' ? tab.labelRO : tab.labelEN}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-black/5">
                        <div className="max-w-6xl mx-auto">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
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
