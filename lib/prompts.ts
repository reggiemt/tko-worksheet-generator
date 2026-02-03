import { getSubcategoryById } from "./categories";
import type { Difficulty, ProblemModifiers } from "./types";

export const SYSTEM_PROMPT = `You are an expert SAT Math problem generator. Your role is to create authentic, high-quality SAT practice problems that match the style, difficulty, and format of real College Board SAT Math questions.

## Core Principles

### Reverse Construction Method
For EVERY problem you create:
1. Start with a clean answer (integer, simple fraction, or clean decimal)
2. Build the problem working backward from that answer
3. Ensure the problem requires genuine SAT-level reasoning to solve
4. Verify by mentally solving forward — you must arrive at the intended answer

### Answer Verification Protocol
Before including ANY problem:
1. Solve the problem step-by-step (forward direction)
2. Confirm answer matches intended answer exactly
3. For multiple choice: verify each distractor is plausible but definitively wrong
4. For grid-in: confirm answer fits grid constraints (0-9999, fractions, decimals)

## Problem Quality Standards

### Authenticity Requirements
- Problems should be indistinguishable from real SAT problems
- Include multi-step reasoning where appropriate
- Use realistic contexts (science, economics, everyday scenarios)
- Vary problem formats within the topic

### Multiple Choice Distractors
When creating wrong answers, make them:
- **Computational errors**: Result of common arithmetic mistakes
- **Conceptual errors**: Result of misunderstanding (e.g., adding instead of multiplying)
- **Partial solutions**: Stopping before the final step
- **Sign errors**: Negative instead of positive or vice versa

All distractors must be:
- Plausible (a real student might choose it)
- Definitively wrong (not an edge case)
- Different from each other

## Difficulty Calibration

### Easy
- Single concept, 1-2 steps
- Straightforward application of formulas
- Clear, direct wording

### Medium
- Combines 2 concepts or requires 2-3 steps
- May require setting up equations from context
- Some interpretation needed

### Hard
- Multi-step reasoning (3+ steps)
- Combines multiple concepts
- Abstract or complex contexts
- Requires strategic problem-solving approach

## Visual Elements (TikZ)
Include visual elements for approximately 30% of problems where appropriate:
- Coordinate planes for function problems
- Geometric figures for geometry problems
- Data tables for statistics problems
- Graphs for data interpretation

Use this TikZ format for graphs:
\`\`\`latex
\\begin{tikzpicture}
\\begin{axis}[
    axis lines=middle,
    xlabel={$x$}, ylabel={$y$},
    xmin=-5, xmax=5,
    ymin=-5, ymax=5,
    xtick={-4,-2,0,2,4},
    ytick={-4,-2,0,2,4},
    grid=both,
    width=7cm, height=7cm
]
\\addplot[domain=-4:4, samples=100, thick, blue] {x^2 - 2*x - 3};
\\end{axis}
\\end{tikzpicture}
\`\`\`

Use this format for right triangles:
\`\`\`latex
\\begin{tikzpicture}[scale=0.8]
    \\coordinate (A) at (0,0);
    \\coordinate (B) at (4,0);
    \\coordinate (C) at (4,3);
    \\draw[thick] (A) -- (B) node[midway, below] {4}
                 -- (C) node[midway, right] {3}
                 -- cycle node[midway, above left] {5};
    \\draw (3.7,0) -- (3.7,0.3) -- (4,0.3);
\\end{tikzpicture}
\`\`\`

## Output Format

You MUST output valid JSON in exactly this format:
{
  "problems": [
    {
      "number": 1,
      "content": "The problem text in plain text (no LaTeX except for math expressions like $x^2$)",
      "choices": {
        "A": "Answer choice A (use LaTeX for math like $\\\\frac{1}{2}$)",
        "B": "Answer choice B",
        "C": "Answer choice C",
        "D": "Answer choice D"
      },
      "isGridIn": false,
      "hasVisual": false,
      "visualCode": null
    },
    {
      "number": 2,
      "content": "A grid-in problem (student-produced response)",
      "choices": null,
      "isGridIn": true,
      "hasVisual": true,
      "visualCode": "\\\\begin{tikzpicture}...\\\\end{tikzpicture}"
    }
  ],
  "answers": [
    {
      "number": 1,
      "correctAnswer": "B",
      "solution": "Step 1: Identify...\\nStep 2: Calculate...\\nStep 3: Therefore the answer is B."
    },
    {
      "number": 2,
      "correctAnswer": "24",
      "solution": "Step 1: Set up the equation...\\nThe answer is 24."
    }
  ]
}

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown code blocks, no explanations
2. All LaTeX backslashes must be escaped as \\\\ in JSON strings
3. Use \\n for line breaks in solution text
4. For grid-in problems, choices should be null and isGridIn should be true
5. Include 1-2 grid-in problems per worksheet
6. visualCode should be null (not an empty string) when hasVisual is false`;

export function buildUserPrompt(
  category: string,
  subcategory: string,
  difficulty: Difficulty,
  questionCount: number,
  modifiers?: ProblemModifiers
): string {
  const subcategoryInfo = getSubcategoryById(category, subcategory);
  const topicName = subcategoryInfo?.name ?? subcategory;
  const topicDescription = subcategoryInfo?.description ?? "";

  const difficultyGuide = {
    easy: "Focus on single-concept problems with 1-2 steps. Use straightforward wording and clear setups.",
    medium: "Include problems that combine 2 concepts or require 2-3 steps. Some problems should require setting up equations from word problems.",
    hard: "Create challenging problems with multi-step reasoning (3+ steps). Include problems that combine multiple concepts and require strategic thinking.",
  };

  // Build modifier instructions
  const modifierInstructions: string[] = [];

  if (modifiers?.includeFractions) {
    modifierInstructions.push(
      "**FRACTIONS REQUIRED:** Every problem must meaningfully involve fractions — fractional coefficients (e.g., ⅔x), fractional answers, fraction arithmetic, or fractional expressions. Do not use only whole numbers."
    );
  }

  if (modifiers?.includeUnknownConstants) {
    modifierInstructions.push(
      '**UNKNOWN CONSTANTS REQUIRED:** Every problem must include at least one unknown constant (k, a, c, m, etc.) that the student must solve for or reason about. Examples: "For what value of k does the equation have no solution?", "If the system has infinitely many solutions, what is the value of a?"'
    );
  }

  if (modifiers?.noDesmos) {
    modifierInstructions.push(
      "**NO-DESMOS PROBLEMS:** Create problems that CANNOT be efficiently solved by graphing on Desmos or plugging in values. Focus on: algebraic manipulation and simplification, interpreting what variables/expressions represent, determining equivalent expressions, reasoning about structure and form, problems where the answer is an expression (not a number), conceptual understanding questions. Avoid problems where graphing two sides of an equation or plugging in answer choices would work."
    );
  }

  if (modifiers?.wordProblemsOnly) {
    modifierInstructions.push(
      "**WORD PROBLEMS ONLY:** Every problem must be presented as a real-world context or scenario. No bare equations or pure symbolic manipulation. Use contexts like: science experiments, business/economics, population growth, construction, travel, surveys, sports statistics, etc."
    );
  }

  if (modifiers?.gridInOnly) {
    modifierInstructions.push(
      "**ALL GRID-IN:** Every problem must be a student-produced response (grid-in) with NO multiple choice options. Set isGridIn to true and choices to null for ALL problems. Answers must fit grid-in constraints (0-9999, simple fractions, or decimals)."
    );
  }

  const modifierSection = modifierInstructions.length > 0
    ? `\n\n## Special Constraints\n${modifierInstructions.join("\n\n")}`
    : "";

  // Adjust grid-in instruction based on gridInOnly modifier
  const gridInInstruction = modifiers?.gridInOnly
    ? `2. ALL problems should be grid-in (student-produced response) — no multiple choice`
    : `2. Include ${Math.max(1, Math.floor(questionCount / 6))} to ${Math.ceil(questionCount / 5)} grid-in (student-produced response) problems`;

  return `Generate exactly ${questionCount} SAT Math problems for the topic: ${topicName}

Topic description: ${topicDescription}

Difficulty level: ${difficulty.toUpperCase()}
${difficultyGuide[difficulty]}${modifierSection}

Requirements:
1. Create exactly ${questionCount} problems numbered 1 through ${questionCount}
${gridInInstruction}
3. Include visual elements (TikZ graphics) for approximately ${Math.round(questionCount * 0.3)} problems where appropriate for this topic
4. Use the reverse construction method - start with clean answers
5. Verify each answer mathematically before including
6. Make distractors plausible but definitively wrong

Output valid JSON only. No markdown, no explanations - just the JSON object.`;
}

export function buildMultiTopicUserPrompt(
  topics: { category: string; subcategory: string }[],
  difficulty: Difficulty,
  questionCount: number,
  modifiers?: ProblemModifiers
): string {
  const topicDescriptions = topics.map((t) => {
    const info = getSubcategoryById(t.category, t.subcategory);
    return {
      name: info?.name ?? t.subcategory,
      description: info?.description ?? "",
      category: t.category,
      subcategory: t.subcategory,
    };
  });

  // Deduplicate topics
  const seen = new Set<string>();
  const uniqueTopics = topicDescriptions.filter((t) => {
    const key = `${t.category}.${t.subcategory}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const topicCount = uniqueTopics.length;
  const perTopic = Math.floor(questionCount / topicCount);
  const remainder = questionCount - perTopic * topicCount;

  const difficultyGuide = {
    easy: "Focus on single-concept problems with 1-2 steps. Use straightforward wording and clear setups.",
    medium: "Include problems that combine 2 concepts or require 2-3 steps. Some problems should require setting up equations from word problems.",
    hard: "Create challenging problems with multi-step reasoning (3+ steps). Include problems that combine multiple concepts and require strategic thinking.",
  };

  const topicList = uniqueTopics
    .map(
      (t, i) =>
        `${i + 1}. **${t.name}** (${t.category}/${t.subcategory})${t.description ? `: ${t.description}` : ""} — generate ${perTopic + (i < remainder ? 1 : 0)} problems`
    )
    .join("\n");

  // Build modifier instructions (same as single-topic)
  const modifierInstructions: string[] = [];

  if (modifiers?.includeFractions) {
    modifierInstructions.push(
      "**FRACTIONS REQUIRED:** Every problem must meaningfully involve fractions."
    );
  }
  if (modifiers?.includeUnknownConstants) {
    modifierInstructions.push(
      "**UNKNOWN CONSTANTS REQUIRED:** Every problem must include at least one unknown constant."
    );
  }
  if (modifiers?.noDesmos) {
    modifierInstructions.push(
      "**NO-DESMOS PROBLEMS:** Create problems that CANNOT be efficiently solved by graphing on Desmos."
    );
  }
  if (modifiers?.wordProblemsOnly) {
    modifierInstructions.push(
      "**WORD PROBLEMS ONLY:** Every problem must be presented as a real-world context."
    );
  }
  if (modifiers?.gridInOnly) {
    modifierInstructions.push(
      "**ALL GRID-IN:** Every problem must be a student-produced response (grid-in)."
    );
  }

  const modifierSection =
    modifierInstructions.length > 0
      ? `\n\n## Special Constraints\n${modifierInstructions.join("\n\n")}`
      : "";

  const gridInInstruction = modifiers?.gridInOnly
    ? `2. ALL problems should be grid-in (student-produced response) — no multiple choice`
    : `2. Include ${Math.max(1, Math.floor(questionCount / 6))} to ${Math.ceil(questionCount / 5)} grid-in (student-produced response) problems`;

  return `Generate exactly ${questionCount} SAT Math problems spanning MULTIPLE topics. This is a mixed-topic worksheet.

## Topics to cover (distribute problems as indicated):
${topicList}

Difficulty level: ${difficulty.toUpperCase()}
${difficultyGuide[difficulty]}${modifierSection}

Requirements:
1. Create exactly ${questionCount} problems numbered 1 through ${questionCount}
${gridInInstruction}
3. Mix the topics throughout the worksheet — do NOT group all problems from the same topic together. Interleave them.
4. Include visual elements (TikZ graphics) for approximately ${Math.round(questionCount * 0.3)} problems where appropriate
5. Use the reverse construction method - start with clean answers
6. Verify each answer mathematically before including
7. Make distractors plausible but definitively wrong

Output valid JSON only. No markdown, no explanations - just the JSON object.`;
}
