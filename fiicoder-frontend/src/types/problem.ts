export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: number;
  title: string;
  shortDescription: string;
  statement: string;
  difficulty: Difficulty;
}