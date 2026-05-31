import { apiClient } from '../../../services/apiClient';
import { buildQuery } from '../../../utils/queryString';
import type { Announcement, AnnouncementInput } from '../../../types/announcement';

export interface AdminOverview {
    users: number;
    problems: number;
    submissions: number;
    classes: number;
    assignments: number;
    pendingProposals: number;
}

type AdminOverviewResponse = {
    totalUsers: number;
    totalProblems: number;
    totalSubmissions: number;
    totalGroups: number;
    totalHomeworks: number;
    pendingProblems: number;
};

export interface AdminUser {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'PROFESSOR';
    creationDate: string;
    banned: boolean;
    banReason?: string | null;
}

export interface ProblemProposal {
    id: string;
    title: string;
    authorUsername: string;
    description: string;
    difficulty?: string;
    status: 'PENDING' | 'CHECKED' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
    tags?: string[];
}

export interface ProblemProposalDetail extends ProblemProposal {
    statement?: string;
    inputDescription?: string;
    outputDescription?: string;
    constraints?: string[];
    sampleInput?: string;
    sampleOutput?: string;
    zipDownloadLink?: string;
    time_limit?: number;
    memory_limit?: number;
}

export interface GroupMemberSummary {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: 'USER' | 'ADMIN' | 'PROFESSOR';
    email: string;
}

export interface GroupMembersResponse {
    groupId: string;
    canManage: boolean;
    teacher: GroupMemberSummary;
    students: GroupMemberSummary[];
}

export interface GroupsSearchCriteria {
    search?: string;
    creatorUsername?: string;
    createdAfter?: string;
    createdBefore?: string;
}

export interface GroupsPage {
    content: GroupSummary[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface ProblemTestDetails {
    subtasks: {
        index: number;
        total_score: number;
        tests: {
            testIndex: number;
            score: number;
        }[];
    }[];
}

export interface AuditLogEntry {
    id: string;
    action: string;
    actorUsername: string;
    targetType: string;
    targetName: string;
    details: string;
    createdAt: string;
}

export interface GroupSummary {
    id: string;
    name: string;
    description: string;
    memberCount?: number;
    creatorId: string;
    creatorUsername: string;
    createdAt: string;
    isCreator: boolean;
}

export interface GroupInvitation {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    sentAt: string;
    resolvedAt: string | null;
    groupId: string;
    groupName: string;
    invitedUserId: string;
    invitedUserUsername: string;
    invitedUserFirstName: string;
    inviterFirstName: string;
    inviterUsername: string;
}

const mockProposalDetails: ProblemProposalDetail[] = [
    {
        id: 'p1',
        title: 'Arbori de intervale avansați',
        authorUsername: 'student1',
        description: 'O problemă clasică de actualizare și interogare în timp logaritmic pe un vector mare.',
        status: 'PENDING',
        createdAt: '2026-04-20',
        statement: 'Se dă un vector cu valorile inițiale și o mulțime de operații de actualizare și interogare. Pentru fiecare interogare, trebuie afișată suma pe interval.',
        inputDescription: 'Prima linie conține n și q. Următoarele q linii descriu operațiile.',
        outputDescription: 'Pentru fiecare interogare de tip query se afișează rezultatul pe o linie separată.',
        constraints: ['1 <= n, q <= 200000', 'valorile sunt întregi pozitive', 'timp limită: O((n + q) log n)'],
        sampleInput: '5 3\n1 1 5\n2 2 4\n1 3 7',
        sampleOutput: '12',
        tags: ['trees', 'data-structures', 'range-query'],
    },
];

const mockAuditLog: AuditLogEntry[] = [
    { id: 'audit-1', action: 'ROLE_CHANGED', actorUsername: 'admin', targetType: 'User', targetName: 'student_11', details: 'User promoted to ADMIN.', createdAt: '2026-04-29 14:10' },
];

function normalizeOverview(payload: AdminOverviewResponse): AdminOverview {
    return {
        users: payload.totalUsers,
        problems: payload.totalProblems,
        submissions: payload.totalSubmissions,
        classes: payload.totalGroups,
        assignments: payload.totalHomeworks,
        pendingProposals: payload.pendingProblems,
    };
}

export interface AcceptedProblem {
    title: string;
    description: string;
    memory_limit: number;
    time_limit: number;
    difficulty: string;
    tags: string[];
    problemVisibility: 'PUBLIC' | 'PRIVATE';
    problemStatus: string;
}

export const adminService = {
    async getAcceptedProblems(): Promise<AcceptedProblem[]> {
        return await apiClient.get<AcceptedProblem[]>('/problems/accepted?page=1&size=200');
    },

    async changeVisibility(title: string, visibility: 'PUBLIC' | 'PRIVATE'): Promise<void> {
        await apiClient.patch(`/problems/${encodeURIComponent(title)}/visibility`, { visibility });
    },

    async getOverview(): Promise<AdminOverview> {
        try {
            const data = await apiClient.get<AdminOverviewResponse>('/admin/overview');
            return normalizeOverview(data);
        } catch {
            return { users: 40, problems: 342, submissions: 1024, classes: 12, assignments: 45, pendingProposals: 3 };
        }
    },

    async getUsers(page: number = 1, pageSize: number = 20): Promise<AdminUser[]> {
        return await apiClient.get(`/users/all?page=${page}&size=${pageSize}`);
    },

    async toggleBan(userId: string, banned: boolean, reason?: string): Promise<void> {
        if (banned) {
            await apiClient.patch(`/admin/users/${userId}/unban`);
        } else {
            await apiClient.patch(`/admin/users/${userId}/ban`, { reason });
        }
    },

    async deleteUser(username: string): Promise<void> {
        await apiClient.delete(`/admin/users/${username}`);
    },

    async changeRole(username: string, role: 'USER' | 'ADMIN' | 'PROFESSOR'): Promise<void> {
        await apiClient.put(`/users/update-role`, { username, role });
    },

    async getProposals(): Promise<ProblemProposal[]> {
        try {
            const data = await apiClient.get<any[]>('/problems/pending');
            return data.map(p => {
                const rawStatus = (p.problemStatus || p.status || 'PENDING').toString().toUpperCase();
                const normalizedStatus: ProblemProposal['status'] =
                    rawStatus === 'CHECKED' ? 'CHECKED'
                        : rawStatus === 'ACCEPTED' ? 'ACCEPTED'
                            : rawStatus === 'REJECTED' ? 'REJECTED'
                                : 'PENDING';
                return {
                    id: p.title,
                    title: p.title,
                    authorUsername: p.user?.username || p.proposedBy || p.authorUsername || 'unknown',
                    description: p.description || '',
                    difficulty: p.difficulty || '',
                    status: normalizedStatus,
                    createdAt: p.submittedAt || p.createdAt || new Date().toISOString(),
                    tags: Array.from(p.tags || []),
                };
            });
        } catch {
            return mockProposalDetails;
        }
    },

    async getProblemProposal(title: string): Promise<ProblemProposalDetail> {
        try {
            // Using form details endpoint which returns ProblemCreationDetailsResponseDTO
            const p = await apiClient.get<any>(`/problems/${encodeURIComponent(title)}/form/details`);
            return {
                id: p.title,
                title: p.title,
                authorUsername: p.user?.username || p.authorUsername || 'unknown',
                description: p.description || '',
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                statement: p.description,
                tags: Array.from(p.tagTitles || []),
                zipDownloadLink: p.zipDownloadLink,
                time_limit: p.time_limit,
                memory_limit: p.memory_limit
            };
        } catch {
            return mockProposalDetails[0];
        }
    },

    async deleteProblem(title: string): Promise<void> {
        await apiClient.delete(`/problems/${encodeURIComponent(title)}`);
    },

    async reviewProposal(title: string, action: 'approve' | 'reject'): Promise<void> {
        await apiClient.patch(`/problems/${encodeURIComponent(title)}/status`, {
            updatedStatus: action === 'approve' ? 'ACCEPTED' : 'REJECTED'
        });
    },

    async getProblemTests(title: string): Promise<ProblemTestDetails> {
        return await apiClient.get(`/problems/${encodeURIComponent(title)}/tests`);
    },

    async getAnnouncements(): Promise<Announcement[]> {
        return await apiClient.get('/announcements');
    },

    async createAnnouncement(input: AnnouncementInput): Promise<Announcement> {
        return await apiClient.post('/announcements', input);
    },

    async updateAnnouncement(id: string, input: AnnouncementInput): Promise<Announcement> {
        return await apiClient.put(`/announcements/${id}`, input);
    },

    async deleteAnnouncement(id: string): Promise<void> {
        await apiClient.delete(`/announcements/${id}`);
    },

    async getAnnouncementById(id: string): Promise<Announcement> {
        return await apiClient.get(`/announcements/${id}`);
    },

    async getAuditLog(): Promise<AuditLogEntry[]> {
        try {
            return await apiClient.get('/admin/audit-log');
        } catch {
            return mockAuditLog;
        }
    },

    async getGroups(
        page: number = 1,
        pageSize: number = 20,
        criteria?: GroupsSearchCriteria,
        sort?: string,
    ): Promise<GroupsPage> {
        const query = buildQuery({ page, size: pageSize, sort, ...criteria });
        return await apiClient.get<GroupsPage>(`/group${query}`);
    },

    async getGroup(groupId: string): Promise<GroupSummary> {
        return await apiClient.get(`/group/${groupId}`);
    },

    async getGroupInvitations(groupId: string): Promise<GroupInvitation[]> {
        return await apiClient.get(`/group/${groupId}/invitations`);
    },

    async getGroupMembers(groupId: string): Promise<GroupMembersResponse> {
        return await apiClient.get(`/group/${groupId}/students`);
    },

    async removeGroupStudent(groupId: string, studentId: string): Promise<void> {
        await apiClient.delete(`/group/${groupId}/students/${studentId}`);
    },

    async removeGroupMember(groupId: string, userId: string): Promise<void> {
        await apiClient.delete(`/group/${groupId}/members/${userId}`);
    },

    async deleteGroup(groupId: string): Promise<void> {
        await apiClient.delete(`/group/${groupId}`);
    },

    async updateGroup(groupId: string, payload: { name?: string; description?: string }): Promise<GroupSummary> {
        return await apiClient.patch(`/group/${groupId}`, payload);
    },
};
