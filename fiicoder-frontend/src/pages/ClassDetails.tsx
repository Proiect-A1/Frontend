import { useEffect, useMemo, useState } from 'react';
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
import { containerVariants, itemVariants, pageVariants } from '../utils/motionConfig';

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

interface HomeworkItemProps {
    homework: HomeworkResponseDTO;
    isSelected: boolean;
    onToggle: (id: string) => void;
    groupId: string;
    userId: string | null;
    creatorId: string | undefined;
    lang: string;
    onReload: () => Promise<void>;
}

function HomeworkItem({
    homework,
    isSelected,
    onToggle,
    groupId,
    userId,
    creatorId,
    lang,
    onReload,
}: HomeworkItemProps) {
    const [selectedHomeworkDetail, setSelectedHomeworkDetail] = useState<HomeworkDetailDTO | null>(
        null,
    );
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const [addUsernamesInput, setAddUsernamesInput] = useState('');
    const [addProblemTitlesInput, setAddProblemTitlesInput] = useState('');
    const [addDeadline, setAddDeadline] = useState('');
    const [removeUsernamesInput, setRemoveUsernamesInput] = useState('');
    const [removeProblemTitlesInput, setRemoveProblemTitlesInput] = useState('');

    useEffect(() => {
        if (!isSelected) {
            setSelectedHomeworkDetail(null);
            return;
        }

        let cancelled = false;
        async function loadDetails() {
            try {
                setLoadingDetails(true);
                const details = await homeworkService.getById(groupId, homework.id);
                if (!cancelled) setSelectedHomeworkDetail(details);
            } catch (err: any) {
                if (!cancelled) {
                    setError(
                        err?.body?.message ||
                            (lang === 'RO' ? 'Eroare la încărcare.' : 'Load error.'),
                    );
                }
            } finally {
                if (!cancelled) setLoadingDetails(false);
            }
        }
        void loadDetails();
        return () => {
            cancelled = true;
        };
    }, [isSelected, groupId, homework.id, lang]);

    const handlePublish = async () => {
        try {
            await homeworkService.publish(groupId, homework.id);
            setFeedback(lang === 'RO' ? 'Publicată!' : 'Published!');
            await onReload();
        } catch (err: any) {
            setError(err?.body?.message || 'Error');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(lang === 'RO' ? 'Ștergi tema?' : 'Delete homework?')) return;
        try {
            await homeworkService.delete(groupId, homework.id);
            await onReload();
        } catch (err: any) {
            setError(err?.body?.message || 'Error');
        }
    };

    const handleAddToDraft = async () => {
        const request: HomeworkUpdateRequestDTO = {};
        const usernames = parseCsvValues(addUsernamesInput);
        const problemTitles = parseCsvValues(addProblemTitlesInput);
        if (usernames.length > 0) request.usernames = usernames;
        if (problemTitles.length > 0) request.problemTitles = problemTitles;
        if (addDeadline.trim().length > 0) request.deadline = addDeadline;

        if (!request.usernames && !request.problemTitles && !request.deadline) return;

        try {
            await homeworkService.addToDraft(groupId, homework.id, request);
            setFeedback(lang === 'RO' ? 'Actualizat!' : 'Updated!');
            setAddUsernamesInput('');
            setAddProblemTitlesInput('');
            setAddDeadline('');
            const details = await homeworkService.getById(groupId, homework.id);
            setSelectedHomeworkDetail(details);
        } catch (err: any) {
            setError(err?.body?.message || 'Error');
        }
    };

    const handleRemoveFromDraft = async () => {
        const request: HomeworkUpdateDeleteRequestDTO = {};
        const usernames = parseCsvValues(removeUsernamesInput);
        const problemTitles = parseCsvValues(removeProblemTitlesInput);
        if (usernames.length > 0) request.usernames = usernames;
        if (problemTitles.length > 0) request.problemTitles = problemTitles;

        if (!request.usernames && !request.problemTitles) return;

        try {
            await homeworkService.removeFromDraft(groupId, homework.id, request);
            setFeedback(lang === 'RO' ? 'Actualizat!' : 'Updated!');
            setRemoveUsernamesInput('');
            setRemoveProblemTitlesInput('');
            const details = await homeworkService.getById(groupId, homework.id);
            setSelectedHomeworkDetail(details);
        } catch (err: any) {
            setError(err?.body?.message || 'Error');
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-(--accent)/20 bg-(--surface-muted) p-4"
        >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-(--text-h)">{homework.title}</h3>
                        <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getHomeworkBadge(homework.status)}`}
                        >
                            {homework.status}
                        </span>
                    </div>
                    <p className="mt-1.5 text-sm text-(--text-muted)">
                        {homework.description ||
                            (lang === 'RO' ? 'Fără descriere.' : 'No description.')}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-(--text-muted)">
                        <span>
                            {lang === 'RO' ? 'Deadline' : 'Deadline'}: {homework.deadline}
                        </span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => onToggle(homework.id)}
                        className="rounded-xl border border-(--accent)/40 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/10"
                    >
                        {isSelected
                            ? lang === 'RO'
                                ? 'Ascunde'
                                : 'Hide'
                            : lang === 'RO'
                              ? 'Detalii'
                              : 'Details'}
                    </button>
                    {userId === creatorId && (
                        <>
                            {homework.status === 'DRAFT' && (
                                <button
                                    onClick={handlePublish}
                                    className="rounded-lg border border-emerald-400/50 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/10"
                                >
                                    {lang === 'RO' ? 'Publică' : 'Publish'}
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="rounded-lg border border-red-400/50 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                            >
                                {lang === 'RO' ? 'Șterge' : 'Delete'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isSelected && (
                <div className="mt-4 rounded-2xl border border-(--accent)/20 bg-black/15 p-4 space-y-4">
                    {loadingDetails && (
                        <p className="text-sm text-(--text-muted)">
                            {lang === 'RO' ? 'Se încarcă...' : 'Loading...'}
                        </p>
                    )}
                    {feedback && <p className="text-xs text-emerald-400">{feedback}</p>}
                    {error && <p className="text-xs text-red-400">{error}</p>}

                    {selectedHomeworkDetail && !loadingDetails && (
                        <>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <h4 className="text-xs uppercase tracking-widest text-(--text-muted) font-bold">
                                        {lang === 'RO' ? 'Probleme' : 'Problems'}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedHomeworkDetail.problems.map((p) => (
                                            <Link
                                                key={p.title}
                                                to={`/problems/${p.title}`}
                                                className="px-2 py-1 rounded-md border border-(--accent)/30 bg-(--accent)/10 text-[11px] hover:bg-(--accent)/25"
                                            >
                                                {p.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-[11px] text-(--text-muted)">
                                    <p>
                                        {lang === 'RO' ? 'Elevi:' : 'Users:'}{' '}
                                        {selectedHomeworkDetail.assignedUsers.length}
                                    </p>
                                    <p>
                                        {lang === 'RO' ? 'Submisii:' : 'Submissions:'}{' '}
                                        {selectedHomeworkDetail.submissions.length}
                                    </p>
                                </div>
                            </div>

                            {homework.status === 'DRAFT' && userId === creatorId && (
                                <div className="grid gap-4 xl:grid-cols-2">
                                    <div className="rounded-2xl border border-(--accent)/20 bg-(--surface-muted) p-3 space-y-2">
                                        <h4 className="text-sm font-bold text-(--text-h)">
                                            {lang === 'RO' ? 'Adaugă' : 'Add'}
                                        </h4>
                                        <input
                                            value={addUsernamesInput}
                                            onChange={(e) => setAddUsernamesInput(e.target.value)}
                                            placeholder="user1, user2"
                                            className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs"
                                        />
                                        <input
                                            value={addProblemTitlesInput}
                                            onChange={(e) =>
                                                setAddProblemTitlesInput(e.target.value)
                                            }
                                            placeholder="p1, p2"
                                            className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs"
                                        />
                                        <input
                                            type="date"
                                            value={addDeadline}
                                            onChange={(e) => setAddDeadline(e.target.value)}
                                            className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs"
                                        />
                                        <button
                                            onClick={handleAddToDraft}
                                            className="rounded-xl border border-emerald-400/50 px-3 py-1.5 text-xs font-semibold text-emerald-200"
                                        >
                                            OK
                                        </button>
                                    </div>
                                    <div className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-3 space-y-2">
                                        <h4 className="text-sm font-bold text-(--text-h)">
                                            {lang === 'RO' ? 'Șterge' : 'Remove'}
                                        </h4>
                                        <input
                                            value={removeUsernamesInput}
                                            onChange={(e) =>
                                                setRemoveUsernamesInput(e.target.value)
                                            }
                                            placeholder="user1, user2"
                                            className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs"
                                        />
                                        <input
                                            value={removeProblemTitlesInput}
                                            onChange={(e) =>
                                                setRemoveProblemTitlesInput(e.target.value)
                                            }
                                            placeholder="p1, p2"
                                            className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs"
                                        />
                                        <button
                                            onClick={handleRemoveFromDraft}
                                            className="rounded-xl border border-red-400/50 px-3 py-1.5 text-xs font-semibold text-red-300"
                                        >
                                            OK
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </motion.div>
    );
}

export default function ClassDetails() {
    const { groupId } = useParams();
    const { lang } = useLanguage();
    const { userId } = useAuth();

    const [group, setGroup] = useState<GroupFindResponseDTO | null>(null);
    const [homeworks, setHomeworks] = useState<HomeworkResponseDTO[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteFeedback, setInviteFeedback] = useState<{ msg: string; isError: boolean } | null>(
        null,
    );
    const [loadingInvite, setLoadingInvite] = useState(false);
    const [homeworkTitle, setHomeworkTitle] = useState('');
    const [homeworkDescription, setHomeworkDescription] = useState('');
    const [homeworkDeadline, setHomeworkDeadline] = useState('');
    const [homeworkCreationUsernames, setHomeworkCreationUsernames] = useState('');
    const [homeworkCreationProblems, setHomeworkCreationProblems] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);

    useEffect(() => {
        if (!groupId) return;
        let isMounted = true;
        async function loadData() {
            try {
                setLoading(true);
                const [groupData, homeworkData] = await Promise.all([
                    classService.getById(groupId!),
                    homeworkService.getAll(groupId!),
                ]);
                if (isMounted) {
                    setGroup(groupData);
                    setHomeworks(homeworkData);
                }
            } catch (err: any) {
                if (isMounted) setError(err?.body?.message || 'Error');
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        void loadData();
        return () => {
            isMounted = false;
        };
    }, [groupId, lang]);

    const reloadHomeworks = async () => {
        if (!groupId) return;
        const data = await homeworkService.getAll(groupId);
        setHomeworks(data);
    };

    const handleInviteStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        setLoadingInvite(true);
        try {
            await classService.inviteUser(groupId!, { email: inviteEmail.trim() });
            setInviteFeedback({ msg: lang === 'RO' ? 'Succes!' : 'Success!', isError: false });
            setInviteEmail('');
        } catch (err: any) {
            setInviteFeedback({ msg: 'Error', isError: true });
        } finally {
            setLoadingInvite(false);
            setTimeout(() => setInviteFeedback(null), 5000);
        }
    };

    const handleCreateHomework = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!groupId) return;
        try {
            const response = await homeworkService.create(groupId, {
                title: homeworkTitle.trim(),
                description: homeworkDescription,
                deadline: homeworkDeadline,
            });
            const usernames = parseCsvValues(homeworkCreationUsernames);
            const problemTitles = parseCsvValues(homeworkCreationProblems);
            if (usernames.length > 0 || problemTitles.length > 0) {
                await homeworkService.addToDraft(groupId, response.id, {
                    usernames,
                    problemTitles,
                });
            }
            setHomeworkTitle('');
            setHomeworkDescription('');
            setHomeworkDeadline('');
            setFeedback(lang === 'RO' ? 'Creat!' : 'Created!');
            await reloadHomeworks();
        } catch (err: any) {
            setError(err?.body?.message || 'Error');
        }
    };

    const memoizedHomeworkList = useMemo(
        () =>
            homeworks.map((hw) => (
                <HomeworkItem
                    key={hw.id}
                    homework={hw}
                    isSelected={selectedHomeworkId === hw.id}
                    onToggle={(id) => setSelectedHomeworkId((prev) => (prev === id ? null : id))}
                    groupId={groupId!}
                    userId={userId}
                    creatorId={group?.creatorId}
                    lang={lang}
                    onReload={reloadHomeworks}
                />
            )),
        [homeworks, selectedHomeworkId, groupId, userId, group, lang],
    );

    return (
        <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
            <motion.div
                className="w-full max-w-7xl rounded-3xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm px-5 py-6 md:px-8 md:py-8 h-auto overflow-visible xl:h-full xl:overflow-y-auto custom-scrollbar"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8"
                    >
                        <div>
                            <p className="text-xs uppercase tracking-widest text-(--text-muted)">
                                {lang === 'RO' ? 'Clasă' : 'Class'}
                            </p>
                            <h1 className="text-3xl font-bold text-(--text-h) mt-1">
                                {group?.name || '...'}
                            </h1>
                            <p className="text-sm text-(--text-muted) mt-2">{group?.description}</p>
                        </div>
                        <Link
                            to="/classes"
                            className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-full font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                        >
                            {lang === 'RO' ? 'Înapoi' : 'Back'}
                        </Link>
                    </motion.div>

                    {(feedback || error) && (
                        <motion.div
                            variants={itemVariants}
                            className={`mb-6 rounded-2xl border-2 px-4 py-3 text-sm ${error ? 'border-red-500/40 bg-red-500/10' : 'border-(--accent)/40 bg-(--accent)/10'}`}
                        >
                            {error || feedback}
                        </motion.div>
                    )}

                    {loading && <p>{lang === 'RO' ? 'Se încarcă...' : 'Loading...'}</p>}

                    {!loading && group && (
                        <div className="grid gap-4 md:gap-6 xl:grid-cols-[1fr_1fr]">
                            <motion.section variants={itemVariants} className="">
                                <h2 className="text-xl font-bold text-(--text-h)">
                                    {lang === 'RO' ? 'Detalii' : 'Details'}
                                </h2>
                                <div className="mt-3 text-xs text-(--text-muted)">
                                    <p>Creator: {group.creatorUsername}</p>
                                    <p>ID: {group.id}</p>
                                </div>
                                <div className="p-4 rounded-2xl border border-(--accent)/20 bg-(--surface-card)">
                                    <h3 className="text-sm font-bold mb-2">
                                        {lang === 'RO' ? 'Invită' : 'Invite'}
                                    </h3>
                                    <form onSubmit={handleInviteStudent} className="flex gap-2">
                                        <input
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="Email"
                                            className="flex-1 rounded-2xl bg-(--surface-muted) border border-(--accent)/20 px-3 py-1.5 text-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={loadingInvite}
                                            className="px-3 py-1.5 bg-(--accent)/10 border border-(--accent)/40 rounded-xl text-xs"
                                        >
                                            {loadingInvite ? '...' : 'OK'}
                                        </button>
                                    </form>
                                    {inviteFeedback && (
                                        <p className="mt-2 text-xs">{inviteFeedback.msg}</p>
                                    )}
                                </div>
                            </motion.section>

                            <motion.section variants={itemVariants} className="">
                                <h2 className="text-xl font-bold text-(--text-h)">
                                    {lang === 'RO' ? 'Temă nouă' : 'New homework'}
                                </h2>
                                <form onSubmit={handleCreateHomework} className="mt-4 space-y-3">
                                    <input
                                        value={homeworkTitle}
                                        onChange={(e) => setHomeworkTitle(e.target.value)}
                                        placeholder="Title"
                                        required
                                        className="w-full rounded-2xl bg-(--surface-muted) border border-(--accent)/20 px-3 py-2 text-sm"
                                    />
                                    <textarea
                                        value={homeworkDescription}
                                        onChange={(e) => setHomeworkDescription(e.target.value)}
                                        placeholder="Desc"
                                        className="w-full rounded-2xl bg-(--surface-muted) border border-(--accent)/20 px-3 py-2 text-sm"
                                    />
                                    <input
                                        type="date"
                                        value={homeworkDeadline}
                                        onChange={(e) => setHomeworkDeadline(e.target.value)}
                                        required
                                        className="w-full rounded-2xl bg-(--surface-muted) border border-(--accent)/20 px-3 py-2 text-sm"
                                    />
                                    <div className="space-y-2 border-t border-(--accent)/10 pt-2">
                                        <input
                                            value={homeworkCreationUsernames}
                                            onChange={(e) =>
                                                setHomeworkCreationUsernames(e.target.value)
                                            }
                                            placeholder="Usernames (user1, user2)"
                                            className="w-full rounded-2xl bg-(--surface-muted) border border-(--accent)/20 px-3 py-2 text-xs"
                                        />
                                        <input
                                            value={homeworkCreationProblems}
                                            onChange={(e) =>
                                                setHomeworkCreationProblems(e.target.value)
                                            }
                                            placeholder="Problems (p1, p2)"
                                            className="w-full rounded-2xl bg-(--surface-muted) border border-(--accent)/20 px-3 py-2 text-xs"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-(--accent)/20 border border-(--accent)/50 py-2 rounded-2xl text-sm"
                                    >
                                        Create
                                    </button>
                                </form>
                            </motion.section>

                            <h2 className="text-xl font-bold">
                                {lang === 'RO' ? 'Teme' : 'Homework'}
                            </h2>

                            <motion.section
                                variants={itemVariants}
                                className="xl:col-span-2 rounded-2xl border border-(--accent)/20 bg-(--surface-card) p-5"
                            >
                                <div className="grid gap-4">{memoizedHomeworkList}</div>
                            </motion.section>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
