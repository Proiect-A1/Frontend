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

  // Edit an existing proposal via PATCH /problems/{title}/edit.
  //
  // Only the fields that actually changed are sent in the body (the backend
  // treats absent JsonNullable fields as "no change"). `fileChanges` is set to
  // true only when the uploaded package content changed (source files, manual
  // tests or generator script) — metadata-only edits send `false`.
  //
  // - fileChanges=true  → backend re-quarantines the problem and returns a
  //                       presigned upload URL; we upload the new ZIP and poll
  //                       until automated verification finishes.
  // - fileChanges=false → backend applies metadata directly and moves the
  //                       problem back to CHECKED; no upload / polling needed.
  updateProposal: async (
    proposalId: string,
    formData: ProposeProblemForm,
    originalForm: ProposeProblemForm,
  ): Promise<ProblemProposalResponse> => {
    const { body, fileChanges, hasMetadataChanges } = buildEditPayload(originalForm, formData);

    if (!fileChanges && !hasMetadataChanges) {
      throw { status: 0, body: null, message: 'NO_CHANGES' };
    }

    const { zipProblemUploadURL } = await apiClient.patch<{ zipProblemUploadURL: string | null }>(
      `/problems/${encodeURIComponent(proposalId)}/edit`,
      body,
    );

    // The title may have changed — subsequent lookups must use the new one.
    const effectiveTitle = (body.title as string | undefined) ?? proposalId;

    if (fileChanges) {
      if (!zipProblemUploadURL) {
        throw { status: 0, body: null, message: 'ZIP_UPLOAD_FAILED' };
      }

      const zipBlob = await createProblemZip(formData);
      const uploadRes = await fetch(zipProblemUploadURL, {
        method: 'PUT',
        body: zipBlob,
        headers: { 'Content-Type': 'application/octet-stream' },
      });
      if (!uploadRes.ok) {
        throw { status: uploadRes.status, body: null, message: 'ZIP_UPLOAD_FAILED' };
      }

      // Edited package goes back through the async auto-verification pipeline.
      return await pollProposalState(effectiveTitle, formData.visibility);
    }

    // Metadata-only edit: backend already moved the problem to CHECKED.
    return {
      id: effectiveTitle,
      title: effectiveTitle,
      status: 'checked',
      visibility: 'private',
      hasPendingUpdate: false,
      submittedAt: new Date().toISOString(),
    };
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
    // memoryLimit is an integer (MB) on the backend.
    memoryLimit: Math.round(Number(formData.memoryLimit)),
    tagTitles: formData.tags,
  };
}

// Builds the PATCH body for an edit. Includes only the metadata fields that
// differ from the original (matching the backend's JsonNullable semantics, where
// an absent field means "leave unchanged"), and decides `fileChanges` by
// comparing only the parts that end up inside the uploaded ZIP.
function buildEditPayload(original: ProposeProblemForm, current: ProposeProblemForm) {
  const body: Record<string, unknown> = {};

  if (current.title !== original.title) body.title = current.title;
  if (current.statement !== original.statement) body.description = current.statement;
  if (current.difficulty !== original.difficulty) body.difficultyLevel = current.difficulty.toUpperCase();
  if (Number(current.timeLimit) !== Number(original.timeLimit)) body.timeLimit = Number(current.timeLimit);
  if (Math.round(Number(current.memoryLimit)) !== Math.round(Number(original.memoryLimit))) {
    body.memoryLimit = Math.round(Number(current.memoryLimit));
  }
  if (!sameTags(current.tags, original.tags)) body.tagTitles = current.tags;

  const hasMetadataChanges = Object.keys(body).length > 0;
  const fileChanges = packageChanged(original, current);

  body.fileChanges = fileChanges;

  return { body, fileChanges, hasMetadataChanges };
}

// Tags are an unordered set on the backend; compare ignoring order.
function sameTags(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((tag, i) => tag === sortedB[i]);
}

// True when anything that gets written into the ZIP changed: the categorized
// source files, the manual test cases (only `manual` tests are serialized as
// raw_tests, see zipHelper) and the generator script.
function packageChanged(original: ProposeProblemForm, current: ProposeProblemForm): boolean {
  if ((original.generatorScript || '') !== (current.generatorScript || '')) return true;
  if (normalizeFiles(original.files) !== normalizeFiles(current.files)) return true;
  if (normalizeManualTests(original.tests) !== normalizeManualTests(current.tests)) return true;
  return false;
}

function normalizeFiles(files: ProposeProblemForm['files']): string {
  return JSON.stringify(
    files
      .map((f) => ({ category: f.category, name: f.name, content: f.content }))
      .sort((a, b) => `${a.category}/${a.name}`.localeCompare(`${b.category}/${b.name}`)),
  );
}

function normalizeManualTests(tests: ProposeProblemForm['tests']): string {
  return JSON.stringify(
    tests
      .filter((test) => test.source === 'manual')
      .map((test) => ({ id: test.id, input: test.input, output: test.output }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  );
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
