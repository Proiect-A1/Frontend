import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    adminService,
    type GroupSummary,
    type GroupsPage,
    type GroupsSearchCriteria,
} from '../services/adminService';
import { toast } from 'sonner';
import { useLanguage, translations, getDeleteGroupConfirm, getRemoveGroupMemberConfirm } from '../../../language/Language';
import { extractErrorMessage } from '../utils/errorUtils';

const GROUPS_PER_PAGE = 20;

export function useAdminGroups(isAdmin: boolean, activeTab: string) {
    const { lang } = useLanguage();
    const t = translations[lang];
    const queryClient = useQueryClient();
    const [groupPage, setGroupPage] = useState(1);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [criteria, setCriteria] = useState<GroupsSearchCriteria>({});
    const [sort, setSort] = useState<string>('createdAt,desc');

    const groupsQuery = useQuery({
        queryKey: ['admin', 'groups', groupPage, criteria, sort],
        enabled: isAdmin && activeTab === 'groups',
        queryFn: () => adminService.getGroups(groupPage, GROUPS_PER_PAGE, criteria, sort),
        staleTime: 1000 * 60 * 5,
    });

    const groupsPage = groupsQuery.data ?? null;
    const groups = groupsPage?.content ?? [];
    const totalPages = groupsPage?.totalPages ?? 0;
    const totalElements = groupsPage?.totalElements ?? 0;
    const isSelectedInList = !!selectedGroupId && groups.some((g) => g.id === selectedGroupId);

    const selectedGroupQuery = useQuery({
        queryKey: ['admin', 'groups', 'detail', selectedGroupId],
        enabled: !!selectedGroupId && isSelectedInList && isAdmin && activeTab === 'groups',
        queryFn: () => adminService.getGroup(selectedGroupId as string),
    });

    const selectedGroup =
        selectedGroupQuery.data ?? groups.find((g) => g.id === selectedGroupId) ?? null;

    const invitationsQuery = useQuery({
        queryKey: ['admin', 'groups', selectedGroupId, 'invitations'],
        enabled: !!selectedGroupId && isSelectedInList && isAdmin && activeTab === 'groups',
        queryFn: () => adminService.getGroupInvitations(selectedGroupId as string),
    });

    const membersQuery = useQuery({
        queryKey: ['admin', 'groups', selectedGroupId, 'members'],
        enabled: !!selectedGroupId && isSelectedInList && isAdmin && activeTab === 'groups',
        queryFn: () => adminService.getGroupMembers(selectedGroupId as string),
    });

    const handleDeleteGroup = async (group: GroupSummary) => {
        if (!window.confirm(getDeleteGroupConfirm(lang, group.name))) return;

        try {
            if (selectedGroupId === group.id) {
                setSelectedGroupId(null);
            }
            await adminService.deleteGroup(group.id);
            toast.success(t.adminGroupDeleted);
            queryClient.setQueryData<GroupsPage>(
                ['admin', 'groups', groupPage, criteria, sort],
                (prev) => prev
                    ? { ...prev, content: prev.content.filter((g) => g.id !== group.id), totalElements: Math.max(prev.totalElements - 1, 0) }
                    : prev,
            );
            await queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
        } catch (error) {
            toast.error(
                extractErrorMessage(
                    error,
                    t.adminGroupDeleteError,
                ),
            );
        }
    };

    const handleRemoveMember = async (userId: string, username: string) => {
        if (!selectedGroupId) return;
        if (!window.confirm(getRemoveGroupMemberConfirm(lang, username))) return;

        try {
            await adminService.removeGroupMember(selectedGroupId, userId);
            toast.success(t.adminMemberRemoved);
            await queryClient.invalidateQueries({ queryKey: ['admin', 'groups', selectedGroupId] });
            await queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
        } catch (error) {
            toast.error(
                extractErrorMessage(
                    error,
                    t.adminMemberRemoveError,
                ),
            );
        }
    };

    return {
        groups,
        isLoading: groupsQuery.isLoading,
        groupPage,
        setGroupPage,
        totalPages,
        totalElements,
        criteria,
        setCriteria: (next: GroupsSearchCriteria) => {
            setCriteria(next);
            setGroupPage(1);
        },
        sort,
        setSort: (next: string) => {
            setSort(next);
            setGroupPage(1);
        },
        selectedGroup,
        selectedGroupId,
        setSelectedGroupId,
        invitations: invitationsQuery.data ?? [],
        isInvitationsLoading: invitationsQuery.isLoading,
        members: membersQuery.data ?? null,
        isMembersLoading: membersQuery.isLoading,
        handleRemoveMember,
        isSelectedLoading: selectedGroupQuery.isLoading,
        handleDeleteGroup,
    };
}
