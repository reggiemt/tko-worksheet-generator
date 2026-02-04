import { getSubcategoryById } from "./categories";
import type { Difficulty, ProblemModifiers } from "./types";

// Categories that need high visual density (60%+)
const HIGH_VISUAL_CATEGORIES = ["geometry"];
// Categories that benefit from moderate visuals (40%)
const MEDIUM_VISUAL_CATEGORIES = ["data"];

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

## Visual Elements — TikZ/pgfplots Figures

Generate TikZ and pgfplots figures directly as raw LaTeX code. When a problem benefits from a diagram, set hasVisual=true and provide the COMPLETE TikZ code in visualCode (as a JSON string with escaped backslashes).

The document preamble already includes: amsmath, amssymb, tikz, pgfplots (compat=1.18), and tikzlibraries calc, patterns, angles, quotes, positioning.

### General Figure Rules
1. **Scale for print**: Keep figures between 5–10 cm wide (US Letter with 1" margins).
2. **Labels must be readable**: Minimum font \\\\small. No overlapping labels.
3. **Consistent style**: thick for primary lines, dashed for construction/hidden lines.
4. **Colors**: blue for primary, red for secondary, black for labels. Avoid yellow/cyan/lime.
5. **Right angle markers**: Always draw the small square: \\\\draw (x-0.3,y) -- (x-0.3,y+0.3) -- (x,y+0.3);
6. **Point markers**: \\\\fill (point) circle (2pt); for solid, \\\\fill[white, draw=black, thick] (point) circle (3pt); for open circles.

### Coordinate Planes (pgfplots)
- Always set axis lines=middle, grid=both, grid style={gray!30}
- samples=100 for curves, samples=2 for lines
- Domain slightly inside axis range to avoid clipping
- Mark key points (intercepts, vertex) with filled circles

### Triangles
- Always include right angle marker on right triangles
- Use scale=0.5 to 0.9, label vertices with uppercase letters
- Side labels at midpoints using $(A)!0.5!(B)$ calc syntax

### Parallel Lines and Transversals
- Label parallel lines with lowercase letters
- Transversal extends beyond both lines
- Angle arcs at intersections with correct angular positions

### Circles
- Use angular positions measured counterclockwise from positive x-axis
- Mark central/inscribed angles with small arcs near vertex
- Highlight arcs with very thick style

### ARC AND ANGLE RULES (CRITICAL — USE pic SYNTAX)
**DO NOT manually calculate arc start/end angles.** You will get them wrong. Instead, use TikZ's built-in \\\\pic angle syntax which automatically computes the correct arc from point coordinates.

**PREFERRED METHOD — pic {angle=...}:**
The \\\\pic syntax takes three points: \\\\pic {angle=B--A--C} draws an arc at vertex A from ray AB to ray AC. TikZ calculates angles automatically.

\\\\pic[draw, angle radius=0.5cm] {angle=B--A--C};                    % plain arc
\\\\pic[draw, angle radius=0.5cm, "$65°$"] {angle=B--A--C};            % with label
\\\\pic[draw, angle radius=0.5cm, angle eccentricity=1.5, "$x$"] {angle=B--A--C};  % label further out

**Example — Triangle with angle labels:**
\\\\begin{tikzpicture}[scale=0.8]
    \\\\coordinate[label=above:$C$] (C) at (2,3);
    \\\\coordinate[label=below left:$A$] (A) at (0,0);
    \\\\coordinate[label=below right:$B$] (B) at (4,0);
    \\\\draw[thick] (A) -- (B) -- (C) -- cycle;
    \\\\pic[draw, angle radius=0.5cm, angle eccentricity=1.5, "$65°$"] {angle=B--A--C};
    \\\\pic[draw, angle radius=0.5cm, angle eccentricity=1.5, "$48°$"] {angle=C--B--A};
\\\\end{tikzpicture}

**Example — Parallel lines with angle labels:**
\\\\begin{tikzpicture}[scale=0.8]
    \\\\coordinate (P1) at (0,2);   \\\\coordinate (P2) at (5,2);
    \\\\coordinate (Q1) at (0,0);   \\\\coordinate (Q2) at (5,0);
    \\\\coordinate (T1) at (1.5,3.5);  \\\\coordinate (T2) at (3.5,-1.5);
    \\\\draw[thick] (P1) -- (P2) node[right] {$p$};
    \\\\draw[thick] (Q1) -- (Q2) node[right] {$q$};
    \\\\draw[thick] (T1) -- (T2);
    % Find intersections
    \\\\coordinate (I1) at (intersection of P1--P2 and T1--T2);
    \\\\coordinate (I2) at (intersection of Q1--Q2 and T1--T2);
    % Angle arcs using pic — TikZ computes angles automatically
    \\\\pic[draw, angle radius=0.5cm, angle eccentricity=1.5, "$a$"] {angle=P2--I1--T1};
    \\\\pic[draw, angle radius=0.5cm, angle eccentricity=1.5, "$b$"] {angle=T2--I2--Q2};
\\\\end{tikzpicture}

**Example — Right angle marker (still use draw for the square):**
\\\\draw (B) ++(0:0.3cm) -- ++(90:0.3cm) -- ++(180:0.3cm);

**ONLY use manual arc (draw...arc) for highlighted circle arcs** (major/minor arcs on circles), NOT for angle markers. For angle markers, ALWAYS use \\\\pic {angle=...}.

**WRONG** (manual arc — will have wrong angles):
\\\\draw (A) +(0:0.5) arc[start angle=0, end angle=65, radius=0.5];

**RIGHT** (pic — TikZ computes automatically):
\\\\pic[draw, angle radius=0.5cm, angle eccentricity=1.5, "$65°$"] {angle=B--A--C};

### 3D Solids (Cones, Cylinders, Prisms)
- Base ellipses: y_radius ≈ 0.25 × x_radius for perspective
- Hidden edges dashed, visible edges solid
- Height/radius as dashed construction lines

### Data Visualization
- Bar charts: ymin=0, symbolic x coords, bar width 12-18pt
- Scatterplots: only marks, regression lines dashed in red
- Tables: full grid with |c| borders and \\\\hline

## Output Format

You MUST output valid JSON in exactly this format:
{
  "problems": [
    {
      "number": 1,
      "content": "In the figure below, lines p and q are parallel and are cut by a transversal. If angle x measures 65 degrees, what is the measure of angle y?",
      "choices": {
        "A": "$25°$",
        "B": "$65°$",
        "C": "$115°$",
        "D": "$130°$"
      },
      "isGridIn": false,
      "hasVisual": true,
      "visualCode": "\\\\begin{tikzpicture}[scale=0.8]\\n\\\\coordinate (P1) at (0,2); \\\\coordinate (P2) at (6,2);\\n\\\\coordinate (Q1) at (0,0); \\\\coordinate (Q2) at (6,0);\\n\\\\coordinate (T1) at (1.5,3); \\\\coordinate (T2) at (4.5,-1);\\n\\\\draw[thick] (P1) -- (P2) node[right] {$p$};\\n\\\\draw[thick] (Q1) -- (Q2) node[right] {$q$};\\n\\\\draw[thick] (T1) -- (T2);\\n\\\\coordinate (I1) at (intersection of P1--P2 and T1--T2);\\n\\\\coordinate (I2) at (intersection of Q1--Q2 and T1--T2);\\n\\\\pic[draw, angle radius=0.5cm, angle eccentricity=1.5, \\\"$x°$\\\"] {angle=P2--I1--T1};\\n\\\\pic[draw, angle radius=0.5cm, angle eccentricity=1.5, \\\"$y°$\\\"] {angle=T2--I2--Q2};\\n\\\\end{tikzpicture}"
    },
    {
      "number": 2,
      "content": "A grid-in problem (student-produced response)",
      "choices": null,
      "isGridIn": true,
      "hasVisual": false,
      "visualCode": null
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
6. visualCode should be null (not an empty string) when hasVisual is false
7. When a problem benefits from a diagram, set hasVisual=true and provide the COMPLETE TikZ code in visualCode as a string. The code must be a valid TikZ environment (\\\\begin{tikzpicture}...\\\\end{tikzpicture}) or pgfplots environment. Escape all backslashes as \\\\\\\\ in the JSON string.
8. NEVER write "in the figure below" or "shown below" in problem text UNLESS you are also setting hasVisual=true AND providing valid TikZ code in visualCode. If you cannot provide a figure, rewrite the problem to be self-contained.
9. For angle markers, ALWAYS use \\\\pic {angle=B--A--C} syntax (TikZ computes angles automatically). NEVER use manual \\\\draw...arc for angle markers — you WILL get the angles wrong. Only use manual arc for highlighted circle arcs.`;

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

  // Topic-aware visual targets
  let visualInstruction: string;
  if (HIGH_VISUAL_CATEGORIES.includes(category)) {
    const visualCount = Math.round(questionCount * 0.65);
    visualInstruction = `3. Include visual elements (TikZ graphics) for AT LEAST ${visualCount} of the ${questionCount} problems. This is a geometry topic — MOST problems should have diagrams. Problems about parallel lines MUST show the lines and transversal. Problems about triangles MUST show the triangle with labeled sides/angles. Problems about circles MUST show the circle. Only pure computational problems (e.g., "what is the perimeter if sides are...") can skip figures.`;
  } else if (MEDIUM_VISUAL_CATEGORIES.includes(category)) {
    const visualCount = Math.round(questionCount * 0.4);
    visualInstruction = `3. Include visual elements (TikZ graphics) for approximately ${visualCount} problems. Use graphs, tables, scatterplots, or histograms where appropriate for data analysis.`;
  } else {
    const visualCount = Math.round(questionCount * 0.3);
    visualInstruction = `3. Include visual elements (TikZ graphics) for approximately ${visualCount} problems where appropriate (coordinate planes, function graphs, etc.)`;
  }

  return `Generate exactly ${questionCount} SAT Math problems for the topic: ${topicName}

Topic description: ${topicDescription}

Difficulty level: ${difficulty.toUpperCase()}
${difficultyGuide[difficulty]}${modifierSection}

Requirements:
1. Create exactly ${questionCount} problems numbered 1 through ${questionCount}
${gridInInstruction}
${visualInstruction}
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
4. Include visual elements (TikZ graphics) for approximately ${Math.round(questionCount * 0.4)} problems where appropriate. Geometry problems MUST have diagrams. Data problems should have graphs/tables where relevant.
5. Use the reverse construction method - start with clean answers
6. Verify each answer mathematically before including
7. Make distractors plausible but definitively wrong

Output valid JSON only. No markdown, no explanations - just the JSON object.`;
}
