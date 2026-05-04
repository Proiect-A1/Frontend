import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../services/AuthContext';
import {
    classService,
    type GroupFindResponseDTO,
    type GroupInvitationResponseDTO,
} from '../services/classService';
import { useLanguage } from '../language/Language';
import { itemVariants, pageVariants } from '../utils/motionConfig';

const RECENT_CLASSES_KEY = 'fiicoder_recent_classes';
const MAX_RECENT_CLASSES = 12;

type RecentClassItem = {
    id: string;
    name: string;
    description: string | null;
    creatorUsername: string;
    createdAt: string;
};

function loadRecentClasses(): RecentClassItem[] {
    try {
        const raw = localStorage.getItem(RECENT_CLASSES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as RecentClassItem[];
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((item) => item?.id && item?.name);
    } catch {
        return [];
    }
}

function saveRecentClasses(items: RecentClassItem[]) {
    localStorage.setItem(RECENT_CLASSES_KEY, JSON.stringify(items));
}

export default function ClassesHub() {
    const { lang } = useLanguage();
    const { userId, username, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [className, setClassName] = useState('');
    const [classDescription, setClassDescription] = useState('');
    const [lookupId, setLookupId] = useState('');
    const [foundClass, setFoundClass] = useState<GroupFindResponseDTO | null>(null);
    const [invitations, setInvitations] = useState<GroupInvitationResponseDTO[]>([]);
    const [loadingInvitations, setLoadingInvitations] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [recentClasses, setRecentClasses] = useState<RecentClassItem[]>(() =>
        loadRecentClasses(),
    );

    const storeRecentClass = (newItem: RecentClassItem) => {
        setRecentClasses((previousItems) => {
            const deduped = previousItems.filter((item) => item.id !== newItem.id);
            const nextItems = [newItem, ...deduped].slice(0, MAX_RECENT_CLASSES);
            saveRecentClasses(nextItems);
            return nextItems;
        });
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        let isMounted = true;

        async function loadInvitations() {
            try {
                setLoadingInvitations(true);
                const data = await classService.getMyInvitations();
                if (isMounted) setInvitations(data);
            } catch {
                if (isMounted) setInvitations([]);
            } finally {
                if (isMounted) setLoadingInvitations(false);
            }
        }

        loadInvitations();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated]);

    const handleCreateClass = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setFeedback(null);

        if (!userId) {
            setError(
                lang === 'RO'
                    ? 'Nu am putut identifica userul curent.'
                    : 'Could not identify the current user.',
            );
            return;
        }

        try {
            const response = await classService.create({
                name: className,
                description: classDescription,
                creatorId: userId,
            });

            storeRecentClass({
                id: response.id,
                name: className,
                description: classDescription || null,
                creatorUsername: username || 'unknown',
                createdAt: new Date().toISOString(),
            });

            setFeedback(
                lang === 'RO'
                    ? `Clasa a fost creată: ${response.id}`
                    : `Class created: ${response.id}`,
            );
            setClassName('');
            setClassDescription('');
            navigate(`/classes/${response.id}`);
        } catch (err: any) {
            setError(
                err?.body?.message ||
                    err?.body?.error ||
                    (lang === 'RO' ? 'Nu s-a putut crea clasa.' : 'Could not create the class.'),
            );
        }
    };

    const handleLookupClass = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setFeedback(null);

        try {
            const response = await classService.getById(lookupId.trim());
            setFoundClass(response);
            storeRecentClass({
                id: response.id,
                name: response.name,
                description: response.description,
                creatorUsername: response.creatorUsername,
                createdAt: response.createdAt,
            });
        } catch (err: any) {
            setFoundClass(null);
            setError(
                err?.body?.message ||
                    err?.body?.error ||
                    (lang === 'RO' ? 'Clasa nu a fost găsită.' : 'Class not found.'),
            );
        }
    };

    return (
        <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
            <motion.div
                className="w-full max-w-7xl rounded-2xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm px-5 py-6 md:px-8 md:py-8 h-auto overflow-visible xl:h-full xl:overflow-y-auto custom-scrollbar"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8"
                >
                    <div>
                        <p className="text-xs uppercase tracking-widest text-(--text-muted)">
                            {lang === 'RO' ? 'Clase' : 'Classes'}
                        </p>
                        <h1 className="text-3xl font-bold text-(--text-h) mt-1">
                            {lang === 'RO' ? 'Hub-ul de clase' : 'Class hub'}
                        </h1>
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
                                    lang === 'RO' ? 'Descriere opțională' : 'Optional description'
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
                            <div className="mt-4 rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-4">
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
                            </div>
                        )}
                    </motion.section>
                </div>

                <motion.section
                    variants={itemVariants}
                    className="mt-4 md:mt-6 rounded-xl border border-(--accent)/20 bg-(--surface-card) p-4 md:p-6"
                >
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-(--text-h)">
                            {lang === 'RO' ? 'Clase recente' : 'Recent classes'}
                        </h2>
                        {recentClasses.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setRecentClasses([]);
                                    saveRecentClasses([]);
                                }}
                                className="rounded-lg border border-(--accent)/35 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/10"
                            >
                                {lang === 'RO' ? 'Curăță' : 'Clear'}
                            </button>
                        )}
                    </div>

                    <div className="mt-4 grid gap-3">
                        {recentClasses.length === 0 && (
                            <div className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-3 text-sm text-(--text-muted)">
                                {lang === 'RO'
                                    ? 'Nu ai clase salvate recent. Creează sau caută o clasă și va apărea aici.'
                                    : 'No recent classes yet. Create or search a class and it will appear here.'}
                            </div>
                        )}

                        {recentClasses.map((savedClass) => (
                            <div
                                key={savedClass.id}
                                className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-3"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-base font-semibold text-(--text-h)">
                                            {savedClass.name}
                                        </p>
                                        <p className="text-xs text-(--text-muted) mt-0.5">
                                            {savedClass.description ||
                                                (lang === 'RO'
                                                    ? 'Fără descriere.'
                                                    : 'No description.')}
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
                            </div>
                        ))}
                    </div>
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

                    <div className="mt-4 grid gap-3">
                        {invitations.length === 0 && !loadingInvitations && (
                            <div className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-3 text-sm text-(--text-muted)">
                                {lang === 'RO'
                                    ? 'Nu ai invitații active.'
                                    : 'You have no active invitations.'}
                            </div>
                        )}

                        {invitations.map((invitation) => (
                            <div
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
                                        className="inline-flex self-start rounded-xl border border-(--accent)/50 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/30 transition-colors"
                                    >
                                        {lang === 'RO' ? 'Vezi clasa' : 'View class'}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.section>
            </motion.div>
        </div>
    );
}
