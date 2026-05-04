import { apiClient } from './apiClient';

export interface AdminOverview {
    users: number;
    problems: number;
    submissions: number;
    classes: number;
    assignments: number;
    pendingProposals: number;
}

export interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
    isBanned: boolean;
}

export interface ProblemProposal {
    id: string;
    title: string;
    authorUsername: string;
    description: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

export interface ProblemProposalDetail extends ProblemProposal {
    statement?: string;
    inputDescription?: string;
    outputDescription?: string;
    constraints?: string[];
    sampleInput?: string;
    sampleOutput?: string;
    tags?: string[];
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
}

export interface AnnouncementInput {
    title: string;
    content: string;
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
    { id: '1', username: 'student1', email: 'student1@fii.ro', role: 'USER', isBanned: false },
    { id: '2', username: 'hacker_boi', email: 'hacker@test.ro', role: 'USER', isBanned: true },
    { id: '3', username: 'profesor_info', email: 'prof@fii.ro', role: 'ADMIN', isBanned: false },
    ...Array.from({ length: 37 }, (_, index) => {
        const userNumber = index + 4;

        return {
            id: String(userNumber),
            username: `student_${userNumber}`,
            email: `student_${userNumber}@fii.ro`,
            role: userNumber % 11 === 0 ? 'ADMIN' : 'USER',
            isBanned: userNumber % 7 === 0,
        } satisfies AdminUser;
    }),
];

const mockProposalDetails: ProblemProposalDetail[] = [
    {
        id: 'p1',
        title: 'Arbori de intervale avansați',
        authorUsername: 'student1',
        description:
            'O problemă clasică de actualizare și interogare în timp logaritmic pe un vector mare.',
        status: 'PENDING',
        createdAt: '2026-04-20',
        statement:
            'Se dă un vector cu valori inițiale și o mulțime de operații de actualizare și interogare. Pentru fiecare interogare, trebuie afișată suma pe interval.',
        inputDescription: 'Prima linie conține n și q. Următoarele q linii descriu operațiile.',
        outputDescription:
            'Pentru fiecare interogare de tip query se afișează rezultatul pe o linie separată.',
        constraints: [
            '1 <= n, q <= 200000',
            'valorile sunt întregi pozitive',
            'timp limită: O((n + q) log n)',
        ],
        sampleInput: '5 3\n1 1 5\n2 2 4\n1 3 7',
        sampleOutput: '12',
        tags: ['trees', 'data-structures', 'range-query'],
    },
    {
        id: 'p2',
        title: 'Dinamica pe stări exponențiale',
        authorUsername: 'algo_master',
        description: 'Calculați numărul de moduri de a acoperi o tablă folosind DP pe profil.',
        status: 'PENDING',
        createdAt: '2026-04-25',
        statement:
            'Pentru o tablă de dimensiune mică pe una dintre dimensiuni, numărați toate acoperirile valide cu piese date.',
        inputDescription: 'n și m urmate de descrierea tablei.',
        outputDescription: 'Numărul total de acoperiri valide modulo 1e9+7.',
        constraints: ['1 <= n <= 12', '1 <= m <= 1000', 'răspuns modulo 1e9+7'],
        sampleInput: '3 4',
        sampleOutput: '42',
        tags: ['dp', 'profile-dp', 'combinatorics'],
    },
    {
        id: 'p3',
        title: 'Grafuri cu flux minim costisitor',
        authorUsername: 'theorist',
        description:
            'O propunere de problemă despre drumuri minime, dar cu o constrângere de capacitate.',
        status: 'PENDING',
        createdAt: '2026-04-28',
        statement:
            'Se dă un graf orientat cu costuri și capacități. Determinați costul minim pentru a transporta k unități.',
        inputDescription: 'n, m, k și apoi muchiile grafului.',
        outputDescription: 'Costul minim total sau -1 dacă transportul este imposibil.',
        constraints: ['1 <= n <= 500', '1 <= m <= 2000', '1 <= k <= 100'],
        sampleInput: '4 5 2',
        sampleOutput: '17',
        tags: ['graphs', 'flows', 'min-cost'],
    },
];

let mockProblemsCount = 342;
let mockSubmissionsCount = 15420;
let mockClassesCount = 45;
let mockHomeworksCount = 87;

const mockAnnouncements: Announcement[] = [
    {
        id: 'a1',
        title: 'Mentenanță platformă',
        content: 'Platforma va fi oprită sâmbătă la ora 02:00 pentru update.',
        createdAt: '2026-04-26',
    },
    {
        id: 'a2',
        title: 'Concurs intern',
        content: 'Lansăm o rundă nouă de antrenament pentru selecția lotului.',
        createdAt: '2026-04-27',
    },
    {
        id: 'a3',
        title: 'Teme publicate',
        content: 'Au fost publicate noile teme pentru laboratorul de algoritmică.',
        createdAt: '2026-04-29',
    },
];

const mockAuditLog: AuditLogEntry[] = [
    {
        id: 'audit-1',
        action: 'ROLE_CHANGED',
        actorUsername: 'admin',
        targetType: 'User',
        targetName: 'student_11',
        details: 'User promoted to ADMIN.',
        createdAt: '2026-04-29 14:10',
    },
    {
        id: 'audit-2',
        action: 'ANNOUNCEMENT_CREATED',
        actorUsername: 'admin',
        targetType: 'Announcement',
        targetName: 'Teme publicate',
        details: 'Created a new announcement for students.',
        createdAt: '2026-04-29 13:45',
    },
    {
        id: 'audit-3',
        action: 'PROPOSAL_REVIEWED',
        actorUsername: 'admin',
        targetType: 'Proposal',
        targetName: 'Dinamica pe stări exponențiale',
        details: 'Proposal approved and converted into a real problem.',
        createdAt: '2026-04-28 18:20',
    },
];

function cloneAuditLog(): AuditLogEntry[] {
    return mockAuditLog.map((entry) => ({ ...entry }));
}

function cloneAnnouncements(): Announcement[] {
    return mockAnnouncements.map((announcement) => ({ ...announcement }));
}

function cloneProposals(): ProblemProposalDetail[] {
    return mockProposalDetails.map((proposal) => ({
        ...proposal,
        constraints: proposal.constraints ? [...proposal.constraints] : undefined,
        tags: proposal.tags ? [...proposal.tags] : undefined,
    }));
}

function getMockOverview(): AdminOverview {
    return {
        users: mockUsers.length,
        problems: mockProblemsCount,
        submissions: mockSubmissionsCount,
        classes: mockClassesCount,
        assignments: mockHomeworksCount,
        pendingProposals: mockProposalDetails.filter((proposal) => proposal.status === 'PENDING')
            .length,
    };
}

function addAuditEntry(action: string, targetType: string, targetName: string, details: string) {
    mockAuditLog.unshift({
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        action,
        actorUsername: 'admin',
        targetType,
        targetName,
        details,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });

    if (mockAuditLog.length > 50) {
        mockAuditLog.pop();
    }
}

// api calls with mock fallback data cuz no api for the moment
export const adminService = {
    async getOverview(): Promise<AdminOverview> {
        try {
            return await apiClient.get('/api/admin/overview');
        } catch {
            return getMockOverview();
        }
    },

    async getUsers(page: number = 1, pageSize: number = 20): Promise<AdminUser[]> {
        try {
            return await apiClient.get(`/api/admin/users?page=${page}&limit=${pageSize}`);
        } catch {
            const startIndex = Math.max(page - 1, 0) * pageSize;
            return mockUsers.slice(startIndex, startIndex + pageSize).map((user) => ({ ...user }));
        }
    },

    async toggleBan(userId: string, isBanned: boolean): Promise<void> {
        try {
            await apiClient.patch(`/api/admin/users/${userId}/${isBanned ? 'unban' : 'ban'}`);
        } catch {
            const user = mockUsers.find((entry) => entry.id === userId);
            if (user) {
                user.isBanned = !isBanned;
                addAuditEntry(
                    isBanned ? 'USER_UNBANNED' : 'USER_BANNED',
                    'User',
                    user.username,
                    `User ${isBanned ? 'unbanned' : 'banned'} from admin panel.`,
                );
            }
        }
    },

    async deleteUser(userId: string): Promise<void> {
        try {
            await apiClient.delete(`/api/admin/users/${userId}`);
        } catch {
            const index = mockUsers.findIndex((entry) => entry.id === userId);
            if (index !== -1) {
                const [removedUser] = mockUsers.splice(index, 1);
                addAuditEntry(
                    'USER_DELETED',
                    'User',
                    removedUser.username,
                    'User removed from platform.',
                );
            }
        }
    },

    async changeRole(userId: string, role: 'USER' | 'ADMIN'): Promise<void> {
        try {
            await apiClient.patch(`/api/admin/users/${userId}/role`, { role });
        } catch {
            const user = mockUsers.find((entry) => entry.id === userId);
            if (user) {
                user.role = role;
                addAuditEntry(
                    'ROLE_CHANGED',
                    'User',
                    user.username,
                    `User role changed to ${role}.`,
                );
            }
        }
    },

    async getProposals(): Promise<ProblemProposal[]> {
        try {
            return await apiClient.get('/api/admin/problem-proposals');
        } catch {
            return cloneProposals()
                .filter((proposal) => proposal.status === 'PENDING')
                .map(
                    ({
                        constraints,
                        tags,
                        statement,
                        inputDescription,
                        outputDescription,
                        sampleInput,
                        sampleOutput,
                        ...proposal
                    }) => ({
                        ...proposal,
                    }),
                );
        }
    },

    async getProblemProposal(id: string): Promise<ProblemProposalDetail> {
        try {
            return await apiClient.get(`/api/admin/problem-proposals/${id}`);
        } catch {
            const proposal = mockProposalDetails.find((entry) => entry.id === id);
            if (!proposal) {
                throw new Error(`Proposal ${id} not found`);
            }

            return {
                ...proposal,
                constraints: proposal.constraints ? [...proposal.constraints] : undefined,
                tags: proposal.tags ? [...proposal.tags] : undefined,
            };
        }
    },

    async approveProposal(id: string): Promise<void> {
        try {
            await apiClient.post(`/api/admin/problem-proposals/${id}/approve`);
        } catch {
            const proposal = mockProposalDetails.find((entry) => entry.id === id);
            if (proposal && proposal.status === 'PENDING') {
                proposal.status = 'APPROVED';
                mockProblemsCount += 1;
                addAuditEntry(
                    'PROPOSAL_APPROVED',
                    'Proposal',
                    proposal.title,
                    'Proposal approved and converted into a problem.',
                );
            }
        }
    },

    async rejectProposal(id: string): Promise<void> {
        try {
            await apiClient.post(`/api/admin/problem-proposals/${id}/reject`);
        } catch {
            const proposal = mockProposalDetails.find((entry) => entry.id === id);
            if (proposal && proposal.status === 'PENDING') {
                proposal.status = 'REJECTED';
                addAuditEntry(
                    'PROPOSAL_REJECTED',
                    'Proposal',
                    proposal.title,
                    'Proposal rejected by admin.',
                );
            }
        }
    },

    async reviewProposal(id: string, action: 'approve' | 'reject'): Promise<void> {
        if (action === 'approve') {
            await this.approveProposal(id);
            return;
        }

        await this.rejectProposal(id);
    },

    async getAnnouncements(): Promise<Announcement[]> {
        try {
            return await apiClient.get('/announcements');
        } catch {
            return cloneAnnouncements();
        }
    },

    async getAnnouncement(id: string): Promise<Announcement> {
        try {
            return await apiClient.get(`/api/announcements/${id}`);
        } catch {
            const found = mockAnnouncements.find((announcement) => announcement.id === id);
            if (!found) {
                throw new Error('Announcement not found');
            }
            return { ...found };
        }
    },

    async createAnnouncement(input: AnnouncementInput): Promise<Announcement> {
        try {
            return await apiClient.post('/announcements', input);
        } catch {
            const announcement: Announcement = {
                id: `a-${Date.now()}`,
                title: input.title,
                content: input.content,
                createdAt: new Date().toISOString().slice(0, 10),
            };

            mockAnnouncements.unshift(announcement);
            addAuditEntry(
                'ANNOUNCEMENT_CREATED',
                'Announcement',
                announcement.title,
                'Announcement created from admin panel.',
            );

            return { ...announcement };
        }
    },

    async updateAnnouncement(id: string, input: AnnouncementInput): Promise<Announcement> {
        try {
            return await apiClient.put(`/announcements/${id}`, input);
        } catch {
            const announcement = mockAnnouncements.find((entry) => entry.id === id);
            if (!announcement) {
                throw new Error(`Announcement ${id} not found`);
            }

            announcement.title = input.title;
            announcement.content = input.content;
            addAuditEntry(
                'ANNOUNCEMENT_UPDATED',
                'Announcement',
                announcement.title,
                'Announcement updated from admin panel.',
            );

            return { ...announcement };
        }
    },

    async deleteAnnouncement(id: string): Promise<void> {
        try {
            await apiClient.delete(`/announcements/${id}`);
        } catch {
            const index = mockAnnouncements.findIndex((entry) => entry.id === id);
            if (index !== -1) {
                const [removedAnnouncement] = mockAnnouncements.splice(index, 1);
                addAuditEntry(
                    'ANNOUNCEMENT_DELETED',
                    'Announcement',
                    removedAnnouncement.title,
                    'Announcement deleted from admin panel.',
                );
            }
        }
    },

    async getAuditLog(): Promise<AuditLogEntry[]> {
        try {
            return await apiClient.get('/api/admin/audit-log');
        } catch {
            return cloneAuditLog();
        }
    },
};
