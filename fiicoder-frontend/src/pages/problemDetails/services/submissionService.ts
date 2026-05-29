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
    ProblemTestDetailsDTO
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
    // Connection established - waiting for events
  };

  let msgCount = 0;

  ws.onmessage = (messageEvent) => {
    try {
      const data = JSON.parse(messageEvent.data);
       msgCount++;
      console.log(`[WS] #${msgCount} ${data.request} testId=${data.testId ?? '-'} subtaskId=${data.subtaskId ?? '-'}`);

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
    console.log(`[WS] closed after ${msgCount} messages — code: ${event.code}, reason: "${event.reason}"`);
    if (event.code !== 1000) {
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
