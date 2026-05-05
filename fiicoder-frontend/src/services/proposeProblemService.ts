import { apiClient } from "./apiClient";
import type { ProposeProblemForm, ProblemProposalResponse } from "../types/proposeProblem";

export const proposeProblemService = {
  // Submit a new problem proposal
  submitProposal: async (formData: ProposeProblemForm): Promise<ProblemProposalResponse> => {
    const payload = buildPayload(formData);
    return await apiClient.post<ProblemProposalResponse>(
      "/problems/propose",
      payload
    );
  },

  // Update an existing proposal (new version)
  updateProposal: async (proposalId: string, formData: ProposeProblemForm): Promise<ProblemProposalResponse> => {
    const payload = buildPayload(formData);
    return await apiClient.put<ProblemProposalResponse>(
      `/problems/proposals/${proposalId}`,
      payload
    );
  },

  // Get user's proposals
  getMyProposals: async (page: number = 1, size: number = 10): Promise<ProblemProposalResponse[]> => {
    return await apiClient.get<ProblemProposalResponse[]>(
      `/problems/my-proposals?page=${page}&size=${size}`
    );
  },

  // Get specific proposal details (full form data for editing)
  getProposalForm: async (proposalId: string): Promise<ProposeProblemForm> => {
    return await apiClient.get<ProposeProblemForm>(
      `/problems/proposals/${proposalId}/form`
    );
  },

  // Get specific proposal metadata
  getProposal: async (proposalId: string): Promise<ProblemProposalResponse> => {
    return await apiClient.get<ProblemProposalResponse>(
      `/problems/proposals/${proposalId}`
    );
  },
};

// ── Helpers ──

function buildPayload(formData: ProposeProblemForm) {
  return {
    title: formData.title,
    difficulty: formData.difficulty,
    timeLimit: formData.timeLimit,
    memoryLimit: formData.memoryLimit,
    tags: formData.tags,
    statement: formData.statement,
    sourceUrl: formData.sourceUrl,
    generatorScript: formData.generatorScript,
    tests: formData.tests,
    subtasks: formData.subtasks,
    files: formData.files,
    visibility: formData.visibility,
    allowedUsers: formData.allowedUsers,
    allowedGroups: formData.allowedGroups,
  };
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
