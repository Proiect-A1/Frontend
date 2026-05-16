import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, type AdminUser } from '../services/adminService';
import { toast } from 'sonner';
import { useLanguage } from '../../../language/Language';
import { extractErrorMessage } from '../utils/errorUtils';

const USERS_PER_PAGE = 20;

export function useAdminUsers(isAdmin: boolean, activeTab: string) {
    const { lang } = useLanguage();
    const queryClient = useQueryClient();
    const [userPage, setUserPage] = useState(1);
    const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());

    const usersQuery = useQuery({
        queryKey: ['admin', 'users', userPage],
        enabled: isAdmin && activeTab === 'users',
        queryFn: () => adminService.getUsers(userPage, USERS_PER_PAGE),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const handleBanToggle = async (username: string, isBanned: boolean) => {
        try {
            await adminService.toggleBan(username, isBanned);
            toast.success(
                isBanned
                    ? lang === 'RO'
                        ? 'Utilizatorul a fost deblocat.'
                        : 'User unbanned.'
                    : lang === 'RO'
                      ? 'Utilizatorul a fost blocat.'
                      : 'User banned.',
            );
            await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            queryClient.setQueryData<AdminUser[]>(['admin', 'users', userPage], (previousUsers) =>
                previousUsers?.map((user) =>
                    user.username === username ? { ...user, isBanned: !isBanned } : user,
                ) ?? [],
            );
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Error'));
        }
    };

    const handleDeleteUser = async (username: string) => {
        const confirmMsg =
            lang === 'RO'
                ? `Sigur vrei să ștergi utilizatorul ${username}?`
                : `Are you sure you want to delete user ${username}?`;

        if (!window.confirm(confirmMsg)) return;

        setProcessingUsers((prev) => new Set(prev).add(username));
        try {
            await adminService.deleteUser(username);
            queryClient.setQueryData<AdminUser[]>(['admin', 'users', userPage], (previousUsers) =>
                previousUsers?.filter((user) => user.username !== username) ?? [],
            );
            toast.success(lang === 'RO' ? 'Utilizatorul a fost șters.' : 'User deleted.');
            await queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error(lang === 'RO' ? 'Eroare la ștergerea utilizatorului.' : 'Error deleting user.');
        } finally {
            setProcessingUsers((prev) => {
                const next = new Set(prev);
                next.delete(username);
                return next;
            });
        }
    };

    const handleRoleChange = async (username: string, newRole: 'USER' | 'ADMIN' | 'PROFESSOR') => {
        try {
            await adminService.changeRole(username, newRole);
            queryClient.setQueryData<AdminUser[]>(['admin', 'users', userPage], (previousUsers) =>
                previousUsers?.map((user) =>
                    user.username === username ? { ...user, role: newRole } : user,
                ) ?? [],
            );
            toast.success(lang === 'RO' ? 'Rol actualizat.' : 'Role updated.');
            await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Error'));
        }
    };

    return {
        users: usersQuery.data ?? [],
        isLoading: usersQuery.isLoading,
        userPage,
        setUserPage,
        processingUsers,
        handleBanToggle,
        handleDeleteUser,
        handleRoleChange
    };
}
