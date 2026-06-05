import { apiClient } from "../../../services/apiClient";
import type { LanguageDTO } from "../types/problemDetails";

export const languageService = {
  getAll: () => apiClient.get<LanguageDTO[]>("/languages"),
};
