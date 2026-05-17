import { apiClient } from './apiClient';

export type SubmissionStatus =
    | 'OK'
    | 'PA'
    | 'TLE'
    | 'MLE'
    | 'WA'
    | 'RTE'
    | 'CPE'
    | 'FAIL'
    | 'SKIP'
    | 'ILE'
    | 'NONE'
    | 'IDLE';

export interface RecentSubmissionDTO {
    problemTitle: string;
    score: number;
    status: SubmissionStatus;
    submissionDate: string;
}

export interface PagedRecentSubmissionsDTO {
    content: RecentSubmissionDTO[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
}

export interface ProfileResponseDTO {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    problemsSolved: number;
    submissions: number;
    acceptanceRate: number;
    streak: number;
    streakCapped: boolean;
    rankEasy: number;
    rankMedium: number;
    rankHard: number;
    rankContest: number;
    recentSubmissions: PagedRecentSubmissionsDTO;
    mostUsedLanguages: string[];
    skillBreakdownTags: string[];
}

export const profileService = {
    getMyProfile(page: number = 0, size: number = 5) {
        return apiClient.get<ProfileResponseDTO>(`/profile/me?page=${page}&size=${size}`);
    },
};