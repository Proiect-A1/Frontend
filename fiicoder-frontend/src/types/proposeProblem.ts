export interface TestCase {
  id: string;
  input: string;
  output: string;
  subtaskIds: string[];
  timeLimit?: number;
  memoryLimit?: number;
  points?: number;
  source: 'manual' | 'generated';
}

export interface Subtask {
  id: string;
  title: string;
  points: number;
  testIds: string[];
}

// ── File categories matching archive structure ──
export type FileCategory = 'sources' | 'checkers' | 'validators' | 'generators' | 'interactors';

export interface ProblemFile {
  id: string;
  name: string;
  size: number;
  category: FileCategory;
  content: string; // raw text content for code files
  language?: string; // monaco language id (cpp, python, etc.)
}

// ── Generator ──
export interface GeneratorValidationError {
  line: number;
  col: number;
  message: string;
}

export interface GeneratorValidationResult {
  valid: boolean;
  errors: GeneratorValidationError[];
}

// ── Run results ──
export interface TestRunResult {
  testId: string;
  verdict: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'PENDING';
  time?: number;  // seconds
  memory?: number; // MB
  points: number;
  maxPoints: number;
}

export interface SubtaskRunResult {
  subtaskId: string;
  name: string;
  scored: number;
  maxPoints: number;
  tests: TestRunResult[];
}

export interface RunResult {
  sourceFile: string;
  totalScore: number;
  maxScore: number;
  subtasks: SubtaskRunResult[];
  timestamp: string;
}

// ── Main form ──
export interface ProposeProblemForm {
  // General Tab
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  memoryLimit: number;
  tags: string[];

  // Statement Tab
  statement: string;
  sourceUrl?: string;

  // Generator Tab
  generatorScript: string;

  // Manual Tests
  tests: TestCase[];

  // Subtasks
  subtasks: Subtask[];

  // Files (categorized)
  files: ProblemFile[];

  // Legacy — kept for compatibility but no longer used directly
  attachments: File[];

  // Access
  visibility: 'private' | 'public' | 'unlisted';
  allowedUsers?: string[];
  allowedGroups?: string[];
}

export interface ProblemProposalResponse {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  feedback?: string;
}
