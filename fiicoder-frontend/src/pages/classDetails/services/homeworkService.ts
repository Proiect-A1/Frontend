import { apiClient } from "../../../services/apiClient";
import type {
    HomeworkResponseDTO,
    HomeworkDetailDTO,
    HomeworkRequestDTO,
    HomeworkUpdateRequestDTO,
    HomeworkUpdateResponseDTO,
    HomeworkUpdateDeleteRequestDTO,
    HomeworkStatisticsDTO,
    StudentProgressSummaryDTO
} from "../types/homework";

export const homeworkService = {
  getAll(groupId: string) {
    return apiClient.get<HomeworkResponseDTO[]>(`/group/${groupId}/homeworks`);
  },

  getById(groupId: string, homeworkId: string) {
    return apiClient.get<HomeworkDetailDTO>(`/group/${groupId}/homeworks/${homeworkId}`);
  },

  create(groupId: string, request: HomeworkRequestDTO) {
    return apiClient.post<HomeworkResponseDTO>(`/group/${groupId}/homeworks`, request);
  },

  addToDraft(groupId: string, homeworkId: string, request: HomeworkUpdateRequestDTO) {
    return apiClient.patch<HomeworkUpdateResponseDTO>(
      `/group/${groupId}/homeworks/${homeworkId}/add`,
      request
    );
  },

  removeFromDraft(groupId: string, homeworkId: string, request: HomeworkUpdateDeleteRequestDTO) {
    return apiClient.patch<HomeworkUpdateResponseDTO>(
      `/group/${groupId}/homeworks/${homeworkId}/delete`,
      request
    );
  },

  publish(groupId: string, homeworkId: string) {
    return apiClient.patch<HomeworkResponseDTO>(`/group/${groupId}/homeworks/${homeworkId}/publish`);
  },

  delete(groupId: string, homeworkId: string) {
    return apiClient.delete<void>(`/group/${groupId}/homeworks/${homeworkId}`);
  },

  getStatistics(groupId: string, homeworkId: string) {
    return apiClient.get<HomeworkStatisticsDTO>(`/group/${groupId}/homeworks/${homeworkId}/statistics`);
  },

  getStudentProgress(groupId: string, homeworkId: string, studentId: string) {
    return apiClient.get<StudentProgressSummaryDTO>(`/group/${groupId}/homeworks/${homeworkId}/students/${studentId}/progress`);
  }
};