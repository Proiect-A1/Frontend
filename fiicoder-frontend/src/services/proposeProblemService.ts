import { apiClient } from "./apiClient";
import type { ProposeProblemForm, ProblemProposalResponse } from "../types/proposeProblem";

export const proposeProblemService = {
  // Submit a new problem proposal
  submitProposal: async (formData: ProposeProblemForm): Promise<ProblemProposalResponse> => {
    const payload = {
      title: formData.title,
      difficulty: formData.difficulty,
      timeLimit: formData.timeLimit,
      memoryLimit: formData.memoryLimit,
      tags: formData.tags,
      statement: formData.statement,
      sourceUrl: formData.sourceUrl,
      tests: formData.tests,
      subtasks: formData.subtasks,
      visibility: formData.visibility,
      allowedUsers: formData.allowedUsers,
      allowedGroups: formData.allowedGroups,
    };

    return await apiClient.post<ProblemProposalResponse>(
      "/problems/propose",
      payload
    );
  },

  // Get user's proposals
  getMyProposals: async (page: number = 1, size: number = 10): Promise<ProblemProposalResponse[]> => {
    return await apiClient.get<ProblemProposalResponse[]>(
      `/problems/my-proposals?page=${page}&size=${size}`
    );
  },

  // Get specific proposal details
  getProposal: async (proposalId: string): Promise<ProblemProposalResponse> => {
    return await apiClient.get<ProblemProposalResponse>(
      `/problems/proposals/${proposalId}`
    );
  },
};
