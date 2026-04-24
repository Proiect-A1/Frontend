import { apiClient } from "./apiClient";

export interface TagResponseDTO {
  id: string;
  title: string;
}

export const tagService = {
  // GET /api/tags
  async getAllTags(): Promise<TagResponseDTO[]> {
    return await apiClient.get<TagResponseDTO[]>("/tags");
  },
};
