import { apiClient } from "../../../services/apiClient";

// Mirrors the backend ShortUserSummaryDTO returned inside each leaderboard entry.
export interface LeaderboardUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN" | "PROFESSOR";
  email: string;
  banned: boolean;
  banReason?: string | null;
  creationDate: string;
}

// Mirrors LeaderboardEntryDTO: a user's rank and how many distinct problems
// they have fully solved.
export interface LeaderboardEntry {
  rank: number;
  solvedCount: number;
  user: LeaderboardUser;
}

export const leaderboardService = {
  // GET /users/leaderboard — paginated, ranked by distinct fully-solved
  // problems (desc, ties by username). Banned users and users with zero solved
  // problems are excluded by the backend.
  async getLeaderboard(page: number = 1, size: number = 20): Promise<LeaderboardEntry[]> {
    return await apiClient.get<LeaderboardEntry[]>(
      `/users/leaderboard?page=${page}&size=${size}`,
    );
  },
};
