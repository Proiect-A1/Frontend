import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useLanguage } from '../../language/Language';
import { useAuth } from '../../contexts/AuthContext';
import { containerVariants } from '../../utils/motionConfig';

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
                className="w-full max-w-7xl rounded-3xl border-2 border-(--accent) bg-(--surface-card) h-full flex overflow-hidden relative"
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

                <div className="flex-1 h-full flex flex-col overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8">
                        <div className="w-full">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setShowOverviewSidebar(true)}
                                        className="p-2.5 rounded-full border-2 border-(--accent)/30 bg-(--accent)/10 text-(--accent) hover:bg-(--accent)/20 transition-all group shadow-sm"
                                    >
                                        <svg className="h-6 w-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M4 15h4M4 11h10M4 7h16" />
                                        </svg>
                                    </button>
                                    <div>
                                        <h1 className="text-3xl font-bold text-(--text-h)">
                                            Admin <span className="text-(--accent)">Panel</span>
                                        </h1>
                                        <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-[0.2em] leading-none mt-1">
                                            Control Center
                                        </p>
                                    </div>
                                </div>

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
