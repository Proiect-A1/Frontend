import { apiClient } from "./apiClient";
import autoTranslateProblemText from "../language/autoTranslateProblem";
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

  // Fetch problem and return an auto-translated description (mapping-based)
  async getProblemByTitleTranslated(title: string, to: string = 'en') {
    const p = await apiClient.get<ProblemFindResponseDTO>(`/problems/${title}`);
    return { ...p, translatedDescription: autoTranslateProblemText(p.description, to) };
  },

  // GET /api/problems/search/tags?tags=tag1&tags=tag2
  async searchByTags(tags: string[], page: number = 1, size: number = 50): Promise<ProblemFindResponseDTO[]> {
    const params = tags.map(t => `tags=${encodeURIComponent(t)}`).join("&");
    return await apiClient.get<ProblemFindResponseDTO[]>(`/problems/search/tags?page=${page}&size=${size}&${params}`);
  },
  
  // Convenience: fetch page of problems and add a `translatedDescription` using mapping rules
  async getAllProblemsTranslated(page: number = 1, size: number = 50, to: string = 'en') {
    const list = await apiClient.get<ProblemFindResponseDTO[]>(`/problems/all?page=${page}&size=${size}`);
    return list.map(p => ({ ...p, translatedDescription: autoTranslateProblemText(p.description, to) }));
  }
};