import { apiClient } from '../../../services/apiClient';
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
    users: number;
    problems: number;
    submissions: number;
    classes: number;
    assignments: number;
    draftProposals: number;
};

export interface AdminUser {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'PROFESSOR';
    creationDate: string;
    isBanned?: boolean;
}

export interface ProblemProposal {
    id: string;
    title: string;
    authorUsername: string;
    description: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
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
    timeLimit?: number;
    memoryLimit?: number;
}

export interface ProblemTestDetails {
    subtasks: {
        index: number;
        score: number;
        tests: {
            index: number;
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

const mockUsers: AdminUser[] = [
    { username: 'student1', firstName: 'Student', lastName: 'One', email: 'student1@fii.ro', role: 'USER', creationDate: '2026-04-20', isBanned: false },
    { username: 'hacker_boi', firstName: 'Hacker', lastName: 'Boi', email: 'hacker@test.ro', role: 'USER', creationDate: '2026-04-21', isBanned: true },
    { username: 'profesor_info', firstName: 'Prof', lastName: 'Info', email: 'prof@fii.ro', role: 'ADMIN', creationDate: '2026-04-22', isBanned: false },
    ...Array.from({ length: 37 }, (_, index) => {
        const userNumber = index + 4;
        return {
            username: `student_${userNumber}`,
            firstName: `Student`,
            lastName: `${userNumber}`,
            email: `student_${userNumber}@fii.ro`,
            role: userNumber % 11 === 0 ? 'ADMIN' : (userNumber % 5 === 0 ? 'PROFESSOR' : 'USER'),
            creationDate: '2026-04-23',
            isBanned: userNumber % 7 === 0,
        } satisfies AdminUser;
    }),
];

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

const mockAnnouncements: Announcement[] = [
    { id: 'a1', title: 'Mentenanță platformă', content: 'Platforma va fi oprită sâmbătă la ora 02:00 pentru update.', createdAt: '2026-04-26' },
];

const mockAuditLog: AuditLogEntry[] = [
    { id: 'audit-1', action: 'ROLE_CHANGED', actorUsername: 'admin', targetType: 'User', targetName: 'student_11', details: 'User promoted to ADMIN.', createdAt: '2026-04-29 14:10' },
];

function normalizeOverview(payload: AdminOverviewResponse): AdminOverview {
    return {
        users: payload.users,
        problems: payload.problems,
        submissions: payload.submissions,
        classes: payload.classes,
        assignments: payload.assignments,
        pendingProposals: payload.draftProposals,
    };
}

export const adminService = {
    async getOverview(): Promise<AdminOverview> {
        try {
            const data = await apiClient.get<AdminOverviewResponse>('/admin/overview');
            return normalizeOverview(data);
        } catch {
            return { users: 40, problems: 342, submissions: 1024, classes: 12, assignments: 45, pendingProposals: 3 };
        }
    },

    async getUsers(page: number = 1, pageSize: number = 20): Promise<AdminUser[]> {
        try {
            return await apiClient.get(`/users/all?page=${page}&size=${pageSize}`);
        } catch {
            const startIndex = (page - 1) * pageSize;
            return mockUsers.slice(startIndex, startIndex + pageSize);
        }
    },

    async toggleBan(username: string, isBanned: boolean): Promise<void> {
        await apiClient.patch(`/admin/users/${username}/${isBanned ? 'unban' : 'ban'}`);
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
            return data.map(p => ({
                id: p.title, 
                title: p.title,
                authorUsername: p.proposedBy || 'unknown',
                description: p.difficulty || '',
                status: 'PENDING',
                createdAt: p.submittedAt || new Date().toISOString(),
                tags: Array.from(p.tags || [])
            }));
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
                authorUsername: 'unknown', // Not provided by this DTO
                description: p.description || '',
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                statement: p.description,
                tags: Array.from(p.tagTitles || []),
                zipDownloadLink: p.zipDownloadLink,
                timeLimit: p.timeLimit,
                memoryLimit: p.memoryLimit
            };
        } catch {
            return mockProposalDetails[0];
        }
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
        try {
            return await apiClient.get('/announcements');
        } catch {
            return mockAnnouncements;
        }
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
};
