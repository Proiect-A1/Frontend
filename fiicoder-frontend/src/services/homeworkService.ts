import { apiClient } from "./apiClient";

export interface HomeworkResponseDTO {
  id: string;
  title: string;
  description: string | null;
  status: "ACTIVE" | "CLOSED" | "DRAFT";
  deadline: string;
  createdAt: string;
}

export interface HomeworkRequestDTO {
  title: string;
  description?: string;
  deadline: string;
}

export interface HomeworkUpdateRequestDTO {
  usernames?: string[];
  problemTitles?: string[];
  deadline?: string;
}

export interface HomeworkUpdateDeleteRequestDTO {
  usernames?: string[];
  problemTitles?: string[];
}

export interface HomeworkUpdateResponseDTO {
  usernames: string[];
  problemTitles: string[];
  deadline: string;
}

export interface HomeworkProblemSummaryDTO {
  id: string;
  title?: string;
  problemTitle?: string;
  difficulty?: string;
}

export interface HomeworkUserSummaryDTO {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface HomeworkSubmissionSummaryDTO {
  id?: string;
  status?: string;
  score?: number;
  submittedAt?: string;
  username?: string;
  problemTitle?: string;
}

export interface HomeworkDetailDTO {
  id: string;
  title: string;
  description: string | null;
  status: "ACTIVE" | "CLOSED" | "DRAFT";
  deadline: string;
  createdAt: string;
  problems: HomeworkProblemSummaryDTO[];
  assignedUsers: HomeworkUserSummaryDTO[];
  submissions: HomeworkSubmissionSummaryDTO[];
}

export interface StudentSummaryDTO {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  totalProblems: number;
  attemptedProblems: number;
  completedProblems: number;
  averageScore: number;
  completionRate: number;
  lastSubmissionTime: string | null;
  hasStarted: boolean;
  isCompleted: boolean;
}

export interface HomeworkStatisticsDTO {
  homeworkId: string;
  homeworkTitle: string;
  groupId: string;
  groupName: string;
  deadline: string;
  status: "ACTIVE" | "CLOSED" | "DRAFT";
  totalAssignedStudents: number;
  studentsWithSubmissions: number;
  studentsWithoutSubmissions: number;
  completionRate: number;
  students: StudentSummaryDTO[];
}

export interface ProblemProgressDTO {
  problemId: string;
  problemTitle: string;
  difficulty: string;
  attempts: number;
  bestScore: number;
  lastStatus: string;
  lastSubmissionTime: string | null;
  isCompleted: boolean;
  timeSpentMinutes: number | null;
}

export interface StudentProgressSummaryDTO {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  homeworkId: string;
  homeworkTitle: string;
  totalProblems: number;
  attemptedProblems: number;
  completedProblems: number;
  completionRate: number;
  averageScore: number;
  problems: ProblemProgressDTO[];
  hasStarted: boolean;
  isCompleted: boolean;
  isOverdue: boolean;
}

export const homeworkService = {
  getAll(groupId: string) {
    return apiClient.get<HomeworkResponseDTO[]>(`/group/${groupId}/homeworks`);
  },

  getById(groupId: string, homeworkId: string) {
    return apiClient.get<HomeworkDetailDTO>(`/group/${groupId}/homeworks/${homeworkId}`);
  },

  create(groupId: string, request: HomeworkRequestDTO) {
    return apiClient.post<HomeworkResponseDTO>(`/group/${groupId}/homeworks`, request);
  },

  addToDraft(groupId: string, homeworkId: string, request: HomeworkUpdateRequestDTO) {
    return apiClient.patch<HomeworkUpdateResponseDTO>(
      `/group/${groupId}/homeworks/${homeworkId}/add`,
      request
    );
  },

  removeFromDraft(groupId: string, homeworkId: string, request: HomeworkUpdateDeleteRequestDTO) {
    return apiClient.patch<HomeworkUpdateResponseDTO>(
      `/group/${groupId}/homeworks/${homeworkId}/delete`,
      request
    );
  },

  publish(groupId: string, homeworkId: string) {
    return apiClient.patch<HomeworkResponseDTO>(`/group/${groupId}/homeworks/${homeworkId}/publish`);
  },

  delete(groupId: string, homeworkId: string) {
    return apiClient.delete<void>(`/group/${groupId}/homeworks/${homeworkId}`);
  },

  getStatistics(groupId: string, homeworkId: string) {
    return apiClient.get<HomeworkStatisticsDTO>(`/group/${groupId}/homeworks/${homeworkId}/statistics`);
  },

  getStudentProgress(groupId: string, homeworkId: string, studentId: string) {
    return apiClient.get<StudentProgressSummaryDTO>(`/group/${groupId}/homeworks/${homeworkId}/students/${studentId}/progress`);
  }
};