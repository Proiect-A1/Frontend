import { apiClient } from "./apiClient";

export interface AdminOverview {
  usersCount: number;
  problemsCount: number;
  submissionsCount: number;
  classesCount: number;
  pendingProposals: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  isBanned: boolean;
}

export interface ProblemProposal {
  id: string;
  title: string;
  authorUsername: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

// api calls with mock fallback data cuz no api for the moment
export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    try {
      return await apiClient.get("/api/admin/overview");
    } catch {
      return { usersCount: 1250, problemsCount: 342, submissionsCount: 15420, classesCount: 45, pendingProposals: 8 };
    }
  },

  async getUsers(page: number = 1): Promise<AdminUser[]> {
    try {
      return await apiClient.get(`/api/admin/users?page=${page}`);
    } catch {
      return [
        { id: "1", username: "student1", email: "student1@fii.ro", role: "USER", isBanned: false },
        { id: "2", username: "hacker_boi", email: "hacker@test.ro", role: "USER", isBanned: true },
        { id: "3", username: "profesor_info", email: "prof@fii.ro", role: "ADMIN", isBanned: false },
      ];
    }
  },

  async toggleBan(userId: string, isBanned: boolean): Promise<void> {
    try {
      await apiClient.patch(`/api/admin/users/${userId}/${isBanned ? 'unban' : 'ban'}`);
    } catch {
      console.log(`Mock: User ${userId} ban toggled`);
    }
  },

  async changeRole(userId: string, role: "USER" | "ADMIN"): Promise<void> {
    try {
      await apiClient.patch(`/api/admin/users/${userId}/role`, { role });
    } catch {
      console.log(`Mock: User ${userId} role changed to ${role}`);
    }
  },

  async getProposals(): Promise<ProblemProposal[]> {
    try {
      return await apiClient.get("/api/admin/problem-proposals");
    } catch {
      return [
        { id: "p1", title: "Arbori de intervale avansați", authorUsername: "student1", description: "O problemă clasică de actualizare și interogare în timp logaritmic pe un vector...", status: "PENDING", createdAt: "2026-04-20" },
        { id: "p2", title: "Dinamica pe stări exponențiale", authorUsername: "algo_master", description: "Calculați numărul de moduri de a acoperi o tablă folosind DP pe profil...", status: "PENDING", createdAt: "2026-04-25" },
      ];
    }
  },

  async reviewProposal(id: string, action: "approve" | "reject"): Promise<void> {
    try {
      await apiClient.post(`/api/admin/problem-proposals/${id}/${action}`);
    } catch {
      console.log(`Mock: Proposal ${id} was ${action}d`);
    }
  },

  async getAnnouncements(): Promise<Announcement[]> {
    try {
      return await apiClient.get("/api/admin/announcements");
    } catch {
      return [
        { id: "a1", title: "Mentenanță platformă", content: "Platforma va fi oprită sâmbătă la ora 02:00 pentru update.", createdAt: "2026-04-26" }
      ];
    }
  }
};