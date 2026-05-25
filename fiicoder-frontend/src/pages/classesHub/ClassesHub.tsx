import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../language/Language';
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

const RECENT_CLASSES_KEY = 'fiicoder_recent_classes_';

export default function ClassesHub() {
    const { userId, isAdmin, isProfessor } = useAuth();
    const { lang } = useLanguage();
    const queryClient = useQueryClient();

    const canCreateGroup = isAdmin || isProfessor;

    const [className, setClassName] = useState('');
    const [classDescription, setClassDescription] = useState('');
    const [lookupId, setLookupId] = useState('');
    const [foundClass, setFoundClass] = useState<GroupFindResponseDTO | null>(null);
    const [recentClasses, setRecentClasses] = useState<RecentClass[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const getRecentClassesKey = (uid: string) => `${RECENT_CLASSES_KEY}${uid}`;

    const loadRecentClasses = (uid: string): RecentClass[] => {
        const stored = localStorage.getItem(getRecentClassesKey(uid));
        if (!stored) return [];
        try {
            return JSON.parse(stored) as RecentClass[];
        } catch {
            return [];
        }
    };

    const saveRecentClasses = (uid: string, classes: RecentClass[]) => {
        localStorage.setItem(getRecentClassesKey(uid), JSON.stringify(classes.slice(0, 5)));
    };

    const storeRecentClass = (c: RecentClass) => {
        if (!userId) return;
        setRecentClasses((prev) => {
            const filtered = prev.filter((item) => item.id !== c.id);
            const updated = [c, ...filtered].slice(0, 5);
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
            setError(lang === 'RO' ? 'Numele clasei este obligatoriu.' : 'Class name is required.');
            return;
        }

        try {
            const newClass = await classService.create({
                name: className,
                description: classDescription,
                creatorId: userId!,
            });
            setFeedback(
                lang === 'RO' ? 'Clasa a fost creată cu succes!' : 'Class created successfully!',
            );
            toast.success(lang === 'RO' ? 'Clasa a fost creată.' : 'Class created.');
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
            setError(lang === 'RO' ? 'Eroare la crearea clasei.' : 'Error creating class.');
        }
    };

    const handleLookupClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFeedback(null);
        setFoundClass(null);

        if (!lookupId.trim()) {
            setError(lang === 'RO' ? 'Introdu un ID valid.' : 'Enter a valid ID.');
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
                setError(
                    lang === 'RO'
                        ? 'Nu ai acces la această clasă. Cere o invitație de la creator.'
                        : 'You do not have access to this class. Ask the creator for an invitation.',
                );
            } else if (err?.status === 404) {
                setError(lang === 'RO' ? 'Clasa nu a fost găsită.' : 'Class not found.');
            } else {
                setError(
                    lang === 'RO' ? 'Eroare la căutarea clasei.' : 'Error looking up class.',
                );
            }
        }
    };

    const handleAcceptInvitation = async (id: string) => {
        try {
            await classService.acceptInvitation(id);
            await invitationsQuery.refetch();
            setFeedback(lang === 'RO' ? 'Invitație acceptată!' : 'Invitation accepted!');
            toast.success(lang === 'RO' ? 'Invitația a fost acceptată.' : 'Invitation accepted.');
        } catch (err: any) {
            setError(lang === 'RO' ? 'Eroare la acceptare.' : 'Error accepting.');
            toast.error(lang === 'RO' ? 'Eroare la acceptare.' : 'Error accepting.');
        }
    };

    const handleDeclineInvitation = async (id: string) => {
        try {
            await classService.declineInvitation(id);
            await invitationsQuery.refetch();
            setFeedback(lang === 'RO' ? 'Invitație refuzată.' : 'Invitation declined.');
            toast.success(lang === 'RO' ? 'Invitația a fost refuzată.' : 'Invitation declined.');
        } catch (err: any) {
            setError(lang === 'RO' ? 'Eroare la refuzare.' : 'Error declining.');
            toast.error(lang === 'RO' ? 'Eroare la refuzare.' : 'Error declining.');
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
                        {lang === 'RO'
                            ? 'Nu ai clase salvate recent. Creează sau caută o clasă și va apărea aici.'
                            : 'No recent classes yet. Create or search a class and it will appear here.'}
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
                                        (lang === 'RO' ? 'Fără descriere.' : 'No description.')}
                                </p>
                                <p className="text-[10px] text-(--text-muted) mt-1">
                                    {lang === 'RO' ? 'Creator' : 'Creator'}:{' '}
                                    {savedClass.creatorUsername}
                                </p>
                            </div>
                            <Link
                                to={`/classes/${savedClass.id}`}
                                className="inline-flex self-start rounded-xl border border-(--accent)/50 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/30 transition-colors"
                            >
                                {lang === 'RO' ? 'Deschide clasa' : 'Open class'}
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
                            ? lang === 'RO'
                                ? 'Eroare la comunicarea cu serverul pentru invitații.'
                                : 'Server error while fetching invitations.'
                            : lang === 'RO'
                              ? 'Nu ai invitații active.'
                              : 'You have no active invitations.'}
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
                                {invitation.studyClass?.name ||
                                    (lang === 'RO' ? 'Clasă invitată' : 'Invited class')}
                            </p>
                            <p className="text-xs text-(--text-muted) mt-0.5">
                                {lang === 'RO' ? 'Status' : 'Status'}: {invitation.status}
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
                                {lang === 'RO' ? 'Acceptă' : 'Accept'}
                            </button>
                            <button
                                onClick={() => handleDeclineInvitation(invitation.id)}
                                className="rounded-lg bg-red-500/20 border border-red-500/50 px-3 py-1.5 text-xs font-bold text-red-200 hover:bg-red-500/30 transition-colors"
                            >
                                {lang === 'RO' ? 'Refuză' : 'Decline'}
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
                                    {lang === 'RO' ? 'Vezi' : 'View'}
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
                            {lang === 'RO' ? 'Clase' : 'Classes'}
                        </p>
                        <h1 className="text-3xl font-bold text-(--text-h) mt-1">
                            {lang === 'RO' ? 'Hub-ul de clase' : 'Class hub'}
                        </h1>
                        <div className="page-line-horizontal mb-0!" />
                    </div>
                    <Link
                        to="/problems"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-full font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                    >
                        {lang === 'RO' ? 'Mergi la probleme' : 'Go to problems'}
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
                                {lang === 'RO' ? 'Creează o clasă' : 'Create a class'}
                            </h2>

                            <form onSubmit={handleCreateClass} className="space-y-3 flex flex-col">
                                <input
                                    value={className}
                                    onChange={(event) => setClassName(event.target.value)}
                                    placeholder={lang === 'RO' ? 'Nume clasă' : 'Class name'}
                                    className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                                />
                                <textarea
                                    value={classDescription}
                                    onChange={(event) => setClassDescription(event.target.value)}
                                    placeholder={
                                        lang === 'RO'
                                            ? 'Descriere opțională'
                                            : 'Optional description'
                                    }
                                    className="min-h-24 w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                                />
                                <button
                                    type="submit"
                                    className="w-full mt-auto inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                                >
                                    {lang === 'RO' ? 'Creează clasa' : 'Create class'}
                                </button>
                            </form>
                        </motion.section>
                    )}
                    <motion.section
                        variants={itemVariants}
                        className="rounded-2xl border border-(--accent)/20 bg-(--surface-muted) p-4 flex flex-col"
                    >
                        <h2 className="text-xl font-bold text-(--text-h) mb-4">
                            {lang === 'RO' ? 'Găsește o clasă' : 'Find a class'}
                        </h2>
                        <form onSubmit={handleLookupClass} className="space-y-3 flex flex-col">
                            <input
                                value={lookupId}
                                onChange={(event) => setLookupId(event.target.value)}
                                placeholder={lang === 'RO' ? 'UUID clasă' : 'Class UUID'}
                                className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                            />
                            <button
                                type="submit"
                                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                            >
                                {lang === 'RO' ? 'Caută' : 'Search'}
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
                                        (lang === 'RO' ? 'Fără descriere.' : 'No description.')}
                                </p>
                                <div className="mt-2 space-y-1 text-[11px] text-(--text-muted)">
                                    <div>
                                        {lang === 'RO' ? 'Creată de' : 'Created by'}:{' '}
                                        {foundClass.creatorUsername}
                                    </div>
                                    {typeof foundClass.memberCount === 'number' && (
                                        <div>
                                            {lang === 'RO' ? 'Membri' : 'Members'}:{' '}
                                            {foundClass.memberCount}
                                        </div>
                                    )}
                                    <div className="font-mono break-all">{foundClass.id}</div>
                                </div>
                                <Link
                                    to={`/classes/${foundClass.id}`}
                                    className="mt-3 inline-flex rounded-xl border border-(--accent)/50 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/30 transition-colors"
                                >
                                    {lang === 'RO' ? 'Deschide clasa' : 'Open class'}
                                </Link>
                            </motion.div>
                        )}
                    </motion.section>
                </div>

                <motion.section variants={itemVariants} className="mt-4 md:mt-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-(--text-h)">
                            {lang === 'RO' ? 'Clase recente' : 'Recent classes'}
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
                                {lang === 'RO' ? 'Curăță' : 'Clear'}
                            </button>
                        )}
                    </div>

                    {memoizedRecentClasses}
                </motion.section>

                <motion.section variants={itemVariants} className="mt-4 md:mt-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-(--text-h)">
                            {lang === 'RO' ? 'Grupurile mele' : 'My groups'}
                        </h2>
                        {loadingMyGroups && (
                            <span className="text-xs text-(--text-muted)">
                                {lang === 'RO' ? 'Se încarcă...' : 'Loading...'}
                            </span>
                        )}
                    </div>

                    <motion.div variants={containerVariants} className="mt-4 grid gap-3">
                        {!loadingMyGroups && myGroups.length === 0 && (
                            <motion.div
                                variants={itemVariants}
                                className="rounded-2xl border-2 border-(--accent)/20 bg-(--surface-muted) p-3 text-sm text-(--text-muted)"
                            >
                                {lang === 'RO'
                                    ? 'Nu faci parte din niciun grup. Creează unul sau acceptă o invitație.'
                                    : 'You are not part of any group. Create one or accept an invitation.'}
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
                                                    {lang === 'RO' ? 'Creator' : 'Creator'}
                                                </span>
                                            )}
                                            {typeof group.memberCount === 'number' && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-(--accent)/30 bg-(--surface-card) text-(--text-h)">
                                                    {group.memberCount}{' '}
                                                    {lang === 'RO' ? 'membri' : 'members'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-(--text-muted) mt-0.5">
                                            {group.description ||
                                                (lang === 'RO' ? 'Fără descriere.' : 'No description.')}
                                        </p>
                                        <p className="text-[10px] text-(--text-muted) mt-1">
                                            {lang === 'RO' ? 'Creator' : 'Created by'}:{' '}
                                            {group.creatorUsername}
                                        </p>
                                    </div>
                                    <Link
                                        to={`/classes/${group.id}`}
                                        className="inline-flex self-start shrink-0 rounded-xl border border-(--accent)/50 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/30 transition-colors"
                                    >
                                        {lang === 'RO' ? 'Deschide' : 'Open'}
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>

                <motion.section variants={itemVariants} className="mt-4 md:mt-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-(--text-h)">
                            {lang === 'RO' ? 'Invitațiile mele' : 'My invitations'}
                        </h2>
                        {loadingInvitations && (
                            <span className="text-xs text-(--text-muted)">
                                {lang === 'RO' ? 'Se încarcă...' : 'Loading...'}
                            </span>
                        )}
                    </div>

                    {memoizedInvitations}
                </motion.section>
            </motion.div>
        </motion.div>
    );
}
