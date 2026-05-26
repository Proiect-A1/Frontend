import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { classService } from '../classesHub/services/classService';
import { homeworkService } from './services/homeworkService';
import type {
    HomeworkResponseDTO,
    HomeworkDetailDTO,
    HomeworkStatisticsDTO,
    StudentProgressSummaryDTO,
    HomeworkUpdateDeleteRequestDTO,
    HomeworkUpdateRequestDTO,
} from './types/homework';
import { useLanguage } from '../../language/Language';
import { containerVariants, itemVariants, pageVariants } from '../../utils/motionConfig';
import { toast } from 'sonner';

function extractErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'body' in error) {
        const body = (error as { body?: { message?: string } }).body;
        if (body?.message) return body.message;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

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

    const [stats, setStats] = useState<HomeworkStatisticsDTO | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [selectedStudentProgress, setSelectedStudentProgress] =
        useState<StudentProgressSummaryDTO | null>(null);
    const [loadingStudentProgress, setLoadingStudentProgress] = useState(false);

    useEffect(() => {
        if (!isSelected) {
            setSelectedHomeworkDetail(null);
            setStats(null);
            return;
        }

        let cancelled = false;
        const isCreator = userId && creatorId && userId.toLowerCase() === creatorId.toLowerCase();

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

        async function loadStats() {
            if (!isCreator || homework.status === 'DRAFT') return;
            try {
                setLoadingStats(true);
                const data = await homeworkService.getStatistics(groupId, homework.id);
                if (!cancelled) setStats(data);
            } catch (err) {
                console.error('Failed to load stats', err);
            } finally {
                if (!cancelled) setLoadingStats(false);
            }
        }

        void loadDetails();
        void loadStats();
        return () => {
            cancelled = true;
        };
    }, [isSelected, groupId, homework.id, lang, userId, creatorId, homework.status]);

    const handlePublish = async () => {
        try {
            await homeworkService.publish(groupId, homework.id);
            setFeedback(lang === 'RO' ? 'Publicată!' : 'Published!');
            toast.success(lang === 'RO' ? 'Tema a fost publicată.' : 'Homework published.');
            await onReload();
        } catch (err: any) {
            const message = extractErrorMessage(err, 'Error');
            setError(message);
            toast.error(message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(lang === 'RO' ? 'Ștergi tema?' : 'Delete homework?')) return;
        try {
            await homeworkService.delete(groupId, homework.id);
            toast.success(lang === 'RO' ? 'Tema a fost ștearsă.' : 'Homework deleted.');
            await onReload();
        } catch (err: any) {
            const message = extractErrorMessage(err, 'Error');
            setError(message);
            toast.error(message);
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
            toast.success(lang === 'RO' ? 'Tema a fost actualizată.' : 'Homework updated.');
            setAddUsernamesInput('');
            setAddProblemTitlesInput('');
            setAddDeadline('');
            const details = await homeworkService.getById(groupId, homework.id);
            setSelectedHomeworkDetail(details);
        } catch (err: any) {
            const message = extractErrorMessage(err, 'Error');
            setError(message);
            toast.error(message);
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
            toast.success(lang === 'RO' ? 'Elementele au fost eliminate.' : 'Items removed.');
            setRemoveUsernamesInput('');
            setRemoveProblemTitlesInput('');
            const details = await homeworkService.getById(groupId, homework.id);
            setSelectedHomeworkDetail(details);
        } catch (err: any) {
            const message = extractErrorMessage(err, 'Error');
            setError(message);
            toast.error(message);
        }
    };

    const handleViewStudentProgress = async (studentId: string) => {
        try {
            setLoadingStudentProgress(true);
            const data = await homeworkService.getStudentProgress(groupId, homework.id, studentId);
            setSelectedStudentProgress(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingStudentProgress(false);
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
                        className="rounded-full border border-(--accent)/40 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/10"
                    >
                        {isSelected
                            ? lang === 'RO'
                                ? 'Ascunde'
                                : 'Hide'
                            : lang === 'RO'
                              ? 'Detalii'
                              : 'Details'}
                    </button>
                    {userId && creatorId && userId.toLowerCase() === creatorId.toLowerCase() && (
                        <>
                            {homework.status === 'DRAFT' && (
                                <button
                                    onClick={handlePublish}
                                    className="rounded-full border border-emerald-400/50 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/10"
                                >
                                    {lang === 'RO' ? 'Publică' : 'Publish'}
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="rounded-full border border-red-400/50 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
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
                                {userId &&
                                    creatorId &&
                                    userId.toLowerCase() === creatorId.toLowerCase() && (
                                        <div className="text-[11px] text-(--text-muted)">
                                            <p>
                                                {lang === 'RO' ? 'Elevi:' : 'Users:'}{' '}
                                                {selectedHomeworkDetail.assignedUsers?.length || 0}
                                            </p>
                                            <p>
                                                {lang === 'RO' ? 'Submisii:' : 'Submissions:'}{' '}
                                                {selectedHomeworkDetail.submissions?.length || 0}
                                            </p>
                                        </div>
                                    )}
                            </div>

                            {homework.status === 'DRAFT' &&
                                userId &&
                                creatorId &&
                                userId.toLowerCase() === creatorId.toLowerCase() && (
                                    <div className="grid gap-4 xl:grid-cols-2 mt-4">
                                        <div className="rounded-2xl border border-(--accent)/20 bg-(--surface-muted) p-3 space-y-2">
                                            <h4 className="text-sm font-bold text-(--text-h)">
                                                {lang === 'RO' ? 'Adaugă' : 'Add'}
                                            </h4>
                                            <input
                                                value={addUsernamesInput}
                                                onChange={(e) =>
                                                    setAddUsernamesInput(e.target.value)
                                                }
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

                            {stats &&
                                userId &&
                                creatorId &&
                                userId.toLowerCase() === creatorId.toLowerCase() && (
                                    <div className="space-y-4 border-t border-(--accent)/10 pt-4 mt-4">
                                        <h4 className="text-xs uppercase tracking-widest text-(--text-muted) font-bold">
                                            {lang === 'RO' ? 'Progres Elevi' : 'Student Progress'}
                                        </h4>

                                        {loadingStats && (
                                            <p className="text-xs text-(--text-muted)">...</p>
                                        )}

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="border-b border-(--accent)/10 text-(--text-muted)">
                                                        <th className="py-2 px-1 font-bold">
                                                            {lang === 'RO' ? 'Elev' : 'Student'}
                                                        </th>
                                                        <th className="py-2 px-1 text-center font-bold">
                                                            {lang === 'RO'
                                                                ? 'Probleme'
                                                                : 'Problems'}
                                                        </th>
                                                        <th className="py-2 px-1 text-center font-bold">
                                                            {lang === 'RO'
                                                                ? 'Scor Mediu'
                                                                : 'Avg Score'}
                                                        </th>
                                                        <th className="py-2 px-1 text-center font-bold">
                                                            Status
                                                        </th>
                                                        <th className="py-2 px-1 text-right"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.students.map((student) => (
                                                        <tr
                                                            key={student.userId}
                                                            className="border-b border-(--accent)/5 hover:bg-(--accent)/5 transition-colors"
                                                        >
                                                            <td className="py-2 px-1">
                                                                <div className="font-bold text-(--text-h)">
                                                                    {student.username}
                                                                </div>
                                                                <div className="text-[10px] text-(--text-muted)">
                                                                    {student.firstName}{' '}
                                                                    {student.lastName}
                                                                </div>
                                                            </td>
                                                            <td className="py-2 px-1 text-center">
                                                                {student.completedProblems} /{' '}
                                                                {student.totalProblems}
                                                            </td>
                                                            <td className="py-2 px-1 text-center font-mono">
                                                                {student.averageScore.toFixed(1)}
                                                            </td>
                                                            <td className="py-2 px-1 text-center">
                                                                <span
                                                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${student.isCompleted ? 'bg-emerald-500/20 text-emerald-400' : student.hasStarted ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/10 text-red-400/60'}`}
                                                                >
                                                                    {student.isCompleted
                                                                        ? lang === 'RO'
                                                                            ? 'GATA'
                                                                            : 'DONE'
                                                                        : student.hasStarted
                                                                          ? lang === 'RO'
                                                                              ? 'ÎN LUCRU'
                                                                              : 'WORKING'
                                                                          : lang === 'RO'
                                                                            ? 'NU A ÎNCEPUT'
                                                                            : 'IDLE'}
                                                                </span>
                                                            </td>
                                                            <td className="py-2 px-1 text-right">
                                                                <button
                                                                    onClick={() =>
                                                                        handleViewStudentProgress(
                                                                            student.userId,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        loadingStudentProgress
                                                                    }
                                                                    className="text-(--accent) hover:underline font-bold disabled:opacity-50"
                                                                >
                                                                    {loadingStudentProgress
                                                                        ? lang === 'RO'
                                                                            ? 'Se încarcă...'
                                                                            : 'Loading...'
                                                                        : lang === 'RO'
                                                                          ? 'Detalii'
                                                                          : 'Details'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {selectedStudentProgress && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-4 p-4 rounded-2xl border-2 border-(--accent)/30 bg-(--surface-card)"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h5 className="font-bold text-(--text-h)">
                                                            {lang === 'RO'
                                                                ? 'Detalii progres:'
                                                                : 'Progress details:'}{' '}
                                                            {selectedStudentProgress.username}
                                                        </h5>
                                                        <p className="text-[10px] text-(--text-muted)">
                                                            {lang === 'RO'
                                                                ? 'Scor mediu:'
                                                                : 'Avg score:'}{' '}
                                                            {selectedStudentProgress.averageScore.toFixed(
                                                                1,
                                                            )}{' '}
                                                            •{' '}
                                                            {
                                                                selectedStudentProgress.attemptedProblems
                                                            }{' '}
                                                            {lang === 'RO'
                                                                ? 'probleme încercate'
                                                                : 'attempted problems'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            setSelectedStudentProgress(null)
                                                        }
                                                        className="text-(--text-muted) hover:text-(--text-h)"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>

                                                <div className="grid gap-2">
                                                    {selectedStudentProgress.problems.map((p) => (
                                                        <div
                                                            key={p.problemId}
                                                            className="flex items-center justify-between p-2 rounded-xl bg-(--accent)/5 text-[11px]"
                                                        >
                                                            <span className="font-bold truncate max-w-37.5">
                                                                {p.problemTitle}
                                                            </span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-(--text-muted)">
                                                                    {p.attempts}{' '}
                                                                    {lang === 'RO' ? 'înc' : 'try'}
                                                                </span>
                                                                <span
                                                                    className={`font-mono font-bold ${p.bestScore === 100 ? 'text-emerald-400' : 'text-amber-400'}`}
                                                                >
                                                                    {p.bestScore.toFixed(0)} pct
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
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
    const navigate = useNavigate();
    const { lang } = useLanguage();
    const { userId, isAdmin } = useAuth();
    const queryClient = useQueryClient();
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
    const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);

    const groupQuery = useQuery({
        queryKey: ['class-details', groupId],
        enabled: !!groupId,
        queryFn: () => classService.getById(groupId as string),
    });

    const homeworksQuery = useQuery({
        queryKey: ['class-homeworks', groupId],
        enabled: !!groupId,
        queryFn: () => homeworkService.getAll(groupId as string),
    });

    const group = groupQuery.data ?? null;
    const isCreator = !!(
        userId &&
        group?.creatorId &&
        userId.toLowerCase() === group.creatorId.toLowerCase()
    );

    const invitationsQuery = useQuery({
        queryKey: ['class-invitations', groupId],
        enabled: !!groupId && (isAdmin || isCreator),
        queryFn: () => classService.getGroupInvitations(groupId as string),
    });

    const membersQuery = useQuery({
        queryKey: ['class-members', groupId],
        enabled: !!groupId,
        queryFn: () => classService.getGroupStudents(groupId as string),
    });
    const members = membersQuery.data ?? null;
    const canManageMembers = !!(members?.canManage || isAdmin || isCreator);

    const handleRemoveStudent = async (studentId: string, username: string) => {
        if (!groupId) return;
        const confirmMsg =
            lang === 'RO'
                ? `Elimini studentul "${username}" din clasă?`
                : `Remove student "${username}" from this class?`;
        if (!window.confirm(confirmMsg)) return;
        try {
            await classService.removeGroupStudent(groupId, studentId);
            toast.success(lang === 'RO' ? 'Student eliminat.' : 'Student removed.');
            await queryClient.invalidateQueries({ queryKey: ['class-members', groupId] });
            await queryClient.invalidateQueries({ queryKey: ['my-groups'] });
        } catch (err: any) {
            toast.error(
                extractErrorMessage(
                    err,
                    lang === 'RO' ? 'Eroare la eliminare.' : 'Failed to remove student.',
                ),
            );
        }
    };
    const pendingInvitations = (invitationsQuery.data ?? []).filter(
        (inv) => inv.status === 'PENDING',
    );
    const homeworks = homeworksQuery.data ?? [];
    const loading = groupQuery.isPending || homeworksQuery.isPending;
    const groupErrorStatus = (groupQuery.error as { status?: number } | null)?.status;
    const accessDeniedMessage =
        lang === 'RO'
            ? 'Nu ai acces la această clasă. Trebuie să fii membru, creator sau admin.'
            : 'You do not have access to this class. You must be a member, creator, or admin.';
    const notFoundMessage =
        lang === 'RO' ? 'Clasa nu a fost găsită.' : 'Class not found.';
    const error =
        groupErrorStatus === 403
            ? accessDeniedMessage
            : groupErrorStatus === 404
              ? notFoundMessage
              : extractErrorMessage(groupQuery.error, '') ||
                extractErrorMessage(homeworksQuery.error, '');

    const reloadHomeworks = useCallback(async () => {
        await homeworksQuery.refetch();
    }, [homeworksQuery]);

    const handleDeleteGroup = async () => {
        const confirmMsg =
            lang === 'RO'
                ? `Sigur vrei să ștergi clasa "${group?.name}"? Această acțiune este ireversibilă.`
                : `Delete class "${group?.name}"? This action cannot be undone.`;
        if (!window.confirm(confirmMsg)) return;
        try {
            await classService.deleteGroup(groupId!);
            if (userId) {
                const key = `fiicoder_recent_classes_${userId}`;
                const stored = localStorage.getItem(key);
                if (stored) {
                    try {
                        const classes = JSON.parse(stored) as { id: string }[];
                        localStorage.setItem(
                            key,
                            JSON.stringify(classes.filter((c) => c.id !== groupId)),
                        );
                    } catch {}
                }
            }
            toast.success(lang === 'RO' ? 'Clasa a fost ștearsă.' : 'Class deleted.');
            navigate('/classes');
        } catch (err: any) {
            toast.error(
                extractErrorMessage(err, lang === 'RO' ? 'Eroare la ștergere.' : 'Delete failed.'),
            );
        }
    };

    const handleInviteStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        const emails = inviteEmail
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter(Boolean);
        if (emails.length === 0) return;
        setLoadingInvite(true);
        const errors: string[] = [];
        let successCount = 0;
        for (const email of emails) {
            try {
                await classService.inviteUser(groupId!, { email });
                successCount++;
            } catch (err: any) {
                const rawMessage = extractErrorMessage(err, 'Error');
                const lowered = rawMessage.toLowerCase();
                let message = rawMessage;
                if (lowered.includes('admin') && lowered.includes('invited')) {
                    message =
                        lang === 'RO'
                            ? `${email}: Conturile de admin nu pot fi invitate.`
                            : `${email}: Admin accounts cannot be invited.`;
                } else if (lowered.includes('already a member')) {
                    message =
                        lang === 'RO'
                            ? `${email}: Deja membru.`
                            : `${email}: Already a member.`;
                } else if (lowered.includes('pending invitation')) {
                    message =
                        lang === 'RO'
                            ? `${email}: Invitație deja în așteptare.`
                            : `${email}: Invitation already pending.`;
                } else {
                    message = `${email}: ${rawMessage}`;
                }
                errors.push(message);
            }
        }
        setLoadingInvite(false);
        if (successCount > 0) {
            toast.success(
                lang === 'RO'
                    ? `${successCount} invitație${successCount > 1 ? ' trimise' : ' trimisă'}.`
                    : `${successCount} invitation${successCount > 1 ? 's' : ''} sent.`,
            );
        }
        if (errors.length > 0) {
            setInviteFeedback({ msg: errors.join(' | '), isError: true });
            errors.forEach((msg) => toast.error(msg));
            setTimeout(() => setInviteFeedback(null), 8000);
        } else {
            setInviteFeedback({ msg: lang === 'RO' ? 'Succes!' : 'Success!', isError: false });
            setInviteEmail('');
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
            toast.success(lang === 'RO' ? 'Tema a fost creată.' : 'Homework created.');
            await reloadHomeworks();
        } catch (err: any) {
            const message = extractErrorMessage(err, 'Error');
            setFeedback(null);
            toast.error(message);
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
                            {lang === 'RO' ? 'Clasă' : 'Class'}
                        </p>
                        <h1 className="text-3xl font-bold text-(--text-h) mt-1">
                            {group?.name || '...'}
                        </h1>
                        <div className="page-line-horizontal mb-0!" />
                    </div>
                    <div className="flex items-center gap-2">
                        {(isAdmin ||
                            (userId &&
                                group?.creatorId &&
                                userId.toLowerCase() === group.creatorId.toLowerCase())) && (
                            <button
                                onClick={handleDeleteGroup}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-full font-semibold border-2 border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            >
                                {lang === 'RO' ? 'Șterge clasa' : 'Delete class'}
                            </button>
                        )}
                        <Link
                            to="/classes"
                            className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-full font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                        >
                            {lang === 'RO' ? 'Înapoi' : 'Back'}
                        </Link>
                    </div>
                </motion.div>

                {(feedback || error) && (
                    <motion.div
                        variants={itemVariants}
                        className={`mb-6 rounded-2xl border-2 px-4 py-3 text-sm ${error ? 'border-red-500/40 bg-red-500/10' : 'border-(--accent)/40 bg-(--accent)/10'}`}
                    >
                        {error || feedback}
                    </motion.div>
                )}

                {loading && (
                    <motion.div variants={itemVariants} className="text-center py-6">
                        <p className="text-(--text-muted)">
                            {lang === 'RO' ? 'Se încarcă...' : 'Loading...'}
                        </p>
                    </motion.div>
                )}

                {!loading && group && (
                    <div className="grid gap-4 md:gap-6 xl:grid-cols-[1fr_1fr]">
                        {/* Details Section */}
                        <motion.section
                            variants={itemVariants}
                            className="rounded-2xl border border-(--accent)/20 bg-(--surface-muted) p-4 flex flex-col"
                        >
                            <h2 className="text-xl font-bold text-(--text-h) mb-4">
                                {lang === 'RO' ? 'Detalii' : 'Details'}
                            </h2>

                            <div className="space-y-3 mb-5">
                                <div className="rounded-xl border border-(--accent)/20 bg-(--surface-card) p-3">
                                    <p className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mb-1">
                                        {lang === 'RO' ? 'Creator' : 'Creator'}
                                    </p>
                                    <p className="text-sm font-semibold text-(--text-h)">
                                        {group.creatorUsername}
                                    </p>
                                </div>
                                {typeof group.memberCount === 'number' && (
                                    <div className="rounded-xl border border-(--accent)/20 bg-(--surface-card) p-3">
                                        <p className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mb-1">
                                            {lang === 'RO' ? 'Membri' : 'Members'}
                                        </p>
                                        <p className="text-sm font-semibold text-(--text-h)">
                                            {group.memberCount}
                                        </p>
                                    </div>
                                )}
                                <div className="rounded-xl border border-(--accent)/20 bg-(--surface-card) p-3">
                                    <p className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mb-1">
                                        ID
                                    </p>
                                    <p className="text-xs font-mono text-(--text-muted) break-all">
                                        {group.id}
                                    </p>
                                </div>
                                {group.description && (
                                    <div className="rounded-xl border border-(--accent)/20 bg-(--surface-card) p-3">
                                        <p className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mb-1">
                                            {lang === 'RO' ? 'Descriere' : 'Description'}
                                        </p>
                                        <p className="text-sm text-(--text-h)">
                                            {group.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-(--accent)/20 pt-4 mt-auto">
                                <h3 className="text-sm font-bold text-(--text-h) mb-3">
                                    {lang === 'RO' ? 'Invită colegi' : 'Invite members'}
                                </h3>
                                <form onSubmit={handleInviteStudent} className="space-y-2">
                                    <textarea
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder={lang === 'RO' ? 'Email-uri (separate prin virgulă sau linie nouă)' : 'Emails (comma or newline separated)'}
                                        rows={3}
                                        className="w-full rounded-xl bg-(--surface-card) border border-(--accent)/25 px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted) resize-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loadingInvite}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                                    >
                                        {loadingInvite
                                            ? '...'
                                            : lang === 'RO'
                                              ? 'Invită'
                                              : 'Invite'}
                                    </button>
                                </form>
                                {inviteFeedback && (
                                    <p
                                        className={`mt-2 text-xs ${inviteFeedback.isError ? 'text-red-400' : 'text-emerald-400'}`}
                                    >
                                        {inviteFeedback.msg}
                                    </p>
                                )}
                            </div>
                        </motion.section>

                        {/* Create Homework Section */}
                        <motion.section
                            variants={itemVariants}
                            className="rounded-2xl border border-(--accent)/20 bg-(--surface-muted) p-4 flex flex-col"
                        >
                            <h2 className="text-xl font-bold text-(--text-h) mb-4">
                                {lang === 'RO' ? 'Temă nouă' : 'New homework'}
                            </h2>
                            <form
                                onSubmit={handleCreateHomework}
                                className="space-y-3 flex flex-col"
                            >
                                <input
                                    value={homeworkTitle}
                                    onChange={(e) => setHomeworkTitle(e.target.value)}
                                    placeholder={lang === 'RO' ? 'Titlu' : 'Title'}
                                    required
                                    className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                                />
                                <textarea
                                    value={homeworkDescription}
                                    onChange={(e) => setHomeworkDescription(e.target.value)}
                                    placeholder={
                                        lang === 'RO'
                                            ? 'Descriere opțională'
                                            : 'Optional description'
                                    }
                                    className="min-h-20 w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted) resize-none"
                                />
                                <input
                                    type="date"
                                    value={homeworkDeadline}
                                    onChange={(e) => setHomeworkDeadline(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition"
                                />
                                <div className="border-t border-(--accent)/20 pt-3 space-y-2">
                                    <p className="text-xs uppercase tracking-widest text-(--text-muted) font-bold">
                                        {lang === 'RO'
                                            ? 'Inițial (opțional)'
                                            : 'Initial setup (optional)'}
                                    </p>
                                    <input
                                        value={homeworkCreationUsernames}
                                        onChange={(e) =>
                                            setHomeworkCreationUsernames(e.target.value)
                                        }
                                        placeholder={
                                            lang === 'RO'
                                                ? 'Utilizatori (user1, user2)'
                                                : 'Users (user1, user2)'
                                        }
                                        className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                                    />
                                    <input
                                        value={homeworkCreationProblems}
                                        onChange={(e) =>
                                            setHomeworkCreationProblems(e.target.value)
                                        }
                                        placeholder={
                                            lang === 'RO'
                                                ? 'Probleme (p1, p2)'
                                                : 'Problems (p1, p2)'
                                        }
                                        className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full mt-auto inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                                >
                                    {lang === 'RO' ? 'Creează' : 'Create'}
                                </button>
                            </form>
                        </motion.section>

                        {/* Members Section */}
                        <motion.section
                            variants={itemVariants}
                            className="xl:col-span-2 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) p-4"
                        >
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <h2 className="text-xl font-bold text-(--text-h)">
                                    {lang === 'RO' ? 'Membrii clasei' : 'Class members'}
                                </h2>
                                {members && (
                                    <span className="text-xs text-(--text-muted)">
                                        {members.students.length + 1}{' '}
                                        {lang === 'RO' ? 'total' : 'total'}
                                    </span>
                                )}
                            </div>
                            {membersQuery.isPending && (
                                <p className="text-sm text-(--text-muted)">
                                    {lang === 'RO' ? 'Se încarcă...' : 'Loading...'}
                                </p>
                            )}
                            {members && (
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="rounded-xl border border-(--accent)/30 bg-(--accent)/10 p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-(--text-h) truncate">
                                                    {members.teacher.firstName}{' '}
                                                    {members.teacher.lastName}
                                                </p>
                                                <p className="text-xs text-(--text-muted) truncate">
                                                    @{members.teacher.username} ·{' '}
                                                    {members.teacher.email}
                                                </p>
                                            </div>
                                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-(--accent)/40 bg-(--accent)/15 text-(--text-h)">
                                                {lang === 'RO' ? 'Profesor' : 'Teacher'}
                                            </span>
                                        </div>
                                    </div>
                                    {members.students.length === 0 && (
                                        <p className="text-xs text-(--text-muted) self-center">
                                            {lang === 'RO'
                                                ? 'Niciun student în clasă încă.'
                                                : 'No students in this class yet.'}
                                        </p>
                                    )}
                                    {members.students.map((student) => (
                                        <div
                                            key={student.id}
                                            className="rounded-xl border border-(--accent)/20 bg-(--surface-card) p-3 flex items-center justify-between gap-2"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-(--text-h) truncate">
                                                    {student.firstName} {student.lastName}
                                                </p>
                                                <p className="text-xs text-(--text-muted) truncate">
                                                    @{student.username} · {student.email}
                                                </p>
                                            </div>
                                            {canManageMembers && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveStudent(
                                                            student.id,
                                                            student.username,
                                                        )
                                                    }
                                                    className="shrink-0 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 px-3 py-1 text-[11px] font-bold hover:bg-red-500/20"
                                                >
                                                    {lang === 'RO' ? 'Elimină' : 'Kick'}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.section>

                        {/* Pending Invitations - if any */}
                        {(isCreator || isAdmin) && pendingInvitations.length > 0 && (
                            <motion.section
                                variants={itemVariants}
                                className="xl:col-span-2 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) p-4"
                            >
                                <h2 className="text-xl font-bold text-(--text-h) mb-4">
                                    {lang === 'RO'
                                        ? `Invitații în așteptare (${pendingInvitations.length})`
                                        : `Pending invitations (${pendingInvitations.length})`}
                                </h2>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {pendingInvitations.map((inv) => (
                                        <div
                                            key={inv.id}
                                            className="rounded-xl border border-(--accent)/20 bg-(--surface-card) p-3"
                                        >
                                            <p className="text-sm font-semibold text-(--text-h)">
                                                {inv.invitedUser?.username ??
                                                    inv.invitedUser?.email ??
                                                    '-'}
                                            </p>
                                            <p className="text-xs text-(--text-muted) mt-1">
                                                {new Date(inv.sentAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Homework Section */}
                        <motion.section variants={itemVariants} className="xl:col-span-2">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <h2 className="text-xl font-bold text-(--text-h)">
                                    {lang === 'RO' ? 'Teme' : 'Homework'}
                                </h2>
                                {homeworks.length > 0 && (
                                    <span className="text-xs text-(--text-muted)">
                                        {homeworks.length} {lang === 'RO' ? 'teme' : 'items'}
                                    </span>
                                )}
                            </div>

                            {homeworks.length === 0 ? (
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-2xl border-2 border-(--accent)/20 bg-(--surface-muted) p-4 text-sm text-(--text-muted) text-center"
                                >
                                    {lang === 'RO'
                                        ? 'Nicio temă creată încă. Creează una mai sus.'
                                        : 'No homework yet. Create one above.'}
                                </motion.div>
                            ) : (
                                <div className="grid gap-4">{memoizedHomeworkList}</div>
                            )}
                        </motion.section>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
