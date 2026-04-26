import { apiClient } from "./apiClient";

export interface LanguageDTO {
  id: string;
  name: string;
  version: string;
}

export const languageService = {
  getAll: async () => {
    const response = await apiClient.get<LanguageDTO[]>("/languages");
    return response.data;
  },
};
