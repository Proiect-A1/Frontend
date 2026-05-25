import { apiClient } from "../../../services/apiClient";
import type { ProposeProblemForm, ProblemProposalResponse } from "../types/proposeProblem";
import { createProblemZip } from "../utils/zipHelper";

type BackendProblemProposal = {
  title: string;
  problemVisibility?: string;
  problemStatus?: string;
};

// Backend auto-verification happens async after the ZIP upload triggers the R2
// webhook. We poll the single-problem endpoint until the status leaves PENDING
// (becomes CHECKED / REJECTED) so the UI can surface the real outcome.
const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 12; // ~18s total

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollProposalState(
  title: string,
  fallbackVisibility: ProblemProposalResponse["visibility"],
): Promise<ProblemProposalResponse> {
  let lastSeen: ProblemProposalResponse | null = null;

  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);
    try {
      const dto = await apiClient.get<{
        title: string;
        problemStatus?: string;
        problemVisibility?: string;
      }>(`/problems/${encodeURIComponent(title)}`);

      const response: ProblemProposalResponse = {
        id: dto.title,
        title: dto.title,
        status: mapProblemStatus(dto.problemStatus),
        visibility: mapProblemVisibility(dto.problemVisibility) || fallbackVisibility,
        hasPendingUpdate: false,
        submittedAt: new Date().toISOString(),
      };
      lastSeen = response;
      if (response.status !== "pending") {
        return response;
      }
    } catch {
      // 403/404 transiently while the webhook updates rows — keep polling.
    }
  }

  // Timed out — verification is still in progress. Surface a pending response
  // so the UI can tell the user to check back later in "My Proposals".
  return (
    lastSeen ?? {
      id: title,
      title,
      status: "pending",
      visibility: fallbackVisibility,
      hasPendingUpdate: false,
      submittedAt: new Date().toISOString(),
    }
  );
}

export const proposeProblemService = {
  // Submit a new problem proposal
  submitProposal: async (formData: ProposeProblemForm): Promise<ProblemProposalResponse> => {
    // 1. Send problem metadata to get the upload URL
    const payload = buildPayload(formData);
    const { zipProblemUploadURL } = await apiClient.post<{ zipProblemUploadURL: string }>(
      "/problems/form/create",
      payload
    );

    // 2. Generate zip with files and tests
    const zipBlob = await createProblemZip(formData);

    // 3. Upload zip to the cloud URL
    const uploadRes = await fetch(zipProblemUploadURL, {
      method: "PUT",
      body: zipBlob,
      headers: { "Content-Type": "application/octet-stream" },
    });
    if (!uploadRes.ok) {
      throw { status: uploadRes.status, body: null, message: 'ZIP_UPLOAD_FAILED' };
    }

    // 4. Poll the backend until automated verification finishes (CHECKED /
    //    REJECTED) or we time out and surface a still-pending response.
    return await pollProposalState(formData.title, formData.visibility);
  },

  // Update an existing proposal (new version) -> The backend handles update with the same POST
  updateProposal: async (_proposalId: string, formData: ProposeProblemForm): Promise<ProblemProposalResponse> => {
    return await proposeProblemService.submitProposal(formData);
  },

  // Get specific proposal details (full form data for editing)
  getProblemFormDetails: async (title: string): Promise<ProposeProblemForm> => {
    // 1. Fetch metadata from backend
    const details = await apiClient.get<any>(`/problems/${encodeURIComponent(title)}/form/details`);

    // 2. Fetch and extract the zip archive
    const { extractProblemZip } = await import("../utils/unzipHelper");
    let files, tests, generatorScript;
    try {
      ({ files, tests, generatorScript } = await extractProblemZip(details.zipDownloadLink));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Eroare la descărcarea arhivei ZIP.';
      throw new Error(msg);
    }

    // 3. Map to ProposeProblemForm
    return {
      title: details.title,
      statement: details.description,
      difficulty: details.difficultyLevel?.toLowerCase() || 'medium',
      timeLimit: details.timeLimit,
      memoryLimit: details.memoryLimit,
      tags: details.tagTitles || [],
      visibility: details.visibility?.toLowerCase() || 'private',
      isInteractive: files.some(f => f.category === 'interactors'), 
      generatorScript: generatorScript,
      tests: tests,
      subtasks: [],
      files: files,
      attachments: []
    } as ProposeProblemForm;
  },

  // Delete a proposal (DRAFT/REJECTED: author or admin; ACCEPTED: admin only)
  deleteProblem: async (title: string): Promise<void> => {
    await apiClient.delete(`/problems/${encodeURIComponent(title)}`);
  },

  // Get list of proposals for the current user
  getMyProposals: async (page: number = 1, size: number = 20): Promise<ProblemProposalResponse[]> => {
    const data = await apiClient.get<BackendProblemProposal[]>(`/problems/proposed?page=${page}&size=${size}`);

    return data.map((proposal) => ({
      id: proposal.title,
      title: proposal.title,
      status: mapProblemStatus(proposal.problemStatus),
      visibility: mapProblemVisibility(proposal.problemVisibility),
      hasPendingUpdate: false,
      // Backend list endpoint currently does not expose submission/update timestamps.
      submittedAt: new Date().toISOString(),
    }));
  },
};

// ── Helpers ──

function buildPayload(formData: ProposeProblemForm) {
  return {
    title: formData.title,
    description: formData.statement,
    difficultyLevel: formData.difficulty.toUpperCase(),
    timeLimit: Number(formData.timeLimit),
    memoryLimit: Number(formData.memoryLimit),
    tagTitles: formData.tags,
  };
}

function mapProblemStatus(status?: string): ProblemProposalResponse["status"] {
  switch ((status ?? "").toUpperCase()) {
    case "ACCEPTED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "CHECKED":
      return "checked";
    default:
      return "pending";
  }
}

function mapProblemVisibility(visibility?: string): ProblemProposalResponse["visibility"] {
  return (visibility ?? "").toUpperCase() === "PUBLIC" ? "public" : "private";
}

// ── Draft persistence (localStorage) ──

const DRAFT_KEY = "fiicoder_proposal_draft";

export function saveDraft(data: ProposeProblemForm): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable - silently ignore
  }
}

export function loadDraft(): ProposeProblemForm | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
