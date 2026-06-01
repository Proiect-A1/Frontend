import { apiClient } from "../../../services/apiClient";
import type {
    SubmissionRequest,
    SubmissionResponse,
    SubmissionStatus,
    ProblemSubmissionDTO,
    EvaluationEvent,
    DoneTestEvent,
    DoneSubtaskEvent,
    DoneSubmissionEvent,
    ProblemTestDetailsDTO,
    HomeworkShortOptionDTO,
} from "../types/problemDetails";

// ── API wrappers ──────────────────────────────────────────────────

export const submissionService = {
  // POST /api/submissions/request-evaluation
  submit: (data: SubmissionRequest) =>
    apiClient.post<SubmissionResponse>("/submissions/request-evaluation", data),

  // GET /api/submissions/view/{id}
  getStatus: (id: string) =>
    apiClient.get<SubmissionStatus>(`/submissions/view/${id}`),

  // GET /api/problems/{title}/submissions
  getByProblem: (title: string) =>
    apiClient.get<ProblemSubmissionDTO[]>(`/problems/${encodeURIComponent(title)}/submissions`),

  // GET /api/problems/{title}/tests
  getTests: (title: string) =>
    apiClient.get<ProblemTestDetailsDTO>(`/problems/${encodeURIComponent(title)}/tests`),

  // GET /api/homeworks/problem/{title} — active homeworks for the current user that include this problem
  getHomeworkOptions: (title: string) =>
    apiClient.get<HomeworkShortOptionDTO[]>(`/homeworks/problem/${encodeURIComponent(title)}`),
};

// ── WebSocket evaluation stream ───────────────────────────────────

const SANDBOX_WS_BASE =
  import.meta.env.VITE_SANDBOX_WS_URL ||
  `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;

// Reconnect tuning: a dropped socket before the submission finishes is retried
// with exponential backoff, capped over the lifetime of the connection so it can
// never loop forever (attempts are NOT reset on reconnect).
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY_MS = 500;
const RECONNECT_MAX_DELAY_MS = 8000;

/**
 * Opens a WebSocket to the sandbox service and streams evaluation events.
 *
 * Resilience: if the socket drops before the `doneSubmission` event (and the
 * caller hasn't cleaned up), it reconnects to the same ticket with exponential
 * backoff, up to MAX_RECONNECT_ATTEMPTS, then reports an error. Re-delivered
 * events are safe — the caller dedupes test/subtask events by id.
 *
 * Returns a cleanup function that stops reconnecting and closes the socket.
 */
export function connectToEvaluation(
  ticket: string,
  onEvent: (event: EvaluationEvent) => void,
  onDone: (summary: DoneSubmissionEvent) => void,
  onError: (error: string) => void,
): () => void {
  const url = `${SANDBOX_WS_BASE}/ws/evaluate/responses/${encodeURIComponent(ticket)}`;

  let ws: WebSocket | null = null;
  let closedByCaller = false; // cleanup() was called
  let isDone = false;         // doneSubmission received → stream finished
  let attempts = 0;           // reconnect attempts used (lifetime, not reset)
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let msgCount = 0;

  function scheduleReconnectOrFail(): void {
    if (closedByCaller || isDone) return;
    if (attempts >= MAX_RECONNECT_ATTEMPTS) {
      onError("Eroare la conexiunea WebSocket cu sandbox-ul.");
      return;
    }
    const delay = Math.min(RECONNECT_BASE_DELAY_MS * 2 ** attempts, RECONNECT_MAX_DELAY_MS);
    attempts++;
    if (import.meta.env.DEV) {
      console.warn(`[WS] reconnecting in ${delay}ms (attempt ${attempts}/${MAX_RECONNECT_ATTEMPTS})`);
    }
    reconnectTimer = setTimeout(connect, delay);
  }

  function connect(): void {
    if (closedByCaller) return;
    try {
      ws = new WebSocket(url);
    } catch {
      // Synchronous construction failure — treat as an unexpected drop.
      scheduleReconnectOrFail();
      return;
    }

    ws.onopen = () => {
      // Connection established - waiting for events
    };

    ws.onmessage = (messageEvent) => {
      try {
        const data = JSON.parse(messageEvent.data);
        msgCount++;
        if (import.meta.env.DEV) {
          console.log(`[WS] #${msgCount} ${data.request} testId=${data.testId ?? '-'} subtaskId=${data.subtaskId ?? '-'}`);
        }

        switch (data.request) {
          case "doneTest":
            onEvent(data as DoneTestEvent);
            break;
          case "doneSubtask":
            onEvent(data as DoneSubtaskEvent);
            break;
          case "doneSubmission":
            isDone = true;
            onEvent(data as DoneSubmissionEvent);
            onDone(data as DoneSubmissionEvent);
            break;
          default:
            if (import.meta.env.DEV) console.warn("[WS] Unknown event type:", data.request);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error("[WS] Failed to parse message:", err);
      }
    };

    // An error is always followed by a close; defer the reconnect/fail decision
    // to onclose so a transient drop can be retried instead of failing outright.
    ws.onerror = () => {
      if (import.meta.env.DEV) console.warn("[WS] connection error");
    };

    ws.onclose = (event) => {
      if (import.meta.env.DEV) {
        console.log(`[WS] closed after ${msgCount} messages — code: ${event.code}, reason: "${event.reason}"`);
      }
      // Clean shutdowns need no reconnect: caller cleanup, normal close, or done.
      if (closedByCaller || isDone || event.code === 1000) return;
      scheduleReconnectOrFail();
    };
  }

  connect();

  // Cleanup: stop reconnecting and close the active socket.
  return () => {
    closedByCaller = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws && ws.readyState <= WebSocket.OPEN) {
      ws.close();
    }
  };
}
