import { apiClient } from "./apiClient";
import type { ProposeProblemForm, ProblemProposalResponse } from "../types/proposeProblem";
import { createProblemZip } from "../utils/zipHelper";

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

  // Get list of proposals for the current user (Mock for now)
  getMyProposals: async (_page: number = 1, _size: number = 20): Promise<ProblemProposalResponse[]> => {
    // This would normally call an endpoint like /api/problems/my-proposals
    // For now, returning mock data to populate the UI
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: "GolderbergPrivate",
        title: "GolderbergPrivate",
        status: 'pending',
        visibility: 'private',
        hasPendingUpdate: false,
        submittedAt: new Date().toISOString(),
      },
      {
        id: "Ecuatii-Complexe",
        title: "Ecuatii Complexe",
        status: 'approved',
        visibility: 'public',
        hasPendingUpdate: false,
        submittedAt: "2026-05-01T10:00:00Z",
      }
    ];
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
