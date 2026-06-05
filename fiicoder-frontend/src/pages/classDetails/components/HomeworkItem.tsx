import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { homeworkService } from '../services/homeworkService';
import type {
    HomeworkResponseDTO,
    HomeworkDetailDTO,
    HomeworkStatisticsDTO,
    StudentProgressSummaryDTO,
    HomeworkUpdateDeleteRequestDTO,
    HomeworkUpdateRequestDTO,
    PagedHomeworkSubmissionsDTO,
} from '../types/homework';
import { submissionVerdict, submissionVerdictLabels, type SubmissionVerdict } from '../../profile/profileUtils';
import { translations } from '../../../language/Language';
import { itemVariants } from '../../../utils/motionConfig';
import { extractErrorMessage } from '../../../utils/httpError';
import { parseCsvValues } from '../classDetailsUtils';
import { toast } from 'sonner';

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

const verdictClasses: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'border-green-500/40 bg-green-500/10 text-green-300',
    PARTIAL: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    PENDING: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    REJECTED: 'border-red-500/40 bg-red-500/10 text-red-300',
};

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

export function HomeworkItem({
    homework,
    isSelected,
    onToggle,
    groupId,
    userId,
    creatorId,
    lang,
    onReload,
}: HomeworkItemProps) {
    const t = translations[lang as 'RO' | 'EN'] ?? translations.RO;
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

    const [submissionsProblem, setSubmissionsProblem] = useState<{ id: string; title: string } | null>(null);
    const [problemSubmissions, setProblemSubmissions] = useState<PagedHomeworkSubmissionsDTO | null>(null);
    const [submissionsPage, setSubmissionsPage] = useState(0);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    const isCreator = !!(userId && creatorId && userId.toLowerCase() === creatorId.toLowerCase());

    useEffect(() => {
        if (!selectedStudentProgress) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedStudentProgress(null); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [selectedStudentProgress]);

    useEffect(() => {
        if (!submissionsProblem) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSubmissionsProblem(null); setProblemSubmissions(null); } };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [submissionsProblem]);

    const loadProblemSubmissions = useCallback(async (problemId: string, page: number) => {
        try {
            setLoadingSubmissions(true);
            const data = await homeworkService.getSubmissionsForProblem(groupId, homework.id, problemId, page);
            setProblemSubmissions(data);
        } catch (err) {
            console.error('Failed to load problem submissions', err);
        } finally {
            setLoadingSubmissions(false);
        }
    }, [groupId, homework.id]);

    const handleViewProblemSubmissions = (problem: { id: string; title: string }) => {
        setSubmissionsProblem(problem);
        setSubmissionsPage(0);
        void loadProblemSubmissions(problem.id, 0);
    };

    const goToSubmissionsPage = (page: number) => {
        if (!submissionsProblem || page < 0) return;
        setSubmissionsPage(page);
        void loadProblemSubmissions(submissionsProblem.id, page);
    };

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
                    setError(err?.body?.message || t.hwLoadError);
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
            setFeedback(t.hwPublishedFeedback);
            toast.success(t.hwPublishedMsg);
            await onReload();
        } catch (err: any) {
            const message = extractErrorMessage(err, 'Error');
            setError(message);
            toast.error(message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(t.hwDeleteConfirm)) return;
        try {
            await homeworkService.delete(groupId, homework.id);
            toast.success(t.hwDeletedMsg);
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
            setFeedback(t.hwUpdatedFeedback);
            toast.success(t.hwUpdatedMsg);
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
            setFeedback(t.hwUpdatedFeedback);
            toast.success(t.hwItemsRemovedMsg);
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
            const data = await homeworkService.getStudentProgress(homework.id, studentId);
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
                        {homework.description || t.noDescription}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-(--text-muted)">
                        <span>
                            Deadline:{' '}
                            {homework.deadline
                                ? new Date(homework.deadline).toLocaleString(lang === 'RO' ? 'ro-RO' : 'en-US', { dateStyle: 'medium', timeStyle: 'short', timeZoneName: 'short' })
                                : '—'}
                        </span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => onToggle(homework.id)}
                        className="rounded-full border border-(--accent)/40 px-3 py-1.5 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/10"
                    >
                        {isSelected ? t.hwHideBtn : t.hwDetailsBtn}
                    </button>
                    {userId && creatorId && userId.toLowerCase() === creatorId.toLowerCase() && (
                        <>
                            {homework.status === 'DRAFT' && (
                                <button
                                    onClick={handlePublish}
                                    className="rounded-full border border-emerald-400/50 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/10"
                                >
                                    {t.hwPublishBtn}
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="rounded-full border border-red-400/50 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                            >
                                {t.hwDeleteBtn}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isSelected && (
                <div className="mt-4 rounded-2xl border border-(--accent)/20 bg-black/15 p-4 space-y-4">
                    {loadingDetails && (
                        <p className="text-sm text-(--text-muted)">
                            {t.loadingLabel}
                        </p>
                    )}
                    {feedback && <p className="text-xs text-emerald-400">{feedback}</p>}
                    {error && <p className="text-xs text-red-400">{error}</p>}

                    {selectedHomeworkDetail && !loadingDetails && (
                        <>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <h4 className="text-xs uppercase tracking-widest text-(--text-muted) font-bold">
                                        {t.hwProblemsLabel}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedHomeworkDetail.problems.map((p) => {
                                            const problemTitle = p.title ?? p.problemTitle ?? '';
                                            return (
                                                <div
                                                    key={p.id ?? problemTitle}
                                                    className="flex items-center rounded-md border border-(--accent)/30 bg-(--accent)/10 overflow-hidden"
                                                >
                                                    <Link
                                                        to={`/problems/${problemTitle}`}
                                                        className="px-2 py-1 text-[11px] hover:bg-(--accent)/25"
                                                    >
                                                        {problemTitle}
                                                    </Link>
                                                    {isCreator && p.id && homework.status !== 'DRAFT' && (
                                                        <button
                                                            onClick={() => handleViewProblemSubmissions({ id: p.id, title: problemTitle })}
                                                            title={t.hwViewSubmissions}
                                                            className="px-1.5 py-1 border-l border-(--accent)/30 text-(--text-muted) hover:bg-(--accent)/25 hover:text-(--accent) transition-colors"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {submissionsProblem && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-3 p-4 rounded-2xl border-2 border-(--accent)/30 bg-(--surface-card)"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h5 className="font-bold text-(--text-h)">
                                                        {t.hwSubmissionsLabel}{' '}
                                                        {submissionsProblem.title}
                                                    </h5>
                                                    {problemSubmissions && (
                                                        <p className="text-[10px] text-(--text-muted)">
                                                            {problemSubmissions.totalElements}{' '}
                                                            {t.hwTotalSubmissions}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => { setSubmissionsProblem(null); setProblemSubmissions(null); }}
                                                    className="text-(--text-muted) hover:text-(--text-h)"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>

                                            {loadingSubmissions ? (
                                                <p className="text-xs text-(--text-muted)">
                                                    {t.loadingLabel}
                                                </p>
                                            ) : problemSubmissions && problemSubmissions.content.length > 0 ? (
                                                <>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left text-xs border-collapse">
                                                            <thead>
                                                                <tr className="border-b border-(--accent)/10 text-(--text-muted)">
                                                                    <th className="py-2 px-1 font-bold">{t.hwStudentCol}</th>
                                                                    <th className="py-2 px-1 text-center font-bold">{t.scoreLabel}</th>
                                                                    <th className="py-2 px-1 text-center font-bold">Status</th>
                                                                    <th className="py-2 px-1 text-right font-bold">{t.hwDateCol}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {problemSubmissions.content.map((s) => {
                                                                    const verdict = submissionVerdict({ status: s.status, score: s.score ?? 0 });
                                                                    return (
                                                                        <tr key={s.submissionId} className="border-b border-(--accent)/5 hover:bg-(--accent)/5 transition-colors">
                                                                            <td className="py-2 px-1 font-bold text-(--text-h)">{s.username ?? '—'}</td>
                                                                            <td className="py-2 px-1 text-center font-mono">{s.score != null ? s.score.toFixed(0) : '—'}</td>
                                                                            <td className="py-2 px-1 text-center">
                                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${verdictClasses[verdict]}`}>
                                                                                    {submissionVerdictLabels[verdict][lang === 'RO' ? 'ro' : 'en']}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-2 px-1 text-right text-[10px] text-(--text-muted)">
                                                                                {new Date(s.submittedAt).toLocaleString(lang === 'RO' ? 'ro-RO' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    {problemSubmissions.totalPages > 1 && (
                                                        <div className="flex items-center justify-between mt-3 text-xs">
                                                            <button
                                                                disabled={submissionsPage <= 0}
                                                                onClick={() => goToSubmissionsPage(submissionsPage - 1)}
                                                                className="px-3 py-1 rounded-lg border border-(--accent)/30 text-(--text-h) hover:bg-(--accent)/10 disabled:opacity-40 disabled:cursor-not-allowed"
                                                            >
                                                                {t.hwPrevBtn}
                                                            </button>
                                                            <span className="text-(--text-muted)">
                                                                {submissionsPage + 1} / {problemSubmissions.totalPages}
                                                            </span>
                                                            <button
                                                                disabled={!problemSubmissions.hasNext}
                                                                onClick={() => goToSubmissionsPage(submissionsPage + 1)}
                                                                className="px-3 py-1 rounded-lg border border-(--accent)/30 text-(--text-h) hover:bg-(--accent)/10 disabled:opacity-40 disabled:cursor-not-allowed"
                                                            >
                                                                {t.hwNextBtn}
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-xs text-(--text-muted)">
                                                    {t.hwNoProblemSubmissions}
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                                {userId &&
                                    creatorId &&
                                    userId.toLowerCase() === creatorId.toLowerCase() && (
                                        <div className="text-[11px] text-(--text-muted)">
                                            <p>
                                                {t.hwStudentsLabel}{' '}
                                                {selectedHomeworkDetail.assignedUsers?.length || 0}
                                            </p>
                                            <p>
                                                {t.hwSubmissionsLabel}{' '}
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
                                                {t.hwAddSection}
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
                                                {t.hwRemoveSection}
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
                                            {t.hwStudentProgressTitle}
                                        </h4>

                                        {loadingStats && (
                                            <p className="text-xs text-(--text-muted)">...</p>
                                        )}

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="border-b border-(--accent)/10 text-(--text-muted)">
                                                        <th className="py-2 px-1 font-bold">
                                                            {t.hwStudentCol}
                                                        </th>
                                                        <th className="py-2 px-1 text-center font-bold">
                                                            {t.hwProblemsLabel}
                                                        </th>
                                                        <th className="py-2 px-1 text-center font-bold">
                                                            {t.hwAvgScoreCol}
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
                                                                        ? t.hwStatusDone
                                                                        : student.hasStarted
                                                                          ? t.hwStatusWorking
                                                                          : t.hwStatusIdle}
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
                                                                    {loadingStudentProgress ? t.loadingLabel : t.hwDetailsBtn}
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
                                                            {t.hwProgressDetailsLabel}{' '}
                                                            {selectedStudentProgress.username}
                                                        </h5>
                                                        <p className="text-[10px] text-(--text-muted)">
                                                            {t.hwAvgScoreShort}{' '}
                                                            {selectedStudentProgress.averageScore.toFixed(
                                                                1,
                                                            )}{' '}
                                                            •{' '}
                                                            {
                                                                selectedStudentProgress.attemptedProblems
                                                            }{' '}
                                                            {t.hwAttemptedProblems}
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
                                                                    {t.hwAttemptsShort}
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
