// ── Request / Response DTOs ───────────────────────────────────────

export interface SubmissionRequest {
  problem_title: string;
  languageId: string;
  code: string;
}

/** Matches backend SubmissionEvaluationResponseDTO (only `ticket`). */
export interface SubmissionResponse {
  ticket: string;
}

/** Matches backend SubmissionViewResponseDTO. */
export interface SubmissionStatus {
  code: string;
  username: string;
  timestamp: string;
  status: string;
  problemTitle: string;
  score: number;
}

// ── WebSocket event types (from sandbox-service protocol) ─────────

export interface DoneTestEvent {
  request: "doneTest";
  submissionId: string;
  testId: number;
  verdict: string;
  message: string;
  score: number;
  maxScore: number;
  "score%": number;
  memory: number; // bytes
  time: number;   // nanoseconds
}

export interface DoneSubtaskEvent {
  request: "doneSubtask";
  submissionId: string;
  subtaskId: number;
  score: number;
  maxScore: number;
  "score%": number;
  max_memory: number;
  max_time: number;
}

export interface DoneSubmissionEvent {
  request: "doneSubmission";
  submissionId: string;
  score: number;
  maxScore: number;
  "score%": number;
  max_memory: number;
  max_time: number;
}

export type EvaluationEvent = DoneTestEvent | DoneSubtaskEvent | DoneSubmissionEvent;

// ── Problem Submissions ───────────────────────────────────────────

export interface ProblemSubmissionDTO {
  code: string;
  language: unknown;
  Score: number;
  status: 'PENDING' | 'FINISHED';
  submissiondate: string;
}

// ── Language Types ────────────────────────────────────────────────

export interface LanguageDTO {
  id: string;
  name: string;
  version: string;
}
