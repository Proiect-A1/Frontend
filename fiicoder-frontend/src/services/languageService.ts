import { apiClient } from "./apiClient";

export interface LanguageDTO {
  id: string;
  name: string;
  version: string;
}

export const languageService = {
  getAll: () => apiClient.get<LanguageDTO[]>("/languages"),
};
