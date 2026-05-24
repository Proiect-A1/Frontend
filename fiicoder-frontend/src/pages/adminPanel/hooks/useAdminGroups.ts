import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, type GroupSummary } from '../services/adminService';
import { toast } from 'sonner';
import { useLanguage } from '../../../language/Language';
import { extractErrorMessage } from '../utils/errorUtils';

const GROUPS_PER_PAGE = 20;

export function useAdminGroups(isAdmin: boolean, activeTab: string) {
    const { lang } = useLanguage();
    const queryClient = useQueryClient();
    const [groupPage, setGroupPage] = useState(1);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const groupsQuery = useQuery({
        queryKey: ['admin', 'groups', groupPage],
        enabled: isAdmin && activeTab === 'groups',
        queryFn: () => adminService.getGroups(groupPage, GROUPS_PER_PAGE),
        staleTime: 1000 * 60 * 5,
    });

    const groups = groupsQuery.data ?? [];
    const isSelectedInList = !!selectedGroupId && groups.some((g) => g.id === selectedGroupId);

    const selectedGroupQuery = useQuery({
        queryKey: ['admin', 'groups', selectedGroupId],
        enabled: !!selectedGroupId && isSelectedInList && isAdmin && activeTab === 'groups',
        queryFn: () => adminService.getGroup(selectedGroupId as string),
    });

    const selectedGroup =
        selectedGroupQuery.data ?? groups.find((g) => g.id === selectedGroupId) ?? null;

    const invitationsQuery = useQuery({
        queryKey: ['admin', 'groups', selectedGroupId, 'invitations'],
        enabled:
            !!selectedGroupId &&
            isSelectedInList &&
            !!selectedGroup?.isCreator &&
            isAdmin &&
            activeTab === 'groups',
        queryFn: () => adminService.getGroupInvitations(selectedGroupId as string),
    });

    const handleDeleteGroup = async (group: GroupSummary) => {
        const confirmMsg =
            lang === 'RO'
                ? `Sigur vrei sa stergi grupul "${group.name}"?`
                : `Are you sure you want to delete "${group.name}"?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            if (selectedGroupId === group.id) {
                setSelectedGroupId(null);
            }
            await adminService.deleteGroup(group.id);
            toast.success(lang === 'RO' ? 'Grup sters.' : 'Group deleted.');
            queryClient.setQueryData<GroupSummary[]>(
                ['admin', 'groups', groupPage],
                (prev) => prev?.filter((g) => g.id !== group.id) ?? [],
            );
            await queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
        } catch (error) {
            toast.error(
                extractErrorMessage(
                    error,
                    lang === 'RO' ? 'Eroare la stergere.' : 'Failed to delete group.',
                ),
            );
        }
    };

    return {
        groups,
        isLoading: groupsQuery.isLoading,
        groupPage,
        setGroupPage,
        selectedGroup,
        selectedGroupId,
        setSelectedGroupId,
        invitations: invitationsQuery.data ?? [],
        isInvitationsLoading: invitationsQuery.isLoading,
        isSelectedLoading: selectedGroupQuery.isLoading,
        handleDeleteGroup,
    };
}
