export type Difficulty = "Ușor" | "Mediu" | "Greu";

export interface Problem {
  id: number;
  title: string;
  shortDescription: string;
  statement: string;
  difficulty: Difficulty;
}