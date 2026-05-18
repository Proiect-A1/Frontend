import { apiClient } from "../../../services/apiClient";
import type { ProposeProblemForm, ProblemProposalResponse } from "../types/proposeProblem";
import { createProblemZip } from "../utils/zipHelper";

type BackendProblemProposal = {
  title: string;
  problemVisibility?: string;
  problemStatus?: string;
};

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
    await fetch(zipProblemUploadURL, {
      method: "PUT",
      body: zipBlob,
      headers: {
        // Must match the content type baked into the presigned PUT URL.
        "Content-Type": "application/octet-stream",
      },
    });

    // Return a mock response or refetch if necessary since the backend might not return the full ProposalResponse here
    return {
      id: formData.title,
      title: formData.title,
      status: 'pending',
      visibility: formData.visibility,
      hasPendingUpdate: false,
      submittedAt: new Date().toISOString(),
    };
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
    const { files, tests, generatorScript } = await extractProblemZip(details.zipDownloadLink);

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
    timeLimit: formData.timeLimit,
    memoryLimit: formData.memoryLimit,
    tagTitles: formData.tags,
    visibility: formData.visibility.toUpperCase(),
  };
}

function mapProblemStatus(status?: string): ProblemProposalResponse["status"] {
  switch ((status ?? "").toUpperCase()) {
    case "ACCEPTED":
      return "approved";
    case "REJECTED":
      return "rejected";
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
    // localStorage full or unavailable — silently ignore
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
