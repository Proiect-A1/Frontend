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

export interface GeneratorValidationWarning {
  line: number;
  col: number;
  message: string;
}

export interface GeneratorValidationResult {
  valid: boolean;
  errors: GeneratorValidationError[];
  warnings: GeneratorValidationWarning[];
}

// ── Run results ──
export interface TestRunResult {
  testId: string;
  verdict: 'OK' | 'WA' | 'PE' | 'SUPER' | 'PA' | 'FAIL' | 'SKIP' | 'NONE' | 'CPE' | 'TLE' | 'MLE' | 'RTE' | 'ILE' | 'OTHER' | 'PENDING';
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
  difficulty: 'easy' | 'medium' | 'hard' | 'contest';
  timeLimit: number;
  memoryLimit: number;
  isInteractive: boolean;
  tags: string[];

  // Statement Tab
  statement: string;

  // Generator Tab
  generatorScript: string;

  // Manual Tests
  tests: TestCase[];

  // Subtasks
  subtasks: Subtask[];

  // Files (categorized)
  files: ProblemFile[];

  // Legacy - kept for compatibility but no longer used directly
  attachments: File[];

  // Access — proposals are always submitted as PRIVATE; visibility is
  // promoted to PUBLIC later from the profile, after admin approval.
  visibility: 'private' | 'public';
}

export interface ProblemProposalResponse {
  id: string;
  title: string;
  status: 'pending' | 'checked' | 'approved' | 'rejected';
  visibility: 'private' | 'public';
  hasPendingUpdate: boolean;
  submittedAt: string;
  updatedAt?: string;
  feedback?: string;
}
