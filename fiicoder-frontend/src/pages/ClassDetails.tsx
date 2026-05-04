import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../services/AuthContext';
import { classService, type GroupFindResponseDTO } from '../services/classService';
import {
    homeworkService,
    type HomeworkDetailDTO,
    type HomeworkResponseDTO,
    type HomeworkUpdateDeleteRequestDTO,
    type HomeworkUpdateRequestDTO,
} from '../services/homeworkService';
import { useLanguage } from '../language/Language';
import { itemVariants, pageVariants } from '../utils/motionConfig';

function getHomeworkBadge(status: HomeworkResponseDTO['status']) {
    switch (status) {
        case 'ACTIVE':
            return 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200';
        case 'DRAFT':
            return 'border-amber-400/40 bg-amber-500/10 text-amber-200';
        default:
            return 'border-(--accent)/20 bg-(--accent)/5 text-(--text-muted)';
    }
}

function parseCsvValues(rawInput: string): string[] {
    return rawInput
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
}

export default function ClassDetails() {
    const { groupId } = useParams();
    const { lang } = useLanguage();
    const { userId } = useAuth();

    const [group, setGroup] = useState<GroupFindResponseDTO | null>(null);
    const [homeworks, setHomeworks] = useState<HomeworkResponseDTO[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [homeworkTitle, setHomeworkTitle] = useState('');
    const [homeworkDescription, setHomeworkDescription] = useState('');
    const [homeworkDeadline, setHomeworkDeadline] = useState('');
    const [homeworkCreationUsernames, setHomeworkCreationUsernames] = useState('');
    const [homeworkCreationProblems, setHomeworkCreationProblems] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);
    const [selectedHomeworkDetail, setSelectedHomeworkDetail] = useState<HomeworkDetailDTO | null>(
        null,
    );
    const [loadingHomeworkId, setLoadingHomeworkId] = useState<string | null>(null);
    const [addUsernamesInput, setAddUsernamesInput] = useState('');
    const [addProblemTitlesInput, setAddProblemTitlesInput] = useState('');
    const [addDeadline, setAddDeadline] = useState('');
    const [removeUsernamesInput, setRemoveUsernamesInput] = useState('');
    const [removeProblemTitlesInput, setRemoveProblemTitlesInput] = useState('');

    useEffect(() => {
        if (!groupId) return;
        const currentGroupId = groupId;

        let isMounted = true;

        async function loadData() {
            try {
                setLoading(true);
                const [groupData, homeworkData] = await Promise.all([
                    classService.getById(currentGroupId),
                    homeworkService.getAll(currentGroupId),
                ]);
                if (!isMounted) return;
                setGroup(groupData);
                setHomeworks(homeworkData);
            } catch (err: any) {
                if (isMounted) {
                    setError(
                        err?.body?.message ||
                            err?.body?.error ||
                            (lang === 'RO'
                                ? 'Nu am putut încărca clasa.'
                                : 'Could not load the class.'),
                    );
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadData();

        return () => {
            isMounted = false;
        };
    }, [groupId, lang]);

    const reloadHomeworks = async () => {
        if (!groupId) return;
        const data = await homeworkService.getAll(groupId);
        setHomeworks(data);
    };

    useEffect(() => {
        if (!groupId || !selectedHomeworkId) {
            setSelectedHomeworkDetail(null);
            return;
        }

        const currentGroupId = groupId;
        const currentHomeworkId = selectedHomeworkId;

        let cancelled = false;

        async function loadHomeworkDetails() {
            try {
                setLoadingHomeworkId(currentHomeworkId);
                const details = await homeworkService.getById(currentGroupId, currentHomeworkId);
                if (!cancelled) {
                    setSelectedHomeworkDetail(details);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(
                        err?.body?.message ||
                            err?.body?.error ||
                            (lang === 'RO'
                                ? 'Nu am putut încărca detaliile temei.'
                                : 'Could not load homework details.'),
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingHomeworkId(null);
                }
            }
        }

        void loadHomeworkDetails();

        return () => {
            cancelled = true;
        };
    }, [groupId, selectedHomeworkId, lang]);

    const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!groupId) return;
        try {
            setError(null);
            setFeedback(null);
            await classService.inviteUser(groupId, { email: inviteEmail });
            setInviteEmail('');
            setFeedback(lang === 'RO' ? 'Invitația a fost trimisă.' : 'Invitation sent.');
        } catch (err: any) {
            setError(
                err?.body?.message ||
                    err?.body?.error ||
                    (lang === 'RO'
                        ? 'Nu am putut trimite invitația.'
                        : 'Could not send invitation.'),
            );
        }
    };

    const handleCreateHomework = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!groupId) return;
        try {
            setError(null);
            setFeedback(null);

            const trimmedTitle = homeworkTitle.trim();

            // Validate title is not empty
            if (!trimmedTitle) {
                setError(lang === 'RO' ? 'Titlul temei este obligatoriu.' : 'Homework title is required.');
                return;
            }

            // Validate title uniqueness within group
            const duplicateExists = homeworks.some(
                (hw) => hw.title.toLowerCase() === trimmedTitle.toLowerCase(),
            );
            if (duplicateExists) {
                setError(
                    lang === 'RO'
                        ? 'O temă cu acest titlu există deja în grup.'
                        : 'A homework with this title already exists in this group.',
                );
                return;
            }

            const response = await homeworkService.create(groupId, {
                title: trimmedTitle,
                description: homeworkDescription,
                deadline: homeworkDeadline,
            });

            const usernames = parseCsvValues(homeworkCreationUsernames);
            const problemTitles = parseCsvValues(homeworkCreationProblems);

            if (usernames.length > 0 || problemTitles.length > 0) {
                const updateRequest: HomeworkUpdateRequestDTO = {};
                if (usernames.length > 0) updateRequest.usernames = usernames;
                if (problemTitles.length > 0) updateRequest.problemTitles = problemTitles;

                await homeworkService.addToDraft(groupId, response.id, updateRequest);
            }

            setHomeworkTitle('');
            setHomeworkDescription('');
            setHomeworkDeadline('');
            setHomeworkCreationUsernames('');
            setHomeworkCreationProblems('');
            setFeedback(lang === 'RO' ? 'Tema a fost creată.' : 'Homework created.');
            await reloadHomeworks();
        } catch (err: any) {
            setError(
                err?.body?.message ||
                    err?.body?.error ||
                    (lang === 'RO' ? 'Nu am putut crea tema.' : 'Could not create homework.'),
            );
        }
    };

    const handleDeleteHomework = async (homeworkId: string) => {
        if (!groupId) return;
        try {
            setError(null);
            setFeedback(null);
            await homeworkService.delete(groupId, homeworkId);
            setFeedback(lang === 'RO' ? 'Tema a fost ștearsă.' : 'Homework deleted.');
            await reloadHomeworks();
        } catch (err: any) {
            setError(
                err?.body?.message ||
                    err?.body?.error ||
                    (lang === 'RO' ? 'Nu am putut șterge tema.' : 'Could not delete homework.'),
            );
        }
    };

    const handleShowHomeworkDetails = async (homeworkId: string) => {
        if (selectedHomeworkId === homeworkId) {
            setSelectedHomeworkId(null);
            setSelectedHomeworkDetail(null);
            return;
        }

        setError(null);
        setSelectedHomeworkId(homeworkId);
    };

    const handlePublishHomework = async (homeworkId: string) => {
        if (!groupId) return;
        try {
            setError(null);
            setFeedback(null);
            await homeworkService.publish(groupId, homeworkId);
            setFeedback(lang === 'RO' ? 'Tema a fost publicată.' : 'Homework published.');
            await reloadHomeworks();
            if (selectedHomeworkId === homeworkId) {
                const details = await homeworkService.getById(groupId, homeworkId);
                setSelectedHomeworkDetail(details);
            }
        } catch (err: any) {
            setError(
                err?.body?.message ||
                    err?.body?.error ||
                    (lang === 'RO'
                        ? 'Nu am putut publica tema.'
                        : 'Could not publish homework.'),
            );
        }
    };

    const handleAddToDraft = async (homeworkId: string) => {
        if (!groupId) return;

        const request: HomeworkUpdateRequestDTO = {};
        const usernames = parseCsvValues(addUsernamesInput);
        const problemTitles = parseCsvValues(addProblemTitlesInput);

        if (usernames.length > 0) request.usernames = usernames;
        if (problemTitles.length > 0) request.problemTitles = problemTitles;
        if (addDeadline.trim().length > 0) request.deadline = addDeadline;

        if (!request.usernames && !request.problemTitles && !request.deadline) {
            setError(
                lang === 'RO'
                    ? 'Completează cel puțin un câmp pentru actualizare.'
                    : 'Fill at least one field for update.',
            );
            return;
        }

        try {
            setError(null);
            setFeedback(null);
            await homeworkService.addToDraft(groupId, homeworkId, request);
            setFeedback(
                lang === 'RO'
                    ? 'Tema draft a fost actualizată (add).'
                    : 'Draft homework updated (add).',
            );
            setAddUsernamesInput('');
            setAddProblemTitlesInput('');
            setAddDeadline('');
            await reloadHomeworks();

            if (selectedHomeworkId === homeworkId) {
                const details = await homeworkService.getById(groupId, homeworkId);
                setSelectedHomeworkDetail(details);
            }
        } catch (err: any) {
            setError(
                err?.body?.message ||
                    err?.body?.error ||
                    (lang === 'RO'
                        ? 'Nu am putut adăuga date în temă.'
                        : 'Could not add data to homework.'),
            );
        }
    };

    const handleRemoveFromDraft = async (homeworkId: string) => {
        if (!groupId) return;

        const request: HomeworkUpdateDeleteRequestDTO = {};
        const usernames = parseCsvValues(removeUsernamesInput);
        const problemTitles = parseCsvValues(removeProblemTitlesInput);

        if (usernames.length > 0) request.usernames = usernames;
        if (problemTitles.length > 0) request.problemTitles = problemTitles;

        if (!request.usernames && !request.problemTitles) {
            setError(
                lang === 'RO'
                    ? 'Completează cel puțin username-uri sau probleme pentru ștergere.'
                    : 'Provide usernames or problems to remove.',
            );
            return;
        }

        try {
            setError(null);
            setFeedback(null);
            await homeworkService.removeFromDraft(groupId, homeworkId, request);
            setFeedback(
                lang === 'RO'
                    ? 'Tema draft a fost actualizată (delete).'
                    : 'Draft homework updated (delete).',
            );
            setRemoveUsernamesInput('');
            setRemoveProblemTitlesInput('');
            await reloadHomeworks();

            if (selectedHomeworkId === homeworkId) {
                const details = await homeworkService.getById(groupId, homeworkId);
                setSelectedHomeworkDetail(details);
            }
        } catch (err: any) {
            setError(
                err?.body?.message ||
                    err?.body?.error ||
                    (lang === 'RO'
                        ? 'Nu am putut șterge date din temă.'
                        : 'Could not remove data from homework.'),
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
                            {lang === 'RO' ? 'Clasă' : 'Class'}
                        </p>
                        <h1 className="text-3xl font-bold text-(--text-h) mt-1">
                            {group?.name ||
                                (lang === 'RO' ? 'Se încarcă clasa...' : 'Loading class...')}
                        </h1>
                        <p className="text-sm text-(--text-muted) mt-2 max-w-3xl">
                            {group?.description ||
                                (lang === 'RO' ? 'Fără descriere.' : 'No description.')}
                        </p>
                    </div>
                    <Link
                        to="/classes"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl border-2 border-(--accent)/50 text-(--text-h) bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                    >
                        {lang === 'RO' ? 'Înapoi la hub' : 'Back to hub'}
                    </Link>
                </motion.div>

                {(feedback || error) && (
                    <motion.div
                        variants={itemVariants}
                        className={`mb-6 rounded-xl border-2 px-4 py-3 text-sm ${error ? 'border-red-500/40 bg-red-500/10 text-red-100' : 'border-(--accent)/40 bg-(--accent)/10 text-(--text-h)'}`}
                    >
                        {error || feedback}
                    </motion.div>
                )}

                {loading && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-xl border border-(--accent)/20 bg-(--surface-card) p-4 text-sm text-(--text-muted)"
                    >
                        {lang === 'RO' ? 'Se încarcă datele clasei...' : 'Loading class data...'}
                    </motion.div>
                )}

                {!loading && group && (
                    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                        <motion.section
                            variants={itemVariants}
                            className="rounded-xl border border-(--accent)/20 bg-(--surface-card) p-5"
                        >
                            <h2 className="text-xl font-bold text-(--text-h)">
                                {lang === 'RO' ? 'Detalii clasă' : 'Class details'}
                            </h2>
                            <div className="mt-3 grid gap-2 text-xs text-(--text-muted)">
                                <div>
                                    {lang === 'RO' ? 'Creată de' : 'Created by'}:{' '}
                                    {group.creatorUsername}
                                </div>
                                <div>ID: {group.id}</div>
                                <div>{group.createdAt}</div>
                            </div>

                            <form
                                onSubmit={handleInvite}
                                className="mt-5 rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-4"
                            >
                                <h3 className="text-lg font-semibold text-(--text-h)">
                                    {lang === 'RO' ? 'Invită un elev' : 'Invite a student'}
                                </h3>
                                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                                    <input
                                        value={inviteEmail}
                                        onChange={(event) => setInviteEmail(event.target.value)}
                                        placeholder={
                                            lang === 'RO'
                                                ? 'email@exemplu.com'
                                                : 'email@example.com'
                                        }
                                        className="flex-1 rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition focus:border-(--accent)"
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-xl border border-(--accent)/60 bg-(--accent)/20 px-4 py-2 text-sm font-semibold text-(--text-h) transition hover:bg-(--accent)/35"
                                    >
                                        {lang === 'RO' ? 'Trimite' : 'Send'}
                                    </button>
                                </div>
                            </form>
                        </motion.section>

                        <motion.section
                            variants={itemVariants}
                            className="rounded-xl border border-(--accent)/20 bg-(--surface-card) p-5"
                        >
                            <h2 className="text-xl font-bold text-(--text-h)">
                                {lang === 'RO' ? 'Creează temă' : 'Create homework'}
                            </h2>
                            <p className="mt-1 text-xs text-(--text-muted)">
                                {lang === 'RO'
                                    ? 'Doar creatorul clasei poate adăuga teme, backend-ul validează asta automat.'
                                    : 'Only the class creator can add homework; the backend validates it automatically.'}
                            </p>

                            <form onSubmit={handleCreateHomework} className="mt-4 space-y-3">
                                <input
                                    value={homeworkTitle}
                                    onChange={(event) => setHomeworkTitle(event.target.value)}
                                    placeholder={lang === 'RO' ? 'Titlu temă' : 'Homework title'}
                                    required
                                    className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-muted) px-3 py-2 text-sm text-(--text-h) outline-none transition focus:border-(--accent)"
                                />
                                <textarea
                                    value={homeworkDescription}
                                    onChange={(event) => setHomeworkDescription(event.target.value)}
                                    placeholder={lang === 'RO' ? 'Descriere' : 'Description'}
                                    className="min-h-24 w-full rounded-xl border border-(--accent)/25 bg-(--surface-muted) px-3 py-2 text-sm text-(--text-h) outline-none transition focus:border-(--accent)"
                                />
                                <input
                                    type="date"
                                    value={homeworkDeadline}
                                    onChange={(event) => setHomeworkDeadline(event.target.value)}
                                    required
                                    className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-muted) px-3 py-2 text-sm text-(--text-h) outline-none transition focus:border-(--accent)"
                                />

                                <div className="border-t border-(--accent)/20 pt-3">
                                    <p className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mb-2">
                                        {lang === 'RO' ? 'Detalii avansate' : 'Advanced details'}
                                    </p>
                                    <input
                                        value={homeworkCreationUsernames}
                                        onChange={(event) => setHomeworkCreationUsernames(event.target.value)}
                                        placeholder={
                                            lang === 'RO'
                                                ? 'Utilizatori (opțional): user1, user2'
                                                : 'Users (optional): user1, user2'
                                        }
                                        className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-muted) px-3 py-2 text-sm text-(--text-h) outline-none transition focus:border-(--accent) mb-2"
                                    />
                                    <input
                                        value={homeworkCreationProblems}
                                        onChange={(event) => setHomeworkCreationProblems(event.target.value)}
                                        placeholder={
                                            lang === 'RO'
                                                ? 'Probleme (opțional): prob1, prob2'
                                                : 'Problems (optional): prob1, prob2'
                                        }
                                        className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-muted) px-3 py-2 text-sm text-(--text-h) outline-none transition focus:border-(--accent)"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-xl border border-(--accent)/60 bg-(--accent)/20 px-4 py-2 text-sm font-semibold text-(--text-h) transition hover:bg-(--accent)/35"
                                >
                                    {lang === 'RO' ? 'Creează tema' : 'Create homework'}
                                </button>
                            </form>
                        </motion.section>
                    </div>
                )}

                <motion.section
                    variants={itemVariants}
                    className="mt-6 rounded-xl border border-(--accent)/20 bg-(--surface-card) p-5"
                >
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-(--text-h)">
                            {lang === 'RO' ? 'Teme active' : 'Active homework'}
                        </h2>
                        <span className="text-xs text-(--text-muted)">{homeworks.length}</span>
                    </div>

                    <div className="mt-4 grid gap-3">
                        {homeworks.length === 0 && !loading && (
                            <div className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-4 text-sm text-(--text-muted)">
                                {lang === 'RO'
                                    ? 'Nu există teme pentru această clasă.'
                                    : 'There is no homework for this class.'}
                            </div>
                        )}

                        {homeworks.map((homework) => (
                            <div
                                key={homework.id}
                                className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-4"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-lg font-semibold text-(--text-h)">
                                                {homework.title}
                                            </h3>
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getHomeworkBadge(homework.status)}`}
                                            >
                                                {homework.status}
                                            </span>
                                        </div>
                                        <p className="mt-1.5 text-sm text-(--text-muted)">
                                            {homework.description ||
                                                (lang === 'RO'
                                                    ? 'Fără descriere.'
                                                    : 'No description.')}
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-(--text-muted)">
                                            <span>
                                                {lang === 'RO' ? 'Deadline' : 'Deadline'}:{' '}
                                                {homework.deadline}
                                            </span>
                                            <span>ID: {homework.id}</span>
                                        </div>
                                    </div>

                                    {userId === group?.creatorId && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                onClick={() => handleShowHomeworkDetails(homework.id)}
                                                className="rounded-lg border border-(--accent)/40 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/10"
                                            >
                                                {selectedHomeworkId === homework.id
                                                    ? lang === 'RO'
                                                        ? 'Ascunde detalii'
                                                        : 'Hide details'
                                                    : lang === 'RO'
                                                      ? 'Detalii'
                                                      : 'Details'}
                                            </button>
                                            {homework.status === 'DRAFT' && (
                                                <button
                                                    onClick={() => handlePublishHomework(homework.id)}
                                                    className="rounded-lg border border-emerald-400/50 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/10"
                                                >
                                                    {lang === 'RO' ? 'Publică' : 'Publish'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteHomework(homework.id)}
                                                className="rounded-lg border border-red-400/50 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                                            >
                                                {lang === 'RO' ? 'Șterge' : 'Delete'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {selectedHomeworkId === homework.id && (
                                    <div className="mt-4 rounded-xl border border-(--accent)/20 bg-black/15 p-4 space-y-4">
                                        {loadingHomeworkId === homework.id && (
                                            <p className="text-sm text-(--text-muted)">
                                                {lang === 'RO'
                                                    ? 'Se încarcă detaliile temei...'
                                                    : 'Loading homework details...'}
                                            </p>
                                        )}

                                        {selectedHomeworkDetail && loadingHomeworkId !== homework.id && (
                                            <>
                                                <div className="grid gap-2 text-xs text-(--text-muted) sm:grid-cols-3">
                                                    <div>
                                                        {lang === 'RO' ? 'Probleme:' : 'Problems:'}{' '}
                                                        {selectedHomeworkDetail.problems.length}
                                                    </div>
                                                    <div>
                                                        {lang === 'RO' ? 'Elevi asignați:' : 'Assigned users:'}{' '}
                                                        {selectedHomeworkDetail.assignedUsers.length}
                                                    </div>
                                                    <div>
                                                        {lang === 'RO' ? 'Submisii:' : 'Submissions:'}{' '}
                                                        {selectedHomeworkDetail.submissions.length}
                                                    </div>
                                                </div>

                                                {homework.status === 'DRAFT' && userId === group?.creatorId && (
                                                    <div className="grid gap-4 xl:grid-cols-2">
                                                        <div className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-3 space-y-2">
                                                            <h4 className="text-sm font-bold text-(--text-h)">
                                                                {lang === 'RO'
                                                                    ? 'Adaugă în draft'
                                                                    : 'Add to draft'}
                                                            </h4>
                                                            <input
                                                                value={addUsernamesInput}
                                                                onChange={(event) =>
                                                                    setAddUsernamesInput(event.target.value)
                                                                }
                                                                placeholder={
                                                                    lang === 'RO'
                                                                        ? 'user1, user2'
                                                                        : 'user1, user2'
                                                                }
                                                                className="w-full rounded-lg border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs text-(--text-h)"
                                                            />
                                                            <input
                                                                value={addProblemTitlesInput}
                                                                onChange={(event) =>
                                                                    setAddProblemTitlesInput(event.target.value)
                                                                }
                                                                placeholder={
                                                                    lang === 'RO'
                                                                        ? 'problemă 1, problemă 2'
                                                                        : 'problem 1, problem 2'
                                                                }
                                                                className="w-full rounded-lg border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs text-(--text-h)"
                                                            />
                                                            <input
                                                                type="date"
                                                                value={addDeadline}
                                                                onChange={(event) =>
                                                                    setAddDeadline(event.target.value)
                                                                }
                                                                className="w-full rounded-lg border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs text-(--text-h)"
                                                            />
                                                            <button
                                                                onClick={() =>
                                                                    handleAddToDraft(homework.id)
                                                                }
                                                                className="rounded-lg border border-emerald-400/50 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/10"
                                                            >
                                                                {lang === 'RO' ? 'Adaugă' : 'Add'}
                                                            </button>
                                                        </div>

                                                        <div className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-3 space-y-2">
                                                            <h4 className="text-sm font-bold text-(--text-h)">
                                                                {lang === 'RO'
                                                                    ? 'Șterge din draft'
                                                                    : 'Remove from draft'}
                                                            </h4>
                                                            <input
                                                                value={removeUsernamesInput}
                                                                onChange={(event) =>
                                                                    setRemoveUsernamesInput(event.target.value)
                                                                }
                                                                placeholder={
                                                                    lang === 'RO'
                                                                        ? 'user1, user2'
                                                                        : 'user1, user2'
                                                                }
                                                                className="w-full rounded-lg border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs text-(--text-h)"
                                                            />
                                                            <input
                                                                value={removeProblemTitlesInput}
                                                                onChange={(event) =>
                                                                    setRemoveProblemTitlesInput(event.target.value)
                                                                }
                                                                placeholder={
                                                                    lang === 'RO'
                                                                        ? 'problemă 1, problemă 2'
                                                                        : 'problem 1, problem 2'
                                                                }
                                                                className="w-full rounded-lg border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs text-(--text-h)"
                                                            />
                                                            <button
                                                                onClick={() =>
                                                                    handleRemoveFromDraft(homework.id)
                                                                }
                                                                className="rounded-lg border border-red-400/50 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                                                            >
                                                                {lang === 'RO' ? 'Șterge' : 'Remove'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.section>
            </motion.div>
        </div>
    );
}
