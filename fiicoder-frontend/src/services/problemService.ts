import { apiClient } from "./apiClient";
import type { Difficulty } from "../types/problem";

// copie a interfetei ProblemFindResponseDTO din backend
export interface ProblemFindResponseDTO {
  title: string;
  description: string;
  memoryLimit: number;
  timeLimit: number;
  difficulty: Difficulty;
  tags: string[];
}

export const problemService = {
  // GET /api/problems/all
  async getAllProblems(page: number = 1, size: number = 50): Promise<ProblemFindResponseDTO[]> {
    return await apiClient.get<ProblemFindResponseDTO[]>(`/problems/all?page=${page}&size=${size}`);
  },

  // GET /api/problems/{title}
  async getProblemByTitle(title: string): Promise<ProblemFindResponseDTO> {
    return await apiClient.get<ProblemFindResponseDTO>(`/problems/${title}`);
  }
};