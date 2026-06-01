import { useCallback, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { classService } from '../classesHub/services/classService';
import { homeworkService } from './services/homeworkService';
import { useLanguage, translations, getRemoveStudentConfirm, getDeleteClassConfirm, getInvitationsSentMsg, getPendingInvitationsTitle } from '../../language/Language';
import { containerVariants, itemVariants, pageVariants } from '../../utils/motionConfig';
import { extractErrorMessage } from '../../utils/httpError';
import { storage, STORAGE_KEYS } from '../../utils/storage';
import { toast } from 'sonner';
import { HomeworkItem } from './components/HomeworkItem';
import { parseCsvValues } from './classDetailsUtils';

export default function ClassDetails() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { lang } = useLanguage();
    const t = translations[lang];
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
        if (!window.confirm(getRemoveStudentConfirm(lang, username))) return;
        try {
            await classService.removeGroupStudent(groupId, studentId);
            toast.success(t.studentRemoved);
            await queryClient.invalidateQueries({ queryKey: ['class-members', groupId] });
            await queryClient.invalidateQueries({ queryKey: ['my-groups'] });
        } catch (err: any) {
            toast.error(
                extractErrorMessage(err, t.studentRemoveError),
            );
        }
    };
    const pendingInvitations = (invitationsQuery.data ?? []).filter(
        (inv) => inv.status === 'PENDING',
    );
    const homeworks = homeworksQuery.data ?? [];
    const loading = groupQuery.isPending || homeworksQuery.isPending;
    const groupErrorStatus = (groupQuery.error as { status?: number } | null)?.status;
    const accessDeniedMessage = t.classAccessDeniedLong;
    const notFoundMessage = t.classNotFoundMsg;
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
        if (!window.confirm(getDeleteClassConfirm(lang, group?.name ?? ''))) return;
        try {
            await classService.deleteGroup(groupId!);
            if (userId) {
                const key = STORAGE_KEYS.recentClasses(userId);
                // Only rewrite if a recent-classes entry already exists (preserves
                // prior behavior of not creating the key on delete).
                if (storage.get(key) !== null) {
                    const classes = storage.getJson<{ id: string }[]>(key, []);
                    storage.setJson(key, classes.filter((c) => c.id !== groupId));
                }
            }
            toast.success(t.classDeleted);
            navigate('/classes');
        } catch (err: any) {
            toast.error(extractErrorMessage(err, t.classDeleteError));
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
                    message = `${email}: ${t.inviteAdminError}`;
                } else if (lowered.includes('already a member')) {
                    message = `${email}: ${t.inviteAlreadyMember}`;
                } else if (lowered.includes('pending invitation')) {
                    message = `${email}: ${t.invitePendingError}`;
                } else {
                    message = `${email}: ${rawMessage}`;
                }
                errors.push(message);
            }
        }
        setLoadingInvite(false);
        if (successCount > 0) {
            toast.success(getInvitationsSentMsg(lang, successCount));
        }
        if (errors.length > 0) {
            setInviteFeedback({ msg: errors.join(' | '), isError: true });
            errors.forEach((msg) => toast.error(msg));
            setTimeout(() => setInviteFeedback(null), 8000);
        } else {
            setInviteFeedback({ msg: t.inviteSuccess, isError: false });
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
            setFeedback(t.hwCreatedFeedback);
            toast.success(t.hwCreatedMsg);
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
                            {t.classLabel}
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
                                {t.deleteClassBtn}
                            </button>
                        )}
                        <Link
                            to="/classes"
                            className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-full font-semibold border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                        >
                            {t.backBtn}
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
                            {t.loadingLabel}
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
                                {t.detailsSection}
                            </h2>

                            <div className="space-y-3 mb-5">
                                <div className="rounded-xl border border-(--accent)/20 bg-(--surface-card) p-3">
                                    <p className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mb-1">
                                        Creator
                                    </p>
                                    <p className="text-sm font-semibold text-(--text-h)">
                                        {group.creatorUsername}
                                    </p>
                                </div>
                                {typeof group.memberCount === 'number' && (
                                    <div className="rounded-xl border border-(--accent)/20 bg-(--surface-card) p-3">
                                        <p className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mb-1">
                                            {t.membersLabel}
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
                                            {t.descriptionLabel}
                                        </p>
                                        <p className="text-sm text-(--text-h)">
                                            {group.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-(--accent)/20 pt-4 mt-auto">
                                <h3 className="text-sm font-bold text-(--text-h) mb-3">
                                    {t.inviteMembersTitle}
                                </h3>
                                <form onSubmit={handleInviteStudent} className="space-y-2">
                                    <textarea
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder={t.inviteEmailPlaceholder}
                                        rows={3}
                                        className="w-full rounded-xl bg-(--surface-card) border border-(--accent)/25 px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted) resize-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loadingInvite}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                                    >
                                        {loadingInvite ? t.sendingBtn : t.inviteBtn}
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
                                {t.newHomeworkSection}
                            </h2>
                            <form
                                onSubmit={handleCreateHomework}
                                className="space-y-3 flex flex-col"
                            >
                                <input
                                    value={homeworkTitle}
                                    onChange={(e) => setHomeworkTitle(e.target.value)}
                                    placeholder={t.hwTitlePlaceholder}
                                    required
                                    className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                                />
                                <textarea
                                    value={homeworkDescription}
                                    onChange={(e) => setHomeworkDescription(e.target.value)}
                                    placeholder={t.classOptionalDesc}
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
                                        {t.hwInitialOptional}
                                    </p>
                                    <input
                                        value={homeworkCreationUsernames}
                                        onChange={(e) =>
                                            setHomeworkCreationUsernames(e.target.value)
                                        }
                                        placeholder={t.hwUsersPlaceholder}
                                        className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                                    />
                                    <input
                                        value={homeworkCreationProblems}
                                        onChange={(e) =>
                                            setHomeworkCreationProblems(e.target.value)
                                        }
                                        placeholder={t.hwProblemsPlaceholder}
                                        className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-xs text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full mt-auto inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                                >
                                    {t.createBtn}
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
                                    {t.classMembersSection}
                                </h2>
                                {members && (
                                    <span className="text-xs text-(--text-muted)">
                                        {members.students.length + 1}{' '}
                                        total
                                    </span>
                                )}
                            </div>
                            {membersQuery.isPending && (
                                <p className="text-sm text-(--text-muted)">
                                    {t.loadingLabel}
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
                                                {t.teacherLabel}
                                            </span>
                                        </div>
                                    </div>
                                    {members.students.length === 0 && (
                                        <p className="text-xs text-(--text-muted) self-center">
                                            {t.noStudentsYet}
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
                                                    {t.kickBtn}
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
                                    {getPendingInvitationsTitle(lang, pendingInvitations.length)}
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
                                    {t.homeworkSection}
                                </h2>
                                {homeworks.length > 0 && (
                                    <span className="text-xs text-(--text-muted)">
                                        {homeworks.length} {t.homeworkItems}
                                    </span>
                                )}
                            </div>

                            {homeworks.length === 0 ? (
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-2xl border-2 border-(--accent)/20 bg-(--surface-muted) p-4 text-sm text-(--text-muted) text-center"
                                >
                                    {t.noHomeworkYet}
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
