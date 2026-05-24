export interface HomeworkResponseDTO {
  id: string;
  title: string;
  description: string | null;
  status: "ACTIVE" | "CLOSED" | "DRAFT";
  deadline: string;
  createdAt: string;
  groupName: string;
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
  submissionId?: string;
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
  groupName: string;
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

export interface ProblemProgressItemDTO {
  problemId: string;
  title: string;
  solved: boolean;
  bestScore: number | null;
  lastStatus: string | null;
}

export interface HomeworkProgressDTO {
  homeworkId: string;
  totalProblems: number;
  solvedProblems: number;
  progressPercentage: number;
  problems: ProblemProgressItemDTO[];
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
