import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useLanguage } from '../language/Language';
import {
    adminService,
    type AdminOverview,
    type AdminUser,
    type Announcement,
    type AuditLogEntry,
    type ProblemProposal,
    type ProblemProposalDetail,
} from '../services/adminService';
import { mockProposals } from '../services/mockProposals';
import { useAuth } from '../services/AuthContext';
import { containerVariants, itemVariants } from '../utils/motionConfig';

const tabs = [
    { id: 'users', labelRO: 'Utilizatori', labelEN: 'Users' },
    { id: 'proposals', labelRO: 'Propuneri', labelEN: 'Proposals' },
    { id: 'announcements', labelRO: 'Anunțuri', labelEN: 'Announcements' },
    { id: 'audit', labelRO: 'Audit', labelEN: 'Audit Log' },
];

const USERS_PER_PAGE = 20;

type TabId = (typeof tabs)[number]['id'];

export default function AdminPanel() {
    const { lang } = useLanguage();
    const { isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState<TabId>('users');
    const [showOverviewSidebar, setShowOverviewSidebar] = useState(false);

    const [overview, setOverview] = useState<AdminOverview | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [userPage, setUserPage] = useState(1);
    const [proposals, setProposals] = useState<ProblemProposal[]>([]);
    const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
    const [selectedProposal, setSelectedProposal] = useState<ProblemProposalDetail | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
    const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
    const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!isAdmin) return;

        let cancelled = false;

        async function loadOverview() {
            try {
                const data = await adminService.getOverview();
                if (!cancelled) setOverview(data);
            } catch (error) {
                console.error('Failed to load admin overview:', error);
            }
        }

        void loadOverview();

        return () => {
            cancelled = true;
        };
    }, [isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;

        let cancelled = false;

        async function loadActiveTab() {
            if (activeTab === 'users') {
                const data = await adminService.getUsers(userPage, USERS_PER_PAGE);
                if (!cancelled) setUsers(data);
                return;
            }

            if (activeTab === 'proposals') {
                try {
                    const data = await adminService.getProposals();
                    if (!cancelled) {
                        const pending = data.filter(
                            (proposal) =>
                                proposal.status === 'PENDING' ||
                                (proposal.status as string) === 'pending',
                        );
                        setProposals(pending);

                        if (pending.length > 0 && !selectedProposalId) {
                            setSelectedProposalId(pending[0].id);
                        }

                        if (pending.length === 0) {
                            setSelectedProposalId(null);
                            setSelectedProposal(null);
                        }
                    }
                } catch (error) {
                    console.log('Using mock proposals for development...');
                    // Use mock proposals in development when API is not available
                    if (!cancelled) {
                        const mockData = mockProposals.map((proposal, index) => ({
                            id: `mock_${index}`,
                            title: proposal.title,
                            difficulty: proposal.difficulty,
                            status: 'pending',
                            submittedAt: new Date().toISOString(),
                        })) as unknown as ProblemProposal[];

                        setProposals(mockData);
                        if (mockData.length > 0 && !selectedProposalId) {
                            setSelectedProposalId(mockData[0].id);
                        }
                    }
                }
                return;
            }

            if (activeTab === 'announcements') {
                const data = await adminService.getAnnouncements();
                if (!cancelled) setAnnouncements(data);
                return;
            }

            if (activeTab === 'audit') {
                const data = await adminService.getAuditLog();
                if (!cancelled) setAuditLog(data);
            }
        }

        void loadActiveTab();

        return () => {
            cancelled = true;
        };
    }, [activeTab, isAdmin, userPage]);

    useEffect(() => {
        if (!isAdmin || activeTab !== 'proposals') {
            return;
        }

        if (!selectedProposalId) {
            setSelectedProposal(null);
            return;
        }

        const proposalId = selectedProposalId;

        let cancelled = false;

        async function loadProposalDetail() {
            try {
                const data = await adminService.getProblemProposal(proposalId);
                if (!cancelled) setSelectedProposal(data);
            } catch (error) {
                // Fallback to mock data if API fails
                const mockMatch =
                    mockProposals.find(
                        (p, idx) =>
                            p.title === proposalId ||
                            `mock_${idx}` === proposalId ||
                            `p${idx + 1}` === proposalId,
                    ) || mockProposals[0];

                if (mockMatch && !cancelled) {
                    const fallbackProposal: ProblemProposalDetail = {
                        id: proposalId,
                        title: mockMatch.title,
                        authorUsername: 'Mock User',
                        description: mockMatch.statement.slice(0, 160),
                        status: 'PENDING',
                        createdAt: new Date().toISOString(),
                        statement: mockMatch.statement,
                        tags: mockMatch.tags,
                    };
                    setSelectedProposal(fallbackProposal);
                }
            }
        }

        void loadProposalDetail();

        return () => {
            cancelled = true;
        };
    }, [activeTab, isAdmin, selectedProposalId]);

    if (!isAdmin) return <Navigate to="/" replace />;

    const handleReviewProposal = async (proposalId: string, action: 'approve' | 'reject') => {
        if (action === 'approve') {
            await adminService.approveProposal(proposalId);
        } else {
            await adminService.rejectProposal(proposalId);
        }

        const remainingProposals = proposals.filter((proposal) => proposal.id !== proposalId);
        setProposals(remainingProposals);

        if (selectedProposalId === proposalId) {
            const nextProposalId = remainingProposals[0]?.id ?? null;
            setSelectedProposal(null);
            setSelectedProposalId(nextProposalId);
        }

        setOverview((previousOverview) =>
            previousOverview
                ? {
                      ...previousOverview,
                      pendingProposals: Math.max(previousOverview.pendingProposals - 1, 0),
                      problems:
                          action === 'approve'
                              ? previousOverview.problems + 1
                              : previousOverview.problems,
                  }
                : previousOverview,
        );
    };

    const handleBanToggle = async (username: string, isBanned: boolean) => {
        await adminService.toggleBan(username, isBanned);
        setUsers((previousUsers) =>
            previousUsers.map((user) =>
                user.username === username ? { ...user, isBanned: !isBanned } : user,
            ),
        );
    };

    const handleDeleteUser = async (username: string) => {
        const confirmMsg =
            lang === 'RO'
                ? `Sigur vrei să ștergi utilizatorul ${username}?`
                : `Are you sure you want to delete user ${username}?`;

        if (!window.confirm(confirmMsg)) return;

        setProcessingUsers((prev) => new Set(prev).add(username));
        try {
            await adminService.deleteUser(username);
            setUsers((previousUsers) => previousUsers.filter((user) => user.username !== username));
            setOverview((previousOverview) =>
                previousOverview
                    ? { ...previousOverview, users: Math.max(previousOverview.users - 1, 0) }
                    : previousOverview,
            );
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert(lang === 'RO' ? 'Eroare la ștergerea utilizatorului.' : 'Error deleting user.');
        } finally {
            setProcessingUsers((prev) => {
                const next = new Set(prev);
                next.delete(username);
                return next;
            });
        }
    };

    const handleRoleChange = async (username: string, newRole: 'USER' | 'ADMIN' | 'PROFESSOR') => {
        await adminService.changeRole(username, newRole);
        setUsers((previousUsers) =>
            previousUsers.map((user) =>
                user.username === username ? { ...user, role: newRole } : user,
            ),
        );
    };

    const handleAnnouncementSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
            return;
        }

        setIsSavingAnnouncement(true);

        try {
            if (editingAnnouncementId) {
                const updatedAnnouncement = await adminService.updateAnnouncement(
                    editingAnnouncementId,
                    announcementForm,
                );
                setAnnouncements((previousAnnouncements) =>
                    previousAnnouncements.map((announcement) =>
                        announcement.id === editingAnnouncementId
                            ? updatedAnnouncement
                            : announcement,
                    ),
                );
            } else {
                const createdAnnouncement = await adminService.createAnnouncement(announcementForm);
                setAnnouncements((previousAnnouncements) => [
                    createdAnnouncement,
                    ...previousAnnouncements,
                ]);
            }

            setAnnouncementForm({ title: '', content: '' });
            setEditingAnnouncementId(null);
        } finally {
            setIsSavingAnnouncement(false);
        }
    };

    const handleEditAnnouncement = (announcement: Announcement) => {
        setEditingAnnouncementId(announcement.id);
        setAnnouncementForm({ title: announcement.title, content: announcement.content });
    };

    const handleViewAnnouncement = (announcementId: string) => {
        if (selectedAnnouncementId === announcementId) {
            setSelectedAnnouncementId(null);
        } else {
            setSelectedAnnouncementId(announcementId);
        }
    };

    const handleDeleteAnnouncement = async (announcementId: string) => {
        await adminService.deleteAnnouncement(announcementId);
        setAnnouncements((previousAnnouncements) =>
            previousAnnouncements.filter((announcement) => announcement.id !== announcementId),
        );

        if (editingAnnouncementId === announcementId) {
            setEditingAnnouncementId(null);
            setAnnouncementForm({ title: '', content: '' });
        }

        if (selectedAnnouncementId === announcementId) {
            setSelectedAnnouncementId(null);
        }
    };

    const overviewCards = useMemo(
        () => [
            { label: lang === 'RO' ? 'Utilizatori' : 'Users', value: overview?.users ?? 0 },
            { label: lang === 'RO' ? 'Probleme' : 'Problems', value: overview?.problems ?? 0 },
            {
                label: lang === 'RO' ? 'Submisii' : 'Submissions',
                value: overview?.submissions ?? 0,
            },
            { label: lang === 'RO' ? 'Clase' : 'Classes', value: overview?.classes ?? 0 },
            { label: lang === 'RO' ? 'Teme' : 'Homework', value: overview?.assignments ?? 0 },
            {
                label: lang === 'RO' ? 'Propuneri pending' : 'Pending proposals',
                value: overview?.pendingProposals ?? 0,
                highlight: true,
            },
        ],
        [overview, lang],
    );

    const memoizedUsers = useMemo(
        () =>
            users.map((user) => (
                <motion.div
                    variants={itemVariants}
                    key={user.username}
                    className="p-4 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                    <div className="min-w-0">
                        <h3 className="text-(--text-h) font-bold text-lg flex flex-wrap items-center gap-4">
                            <span className="truncate">{user.username}</span>
                            {user.role === 'ADMIN' && (
                                <span className="bg-purple-500/20 text-purple-500/60 border border-purple-500/60 text-xs px-2.5 py-1 rounded-full uppercase">
                                    Admin
                                </span>
                            )}
                            {user.role === 'PROFESSOR' && (
                                <span className="bg-blue-500/20 text-blue-500/60 border border-blue-500/60 text-xs px-2.5 py-1 rounded-full uppercase">
                                    Professor
                                </span>
                            )}
                            {user.isBanned && (
                                <span className="bg-red-500/20 text-red-500/60 border border-red-500/60 text-xs px-2.5 py-1 rounded-full uppercase">
                                    Banned
                                </span>
                            )}
                        </h3>
                        <p className="text-(--text-muted) text-sm truncate">
                            {user.firstName} {user.lastName} • {user.email}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className="relative group">
                            <select
                                value={user.role}
                                onChange={(e) =>
                                    handleRoleChange(user.username, e.target.value as any)
                                }
                                className="appearance-none bg-(--accent)/10 border border-(--accent)/40 rounded-full px-4 py-1 text-xs font-semibold text-(--text-h) pr-6 cursor-pointer hover:bg-(--accent)/20 transition-all outline-none"
                            >
                                <option
                                    value="USER"
                                    className="bg-(--surface-card) text-(--text-h)"
                                >
                                    STUDENT
                                </option>
                                <option
                                    value="PROFESSOR"
                                    className="bg-(--surface-card) text-(--text-h)"
                                >
                                    PROFESOR
                                </option>
                                <option
                                    value="ADMIN"
                                    className="bg-(--surface-card) text-(--text-h)"
                                >
                                    ADMIN
                                </option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-(--accent) text-[8px]">
                                ▼
                            </div>
                        </div>
                        <button
                            onClick={() => handleBanToggle(user.username, user.isBanned || false)}
                            disabled={processingUsers.has(user.username)}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
                                user.isBanned
                                    ? 'border-green-500/60 bg-green-500/10 text-green-500/60 hover:bg-green-500/20'
                                    : 'border-red-500/60 bg-red-500/10 text-red-500/60 hover:bg-red-500/20'
                            }`}
                        >
                            {user.isBanned ? 'Unban' : 'Ban'}
                        </button>
                        <button
                            onClick={() => handleDeleteUser(user.username)}
                            disabled={processingUsers.has(user.username)}
                            className="rounded-full border border-(--accent)/40 bg-(--accent)/10 px-3 py-1 text-xs font-bold text-(--text-h) hover:bg-(--accent)/20"
                        >
                            {processingUsers.has(user.username) ? '...' : 'Delete'}
                        </button>
                    </div>
                </motion.div>
            )),
        [users, processingUsers, lang],
    );

    return (
        <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
            <motion.div
                className="w-full max-w-7xl rounded-3xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm h-auto xl:h-full relative overflow-hidden"
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {showOverviewSidebar && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowOverviewSidebar(false)}
                                className="absolute inset-0 z-40 bg-black/15 backdrop-blur-[2px]"
                            />
                            <motion.aside
                                initial={{ x: -320, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -320, opacity: 0 }}
                                className="absolute z-50 left-0 top-0 w-80 h-full bg-(--surface-card) border-r-2 border-(--accent) flex flex-col"
                            >
                                <div className="h-full overflow-y-auto custom-scrollbar p-5 border-r-2 border-transparent">
                                    <>
                                        <div className="flex items-start justify-between gap-3 mb-5">
                                            <div>
                                                <h2 className="text-xl font-bold text-(--text-h) flex items-center gap-2">
                                                    <svg
                                                        className="h-5 w-5 text-(--accent)"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M4 19h16M4 15h4M4 11h10M4 7h16"
                                                        />
                                                    </svg>
                                                    {lang === 'RO' ? 'Rezumat' : 'Overview'}
                                                </h2>
                                                <p className="text-sm text-(--text-muted) mt-1">
                                                    {lang === 'RO'
                                                        ? 'Statistici live ale panoului de administrare.'
                                                        : 'Live admin panel statistics.'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowOverviewSidebar(false)}
                                                className="rounded-full border border-(--accent)/30 bg-(--accent)/10 p-2 text-(--text-h) hover:bg-(--accent)/20 transition-colors"
                                                aria-label={
                                                    lang === 'RO'
                                                        ? 'Ascunde rezumatul'
                                                        : 'Hide overview'
                                                }
                                                title={
                                                    lang === 'RO'
                                                        ? 'Ascunde rezumatul'
                                                        : 'Hide overview'
                                                }
                                            >
                                                <svg
                                                    className="h-4 w-4"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 6l12 12M18 6L6 18"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {overviewCards.map((stat) => (
                                                <div
                                                    key={stat.label}
                                                    className={`rounded-2xl border p-4 text-center ${stat.highlight ? 'border-amber-400/50 bg-amber-500/10' : 'border-(--accent)/20 bg-black/15'}`}
                                                >
                                                    <span
                                                        className={`block text-3xl font-black mb-1 ${stat.highlight ? 'text-amber-300' : 'text-(--accent)'}`}
                                                    >
                                                        {stat.value}
                                                    </span>
                                                    <span className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold">
                                                        {stat.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>
                <div className="h-auto xl:h-full xl:overflow-y-auto custom-scrollbar">
                    <div className="relative min-h-full">
                        <div className="min-w-0 space-y-6 px-5 py-6 md:px-8 md:py-8">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowOverviewSidebar((current) => !current)
                                        }
                                        className={`rounded-2xl border-2 p-2.5 transition-all ${showOverviewSidebar ? 'bg-(--accent) text-white border-(--accent)' : 'bg-(--accent)/10 border-(--accent)/20 text-(--accent) hover:bg-(--accent)/20'}`}
                                        aria-label={
                                            showOverviewSidebar
                                                ? lang === 'RO'
                                                    ? 'Ascunde rezumatul'
                                                    : 'Hide overview'
                                                : lang === 'RO'
                                                  ? 'Arată rezumatul'
                                                  : 'Show overview'
                                        }
                                        title={
                                            showOverviewSidebar
                                                ? lang === 'RO'
                                                    ? 'Ascunde rezumatul'
                                                    : 'Hide overview'
                                                : lang === 'RO'
                                                  ? 'Arată rezumatul'
                                                  : 'Show overview'
                                        }
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4 5h16M4 12h10M4 19h16"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M17 3l4 2-4 2V3z"
                                            />
                                        </svg>
                                    </button>
                                    <h1 className="text-3xl font-bold text-(--text-h) flex items-center gap-3">
                                        {lang === 'RO' ? 'Panou Administrare' : 'Admin Panel'}
                                    </h1>
                                </div>

                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                    {tabs.map((tab) => {
                                        const isActive = activeTab === tab.id;
                                        const baseClasses =
                                            'px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center cursor-pointer outline-none';

                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`${baseClasses} ${
                                                    isActive
                                                        ? 'bg-(--accent)/25 border-(--accent) text-(--text-h)'
                                                        : 'bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) hover:-translate-y-0.5'
                                                }`}
                                            >
                                                {lang === 'RO' ? tab.labelRO : tab.labelEN}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    variants={containerVariants}
                                    key={
                                        activeTab === 'users'
                                            ? `users-${users.length > 0}`
                                            : activeTab === 'audit'
                                              ? `audit-${auditLog.length > 0}`
                                              : activeTab
                                    }
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    {activeTab === 'users' && (
                                        <motion.div
                                            variants={containerVariants}
                                            className="space-y-4"
                                        >
                                            <motion.div
                                                variants={itemVariants}
                                                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs uppercase tracking-widest text-(--text-muted) font-bold"
                                            >
                                                <span>
                                                    {lang === 'RO'
                                                        ? `Pagina ${userPage}`
                                                        : `Page ${userPage}`}
                                                </span>
                                                <span>
                                                    {users.length}{' '}
                                                    {lang === 'RO' ? 'afișați' : 'shown'}
                                                </span>
                                            </motion.div>

                                            <motion.div
                                                variants={containerVariants}
                                                className="grid gap-3"
                                            >
                                                {memoizedUsers}
                                            </motion.div>

                                            <motion.div
                                                variants={itemVariants}
                                                className="flex items-center justify-between gap-3"
                                            >
                                                <button
                                                    onClick={() =>
                                                        setUserPage((currentPage) =>
                                                            Math.max(currentPage - 1, 1),
                                                        )
                                                    }
                                                    disabled={userPage === 1}
                                                    className="rounded-full border border-(--accent)/40 bg-(--accent)/10 px-4 py-2 text-xs font-bold text-(--text-h) disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    {lang === 'RO'
                                                        ? 'Pagina anterioară'
                                                        : 'Previous'}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setUserPage(
                                                            (currentPage) => currentPage + 1,
                                                        )
                                                    }
                                                    disabled={users.length < USERS_PER_PAGE}
                                                    className="rounded-full border border-(--accent)/40 bg-(--accent)/10 px-4 py-2 text-xs font-bold text-(--text-h) disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    {lang === 'RO' ? 'Pagina următoare' : 'Next'}
                                                </button>
                                            </motion.div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'proposals' && (
                                        <motion.div
                                            variants={containerVariants}
                                            className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]"
                                        >
                                            <motion.div
                                                variants={containerVariants}
                                                className="space-y-3"
                                            >
                                                <motion.div
                                                    variants={itemVariants}
                                                    className="flex items-center justify-between text-xs uppercase tracking-widest text-(--text-muted) font-bold"
                                                >
                                                    <span>
                                                        {lang === 'RO'
                                                            ? 'Propuneri în așteptare'
                                                            : 'Pending proposals'}
                                                    </span>
                                                    <span>{proposals.length}</span>
                                                </motion.div>

                                                <motion.div
                                                    variants={containerVariants}
                                                    className="grid gap-3"
                                                >
                                                    {proposals.length === 0 && (
                                                        <motion.p
                                                            variants={itemVariants}
                                                            className="text-(--text-muted) text-sm"
                                                        >
                                                            {lang === 'RO'
                                                                ? 'Nu există propuneri în așteptare.'
                                                                : 'There are no pending proposals.'}
                                                        </motion.p>
                                                    )}

                                                    {proposals.map((proposal) => {
                                                        const isSelected =
                                                            selectedProposalId === proposal.id;

                                                        return (
                                                            <motion.button
                                                                variants={itemVariants}
                                                                key={proposal.id}
                                                                onClick={() =>
                                                                    setSelectedProposalId(
                                                                        proposal.id,
                                                                    )
                                                                }
                                                                className={`text-left p-4 rounded-2xl border transition-colors duration-200 ${
                                                                    isSelected
                                                                        ? 'border-(--accent) bg-(--accent)/15'
                                                                        : 'border-(--accent)/20 bg-(--surface-muted) hover:border-(--accent)/40 hover:bg-(--accent)/10'
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                                    <h3 className="text-lg font-bold text-(--text-h) line-clamp-1">
                                                                        {proposal.title}
                                                                    </h3>
                                                                    <span className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold whitespace-nowrap">
                                                                        {proposal.createdAt}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-(--text) line-clamp-2 mb-3">
                                                                    {proposal.description}
                                                                </p>
                                                                <div className="flex items-center justify-between text-xs text-(--text-muted) font-semibold">
                                                                    <span>
                                                                        {lang === 'RO'
                                                                            ? 'Propus de'
                                                                            : 'By'}
                                                                        :{' '}
                                                                        <span className="text-(--text)">
                                                                            {
                                                                                proposal.authorUsername
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                    <span className="rounded-full border border-amber-400/60 bg-amber-400/20 px-2.5 py-1 text-amber-400 uppercase tracking-widest">
                                                                        {proposal.status}
                                                                    </span>
                                                                </div>
                                                            </motion.button>
                                                        );
                                                    })}
                                                </motion.div>
                                            </motion.div>

                                            <motion.div
                                                variants={itemVariants}
                                                className="p-5 rounded-2xl border border-(--accent)/20 bg-(--surface-muted)"
                                            >
                                                {!selectedProposal && selectedProposalId && (
                                                    <p className="text-(--text-muted) text-sm">
                                                        {lang === 'RO'
                                                            ? 'Se încarcă detaliile propunerii...'
                                                            : 'Loading proposal details...'}
                                                    </p>
                                                )}

                                                {!selectedProposal && !selectedProposalId && (
                                                    <p className="text-(--text-muted) text-sm">
                                                        {lang === 'RO'
                                                            ? 'Selectează o propunere pentru a vedea detaliile.'
                                                            : 'Select a proposal to see the details.'}
                                                    </p>
                                                )}

                                                {selectedProposal && (
                                                    <div className="space-y-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <h3 className="text-2xl font-bold text-(--text-h)">
                                                                    {selectedProposal.title}
                                                                </h3>
                                                                <p className="text-sm text-(--text-muted) mt-1">
                                                                    {lang === 'RO'
                                                                        ? 'Propus de'
                                                                        : 'Author'}{' '}
                                                                    <span className="text-(--text-h)">
                                                                        {
                                                                            selectedProposal.authorUsername
                                                                        }
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            <span className="rounded-full border border-amber-400/40 bg-amber-400/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 whitespace-nowrap">
                                                                {selectedProposal.status}
                                                            </span>
                                                        </div>

                                                        <p className="text-sm text-(--text) leading-relaxed">
                                                            {selectedProposal.statement ??
                                                                selectedProposal.description}
                                                        </p>

                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            <div className="rounded-2xl border border-(--accent)/20 bg-black/15 p-3">
                                                                <p className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold mb-2">
                                                                    {lang === 'RO'
                                                                        ? 'Input'
                                                                        : 'Input'}
                                                                </p>
                                                                <p className="text-sm text-(--text) whitespace-pre-wrap">
                                                                    {selectedProposal.inputDescription ??
                                                                        '-'}
                                                                </p>
                                                            </div>
                                                            <div className="rounded-2xl border border-(--accent)/20 bg-black/15 p-3">
                                                                <p className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold mb-2">
                                                                    {lang === 'RO'
                                                                        ? 'Output'
                                                                        : 'Output'}
                                                                </p>
                                                                <p className="text-sm text-(--text) whitespace-pre-wrap">
                                                                    {selectedProposal.outputDescription ??
                                                                        '-'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {selectedProposal.constraints &&
                                                            selectedProposal.constraints.length >
                                                                0 && (
                                                                <div className="rounded-2xl border border-(--accent)/20 bg-black/15 p-3">
                                                                    <p className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold mb-2">
                                                                        {lang === 'RO'
                                                                            ? 'Restricții'
                                                                            : 'Constraints'}
                                                                    </p>
                                                                    <ul className="space-y-1 text-sm text-(--text)">
                                                                        {selectedProposal.constraints.map(
                                                                            (constraint) => (
                                                                                <li
                                                                                    key={constraint}
                                                                                >
                                                                                    • {constraint}
                                                                                </li>
                                                                            ),
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            <div className="rounded-2xl border border-(--accent)/20 bg-black/15 p-3">
                                                                <p className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold mb-2">
                                                                    Sample Input
                                                                </p>
                                                                <pre className="text-xs text-(--text) whitespace-pre-wrap font-mono">
                                                                    {selectedProposal.sampleInput ??
                                                                        '-'}
                                                                </pre>
                                                            </div>
                                                            <div className="rounded-2xl border border-(--accent)/20 bg-black/15 p-3">
                                                                <p className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold mb-2">
                                                                    Sample Output
                                                                </p>
                                                                <pre className="text-xs text-(--text) whitespace-pre-wrap font-mono">
                                                                    {selectedProposal.sampleOutput ??
                                                                        '-'}
                                                                </pre>
                                                            </div>
                                                        </div>

                                                        {selectedProposal.tags &&
                                                            selectedProposal.tags.length > 0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {selectedProposal.tags.map(
                                                                        (tag) => (
                                                                            <span
                                                                                key={tag}
                                                                                className="rounded-full border border-(--accent)/30 bg-(--accent)/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-(--text-h)"
                                                                            >
                                                                                {tag}
                                                                            </span>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}

                                                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-(--accent)/20">
                                                            <button
                                                                onClick={() =>
                                                                    handleReviewProposal(
                                                                        selectedProposal.id,
                                                                        'reject',
                                                                    )
                                                                }
                                                                className="px-3 py-1 rounded-full border border-red-500/40 bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors"
                                                            >
                                                                {lang === 'RO'
                                                                    ? 'Respinge'
                                                                    : 'Reject'}
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleReviewProposal(
                                                                        selectedProposal.id,
                                                                        'approve',
                                                                    )
                                                                }
                                                                className="px-3 py-1 rounded-full border border-green-500/40 bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors"
                                                            >
                                                                {lang === 'RO'
                                                                    ? 'Aprobă Problema'
                                                                    : 'Approve and create problem'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'announcements' && (
                                        <motion.div
                                            variants={containerVariants}
                                            className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
                                        >
                                            <motion.form
                                                variants={itemVariants}
                                                onSubmit={handleAnnouncementSubmit}
                                                className="p-5 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) space-y-4"
                                            >
                                                <div>
                                                    <h3 className="text-xl font-bold text-(--text-h)">
                                                        {editingAnnouncementId
                                                            ? lang === 'RO'
                                                                ? 'Editează anunțul'
                                                                : 'Edit announcement'
                                                            : lang === 'RO'
                                                              ? 'Creează anunț'
                                                              : 'Create announcement'}
                                                    </h3>
                                                    <p className="text-sm text-(--text-muted) mt-1">
                                                        {lang === 'RO'
                                                            ? 'Folosește acest formular pentru a publica mesaje globale.'
                                                            : 'Use this form to publish global messages.'}
                                                    </p>
                                                </div>

                                                <div className="space-y-3">
                                                    <input
                                                        value={announcementForm.title}
                                                        onChange={(event) =>
                                                            setAnnouncementForm((currentForm) => ({
                                                                ...currentForm,
                                                                title: event.target.value,
                                                            }))
                                                        }
                                                        placeholder={
                                                            lang === 'RO'
                                                                ? 'Titlu anunț'
                                                                : 'Announcement title'
                                                        }
                                                        className="w-full rounded-2xl border border-(--accent)/20 bg-black/20 px-3 py-2 text-sm text-(--text-h) outline-none placeholder:text-(--text-muted) focus:border-(--accent)/50"
                                                    />
                                                    <textarea
                                                        value={announcementForm.content}
                                                        onChange={(event) =>
                                                            setAnnouncementForm((currentForm) => ({
                                                                ...currentForm,
                                                                content: event.target.value,
                                                            }))
                                                        }
                                                        placeholder={
                                                            lang === 'RO'
                                                                ? 'Conținut anunț'
                                                                : 'Announcement content'
                                                        }
                                                        rows={6}
                                                        className="w-full rounded-2xl border border-(--accent)/20 bg-black/20 px-3 py-2 text-sm text-(--text-h) outline-none placeholder:text-(--text-muted) focus:border-(--accent)/50 resize-none"
                                                    />
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        type="submit"
                                                        disabled={isSavingAnnouncement}
                                                        className="rounded-full border border-(--accent)/40 bg-(--accent)/10 px-3 py-2 text-sm font-bold text-(--text-h) hover:bg-(--accent)/20 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {isSavingAnnouncement
                                                            ? lang === 'RO'
                                                                ? 'Se salvează...'
                                                                : 'Saving...'
                                                            : editingAnnouncementId
                                                              ? lang === 'RO'
                                                                  ? 'Salvează modificarea'
                                                                  : 'Save changes'
                                                              : lang === 'RO'
                                                                ? 'Publică anunțul'
                                                                : 'Publish announcement'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingAnnouncementId(null);
                                                            setAnnouncementForm({
                                                                title: '',
                                                                content: '',
                                                            });
                                                        }}
                                                        className="rounded-full border border-(--accent)/40 bg-(--accent)/10 px-3 py-2 text-sm font-bold text-(--text-h) hover:bg-(--accent)/20 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {lang === 'RO' ? 'Resetează' : 'Reset'}
                                                    </button>
                                                </div>
                                            </motion.form>

                                            <motion.div
                                                variants={containerVariants}
                                                className="grid gap-3"
                                            >
                                                {announcements.map((announcement) => (
                                                    <motion.div
                                                        variants={itemVariants}
                                                        key={announcement.id}
                                                        className="p-4 rounded-2xl border border-(--accent)/20 bg-(--surface-muted)"
                                                    >
                                                        <div className="flex items-start justify-between gap-3 mb-2">
                                                            <div>
                                                                <h3 className="text-(--text-h) font-bold text-lg">
                                                                    {announcement.title}
                                                                </h3>
                                                                <p className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mt-1">
                                                                    {announcement.createdAt}
                                                                </p>
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleViewAnnouncement(
                                                                            announcement.id,
                                                                        )
                                                                    }
                                                                    className="rounded-full border border-(--accent)/40 bg-(--accent)/10 px-3 py-1 text-xs font-bold text-(--text-h) hover:bg-(--accent)/20"
                                                                >
                                                                    {selectedAnnouncementId ===
                                                                    announcement.id
                                                                        ? lang === 'RO'
                                                                            ? 'Restrânge'
                                                                            : 'Collapse'
                                                                        : lang === 'RO'
                                                                          ? 'Extinde'
                                                                          : 'Expand'}
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleEditAnnouncement(
                                                                            announcement,
                                                                        )
                                                                    }
                                                                    className="rounded-full border border-(--accent)/40 bg-(--accent)/10 px-3 py-1 text-xs font-bold text-(--text-h) hover:bg-(--accent)/20"
                                                                >
                                                                    {lang === 'RO'
                                                                        ? 'Editează'
                                                                        : 'Edit'}
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteAnnouncement(
                                                                            announcement.id,
                                                                        )
                                                                    }
                                                                    className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-500/20"
                                                                >
                                                                    {lang === 'RO'
                                                                        ? 'Șterge'
                                                                        : 'Delete'}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div
                                                            className={`text-sm text-(--text) leading-relaxed wrap-anywhere whitespace-pre-wrap ${selectedAnnouncementId === announcement.id ? '' : 'line-clamp-3'}`}
                                                        >
                                                            {announcement.content}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'audit' && (
                                        <motion.div
                                            variants={containerVariants}
                                            className="grid gap-3"
                                        >
                                            {auditLog.map((entry) => (
                                                <motion.div
                                                    variants={itemVariants}
                                                    key={entry.id}
                                                    className="p-4 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <span className="rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                                                                {entry.action}
                                                            </span>
                                                            <span className="text-xs uppercase tracking-widest text-(--text-muted) font-bold">
                                                                {entry.createdAt}
                                                            </span>
                                                        </div>
                                                        <p className="text-(--text-h) font-semibold truncate">
                                                            {entry.targetType}: {entry.targetName}
                                                        </p>
                                                        <p className="text-sm text-(--text-muted) mt-1">
                                                            {entry.details}
                                                        </p>
                                                    </div>

                                                    <div className="text-xs uppercase tracking-widest text-(--text-muted) font-bold">
                                                        {lang === 'RO' ? 'Utilizator:' : 'User:'}{' '}
                                                        {entry.actorUsername}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
