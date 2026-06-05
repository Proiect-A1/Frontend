// ── Request / Response DTOs ───────────────────────────────────────

export interface SubmissionRequest {
  problem_title: string;
  languageId: string;
  code: string;
  homeworkId?: string;
}

export interface HomeworkShortOptionDTO {
  id: string;
  title: string;
}

/** Matches backend SubmissionEvaluationResponseDTO (only `ticket`). */
export interface SubmissionResponse {
  ticket: string;
}

export interface SubmissionSubtaskTestDTO {
  index: number;
  verdict: string;
  time: number;   // milliseconds
  memory: number; // bytes
  message: string;
}

export interface SubmissionSubtaskDTO {
  index: number;
  score: number;
  maxScore: number;
  maxMemory: number;
  maxTime: number;
  tests: SubmissionSubtaskTestDTO[];
}

/** Matches backend SubmissionViewResponseDTO. */
export interface SubmissionStatus {
  code: string;
  username: string;
  timestamp: string;
  status: string;
  problemTitle: string;
  score: number;
  verdict: string;
  subtasks: SubmissionSubtaskDTO[];
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
  time: number;   // milliseconds
}

export interface DoneSubtaskEvent {
  request: "doneSubtask";
  submissionId: string;
  subtaskId: number;
  score: number;
  maxScore: number;
  "score%": number;
  maxMemory: number;
  maxTime: number;
}

export interface DoneSubmissionEvent {
  request: "doneSubmission";
  submissionId: string;
  verdict: string;
  score: number;
  maxScore: number;
  "score%": number;
  maxMemory: number;
  maxTime: number;
}

export type EvaluationEvent = DoneTestEvent | DoneSubtaskEvent | DoneSubmissionEvent;

// ── Problem Submissions ───────────────────────────────────────────

export interface ProblemSubmissionDTO {
  id: string;
  code: string;
  language: unknown;
  Score: number;
  status: 'PENDING' | 'FINISHED';
  submissiondate: string;
}

// ── Tests Structure ───────────────────────────────────────────────

export interface ProblemSingleTestDTO {
  testIndex: number;
  score: number;
}

export interface ProblemSingleSubtaskDTO {
  index: number;
  total_score: number;
  tests: ProblemSingleTestDTO[];
}

export interface ProblemTestDetailsDTO {
  subtasks: ProblemSingleSubtaskDTO[];
}

// ── Language Types ────────────────────────────────────────────────

export interface LanguageDTO {
  id: string;
  name: string;
  version: string;
}
