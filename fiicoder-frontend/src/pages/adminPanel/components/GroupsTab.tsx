import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { containerVariants, itemVariants } from '../../../utils/motionConfig';
import { useLanguage } from '../../../language/Language';
import type {
    GroupInvitation,
    GroupSummary,
    GroupsSearchCriteria,
    GroupMembersResponse,
} from '../services/adminService';
import { formatDateTime } from '../../../utils/dateTime';

type Props = {
    groups: GroupSummary[];
    isLoading: boolean;
    groupPage: number;
    setGroupPage: (page: (p: number) => number) => void;
    totalPages: number;
    totalElements: number;
    criteria: GroupsSearchCriteria;
    setCriteria: (next: GroupsSearchCriteria) => void;
    sort: string;
    setSort: (next: string) => void;
    selectedGroup: GroupSummary | null;
    selectedGroupId: string | null;
    setSelectedGroupId: (id: string | null) => void;
    invitations: GroupInvitation[];
    isInvitationsLoading: boolean;
    members: GroupMembersResponse | null;
    isMembersLoading: boolean;
    handleRemoveMember: (userId: string, username: string) => void;
    isSelectedLoading: boolean;
    handleDeleteGroup: (group: GroupSummary) => void;
};

function formatInviteLabel(invite: GroupInvitation) {
    return {
        target: invite.invitedUserUsername,
        createdAt: invite.sentAt,
        status: invite.status,
    };
}

export default function GroupsTab({
    groups,
    isLoading,
    groupPage,
    setGroupPage,
    totalPages,
    totalElements,
    criteria,
    setCriteria,
    sort,
    setSort,
    selectedGroup,
    selectedGroupId,
    setSelectedGroupId,
    invitations,
    isInvitationsLoading,
    members,
    isMembersLoading,
    handleRemoveMember,
    isSelectedLoading,
    handleDeleteGroup,
}: Props) {
    const { lang } = useLanguage();
    const [searchInput, setSearchInput] = useState(criteria.search ?? '');
    const [creatorInput, setCreatorInput] = useState(criteria.creatorUsername ?? '');
    const [createdAfter, setCreatedAfter] = useState(criteria.createdAfter ?? '');
    const [createdBefore, setCreatedBefore] = useState(criteria.createdBefore ?? '');

    useEffect(() => {
        const handle = setTimeout(() => {
            const trimmedSearch = searchInput.trim();
            const trimmedCreator = creatorInput.trim();
            const next: GroupsSearchCriteria = {
                search: trimmedSearch || undefined,
                creatorUsername: trimmedCreator || undefined,
                createdAfter: createdAfter ? new Date(createdAfter).toISOString() : undefined,
                createdBefore: createdBefore ? new Date(createdBefore).toISOString() : undefined,
            };
            if (
                next.search === criteria.search &&
                next.creatorUsername === criteria.creatorUsername &&
                next.createdAfter === criteria.createdAfter &&
                next.createdBefore === criteria.createdBefore
            ) return;
            setCriteria(next);
        }, 350);
        return () => clearTimeout(handle);
    }, [searchInput, creatorInput, createdAfter, createdBefore]); // eslint-disable-line react-hooks/exhaustive-deps

    const hasNextPage = groupPage < totalPages;

    return (
        <motion.div variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants} className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-2xl font-bold text-(--text-h)">
                    {lang === 'RO' ? 'Gestionare Grupe' : 'Group Management'}
                </h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setGroupPage((currentPage) => Math.max(currentPage - 1, 1))}
                        disabled={groupPage === 1}
                        className="w-10 h-10 rounded-full border border-(--accent)/30 bg-(--accent)/5 flex items-center justify-center text-(--text-muted) hover:bg-(--accent)/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        ←
                    </button>
                    <span className="text-sm font-black text-(--text-h)">
                        {groupPage}
                        {totalPages > 0 && (
                            <span className="text-(--text-muted) font-bold"> / {totalPages}</span>
                        )}
                    </span>
                    <button
                        onClick={() => setGroupPage((currentPage) => currentPage + 1)}
                        disabled={!hasNextPage}
                        className="w-10 h-10 rounded-full border border-(--accent)/30 bg-(--accent)/5 flex items-center justify-center text-(--text-muted) hover:bg-(--accent)/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        →
                    </button>
                </div>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 p-4 rounded-2xl border border-(--accent)/20 bg-(--surface-muted)"
            >
                <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={lang === 'RO' ? 'Caută după nume...' : 'Search by name...'}
                    className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                />
                <input
                    value={creatorInput}
                    onChange={(e) => setCreatorInput(e.target.value)}
                    placeholder={lang === 'RO' ? 'Creator (username)' : 'Creator (username)'}
                    className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition placeholder:text-(--text-muted)"
                />
                <input
                    type="date"
                    value={createdAfter}
                    onChange={(e) => setCreatedAfter(e.target.value)}
                    title={lang === 'RO' ? 'Creată după' : 'Created after'}
                    className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition"
                />
                <input
                    type="date"
                    value={createdBefore}
                    onChange={(e) => setCreatedBefore(e.target.value)}
                    title={lang === 'RO' ? 'Creată înainte de' : 'Created before'}
                    className="w-full rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-2 text-sm text-(--text-h) outline-none transition"
                />
                <div className="md:col-span-2 xl:col-span-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="text-xs text-(--text-muted) font-semibold">
                        {lang === 'RO' ? 'Total' : 'Total'}: {totalElements}
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-(--text-muted) font-bold uppercase tracking-widest">
                            {lang === 'RO' ? 'Sortează' : 'Sort'}
                        </label>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="rounded-xl border border-(--accent)/25 bg-(--surface-card) px-3 py-1.5 text-xs text-(--text-h) outline-none"
                        >
                            <option value="createdAt,desc">{lang === 'RO' ? 'Cele mai noi' : 'Newest first'}</option>
                            <option value="createdAt,asc">{lang === 'RO' ? 'Cele mai vechi' : 'Oldest first'}</option>
                            <option value="name,asc">{lang === 'RO' ? 'Nume A–Z' : 'Name A–Z'}</option>
                            <option value="name,desc">{lang === 'RO' ? 'Nume Z–A' : 'Name Z–A'}</option>
                        </select>
                        {(searchInput || creatorInput || createdAfter || createdBefore) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput('');
                                    setCreatorInput('');
                                    setCreatedAfter('');
                                    setCreatedBefore('');
                                }}
                                className="rounded-full border border-(--accent)/35 px-3 py-1 text-xs font-semibold text-(--text-h) hover:bg-(--accent)/10"
                            >
                                {lang === 'RO' ? 'Resetează filtrele' : 'Reset filters'}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
            >
                <motion.div variants={containerVariants} className="space-y-3">
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between text-sm text-(--text-muted) font-semibold"
                    >
                        <span>{lang === 'RO' ? 'Grupe disponibile' : 'Available groups'}</span>
                        <span>{groups.length}</span>
                    </motion.div>

                    {isLoading && (
                        <motion.p variants={itemVariants} className="text-(--text-muted) text-sm">
                            {lang === 'RO' ? 'Se incarca grupele...' : 'Loading groups...'}
                        </motion.p>
                    )}

                    <motion.div variants={containerVariants} className="grid gap-3">
                        {!isLoading && groups.length === 0 && (
                            <motion.p
                                variants={itemVariants}
                                className="text-(--text-muted) text-sm"
                            >
                                {lang === 'RO' ? 'Nu exista grupe.' : 'No groups found.'}
                            </motion.p>
                        )}

                        {groups.map((group) => {
                            const isSelected = selectedGroupId === group.id;
                            return (
                                <motion.button
                                    key={group.id}
                                    variants={itemVariants}
                                    onClick={() => setSelectedGroupId(group.id)}
                                    className={`text-left p-4 rounded-2xl border transition-colors duration-200 ${
                                        isSelected
                                            ? 'border-(--accent) bg-(--accent)/15'
                                            : 'border-(--accent)/20 bg-(--surface-muted) hover:border-(--accent)/40 hover:bg-(--accent)/10'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-(--text-h) line-clamp-1">
                                            {group.name}
                                        </h3>
                                        <span className="text-xs text-(--text-muted) font-semibold whitespace-nowrap">
                                            {formatDateTime(group.createdAt, lang)}
                                        </span>
                                    </div>
                                    {group.description && (
                                        <p className="text-sm text-(--text-muted) line-clamp-2">
                                            {group.description}
                                        </p>
                                    )}
                                    <div className="mt-2 flex items-center justify-between gap-2 flex-wrap text-xs text-(--text-muted) font-semibold">
                                        <span>
                                            {lang === 'RO' ? 'Creator' : 'Creator'}:{' '}
                                            <span className="text-(--text)">
                                                {group.creatorUsername}
                                            </span>
                                        </span>
                                        {typeof group.memberCount === 'number' && (
                                            <span className="px-2 py-0.5 rounded-full border border-(--accent)/30 bg-(--accent)/5 text-(--text-h)">
                                                {group.memberCount}{' '}
                                                {lang === 'RO' ? 'membri' : 'members'}
                                            </span>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="p-5 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) h-fit xl:sticky xl:top-0 space-y-4"
                >
                    {!selectedGroup && !selectedGroupId && (
                        <p className="text-(--text-muted) text-sm text-center py-8">
                            {lang === 'RO'
                                ? 'Selecteaza o grupa pentru detalii.'
                                : 'Select a group to see details.'}
                        </p>
                    )}

                    {!selectedGroup && selectedGroupId && (
                        <p className="text-(--text-muted) text-sm">
                            {lang === 'RO'
                                ? 'Se incarca detaliile grupei...'
                                : 'Loading group details...'}
                        </p>
                    )}

                    {selectedGroup && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-(--text-h)">
                                    {selectedGroup.name}
                                </h3>
                                {selectedGroup.description && (
                                    <p className="text-sm text-(--text-muted)">
                                        {selectedGroup.description}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center gap-2 text-xs text-(--text-muted)">
                                    <span>
                                        {lang === 'RO' ? 'Creator' : 'Creator'}:{' '}
                                        <span className="text-(--text-h) font-bold">
                                            {selectedGroup.creatorUsername}
                                        </span>
                                    </span>
                                    <span>{formatDateTime(selectedGroup.createdAt, lang)}</span>
                                    {typeof selectedGroup.memberCount === 'number' && (
                                        <span className="px-2 py-0.5 rounded-full border border-(--accent)/30 bg-(--accent)/10 text-(--text-h)">
                                            {selectedGroup.memberCount}{' '}
                                            {lang === 'RO' ? 'membri' : 'members'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Link
                                    to={`/classes/${selectedGroup.id}`}
                                    className="rounded-full border border-(--accent)/40 bg-(--accent)/10 px-3 py-1 text-xs font-bold text-(--text-h) hover:bg-(--accent)/20 transition-all"
                                >
                                    {lang === 'RO' ? 'Deschide clasa' : 'Open class'}
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteGroup(selectedGroup)}
                                    className="rounded-full border border-red-500/60 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-all"
                                >
                                    {lang === 'RO' ? 'Sterge' : 'Delete'}
                                </button>
                            </div>

                            <div className="border-t border-(--accent)/20 pt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-(--text-h)">
                                        {lang === 'RO' ? 'Membri' : 'Members'}
                                    </h4>
                                    <span className="text-xs text-(--text-muted)">
                                        {isMembersLoading
                                            ? '...'
                                            : members
                                              ? members.students.length + 1
                                              : 0}
                                    </span>
                                </div>

                                {isMembersLoading && (
                                    <p className="text-xs text-(--text-muted)">
                                        {lang === 'RO'
                                            ? 'Se incarca membrii...'
                                            : 'Loading members...'}
                                    </p>
                                )}

                                {!isMembersLoading && members && (
                                    <div className="space-y-2">
                                        <div className="rounded-2xl border border-(--accent)/30 bg-(--accent)/10 px-3 py-2 flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-(--text-h) truncate">
                                                    {members.teacher.username}{' '}
                                                    <span className="text-[10px] uppercase tracking-widest text-(--text-muted) ml-1">
                                                        {lang === 'RO' ? 'Profesor' : 'Teacher'}
                                                    </span>
                                                </p>
                                                <p className="text-[10px] text-(--text-muted) truncate">
                                                    {members.teacher.firstName}{' '}
                                                    {members.teacher.lastName} ·{' '}
                                                    {members.teacher.email}
                                                </p>
                                            </div>
                                        </div>
                                        {members.students.length === 0 && (
                                            <p className="text-xs text-(--text-muted)">
                                                {lang === 'RO'
                                                    ? 'Niciun student.'
                                                    : 'No students.'}
                                            </p>
                                        )}
                                        {members.students.map((student) => (
                                            <div
                                                key={student.id}
                                                className="rounded-2xl border border-(--accent)/20 bg-(--accent)/5 px-3 py-2 flex items-center justify-between gap-2"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-(--text-h) truncate">
                                                        {student.username}
                                                    </p>
                                                    <p className="text-[10px] text-(--text-muted) truncate">
                                                        {student.firstName} {student.lastName} ·{' '}
                                                        {student.email}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveMember(
                                                            student.id,
                                                            student.username,
                                                        )
                                                    }
                                                    className="shrink-0 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 px-2 py-0.5 text-[10px] font-bold hover:bg-red-500/20"
                                                >
                                                    {lang === 'RO' ? 'Elimină' : 'Remove'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-(--accent)/20 pt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-(--text-h)">
                                        {lang === 'RO'
                                            ? 'Invitatii pending'
                                            : 'Pending invitations'}
                                    </h4>
                                    <span className="text-xs text-(--text-muted)">
                                        {isInvitationsLoading ? '...' : invitations.length}
                                    </span>
                                </div>

                                {isInvitationsLoading && (
                                    <p className="text-xs text-(--text-muted)">
                                        {lang === 'RO'
                                            ? 'Se incarca invitatiile...'
                                            : 'Loading invitations...'}
                                    </p>
                                )}

                                {!isInvitationsLoading && invitations.length === 0 && (
                                    <p className="text-xs text-(--text-muted)">
                                        {lang === 'RO'
                                            ? 'Nu exista invitatii pending.'
                                            : 'No pending invitations.'}
                                    </p>
                                )}

                                {invitations.length > 0 && (
                                    <div className="space-y-2">
                                        {invitations.map((invite) => {
                                            const { target, createdAt, status } =
                                                formatInviteLabel(invite);
                                            return (
                                                <div
                                                    key={invite.id}
                                                    className="rounded-2xl border border-(--accent)/20 bg-(--accent)/5 px-3 py-2"
                                                >
                                                    <div className="text-xs font-semibold text-(--text-h)">
                                                        {target}
                                                    </div>
                                                    <div className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold">
                                                        {formatDateTime(createdAt, lang)}
                                                        {status ? ` · ${status}` : ''}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {isSelectedLoading && (
                                <p className="text-xs text-(--text-muted)">
                                    {lang === 'RO'
                                        ? 'Se actualizeaza detaliile...'
                                        : 'Refreshing details...'}
                                </p>
                            )}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
