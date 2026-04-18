export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: string;
  title: string;
  shortDescription: string;
  statement: string;
  difficulty: Difficulty;
}