export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "CONTEST";

export interface Problem {
  id: string;
  title: string;
  shortDescription: string;
  statement: string;
  difficulty: Difficulty;
  tags: string[];
}