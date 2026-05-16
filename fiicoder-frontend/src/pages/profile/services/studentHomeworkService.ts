import { apiClient } from "../../../services/apiClient";
import type { HomeworkResponseDTO, HomeworkDetailDTO, StudentProgressSummaryDTO } from "../../classDetails/types/homework";

export const studentHomeworkService = {
  getMyHomeworks() {
    return apiClient.get<HomeworkResponseDTO[]>("/homeworks");
  },

  getHomeworkDetails(homeworkId: string) {
    return apiClient.get<HomeworkDetailDTO>(`/homeworks/${homeworkId}`);
  },

  getMyProgress(homeworkId: string) {
    return apiClient.get<StudentProgressSummaryDTO>(`/homeworks/${homeworkId}/progress`);
  },
};
