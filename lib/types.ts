export type Difficulty = "easy" | "medium" | "hard";
export type QuestionCount = 10 | 15 | 20;

export interface ProblemModifiers {
  includeFractions: boolean;
  includeUnknownConstants: boolean;
  noDesmos: boolean;
  wordProblemsOnly: boolean;
  gridInOnly: boolean;
}

export const DEFAULT_MODIFIERS: ProblemModifiers = {
  includeFractions: false,
  includeUnknownConstants: false,
  noDesmos: false,
  wordProblemsOnly: false,
  gridInOnly: false,
};

export interface GenerateRequest {
  category: string;
  subcategory: string;
  difficulty: Difficulty;
  questionCount: QuestionCount;
  modifiers?: ProblemModifiers;
}

export interface AnalyzeRequest {
  image: string; // base64 encoded image
}

export interface AnalyzeResponse {
  success: boolean;
  category?: string;
  subcategory?: string;
  difficulty?: Difficulty;
  description?: string;
  error?: string;
}

export interface Problem {
  number: number;
  content: string;
  choices?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  isGridIn: boolean;
  hasVisual: boolean;
  visualCode?: string;
}

export interface Answer {
  number: number;
  correctAnswer: string;
  solution: string;
}

export interface GeneratedWorksheet {
  problems: Problem[];
  answers: Answer[];
  metadata: {
    category: string;
    subcategory: string;
    difficulty: Difficulty;
    questionCount: number;
    generatedAt: string;
  };
}

export interface GenerateResponse {
  success: boolean;
  worksheetPdf?: string;
  answerKeyPdf?: string;
  worksheetId?: string;
  error?: string;
  metadata?: GeneratedWorksheet["metadata"];
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}
