import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useLanguage } from '../language/Language';
import {
    classService,
    type GroupFindResponseDTO,
    type GroupInvitationResponseDTO,
} from '../services/classService';
import { containerVariants, itemVariants, pageVariants } from '../utils/motionConfig';

interface RecentClass {
    id: string;
    name: string;
    description: string | null;
    creatorUsername: string;
    createdAt: string;
}

const RECENT_CLASSES_KEY = 'fiicoder_recent_classes_';

export default function ClassesHub() {
    const { userId } = useAuth();
    const { lang } = useLanguage();

    const [className, setClassName] = useState('');
    const [classDescription, setClassDescription] = useState('');
    const [lookupId, setLookupId] = useState('');
    const [foundClass, setFoundClass] = useState<GroupFindResponseDTO | null>(null);
    const [recentClasses, setRecentClasses] = useState<RecentClass[]>([]);
    const [invitations, setInvitations] = useState<GroupInvitationResponseDTO[]>([]);
    const [loadingInvitations, setLoadingInvitations] = useState(false);
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
            void fetchInvitations();
        }
    }, [userId]);

    const fetchInvitations = async () => {
        if (!userId) return;
        setLoadingInvitations(true);
        try {
            const data = await classService.getMyInvitations();
            setInvitations(
                data.filter((inv: GroupInvitationResponseDTO) => inv.status === 'PENDING'),
            );
        } catch (err: any) {
            console.error('Error fetching invitations:', err);
            setError(
                lang === 'RO' ? 'Eroare la încărcarea invitațiilor.' : 'Error loading invitations.',
            );
        } finally {
            setLoadingInvitations(false);
        }
    };

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
            const data = await classService.getById(lookupId);
            setFoundClass(data);
            storeRecentClass({
                id: data.id,
                name: data.name,
                description: data.description || null,
                creatorUsername: data.creatorUsername,
                createdAt: data.createdAt,
            });
        } catch (err: any) {
            setError(lang === 'RO' ? 'Clasa nu a fost găsită.' : 'Class not found.');
        }
    };

    const handleAcceptInvitation = async (id: string) => {
        try {
            await classService.acceptInvitation(id);
            setInvitations((prev) => prev.filter((inv) => inv.id !== id));
            setFeedback(lang === 'RO' ? 'Invitație acceptată!' : 'Invitation accepted!');
        } catch (err: any) {
            setError(lang === 'RO' ? 'Eroare la acceptare.' : 'Error accepting.');
        }
    };

    const handleDeclineInvitation = async (id: string) => {
        try {
            await classService.declineInvitation(id);
            setInvitations((prev) => prev.filter((inv) => inv.id !== id));
            setFeedback(lang === 'RO' ? 'Invitație refuzată.' : 'Invitation declined.');
        } catch (err: any) {
            setError(lang === 'RO' ? 'Eroare la refuzare.' : 'Error declining.');
        }
    };

    const memoizedRecentClasses = useMemo(
        () => (
            <motion.div variants={containerVariants} className="mt-4 grid gap-3">
                {recentClasses.length === 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-xl border-2 border-(--accent)/20 bg-(--surface-muted) p-3 text-sm text-(--text-muted)"
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
                        className="rounded-xl border-2 border-(--accent)/20 bg-(--surface-muted) p-3 text-sm text-(--text-muted)"
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
                        className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
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
                                    className="rounded-lg border border-(--accent)/50 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/30 transition-colors"
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
        <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
            <motion.div
                className="w-full max-w-7xl rounded-2xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm px-5 py-6 md:px-8 md:py-8 h-auto overflow-visible xl:h-full xl:overflow-y-auto custom-scrollbar"
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
                            className={`mb-6 rounded-xl border-2 px-4 py-3 text-sm ${error ? 'border-red-500/40 bg-red-500/10 text-(--text-h)' : 'border-(--accent)/40 bg-(--accent)/10 text-(--text-h)'}`}
                        >
                            {error || feedback}
                        </motion.div>
                    )}

                    <div className="grid gap-4 md:gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <motion.section
                            variants={itemVariants}
                            className="rounded-xl border border-(--accent)/25 bg-(--surface-card) p-4 md:p-6"
                        >
                            <h2 className="text-xl font-bold text-(--text-h)">
                                {lang === 'RO' ? 'Creează o clasă' : 'Create a class'}
                            </h2>
                            <p className="mt-2 text-xs text-(--text-muted)">
                                {lang === 'RO'
                                    ? 'Backend-ul cere creatorId, deci folosim direct userul din JWT.'
                                    : 'The backend expects creatorId, so we use the user id from the JWT.'}
                            </p>

                            <form onSubmit={handleCreateClass} className="mt-4 space-y-3">
                                <input
                                    value={className}
                                    onChange={(event) => setClassName(event.target.value)}
                                    placeholder={lang === 'RO' ? 'Nume clasă' : 'Class name'}
                                    className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-muted) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                                />
                                <textarea
                                    value={classDescription}
                                    onChange={(event) => setClassDescription(event.target.value)}
                                    placeholder={
                                        lang === 'RO'
                                            ? 'Descriere opțională'
                                            : 'Optional description'
                                    }
                                    className="min-h-24 w-full rounded-xl border border-(--accent)/25 bg-(--surface-muted) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                                >
                                    {lang === 'RO' ? 'Creează clasa' : 'Create class'}
                                </button>
                            </form>
                        </motion.section>
                        <motion.section
                            variants={itemVariants}
                            className="rounded-xl border border-(--accent)/25 bg-(--surface-card) p-4 md:p-6"
                        >
                            <h2 className="text-xl font-bold text-(--text-h)">
                                {lang === 'RO' ? 'Găsește o clasă' : 'Find a class'}
                            </h2>
                            <form
                                onSubmit={handleLookupClass}
                                className="mt-4 flex flex-col sm:flex-row gap-3"
                            >
                                <input
                                    value={lookupId}
                                    onChange={(event) => setLookupId(event.target.value)}
                                    placeholder={lang === 'RO' ? 'UUID clasă' : 'Class UUID'}
                                    className="flex-1 rounded-xl border border-(--accent)/25 bg-(--surface-muted) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                                >
                                    {lang === 'RO' ? 'Caută' : 'Search'}
                                </button>
                            </form>

                            {foundClass && (
                                <motion.div
                                    variants={itemVariants}
                                    className="mt-4 rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-4"
                                >
                                    <h3 className="text-lg font-semibold text-(--text-h)">
                                        {foundClass.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-(--text-muted)">
                                        {foundClass.description ||
                                            (lang === 'RO' ? 'Fără descriere.' : 'No description.')}
                                    </p>
                                    <div className="mt-3 grid gap-1 text-xs text-(--text-muted)">
                                        <div>
                                            {lang === 'RO' ? 'Creată de' : 'Created by'}:{' '}
                                            {foundClass.creatorUsername}
                                        </div>
                                        <div>ID: {foundClass.id}</div>
                                        <div>{foundClass.createdAt}</div>
                                    </div>
                                    <Link
                                        to={`/classes/${foundClass.id}`}
                                        className="mt-3 inline-flex rounded-lg border border-(--accent)/50 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/30 transition-colors"
                                    >
                                        {lang === 'RO' ? 'Deschide clasa' : 'Open class'}
                                    </Link>
                                </motion.div>
                            )}
                        </motion.section>
                    </div>

                    <motion.section
                        variants={itemVariants}
                        className="mt-4 md:mt-6 rounded-xl border-2 border-(--accent)/20 bg-(--surface-card) p-4 md:p-6"
                    >
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
                                    className="rounded-lg border border-(--accent)/35 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/10"
                                >
                                    {lang === 'RO' ? 'Curăță' : 'Clear'}
                                </button>
                            )}
                        </div>

                        {memoizedRecentClasses}
                    </motion.section>

                    <motion.section
                        variants={itemVariants}
                        className="mt-4 md:mt-6 rounded-xl border border-(--accent)/20 bg-(--surface-card) p-4 md:p-6"
                    >
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
        </div>
    );
}
