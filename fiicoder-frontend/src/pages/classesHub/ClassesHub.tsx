import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, translations } from '../../language/Language';
import { storage, STORAGE_KEYS } from '../../utils/storage';
import {
    classService,
    type GroupFindResponseDTO,
    type GroupInvitationResponseDTO,
    type GroupMembershipDTO,
} from './services/classService';
import { containerVariants, itemVariants, pageVariants } from '../../utils/motionConfig';
import { toast } from 'sonner';

interface RecentClass {
    id: string;
    name: string;
    description: string | null;
    creatorUsername: string;
    createdAt: string;
}

export default function ClassesHub() {
    const { userId, isAdmin, isProfessor } = useAuth();
    const { lang } = useLanguage();
    const t = translations[lang];
    const queryClient = useQueryClient();

    const canCreateGroup = isAdmin || isProfessor;

    const [className, setClassName] = useState('');
    const [classDescription, setClassDescription] = useState('');
    const [lookupId, setLookupId] = useState('');
    const [foundClass, setFoundClass] = useState<GroupFindResponseDTO | null>(null);
    const [recentClasses, setRecentClasses] = useState<RecentClass[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const loadRecentClasses = (uid: string): RecentClass[] =>
        storage.getJson<RecentClass[]>(STORAGE_KEYS.recentClasses(uid), []);

    const saveRecentClasses = (uid: string, classes: RecentClass[]) => {
        storage.setJson(STORAGE_KEYS.recentClasses(uid), classes.slice(0, 10));
    };

    const storeRecentClass = (c: RecentClass) => {
        if (!userId) return;
        setRecentClasses((prev) => {
            const filtered = prev.filter((item) => item.id !== c.id);
            const updated = [c, ...filtered].slice(0, 10);
            saveRecentClasses(userId, updated);
            return updated;
        });
    };

    useEffect(() => {
        if (userId) {
            setRecentClasses(loadRecentClasses(userId));
        }
    }, [userId]);

    const invitationsQuery = useQuery({
        queryKey: ['class-invitations', userId],
        enabled: !!userId,
        queryFn: async () => {
            const data = await classService.getMyInvitations();
            return data.filter((inv: GroupInvitationResponseDTO) => inv.status === 'PENDING');
        },
    });

    const myGroupsQuery = useQuery({
        queryKey: ['my-groups', userId],
        enabled: !!userId,
        queryFn: () => classService.getMyGroups(),
    });

    const invitations = invitationsQuery.data ?? [];
    const loadingInvitations = invitationsQuery.isPending;
    const myGroups = myGroupsQuery.data ?? [];
    const loadingMyGroups = myGroupsQuery.isPending;

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFeedback(null);

        if (!className.trim()) {
            setError(t.classNameRequired);
            return;
        }

        try {
            const newClass = await classService.create({
                name: className,
                description: classDescription,
                creatorId: userId!,
            });
            setFeedback(t.classCreatedSuccess);
            toast.success(t.classCreatedShort);
            setClassName('');
            setClassDescription('');
            storeRecentClass({
                id: newClass.id,
                name: className,
                description: classDescription || null,
                creatorUsername: 'me',
                createdAt: new Date().toISOString(),
            });
        } catch (err: any) {
            setError(t.classCreateError);
        }
    };

    const handleLookupClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFeedback(null);
        setFoundClass(null);

        if (!lookupId.trim()) {
            setError(t.classIdRequired);
            return;
        }

        try {
            const data = await queryClient.fetchQuery({
                queryKey: ['class-lookup', lookupId],
                queryFn: () => classService.getById(lookupId),
            });
            setFoundClass(data);
            storeRecentClass({
                id: data.id,
                name: data.name,
                description: data.description || null,
                creatorUsername: data.creatorUsername,
                createdAt: data.createdAt,
            });
        } catch (err: any) {
            if (err?.status === 403) {
                setError(t.classAccessDeniedInvite);
            } else if (err?.status === 404) {
                setError(t.classNotFoundMsg);
            } else {
                setError(t.classLookupError);
            }
        }
    };

    const handleAcceptInvitation = async (id: string) => {
        try {
            await classService.acceptInvitation(id);
            await invitationsQuery.refetch();
            setFeedback(t.invitationAccepted);
            toast.success(t.invitationAcceptedMsg);
        } catch (err: any) {
            setError(t.invitationAcceptError);
            toast.error(t.invitationAcceptError);
        }
    };

    const handleDeclineInvitation = async (id: string) => {
        try {
            await classService.declineInvitation(id);
            await invitationsQuery.refetch();
            setFeedback(t.invitationDeclined);
            toast.success(t.invitationDeclinedMsg);
        } catch (err: any) {
            setError(t.invitationDeclineError);
            toast.error(t.invitationDeclineError);
        }
    };

    const memoizedRecentClasses = useMemo(
        () => (
            <motion.div variants={containerVariants} className="mt-4 grid gap-3">
                {recentClasses.length === 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border-2 border-(--accent)/20 bg-(--surface-muted) p-3 text-sm text-(--text-muted)"
                    >
                        {t.noRecentClasses}
                    </motion.div>
                )}

                {recentClasses.map((savedClass) => (
                    <motion.div
                        variants={itemVariants}
                        key={savedClass.id}
                        className="rounded-xl border-2 border-(--accent)/20 bg-(--surface-muted) p-3"
                    >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-base font-semibold text-(--text-h)">
                                    {savedClass.name}
                                </p>
                                <p className="text-xs text-(--text-muted) mt-0.5">
                                    {savedClass.description ||
                                        t.noDescription}
                                </p>
                                <p className="text-[10px] text-(--text-muted) mt-1">
                                    Creator:{' '}
                                    {savedClass.creatorUsername}
                                </p>
                            </div>
                            <Link
                                to={`/classes/${savedClass.id}`}
                                className="inline-flex self-start rounded-xl border border-(--accent)/50 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/30 transition-colors"
                            >
                                {t.openClassBtn}
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        ),
        [recentClasses, lang],
    );

    const memoizedInvitations = useMemo(
        () => (
            <motion.div variants={containerVariants} className="mt-4 grid gap-3">
                {invitations.length === 0 && !loadingInvitations && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border-2 border-(--accent)/20 bg-(--surface-muted) p-3 text-sm text-(--text-muted)"
                    >
                        {error?.includes('invita') || error?.includes('fetch')
                            ? t.invitationsServerError
                            : t.noActiveInvitations}
                    </motion.div>
                )}

                {invitations.map((invitation) => (
                    <motion.div
                        variants={itemVariants}
                        key={invitation.id}
                        className="rounded-2xl border border-(--accent)/20 bg-(--surface-muted) p-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                    >
                        <div>
                            <p className="text-base font-semibold text-(--text-h)">
                                {invitation.studyClass?.name || t.invitedClassFallback}
                            </p>
                            <p className="text-xs text-(--text-muted) mt-0.5">
                                {t.statusLabel}: {invitation.status}
                            </p>
                            <p className="text-[10px] text-(--text-muted) mt-0.5">
                                {invitation.sentAt}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => handleAcceptInvitation(invitation.id)}
                                className="rounded-lg bg-emerald-500/20 border border-emerald-500/50 px-3 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 transition-colors"
                            >
                                {t.acceptBtn}
                            </button>
                            <button
                                onClick={() => handleDeclineInvitation(invitation.id)}
                                className="rounded-lg bg-red-500/20 border border-red-500/50 px-3 py-1.5 text-xs font-bold text-red-200 hover:bg-red-500/30 transition-colors"
                            >
                                {t.declineBtn}
                            </button>
                            {invitation.studyClass?.id && (
                                <Link
                                    to={`/classes/${invitation.studyClass.id}`}
                                    onClick={() => {
                                        if (invitation.studyClass) {
                                            storeRecentClass({
                                                id: invitation.studyClass.id,
                                                name: invitation.studyClass.name,
                                                description:
                                                    invitation.studyClass.description || null,
                                                creatorUsername:
                                                    invitation.studyClass.creator?.username ||
                                                    'unknown',
                                                createdAt:
                                                    invitation.studyClass.createdAt ||
                                                    new Date().toISOString(),
                                            });
                                        }
                                    }}
                                    className="rounded-2xl border border-(--accent)/50 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/30 transition-colors"
                                >
                                    {t.classViewBtn}
                                </Link>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        ),
        [invitations, loadingInvitations, error, lang],
    );

    return (
        <motion.div
            className="w-full max-w-7xl mx-auto rounded-3xl border-2 border-(--accent) bg-(--surface-card) card-glow backdrop-blur-sm px-5 py-6 md:px-8 md:py-8 h-auto overflow-visible xl:h-full xl:overflow-y-auto custom-scrollbar xl:flex-1 xl:min-h-0"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-5"
                >
                    <div>
                        <p className="text-xs uppercase tracking-widest text-(--text-muted)">
                            {t.classesEyebrow}
                        </p>
                        <h1 className="text-3xl font-bold text-(--text-h) mt-1">
                            {t.classHubTitle}
                        </h1>
                        <div className="page-line-horizontal mb-0!" />
                    </div>
                    <Link
                        to="/problems"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-full font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                    >
                        {t.goToProblems}
                    </Link>
                </motion.div>

                {(feedback || error) && (
                    <motion.div
                        variants={itemVariants}
                        className={`mb-6 rounded-2xl border-2 px-4 py-3 text-sm ${error ? 'border-red-500/40 bg-red-500/10 text-(--text-h)' : 'border-(--accent)/40 bg-(--accent)/10 text-(--text-h)'}`}
                    >
                        {error || feedback}
                    </motion.div>
                )}

                <div
                    className={`grid gap-4 md:gap-6 ${canCreateGroup ? 'xl:grid-cols-[1fr_1fr]' : 'xl:grid-cols-1'}`}
                >
                    {canCreateGroup && (
                        <motion.section
                            variants={itemVariants}
                            className="rounded-2xl border border-(--accent)/20 bg-(--surface-muted) p-4 flex flex-col"
                        >
                            <h2 className="text-xl font-bold text-(--text-h) mb-4">
                                {t.createClassSection}
                            </h2>

                            <form onSubmit={handleCreateClass} className="space-y-3 flex flex-col">
                                <input
                                    value={className}
                                    onChange={(event) => setClassName(event.target.value)}
                                    placeholder={t.classNamePlaceholder}
                                    className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                                />
                                <textarea
                                    value={classDescription}
                                    onChange={(event) => setClassDescription(event.target.value)}
                                    placeholder={t.classOptionalDesc}
                                    className="min-h-24 w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                                />
                                <button
                                    type="submit"
                                    className="w-full mt-auto inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                                >
                                    {t.createClassBtn}
                                </button>
                            </form>
                        </motion.section>
                    )}
                    <motion.section
                        variants={itemVariants}
                        className="rounded-2xl border border-(--accent)/20 bg-(--surface-muted) p-4 flex flex-col"
                    >
                        <h2 className="text-xl font-bold text-(--text-h) mb-4">
                            {t.findClassSection}
                        </h2>
                        <form onSubmit={handleLookupClass} className="space-y-3 flex flex-col">
                            <input
                                value={lookupId}
                                onChange={(event) => setLookupId(event.target.value)}
                                placeholder={t.classUuidPlaceholder}
                                className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                            />
                            <button
                                type="submit"
                                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                            >
                                {t.classSearchBtn}
                            </button>
                        </form>

                        {foundClass && (
                            <motion.div
                                variants={itemVariants}
                                className="mt-4 rounded-xl border border-(--accent)/20 bg-(--surface-card) p-3"
                            >
                                <h3 className="text-sm font-semibold text-(--text-h)">
                                    {foundClass.name}
                                </h3>
                                <p className="mt-1 text-xs text-(--text-muted)">
                                    {foundClass.description ||
                                        t.noDescription}
                                </p>
                                <div className="mt-2 space-y-1 text-[11px] text-(--text-muted)">
                                    <div>
                                        {t.createdByLabel}:{' '}
                                        {foundClass.creatorUsername}
                                    </div>
                                    {typeof foundClass.memberCount === 'number' && (
                                        <div>
                                            {t.membersLabel}:{' '}
                                            {foundClass.memberCount}
                                        </div>
                                    )}
                                    <div className="font-mono break-all">{foundClass.id}</div>
                                </div>
                                <Link
                                    to={`/classes/${foundClass.id}`}
                                    className="mt-3 inline-flex rounded-xl border border-(--accent)/50 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/30 transition-colors"
                                >
                                    {t.openClassBtn}
                                </Link>
                            </motion.div>
                        )}
                    </motion.section>
                </div>

                <motion.section variants={itemVariants} className="mt-4 md:mt-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-(--text-h)">
                            {t.recentClassesSection}
                        </h2>
                        {recentClasses.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (userId) {
                                        setRecentClasses([]);
                                        saveRecentClasses(userId, []);
                                    }
                                }}
                                className="rounded-2xl border border-(--accent)/35 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/10"
                            >
                                {t.clearBtn}
                            </button>
                        )}
                    </div>

                    {memoizedRecentClasses}
                </motion.section>

                <motion.section variants={itemVariants} className="mt-4 md:mt-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-(--text-h)">
                            {t.myGroupsSection}
                        </h2>
                        {loadingMyGroups && (
                            <span className="text-xs text-(--text-muted)">
                                {t.loadingLabel}
                            </span>
                        )}
                    </div>

                    <motion.div variants={containerVariants} className="mt-4 grid gap-3">
                        {!loadingMyGroups && myGroups.length === 0 && (
                            <motion.div
                                variants={itemVariants}
                                className="rounded-2xl border-2 border-(--accent)/20 bg-(--surface-muted) p-3 text-sm text-(--text-muted)"
                            >
                                {t.noMyGroups}
                            </motion.div>
                        )}

                        {myGroups.map((group: GroupMembershipDTO) => (
                            <motion.div
                                variants={itemVariants}
                                key={group.id}
                                className="rounded-xl border-2 border-(--accent)/20 bg-(--surface-muted) p-3"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-base font-semibold text-(--text-h)">
                                                {group.name}
                                            </p>
                                            {group.isCreator && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-(--accent)/40 bg-(--accent)/15 text-(--text-h)">
                                                    Creator
                                                </span>
                                            )}
                                            {typeof group.memberCount === 'number' && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-(--accent)/30 bg-(--surface-card) text-(--text-h)">
                                                    {group.memberCount}{' '}
                                                    {t.membersCount}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-(--text-muted) mt-0.5">
                                            {group.description ||
                                                t.noDescription}
                                        </p>
                                        <p className="text-[10px] text-(--text-muted) mt-1">
                                            {lang === 'RO' ? 'Creator' : 'Created by'}:{' '}
                                            {group.creatorUsername}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 self-start shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/classes/${group.id}`);
                                                toast.success(t.linkCopied);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-xl border border-(--accent)/30 px-3 py-1.5 text-xs font-semibold text-(--text-muted) hover:bg-(--accent)/15 hover:text-(--text-h) transition-colors"
                                            title={t.copyLinkTitle}
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            Link
                                        </button>
                                        <Link
                                            to={`/classes/${group.id}`}
                                            className="inline-flex rounded-xl border border-(--accent)/50 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/30 transition-colors"
                                        >
                                            {t.openBtn}
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>

                <motion.section variants={itemVariants} className="mt-4 md:mt-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-(--text-h)">
                            {t.myInvitationsSection}
                        </h2>
                        {loadingInvitations && (
                            <span className="text-xs text-(--text-muted)">
                                {t.loadingLabel}
                            </span>
                        )}
                    </div>

                    {memoizedInvitations}
                </motion.section>
            </motion.div>
        </motion.div>
    );
}
