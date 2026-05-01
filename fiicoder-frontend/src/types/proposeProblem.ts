export interface TestCase {
  id: string;
  input: string;
  output: string;
  subtaskIds: string[];
  timeLimit?: number;
  memoryLimit?: number;
  points?: number;
}

export interface Subtask {
  id: string;
  title: string;
  points: number;
  testIds: string[];
}

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
  
  // Tests
  tests: TestCase[];
  
  // Subtasks
  subtasks: Subtask[];
  
  // Attachments
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
