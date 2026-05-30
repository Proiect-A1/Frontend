import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../../../utils/motionConfig';
import { useT } from '../../../language/Language';
import type { AdminUser } from '../services/adminService';
import { getGravatarUrl, getDiceBearUrl } from '../../../utils/gravatar';

function UserAvatar({ user }: { user: AdminUser }) {
    const gravatar = getGravatarUrl(user.email, 40);
    const [src, setSrc] = useState(gravatar);
    const [failed, setFailed] = useState(false);

    const handleError = () => {
        if (src === gravatar) setSrc(getDiceBearUrl(user.email));
        else setFailed(true);
    };

    if (failed) {
        return (
            <div className="w-10 h-10 rounded-full bg-(--accent)/20 border border-(--accent)/30 flex items-center justify-center text-sm font-bold text-(--text-h) shrink-0 uppercase">
                {(user.firstName || user.username).charAt(0)}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={user.username}
            onError={handleError}
            className="w-10 h-10 rounded-full border border-(--accent)/30 object-cover shrink-0"
        />
    );
}

type Props = {
    users: AdminUser[];
    userPage: number;
    setUserPage: (page: (p: number) => number) => void;
    processingUsers: Set<string>;
    handleRoleChange: (username: string, role: 'USER' | 'ADMIN' | 'PROFESSOR') => void;
    handleBanToggle: (id: string, username: string, banned: boolean) => void;
    handleDeleteUser: (username: string) => void;
};

export default function UserTab({
    users,
    userPage,
    setUserPage,
    processingUsers,
    handleRoleChange,
    handleBanToggle,
    handleDeleteUser
}: Props) {
    const t = useT();

    return (
        <motion.div
            variants={containerVariants}
            className="space-y-4"
        >
            <motion.div
                variants={itemVariants}
                className="flex items-center justify-between mb-6"
            >
                <h2 className="text-2xl font-bold text-(--text-h)">
                    {t.userMgmtTitle}
                </h2>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setUserPage((currentPage) => Math.max(currentPage - 1, 1))}
                        disabled={userPage === 1}
                        className="w-10 h-10 rounded-full border border-(--accent)/30 bg-(--accent)/5 flex items-center justify-center text-(--text-muted) hover:bg-(--accent)/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        ←
                    </button>
                    <span className="text-sm font-black text-(--text-h)">{userPage}</span>
                    <button
                        onClick={() => setUserPage((currentPage) => currentPage + 1)}
                        disabled={users.length < 20}
                        className="w-10 h-10 rounded-full border border-(--accent)/30 bg-(--accent)/5 flex items-center justify-center text-(--text-muted) hover:bg-(--accent)/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        →
                    </button>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                className="grid gap-3"
            >
                {users.map((user) => (
                    <motion.div
                        variants={itemVariants}
                        key={user.username}
                        className="p-4 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar user={user} />
                            <div className="min-w-0">
                            <h3 className="text-(--text-h) font-bold text-lg flex flex-wrap items-center gap-4">
                                <Link
                                    to={`/profile/${encodeURIComponent(user.username)}`}
                                    className="truncate hover:text-(--accent) transition-colors"
                                >
                                    {user.username}
                                </Link>
                                {user.role === 'ADMIN' && (
                                    <span className="bg-purple-500/20 text-purple-500/60 border border-purple-500/60 text-xs px-2.5 py-1 rounded-full uppercase">
                                        Admin
                                    </span>
                                )}
                                {user.role === 'PROFESSOR' && (
                                    <span className="bg-blue-500/20 text-blue-500/60 border border-blue-500/60 text-xs px-2.5 py-1 rounded-full uppercase">
                                        Professor
                                    </span>
                                )}
                                {user.banned && (
                                    <span className="bg-red-500/20 text-red-500/60 border border-red-500/60 text-xs px-2.5 py-1 rounded-full uppercase">
                                        Banned
                                    </span>
                                )}
                            </h3>
                            <p className="text-(--text-muted) text-sm truncate">
                                {user.firstName} {user.lastName} • {user.email}
                            </p>
                            {user.banned && user.banReason && (
                                <p className="text-red-400/70 text-xs mt-0.5 truncate">
                                    {t.userBanReasonLabel} {user.banReason}
                                </p>
                            )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div className="relative group">
                                <select
                                    value={user.role}
                                    onChange={(e) =>
                                        handleRoleChange(user.username, e.target.value as any)
                                    }
                                    className="appearance-none bg-(--accent)/10 border border-(--accent)/40 rounded-full px-4 py-1 text-xs font-semibold text-(--text-h) pr-6 cursor-pointer hover:bg-(--accent)/20 transition-all outline-none"
                                >
                                    <option value="USER" className="bg-(--surface-card) text-(--text-h)">
                                        {t.userRoleStudent}
                                    </option>
                                    <option value="PROFESSOR" className="bg-(--surface-card) text-(--text-h)">
                                        {t.userRoleProfessor}
                                    </option>
                                    <option value="ADMIN" className="bg-(--surface-card) text-(--text-h)">
                                        {t.userRoleAdmin}
                                    </option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-(--accent) text-[8px]">
                                    ▼
                                </div>
                            </div>
                            <button
                                onClick={() => handleBanToggle(user.id, user.username, user.banned)}
                                disabled={processingUsers.has(user.username)}
                                className={`rounded-full border px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
                                    user.banned
                                        ? 'border-green-500/60 bg-green-500/10 text-green-500/60 hover:bg-green-500/20'
                                        : 'border-red-500/60 bg-red-500/10 text-red-500/60 hover:bg-red-500/20'
                                }`}
                            >
                                {user.banned ? t.userUnbanBtn : t.userBanBtn}
                            </button>
                            <button
                                onClick={() => handleDeleteUser(user.username)}
                                disabled={processingUsers.has(user.username)}
                                className="rounded-full border border-(--accent)/40 bg-(--accent)/10 px-3 py-1 text-xs font-bold text-(--text-h) hover:bg-(--accent)/20"
                            >
                                {processingUsers.has(user.username) ? '...' : t.userDeleteBtn}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}
