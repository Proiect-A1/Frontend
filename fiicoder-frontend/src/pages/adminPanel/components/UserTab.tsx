import { motion } from 'framer-motion';
import { itemVariants } from '../../../utils/motionConfig';
import { useLanguage } from '../../../language/Language';
import type { AdminUser } from '../services/adminService';

type Props = {
    users: AdminUser[];
    userPage: number;
    setUserPage: (page: number) => void;
    processingUsers: Set<string>;
    handleRoleChange: (username: string, role: 'USER' | 'ADMIN' | 'PROFESSOR') => void;
    handleBanToggle: (username: string, isBanned: boolean) => void;
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
    const { lang } = useLanguage();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold text-(--text-h)">
                    {lang === 'RO' ? 'Gestionare Utilizatori' : 'User Management'}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setUserPage(Math.max(1, userPage - 1))}
                        disabled={userPage === 1}
                        className="p-2 rounded-xl border border-(--accent)/30 hover:bg-(--accent)/10 disabled:opacity-30"
                    >
                        ←
                    </button>
                    <span className="text-sm font-bold text-(--text-h)">{userPage}</span>
                    <button
                        onClick={() => setUserPage(userPage + 1)}
                        disabled={users.length < 20}
                        className="p-2 rounded-xl border border-(--accent)/30 hover:bg-(--accent)/10 disabled:opacity-30"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className="grid gap-3">
                {users.map((user) => (
                    <motion.div
                        variants={itemVariants}
                        key={user.username}
                        className="p-4 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                    >
                        <div className="min-w-0">
                            <h3 className="text-(--text-h) font-bold text-lg flex flex-wrap items-center gap-4">
                                <span className="truncate">{user.username}</span>
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
                                {user.isBanned && (
                                    <span className="bg-red-500/20 text-red-500/60 border border-red-500/60 text-xs px-2.5 py-1 rounded-full uppercase">
                                        Banned
                                    </span>
                                )}
                            </h3>
                            <p className="text-(--text-muted) text-sm truncate">
                                {user.firstName} {user.lastName} • {user.email}
                            </p>
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
                                        STUDENT
                                    </option>
                                    <option value="PROFESSOR" className="bg-(--surface-card) text-(--text-h)">
                                        PROFESOR
                                    </option>
                                    <option value="ADMIN" className="bg-(--surface-card) text-(--text-h)">
                                        ADMIN
                                    </option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-(--accent) text-[8px]">
                                    ▼
                                </div>
                            </div>
                            <button
                                onClick={() => handleBanToggle(user.username, user.isBanned || false)}
                                disabled={processingUsers.has(user.username)}
                                className={`rounded-full border px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
                                    user.isBanned
                                        ? 'border-green-500/60 bg-green-500/10 text-green-500/60 hover:bg-green-500/20'
                                        : 'border-red-500/60 bg-red-500/10 text-red-500/60 hover:bg-red-500/20'
                                }`}
                            >
                                {user.isBanned ? 'Unban' : 'Ban'}
                            </button>
                            <button
                                onClick={() => handleDeleteUser(user.username)}
                                disabled={processingUsers.has(user.username)}
                                className="rounded-full border border-(--accent)/40 bg-(--accent)/10 px-3 py-1 text-xs font-bold text-(--text-h) hover:bg-(--accent)/20"
                            >
                                {processingUsers.has(user.username) ? '...' : 'Delete'}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
