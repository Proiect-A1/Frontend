import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, type AdminUser } from '../services/adminService';
import { toast } from 'sonner';
import { useLanguage, translations, getDeleteUserConfirm } from '../../../language/Language';
import { extractErrorMessage } from '../utils/errorUtils';

const USERS_PER_PAGE = 20;

export function useAdminUsers(isAdmin: boolean, activeTab: string) {
    const { lang } = useLanguage();
    const t = translations[lang];
    const queryClient = useQueryClient();
    const [userPage, setUserPage] = useState(1);
    const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());

    const usersQuery = useQuery({
        queryKey: ['admin', 'users', userPage],
        enabled: isAdmin && activeTab === 'users',
        queryFn: () => adminService.getUsers(userPage, USERS_PER_PAGE),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const handleBanToggle = async (id: string, username: string, banned: boolean) => {
        let reason: string | undefined;
        if (!banned) {
            const input = window.prompt(
                t.adminBanReasonPrompt
            );
            if (input === null) return;
            if (!input.trim()) {
                toast.error(t.adminReasonEmpty);
                return;
            }
            reason = input.trim();
        }

        try {
            await adminService.toggleBan(id, banned, reason);
            toast.success(banned ? t.adminUserUnbanned : t.adminUserBanned);
            await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            queryClient.setQueryData<AdminUser[]>(['admin', 'users', userPage], (previousUsers) =>
                previousUsers?.map((user) =>
                    user.username === username ? { ...user, banned: !banned, banReason: reason ?? null } : user,
                ) ?? [],
            );
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Error'));
        }
    };

    const handleDeleteUser = async (username: string) => {
        const confirmMsg = getDeleteUserConfirm(lang, username);

        if (!window.confirm(confirmMsg)) return;

        setProcessingUsers((prev) => new Set(prev).add(username));
        try {
            await adminService.deleteUser(username);
            queryClient.setQueryData<AdminUser[]>(['admin', 'users', userPage], (previousUsers) =>
                previousUsers?.filter((user) => user.username !== username) ?? [],
            );
            toast.success(t.adminUserDeleted);
            await queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error(t.adminUserDeleteError);
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
            toast.success(t.adminRoleUpdated);
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
