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

  async createTag(title: string): Promise<TagResponseDTO> {
    return await apiClient.post<TagResponseDTO>("/tags", { title });
  },

  async updateTag(originalTitle: string, newTitle: string): Promise<TagResponseDTO> {
    return await apiClient.put<TagResponseDTO>(`/tags/${encodeURIComponent(originalTitle)}`, { 
        originalTitle, 
        newTitle 
    });
  },

  async deleteTag(title: string): Promise<void> {
    return await apiClient.delete<void>(`/tags/${encodeURIComponent(title)}`);
  },

  async getTagByTitle(title: string): Promise<TagResponseDTO> {
    return await apiClient.get<TagResponseDTO>(`/tags/${encodeURIComponent(title)}`);
  },
};
