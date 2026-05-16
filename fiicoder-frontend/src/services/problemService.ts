import { apiClient } from "./apiClient";
export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "CONTEST";


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
  },

  // GET /api/problems/search/tags?tags=tag1&tags=tag2
  async searchByTags(tags: string[], page: number = 1, size: number = 50): Promise<ProblemFindResponseDTO[]> {
    const params = tags.map(t => `tags=${encodeURIComponent(t)}`).join("&");
    return await apiClient.get<ProblemFindResponseDTO[]>(`/problems/search/tags?page=${page}&size=${size}&${params}`);
  },

  // PATCH /api/problems/{title}/visibility
  async changeVisibility(title: string, visibility: 'PUBLIC' | 'PRIVATE'): Promise<void> {
    return await apiClient.patch<void>(`/problems/${encodeURIComponent(title)}/visibility`, { visibility });
  },
};