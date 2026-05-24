import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../../../utils/motionConfig';
import { useLanguage } from '../../../language/Language';
import type { GroupInvitation, GroupSummary } from '../services/adminService';
import { formatDateTime } from '../../../utils/dateTime';

type Props = {
    groups: GroupSummary[];
    isLoading: boolean;
    groupPage: number;
    setGroupPage: (page: (p: number) => number) => void;
    selectedGroup: GroupSummary | null;
    selectedGroupId: string | null;
    setSelectedGroupId: (id: string | null) => void;
    invitations: GroupInvitation[];
    isInvitationsLoading: boolean;
    isSelectedLoading: boolean;
    handleDeleteGroup: (group: GroupSummary) => void;
};

function formatInviteLabel(invite: GroupInvitation) {
    const target = invite.inviteeUsername || invite.inviteeEmail || invite.email || invite.username || invite.id;
    const createdAt = invite.createdAt || invite.invitedAt || invite.sentAt;
    const status = invite.status || invite.state;
    return { target, createdAt, status };
}


export default function GroupsTab({
    groups,
    isLoading,
    groupPage,
    setGroupPage,
    selectedGroup,
    selectedGroupId,
    setSelectedGroupId,
    invitations,
    isInvitationsLoading,
    isSelectedLoading,
    handleDeleteGroup,
}: Props) {
    const { lang } = useLanguage();

    return (
        <motion.div variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
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
                    <span className="text-sm font-black text-(--text-h)">{groupPage}</span>
                    <button
                        onClick={() => setGroupPage((currentPage) => currentPage + 1)}
                        disabled={groups.length < 20}
                        className="w-10 h-10 rounded-full border border-(--accent)/30 bg-(--accent)/5 flex items-center justify-center text-(--text-muted) hover:bg-(--accent)/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        →
                    </button>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
            >
                <motion.div variants={containerVariants} className="space-y-3">
                    <motion.div variants={itemVariants} className="flex items-center justify-between text-sm text-(--text-muted) font-semibold">
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
                            <motion.p variants={itemVariants} className="text-(--text-muted) text-sm">
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
                                    <div className="mt-2 text-xs text-(--text-muted) font-semibold">
                                        {lang === 'RO' ? 'Creator' : 'Creator'}:{' '}
                                        <span className="text-(--text)">{group.creatorUsername}</span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="p-5 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) h-fit xl:sticky xl:top-0"
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
                            {lang === 'RO' ? 'Se incarca detaliile grupei...' : 'Loading group details...'}
                        </p>
                    )}

                    {selectedGroup && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-(--text-h)">{selectedGroup.name}</h3>
                                {selectedGroup.description && (
                                    <p className="text-sm text-(--text-muted)">{selectedGroup.description}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-2 text-xs text-(--text-muted)">
                                    <span>
                                        {lang === 'RO' ? 'Creator' : 'Creator'}:{' '}
                                        <span className="text-(--text-h) font-bold">{selectedGroup.creatorUsername}</span>
                                    </span>
                                        {formatDateTime(selectedGroup.createdAt, lang)}
                                    <span>{selectedGroup.createdAt}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {selectedGroup.isCreator && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteGroup(selectedGroup)}
                                        className="rounded-full border border-red-500/60 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-all"
                                    >
                                        {lang === 'RO' ? 'Sterge' : 'Delete'}
                                    </button>
                                )}
                                {!selectedGroup.isCreator && (
                                    <span className="text-xs text-(--text-muted)">
                                        {lang === 'RO' ? 'Doar creatorul poate sterge.' : 'Only the creator can delete.'}
                                    </span>
                                )}
                            </div>

                            <div className="border-t border-(--accent)/20 pt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-(--text-h)">
                                        {lang === 'RO' ? 'Invitatii pending' : 'Pending invitations'}
                                    </h4>
                                    {selectedGroup.isCreator && (
                                        <span className="text-xs text-(--text-muted)">
                                            {isInvitationsLoading ? '...' : invitations.length}
                                        </span>
                                    )}
                                </div>

                                {!selectedGroup.isCreator && (
                                    <p className="text-xs text-(--text-muted)">
                                        {lang === 'RO'
                                            ? 'Doar creatorul poate vedea invitatiile.'
                                            : 'Only the creator can view invitations.'}
                                    </p>
                                )}

                                {selectedGroup.isCreator && isInvitationsLoading && (
                                    <p className="text-xs text-(--text-muted)">
                                        {lang === 'RO' ? 'Se incarca invitatiile...' : 'Loading invitations...'}
                                    </p>
                                )}

                                {selectedGroup.isCreator && !isInvitationsLoading && invitations.length === 0 && (
                                    <p className="text-xs text-(--text-muted)">
                                        {lang === 'RO' ? 'Nu exista invitatii pending.' : 'No pending invitations.'}
                                    </p>
                                )}

                                {selectedGroup.isCreator && invitations.length > 0 && (
                                    <div className="space-y-2">
                                        {invitations.map((invite) => {
                                            const { target, createdAt, status } = formatInviteLabel(invite);
                                            return (
                                                <div
                                                    key={invite.id}
                                                    className="rounded-2xl border border-(--accent)/20 bg-(--accent)/5 px-3 py-2"
                                                >
                                                    <div className="text-xs font-semibold text-(--text-h)">{target}</div>
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
                                    {lang === 'RO' ? 'Se actualizeaza detaliile...' : 'Refreshing details...'}
                                </p>
                            )}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
