import { apiClient } from "./apiClient";

export interface SubmissionRequest {
  problem_id: string;
  user_id: string;
  code: string;
}

export interface SubmissionResponse {
  submissionId: string;
  ticket: string;
  evaluationNodeId: string;
}

export interface SubmissionStatus {
  code: string;
  username: string;
  timestamp: string;
  status: string;
  problemTitle: string;
  score: number;
}

// ── Methods that communicate with the backend ──

export const submissionService = {
    // POST /api/submission/request-evaluation
    submit: (data: SubmissionRequest) =>
        apiClient.post<SubmissionResponse>("/submission/request-evaluation", data),

    // GET /api/submission/view/{id}
    getStatus: (id: string) =>
        apiClient.get<SubmissionStatus>(`/submission/view/${id}`),
};
