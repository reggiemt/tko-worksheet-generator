export interface RWSubcategory {
  id: string;
  name: string;
  description: string;
  tag: string;
  avgQuestions: string; // e.g. "10-11" per test
}

export interface RWCategory {
  id: string;
  name: string;
  subcategories: RWSubcategory[];
}

export const RW_CATEGORIES: RWCategory[] = [
  {
    id: "craft_structure",
    name: "Craft & Structure",
    subcategories: [
      {
        id: "words_in_context",
        name: "Words in Context",
        description: "Vocabulary in context, completing text with the most logical word or phrase",
        tag: "craft_structure.words_in_context",
        avgQuestions: "10-11",
      },
      {
        id: "text_structure_purpose",
        name: "Text Structure & Purpose",
        description: "Identifying main purpose, overall structure, or function of a sentence",
        tag: "craft_structure.text_structure_purpose",
        avgQuestions: "2-3",
      },
      {
        id: "cross_text_connections",
        name: "Cross-Text Connections",
        description: "Comparing or contrasting ideas across two related passages",
        tag: "craft_structure.cross_text_connections",
        avgQuestions: "1",
      },
    ],
  },
  {
    id: "information_ideas",
    name: "Information & Ideas",
    subcategories: [
      {
        id: "central_ideas",
        name: "Central Ideas & Details",
        description: "Main idea, key details, and comprehension of passage content",
        tag: "information_ideas.central_ideas",
        avgQuestions: "4-5",
      },
      {
        id: "command_evidence_textual",
        name: "Command of Evidence (Textual)",
        description: "Identifying textual evidence that supports a given claim or hypothesis",
        tag: "information_ideas.command_evidence_textual",
        avgQuestions: "4",
      },
      {
        id: "command_evidence_quantitative",
        name: "Command of Evidence (Quantitative)",
        description: "Using data from tables or graphs to support or complete a statement",
        tag: "information_ideas.command_evidence_quantitative",
        avgQuestions: "3-4",
      },
      {
        id: "inferences",
        name: "Inferences",
        description: "Drawing logical conclusions supported by the passage text",
        tag: "information_ideas.inferences",
        avgQuestions: "3-4",
      },
    ],
  },
  {
    id: "expression_ideas",
    name: "Expression of Ideas",
    subcategories: [
      {
        id: "transitions",
        name: "Transitions",
        description: "Selecting the most logical transition word or phrase between ideas",
        tag: "expression_ideas.transitions",
        avgQuestions: "5-6",
      },
      {
        id: "rhetorical_synthesis",
        name: "Rhetorical Synthesis",
        description: "Using bullet-pointed notes to accomplish a specific writing goal",
        tag: "expression_ideas.rhetorical_synthesis",
        avgQuestions: "5-6",
      },
    ],
  },
  {
    id: "standard_english",
    name: "Standard English Conventions",
    subcategories: [
      {
        id: "boundaries",
        name: "Boundaries (Punctuation)",
        description: "Commas, semicolons, colons, periods, and dashes for sentence boundaries",
        tag: "standard_english.boundaries",
        avgQuestions: "5-6",
      },
      {
        id: "form_structure_sense",
        name: "Form, Structure & Sense",
        description: "Subject-verb agreement, verb tense, pronouns, modifiers, parallel structure",
        tag: "standard_english.form_structure_sense",
        avgQuestions: "7-8",
      },
    ],
  },
];

export function getRWCategoryById(id: string): RWCategory | undefined {
  return RW_CATEGORIES.find((cat) => cat.id === id);
}

export function getRWSubcategoryById(
  categoryId: string,
  subcategoryId: string
): RWSubcategory | undefined {
  const category = getRWCategoryById(categoryId);
  return category?.subcategories.find((sub) => sub.id === subcategoryId);
}

export function getRWSubcategoryName(categoryId: string, subcategoryId: string): string {
  const subcategory = getRWSubcategoryById(categoryId, subcategoryId);
  return subcategory?.name ?? subcategoryId;
}
