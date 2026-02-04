import type { Difficulty, QuestionCount } from "./types";

export interface RWProblem {
  number: number;
  passage: string;
  question: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  hasData: boolean;
  dataType?: "table" | "bar_graph" | "line_graph";
  dataContent?: string; // LaTeX-formatted table or description for graph
}

export interface RWAnswer {
  number: number;
  correctAnswer: string; // A, B, C, or D
  explanation: string;
}

export interface RWModifiers {
  passageType: "science" | "literature" | "history" | "humanities" | "mixed";
  includeCharts: boolean;
  includePoetry: boolean;
  includeDualPassages: boolean;
  grammarHeavy: boolean;
  vocabularyHeavy: boolean;
  transitionsFocus: boolean;
  evidenceFocus: boolean;
}

export const DEFAULT_RW_MODIFIERS: RWModifiers = {
  passageType: "mixed",
  includeCharts: false,
  includePoetry: false,
  includeDualPassages: false,
  grammarHeavy: false,
  vocabularyHeavy: false,
  transitionsFocus: false,
  evidenceFocus: false,
};

export interface GenerateRWRequest {
  category: string;
  subcategory: string;
  difficulty: Difficulty;
  questionCount: QuestionCount;
  modifiers?: RWModifiers;
}

export interface GeneratedRWWorksheet {
  problems: RWProblem[];
  answers: RWAnswer[];
  metadata: {
    category: string;
    subcategory: string;
    difficulty: Difficulty;
    questionCount: number;
    generatedAt: string;
  };
}
