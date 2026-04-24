import { apiClient } from "./apiClient";

export interface HomeworkResponseDTO {
  id: string;
  title: string;
  description: string | null;
  status: "ACTIVE" | "CLOSED" | "DRAFT";
  deadline: string;
  createdAt: string;
}

export interface HomeworkRequestDTO {
  title: string;
  description?: string;
  deadline: string;
}

export const homeworkService = {
  getAll(groupId: string) {
    return apiClient.get<HomeworkResponseDTO[]>(`/classes/${groupId}/homeworks`);
  },

  create(groupId: string, request: HomeworkRequestDTO) {
    return apiClient.post<HomeworkResponseDTO>(`/classes/${groupId}/homeworks`, request);
  },

  delete(groupId: string, homeworkId: string) {
    return apiClient.delete<void>(`/classes/${groupId}/homeworks/${homeworkId}`);
  },
};