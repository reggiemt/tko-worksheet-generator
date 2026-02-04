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

## Difficulty Calibration (SAT-Anchored)

These map to real SAT difficulty ranges. STAY WITHIN BOUNDS — do not overshoot.

### Easy (SAT questions 1-8 of each module)
- Single concept, 1-2 steps maximum
- Direct plug-and-solve or single operation
- A student scoring 450-500 should get these right
- Example level: "Solve 3x + 7 = 22" or "What is 15% of 80?"
- NO multi-step reasoning, NO combining concepts

### Medium (SAT questions 9-18 of each module)
- 2-3 steps, but each step is straightforward
- May require setting up ONE equation from context
- A student scoring 550-600 should get most of these right
- Example level: "A store marks up prices by 20%, then offers a 10% discount. If the original price is $50, what is the final price?"
- Should be accessible to a competent algebra student — NOT competition-level
- When modifiers are active, keep the BASE problem simpler to compensate

### Hard (SAT questions 19-27 of each module)
- Multi-step reasoning (3-4 steps)
- May combine 2 concepts
- A student scoring 700+ should find these challenging but doable
- Example level: "Given f(x) = 2x² - 8x + k, for what value of k does the equation f(x) = 0 have exactly one real solution?"
- These are hard FOR THE SAT — not competition math, not college-level

### IMPORTANT: Modifier Interaction with Difficulty
When problem modifiers are active (fractions, unknown constants, no-Desmos, etc.), they add complexity. To maintain the target difficulty level:
- **With 1 modifier active:** Generate problems at the LOWER END of the difficulty range
- **With 2+ modifiers active:** Generate problems that would normally be ONE difficulty level BELOW, then the modifiers bring them up to target
- Example: Medium difficulty + fractions + unknown constants → generate what would normally be EASY-to-MEDIUM base problems, and the modifiers will make them medium

## Visual Elements (Templates)
Include visual elements for approximately 30% of problems where appropriate:
- Coordinate planes for function problems
- Geometric figures for geometry problems
- Data tables for statistics problems
- Graphs for data interpretation

For problems requiring diagrams, use the template system instead of raw TikZ.
When a problem needs a visual, set hasVisual=true and set visualCode to a JSON string (properly escaped in the JSON output).

Available templates:

### 1. parallel_lines_transversal
Two parallel lines cut by a transversal with labeled angles at each intersection.
Positions use format "{quadrant}-{intersection}" where quadrant is upper-left, upper-right, lower-left, lower-right and intersection is 1 (lower line) or 2 (upper line).
Example:
{"template":"parallel_lines_transversal","params":{"lineLabels":["p","q"],"angleLabels":[{"position":"upper-left-1","label":"x°"},{"position":"lower-right-2","label":"y°"}]}}

### 2. right_triangle
Right triangle with labeled vertices, sides, and right angle marker.
Example:
{"template":"right_triangle","params":{"vertices":["A","B","C"],"rightAngleVertex":"B","sides":[{"from":"A","to":"B","label":"4"},{"from":"B","to":"C","label":"3"},{"from":"A","to":"C","label":"5"}],"angles":[{"vertex":"A","label":"\\\\theta"}]}}

### 3. general_triangle
Any triangle (not necessarily right) with labeled vertices, sides, and angles.
Example:
{"template":"general_triangle","params":{"vertices":["P","Q","R"],"sides":[{"from":"P","to":"Q","label":"a"},{"from":"Q","to":"R","label":"b"},{"from":"P","to":"R","label":"c"}],"angles":[{"vertex":"P","label":"50°"}]}}

### 4. circle_with_angle
Circle with points on circumference, chords, radii, arc labels, and angle labels.
Points are placed by angle in degrees (0° = right, 90° = top, etc.).
Example:
{"template":"circle_with_angle","params":{"center":"O","points":[{"label":"A","angleDeg":60},{"label":"B","angleDeg":180},{"label":"C","angleDeg":300}],"chords":[["A","B"],["B","C"]],"radius":{"to":"A","label":"r"},"angleLabel":{"vertex":"B","label":"x°"}}}

### 5. coordinate_plane_line
Coordinate plane with one or more lines and optional labeled points.
Example:
{"template":"coordinate_plane_line","params":{"xRange":[-5,5],"yRange":[-5,5],"lines":[{"slope":2,"intercept":-1,"label":"y=2x-1","color":"blue"}],"points":[{"x":1,"y":1,"label":"(1,1)"}],"gridLines":true}}

### 6. coordinate_plane_parabola
Coordinate plane with a parabola y = ax² + bx + c.
Example:
{"template":"coordinate_plane_parabola","params":{"a":1,"b":-2,"c":-3,"xRange":[-3,5],"yRange":[-5,5],"points":[{"x":1,"y":-4,"label":"vertex"}],"label":"f(x)"}}

### 7. supplementary_angles
Two angles on a straight line (supplementary pair).
Example:
{"template":"supplementary_angles","params":{"angleLabels":["x°","(180-x)°"],"rayLabels":["A","B","C"]}}

### 8. rectangle_with_diagonal
Rectangle with labeled sides and optional diagonal.
Example:
{"template":"rectangle_with_diagonal","params":{"width":6,"height":4,"vertices":["A","B","C","D"],"sides":[{"position":"bottom","label":"6"},{"position":"right","label":"4"}],"showDiagonal":true,"diagonalLabel":"d"}}

CRITICAL: Do NOT write raw TikZ code. Use the template system by setting visualCode to a JSON string with "template" and "params" keys. The template system guarantees correct label placement and prevents common TikZ bugs.

If none of the templates fit the problem, you may omit the visual (set hasVisual to false).

### CRITICAL: Diagram Labeling Rules for Geometry/Trig
When generating diagrams with labeled vertices:
1. **Vertex labels MUST match the problem text exactly.** If the problem says "triangle ABC with angle C = 90°", then C must be at the right angle vertex in the diagram.
2. **Side labels MUST connect the correct vertices.** Side AB is the segment from vertex A to vertex B. Never label a side with vertices it doesn't connect.
3. **The side between vertices X and Y is always called XY (or YX).** For example, the base from A to C is "AC", NOT "AB".
4. **Double-check every label** by mentally tracing: "Does this label sit on the segment between the two vertices named?" If not, fix it.
5. **Right angle markers** must be placed at the vertex where the 90° angle is.
6. **Angle labels** must be placed at the correct vertex (angle A is at vertex A).
7. **Known side lengths** labeled in the diagram must match the values stated in the problem text.

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

  const activeModifierCount = modifiers
    ? Object.values(modifiers).filter(Boolean).length
    : 0;

  const modifierAdjustment = activeModifierCount >= 2
    ? " IMPORTANT: Multiple modifiers are active — generate simpler BASE problems so the modifiers bring total difficulty to the target level. Do NOT make the base problem hard AND add modifiers on top."
    : activeModifierCount === 1
    ? " Note: A modifier is active — aim for the lower end of this difficulty range."
    : "";

  const difficultyGuide = {
    easy: `Focus on single-concept problems with 1-2 steps. Direct plug-and-solve. A student scoring 450-500 on the SAT should get these right. Like questions 1-8 on an SAT module.${modifierAdjustment}`,
    medium: `Problems should have 2-3 straightforward steps. Like questions 9-18 on an SAT module. A 550-600 scorer should get most right. These should feel like TYPICAL SAT problems — not competition math. Keep problems accessible.${modifierAdjustment}`,
    hard: `Multi-step reasoning (3-4 steps), may combine 2 concepts. Like questions 19-27 on an SAT module. A 700+ scorer should find these challenging but doable. Hard FOR THE SAT — not college-level or competition math.${modifierAdjustment}`,
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

  const activeModifierCount = modifiers
    ? Object.values(modifiers).filter(Boolean).length
    : 0;

  const modifierAdjustment = activeModifierCount >= 2
    ? " IMPORTANT: Multiple modifiers are active — generate simpler BASE problems so the modifiers bring total difficulty to the target level. Do NOT make the base problem hard AND add modifiers on top."
    : activeModifierCount === 1
    ? " Note: A modifier is active — aim for the lower end of this difficulty range."
    : "";

  const difficultyGuide = {
    easy: `Focus on single-concept problems with 1-2 steps. Direct plug-and-solve. Like questions 1-8 on an SAT module. A 450-500 scorer should get these right.${modifierAdjustment}`,
    medium: `Problems should have 2-3 straightforward steps. Like questions 9-18 on an SAT module. A 550-600 scorer should get most right. Keep problems accessible — typical SAT level, not competition math.${modifierAdjustment}`,
    hard: `Multi-step reasoning (3-4 steps), may combine 2 concepts. Like questions 19-27 on an SAT module. Hard FOR THE SAT — not college-level or competition math.${modifierAdjustment}`,
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
