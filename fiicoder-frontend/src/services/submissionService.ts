import { apiClient } from "./apiClient";

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

// ── API wrappers ──────────────────────────────────────────────────

export const submissionService = {
  // POST /api/submission/request-evaluation
  submit: (data: SubmissionRequest) =>
    apiClient.post<SubmissionResponse>("/submission/request-evaluation", data),

  // GET /api/submission/view/{id}
  getStatus: (id: string) =>
    apiClient.get<SubmissionStatus>(`/submission/view/${id}`),
};

// ── WebSocket evaluation stream ───────────────────────────────────

const SANDBOX_WS_BASE =
  import.meta.env.VITE_SANDBOX_WS_URL ||
  `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;

/**
 * Opens a WebSocket to the sandbox service and streams evaluation events.
 * Returns a cleanup function that closes the connection.
 */
export function connectToEvaluation(
  ticket: string,
  onEvent: (event: EvaluationEvent) => void,
  onDone: (summary: DoneSubmissionEvent) => void,
  onError: (error: string) => void,
): () => void {
  const url = `${SANDBOX_WS_BASE}/ws/evaluate/responses/${encodeURIComponent(ticket)}`;

  let ws: WebSocket | null = null;

  try {
    ws = new WebSocket(url);
  } catch (err) {
    onError("Nu s-a putut deschide conexiunea WebSocket.");
    return () => {};
  }

  ws.onopen = () => {
    // Connection established — waiting for events
  };

  ws.onmessage = (messageEvent) => {
    try {
      const data = JSON.parse(messageEvent.data);

      switch (data.request) {
        case "doneTest":
          onEvent(data as DoneTestEvent);
          break;
        case "doneSubtask":
          onEvent(data as DoneSubtaskEvent);
          break;
        case "doneSubmission":
          onEvent(data as DoneSubmissionEvent);
          onDone(data as DoneSubmissionEvent);
          break;
        default:
          console.warn("[WS] Unknown event type:", data.request);
      }
    } catch (err) {
      console.error("[WS] Failed to parse message:", err);
    }
  };

  ws.onerror = () => {
    onError("Eroare la conexiunea WebSocket cu sandbox-ul.");
  };

  ws.onclose = (event) => {
    if (event.code !== 1000) {
      // Abnormal close
      console.warn("[WS] Connection closed unexpectedly:", event.code, event.reason);
    }
  };

  // Return cleanup function
  return () => {
    if (ws && ws.readyState <= WebSocket.OPEN) {
      ws.close();
    }
  };
}
