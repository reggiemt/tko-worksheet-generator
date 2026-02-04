import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserPrompt, buildMultiTopicUserPrompt } from "./prompts";
import type { Difficulty, GeneratedWorksheet, Problem, Answer, ProblemModifiers } from "./types";
import { testCompileTikZ } from "./latex-client";

// ── Verification types ──────────────────────────────────────────────

export interface VerificationResult {
  passed: boolean;
  problemResults: {
    number: number;
    passed: boolean;
    expectedAnswer: string;
    verifiedAnswer: string;
    issue?: string;
  }[];
}

interface TopicPair {
  category: string;
  subcategory: string;
}

interface GenerateParams {
  category: string;
  subcategory: string;
  difficulty: Difficulty;
  questionCount: number;
  modifiers?: ProblemModifiers;
  topics?: TopicPair[];
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Server API key not configured. Contact the administrator.");
  }
  return new Anthropic({ apiKey });
}

export async function generateProblems(params: GenerateParams): Promise<GeneratedWorksheet> {
  const client = getClient();

  const userPrompt = params.topics && params.topics.length > 1
    ? buildMultiTopicUserPrompt(
        params.topics,
        params.difficulty,
        params.questionCount,
        params.modifiers
      )
    : buildUserPrompt(
        params.category,
        params.subcategory,
        params.difficulty,
        params.questionCount,
        params.modifiers
      );

  // Scale max_tokens based on question count + modifiers to prevent truncation
  const activeModifierCount = params.modifiers
    ? Object.values(params.modifiers).filter(Boolean).length
    : 0;
  const activeModifiers = params.modifiers
    ? Object.entries(params.modifiers).filter(([, v]) => v).map(([k]) => k)
    : [];
  const baseTokens = Math.max(8000, params.questionCount * 800);
  const maxTokens = Math.min(16000, baseTokens + activeModifierCount * 1000);
  const isMultiTopic = params.topics && params.topics.length > 1;

  const requestMeta = {
    category: isMultiTopic ? "mixed" : params.category,
    subcategory: isMultiTopic ? params.topics!.map(t => `${t.category}.${t.subcategory}`).join(", ") : params.subcategory,
    difficulty: params.difficulty,
    questionCount: params.questionCount,
    modifiers: activeModifiers,
    maxTokens,
    isMultiTopic,
  };
  console.log(`[GENERATE] Request: ${JSON.stringify(requestMeta)}`);

  const startTime = Date.now();
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: userPrompt },
      { role: "assistant", content: "{" },  // Force JSON output — prevents preamble text
    ],
  });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  const inputTokens = response.usage?.input_tokens ?? 0;
  const outputTokens = response.usage?.output_tokens ?? 0;

  // Check if response was truncated
  if (response.stop_reason === "max_tokens") {
    console.error(`[GENERATE] TRUNCATED after ${elapsed}s | tokens: ${inputTokens}in/${outputTokens}out (max: ${maxTokens}) | ${JSON.stringify(requestMeta)}`);
    throw new Error("Failed to parse AI response: output truncated (max_tokens reached)");
  }

  // Extract text content from response
  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  // Prepend the "{" we used as prefill — Claude continues from there
  const fullJson = "{" + content.text;

  console.log(`[GENERATE] OK in ${elapsed}s | stop=${response.stop_reason} | tokens: ${inputTokens}in/${outputTokens}out | chars: ${fullJson.length} | ${params.questionCount}q ${params.difficulty} ${activeModifiers.length}mod`);

  // Parse JSON response
  const parsed = parseClaudeResponse(fullJson);

  // Diagnostic: log visual stats
  const visualProblems = parsed.problems.filter(p => p.hasVisual);
  const withCode = visualProblems.filter(p => p.visualCode);
  console.log(`[GENERATE] Visuals: ${visualProblems.length}/${parsed.problems.length} problems have hasVisual=true, ${withCode.length} have visualCode set`);
  for (const p of visualProblems) {
    const codePreview = p.visualCode ? p.visualCode.substring(0, 80) : "(null)";
    console.log(`[GENERATE]   Problem #${p.number}: visualCode = ${codePreview}...`);
  }

  // Validate and fix TikZ figures
  const fixedProblems = await validateAndFixFigures(client, parsed.problems);

  return {
    problems: fixedProblems,
    answers: parsed.answers,
    metadata: {
      category: params.topics && params.topics.length > 1 ? "mixed" : params.category,
      subcategory: params.topics && params.topics.length > 1 ? "mixed" : params.subcategory,
      difficulty: params.difficulty,
      questionCount: params.questionCount,
      generatedAt: new Date().toISOString(),
    },
  };
}

// ── TikZ Figure Validation & Auto-Fix Pipeline ─────────────────────

/**
 * For each problem with hasVisual:
 * - If visualCode is missing → strip "figure below" references from text
 * - If visualCode exists → test-compile it; if it fails, ask Claude to fix it
 * - If fix fails too → strip figure references as graceful fallback
 */
async function validateAndFixFigures(
  client: Anthropic,
  problems: Problem[]
): Promise<Problem[]> {
  const results: Problem[] = [];
  let tested = 0;
  let passed = 0;
  let fixed = 0;
  let stripped = 0;

  for (const problem of problems) {
    // Case 1: hasVisual but no visualCode
    if (problem.hasVisual && !problem.visualCode) {
      console.warn(`[FIGURES] Problem #${problem.number}: hasVisual=true but no visualCode — stripping references`);
      stripped++;
      results.push({
        ...problem,
        hasVisual: false,
        content: stripFigureReferences(problem.content),
      });
      continue;
    }

    // Case 2: has visualCode — test compile it
    if (problem.hasVisual && problem.visualCode) {
      tested++;
      const compileResult = await testCompileTikZ(problem.visualCode);

      if (compileResult.success) {
        passed++;
        console.log(`[FIGURES] Problem #${problem.number}: TikZ OK ✓`);
        results.push(problem);
      } else {
        console.warn(`[FIGURES] Problem #${problem.number}: TikZ FAILED ✗ — ${compileResult.error?.substring(0, 200)}`);

        // Try to fix via Claude
        const fixedCode = await fixTikZCode(
          client,
          problem.visualCode,
          compileResult.error || "Compilation failed",
          problem.content
        );

        if (fixedCode) {
          const fixResult = await testCompileTikZ(fixedCode);
          if (fixResult.success) {
            fixed++;
            console.log(`[FIGURES] Problem #${problem.number}: TikZ FIXED ✓`);
            results.push({ ...problem, visualCode: fixedCode });
          } else {
            stripped++;
            console.warn(`[FIGURES] Problem #${problem.number}: fix also failed — stripping figure`);
            results.push({
              ...problem,
              hasVisual: false,
              visualCode: undefined,
              content: stripFigureReferences(problem.content),
            });
          }
        } else {
          stripped++;
          results.push({
            ...problem,
            hasVisual: false,
            visualCode: undefined,
            content: stripFigureReferences(problem.content),
          });
        }
      }
      continue;
    }

    // Case 3: no visual — pass through
    results.push(problem);
  }

  console.log(`[FIGURES] Summary: ${tested} tested, ${passed} passed, ${fixed} fixed, ${stripped} stripped`);
  return results;
}

/**
 * Ask Claude to fix broken TikZ code given the compilation error.
 */
async function fixTikZCode(
  client: Anthropic,
  brokenCode: string,
  error: string,
  problemContext: string
): Promise<string | null> {
  try {
    console.log(`[TIKZ-FIX] Attempting auto-fix...`);

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system:
        "You are a LaTeX/TikZ expert. Fix the broken TikZ code based on the compilation error. Output ONLY the fixed TikZ code starting with \\begin{tikzpicture} and ending with \\end{tikzpicture}. No explanations, no markdown code blocks, no commentary.",
      messages: [
        {
          role: "user",
          content: `Fix this TikZ code that failed to compile.

Problem context: ${problemContext.substring(0, 200)}

Broken code:
${brokenCode}

Error:
${error.substring(0, 500)}

Output ONLY the fixed code:`,
        },
        {
          role: "assistant",
          content: "\\begin{tikzpicture}",
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") return null;

    const fixedCode = "\\begin{tikzpicture}" + content.text;

    if (!fixedCode.includes("\\end{tikzpicture}")) return null;

    // Trim anything after the closing tag
    const endIdx = fixedCode.lastIndexOf("\\end{tikzpicture}");
    return fixedCode.substring(0, endIdx + "\\end{tikzpicture}".length);
  } catch (err) {
    console.error(`[TIKZ-FIX] Failed: ${err}`);
    return null;
  }
}

/**
 * Strip "In the figure below" and similar references when no figure exists.
 */
function stripFigureReferences(text: string): string {
  return text
    .replace(/[Ii]n the figure below,?\s*/g, "")
    .replace(/[Aa]s shown in the figure(?: below)?,?\s*/g, "")
    .replace(/[Tt]he figure (?:below )?shows\s*/g, "")
    .replace(/[Rr]efer(?:ring)? to the figure(?: below)?,?\s*/g, "")
    .replace(/[Uu]sing the figure below,?\s*/g, "")
    .replace(/[Ss]hown below,?\s*/g, "")
    .replace(/^\s+/, "");
}

export interface AnalyzeImageResult {
  category: string;
  subcategory: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
}

export async function analyzeScreenshot(imageBase64: string, mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"): Promise<AnalyzeImageResult> {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `You are an SAT math expert. Analyze screenshots of SAT math problems and identify what topic they cover.

You must categorize problems into these exact categories and subcategories:

ALGEBRA:
- linear_one_var: Linear Equations (One Variable)
- linear_two_var: Linear Equations (Two Variables)
- systems: Systems of Equations
- inequalities: Inequalities
- absolute_value: Absolute Value

ADVANCED:
- quadratics: Quadratics
- polynomials: Polynomials
- rational: Rational Expressions
- radicals_exponents: Radicals & Exponents
- exponential: Exponential Functions
- functions: Functions

DATA:
- ratios_rates: Ratios & Rates
- percentages: Percentages
- units: Units & Conversions
- interpretation: Data Interpretation
- statistics: Statistics
- probability: Probability

GEOMETRY:
- area_perimeter: Area & Perimeter
- volume_surface: Volume & Surface Area
- lines_angles_triangles: Lines, Angles & Triangles
- right_triangle_trig: Right Triangle Trig
- circles: Circles
- coordinate: Coordinate Geometry

Return ONLY valid JSON with these exact fields:
{
  "category": "one of: algebra, advanced, data, geometry",
  "subcategory": "the subcategory id from the list above",
  "difficulty": "one of: easy, medium, hard",
  "description": "Brief description of what the problem(s) cover"
}`,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "Analyze this SAT math problem screenshot. Identify the category, subcategory, difficulty level, and provide a brief description. Return JSON only.",
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  let jsonText = content.text.trim();
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.slice(7);
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith("```")) {
    jsonText = jsonText.slice(0, -3);
  }
  jsonText = jsonText.trim();

  try {
    const parsed = JSON.parse(jsonText);
    return {
      category: String(parsed.category || "algebra"),
      subcategory: String(parsed.subcategory || "linear_one_var"),
      difficulty: ["easy", "medium", "hard"].includes(parsed.difficulty) ? parsed.difficulty : "medium",
      description: String(parsed.description || "SAT math problem"),
    };
  } catch {
    throw new Error("Failed to parse analysis response");
  }
}

interface ParsedResponse {
  problems: Problem[];
  answers: Answer[];
}

function parseClaudeResponse(text: string): ParsedResponse {
  let jsonText = text.trim();

  // Strip markdown fences
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.slice(7);
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith("```")) {
    jsonText = jsonText.slice(0, -3);
  }
  jsonText = jsonText.trim();

  // If direct parse fails, try to extract JSON object from the text
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    // Try to find a JSON object in the response (Claude sometimes adds explanation text)
    const jsonMatch = text.match(/\{[\s\S]*"problems"\s*:\s*\[[\s\S]*"answers"\s*:\s*\[[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        // Try fixing common JSON issues: trailing commas, unescaped newlines in strings
        let fixedJson = jsonMatch[0]
          .replace(/,\s*([}\]])/g, "$1")  // trailing commas
          .replace(/[\r\n]+/g, " ");       // newlines in strings
        try {
          parsed = JSON.parse(fixedJson);
        } catch (finalErr) {
          console.error("Failed to parse Claude response after all attempts:", text.substring(0, 500));
          throw new Error(
            `Failed to parse AI response: ${finalErr instanceof Error ? finalErr.message : "Invalid JSON"}`
          );
        }
      }
    } else {
      console.error("No JSON object found in Claude response:", text.substring(0, 500));
      throw new Error("Failed to parse AI response: No valid JSON found in response");
    }
  }

  try {

    if (!Array.isArray(parsed.problems) || !Array.isArray(parsed.answers)) {
      throw new Error("Invalid response structure: missing problems or answers array");
    }

    const problems: Problem[] = parsed.problems.map((p: Record<string, unknown>, i: number) => ({
      number: typeof p.number === "number" ? p.number : i + 1,
      content: String(p.content || ""),
      choices: p.choices && typeof p.choices === "object" ? {
        A: String((p.choices as Record<string, unknown>).A || ""),
        B: String((p.choices as Record<string, unknown>).B || ""),
        C: String((p.choices as Record<string, unknown>).C || ""),
        D: String((p.choices as Record<string, unknown>).D || ""),
      } : undefined,
      isGridIn: Boolean(p.isGridIn),
      hasVisual: Boolean(p.hasVisual),
      visualCode: p.visualCode ? String(p.visualCode) : undefined,
    }));

    const answers: Answer[] = parsed.answers.map((a: Record<string, unknown>, i: number) => ({
      number: typeof a.number === "number" ? a.number : i + 1,
      correctAnswer: String(a.correctAnswer || ""),
      solution: String(a.solution || ""),
    }));

    return { problems, answers };
  } catch (error) {
    console.error("Failed to parse Claude response:", text.substring(0, 500));
    throw new Error(
      `Failed to parse AI response: ${error instanceof Error ? error.message : "Invalid JSON"}`
    );
  }
}

// ── Answer-choice validation (synchronous, no API call) ─────────────

/**
 * For every non-grid-in problem, verify that correctAnswer is one of A/B/C/D.
 * Returns a list of human-readable issues (empty = all good).
 */
export function validateAnswerChoices(problems: Problem[], answers: Answer[]): string[] {
  const issues: string[] = [];
  const validLetters = new Set(["A", "B", "C", "D"]);

  for (const answer of answers) {
    const problem = problems.find((p) => p.number === answer.number);
    if (!problem) {
      issues.push(`Problem #${answer.number}: answer references a problem that doesn't exist`);
      continue;
    }
    if (problem.isGridIn) continue; // grid-in answers are numeric, not A-D

    if (!validLetters.has(answer.correctAnswer.trim().toUpperCase())) {
      issues.push(
        `Problem #${answer.number}: correctAnswer "${answer.correctAnswer}" is not one of A, B, C, D`
      );
    }
  }

  return issues;
}

// ── Blind verification via a second Claude call ─────────────────────

/**
 * Send every generated problem (without the answer key) to Claude and ask it
 * to solve each one from scratch.  Compare its answers to the key.
 */
export async function verifyProblems(
  problems: Problem[],
  answers: Answer[]
): Promise<VerificationResult> {
  const client = getClient();

  // Build a text representation of each problem for the verifier
  const problemDescriptions = problems.map((p) => {
    let desc = `Problem ${p.number}:\n${p.content}`;
    if (p.hasVisual) {
      desc += "\n[This problem includes a diagram — work from the mathematical content only.]";
    }
    if (p.choices) {
      desc += `\nA) ${p.choices.A}\nB) ${p.choices.B}\nC) ${p.choices.C}\nD) ${p.choices.D}`;
    }
    if (p.isGridIn) {
      desc += "\n(Grid-in: provide a numerical answer)";
    }
    return desc;
  });

  const verificationPrompt = `You are an SAT math expert. Solve each problem independently. Do NOT guess — show brief work.

For multiple-choice problems, your answer must be exactly one of A, B, C, or D.
For grid-in problems, give the numerical answer.

${problemDescriptions.join("\n\n---\n\n")}

Solve each problem independently. For each, give your answer and brief work.
Output ONLY valid JSON (no markdown fences): [{"number": 1, "answer": "B", "brief_work": "..."}, ...]`;

  try {
    // Use Haiku for verification — faster and cheaper, still accurate for checking math
    const response = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4000,
      messages: [
        { role: "user", content: verificationPrompt },
        { role: "assistant", content: "[" },  // Force JSON array output
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      console.error("Verification: unexpected response type");
      return { passed: true, problemResults: [] }; // fail-open
    }

    let jsonText = ("[" + content.text).trim();
    // Strip markdown fences just in case
    if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
    else if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
    if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
    jsonText = jsonText.trim();

    const verifierAnswers: { number: number; answer: string; brief_work: string }[] =
      JSON.parse(jsonText);

    // Build a quick lookup for expected answers
    const expectedMap = new Map(answers.map((a) => [a.number, a.correctAnswer.trim().toUpperCase()]));

    const problemResults = verifierAnswers.map((v) => {
      const expected = expectedMap.get(v.number) ?? "?";
      const verified = v.answer.trim().toUpperCase();
      const passed = normalizeAnswer(expected) === normalizeAnswer(verified);
      return {
        number: v.number,
        passed,
        expectedAnswer: expected,
        verifiedAnswer: verified,
        ...(passed ? {} : { issue: `Verifier got ${verified}, answer key says ${expected}. Work: ${v.brief_work}` }),
      };
    });

    return {
      passed: problemResults.every((r) => r.passed),
      problemResults,
    };
  } catch (error) {
    // If verification itself fails, fail-open so we still deliver a worksheet
    console.error("Verification call failed, proceeding anyway:", error);
    return { passed: true, problemResults: [] };
  }
}

// ── Targeted regeneration of failed problems ────────────────────────

/**
 * Regenerate only the specific problems that failed verification,
 * instead of regenerating the entire worksheet.
 */
export async function regenerateFailedProblems(
  worksheet: GeneratedWorksheet,
  failedNumbers: number[],
  params: GenerateParams
): Promise<GeneratedWorksheet> {
  const client = getClient();

  const failedProblems = worksheet.problems.filter((p) => failedNumbers.includes(p.number));

  const problemDescriptions = failedProblems.map((p) => {
    let desc = `Problem ${p.number}: ${p.content}`;
    if (p.choices) {
      desc += `\nA) ${p.choices.A}\nB) ${p.choices.B}\nC) ${p.choices.C}\nD) ${p.choices.D}`;
    }
    if (p.isGridIn) desc += "\n(Grid-in)";
    return desc;
  });

  const modifierInstructions: string[] = [];
  if (params.modifiers?.includeFractions) modifierInstructions.push("Include fractional values");
  if (params.modifiers?.includeUnknownConstants) modifierInstructions.push("Include unknown constants (k, a, c)");
  if (params.modifiers?.noDesmos) modifierInstructions.push("Problems must be solvable without a graphing calculator");
  if (params.modifiers?.wordProblemsOnly) modifierInstructions.push("All problems must be word problems");
  if (params.modifiers?.gridInOnly) modifierInstructions.push("All problems must be grid-in (no multiple choice)");

  const prompt = `The following SAT math problems had incorrect answers. Generate REPLACEMENT problems for ONLY these problem numbers. Keep the same topic (${params.category}/${params.subcategory}), difficulty (${params.difficulty}), and format.

IMPORTANT: Use the Reverse Construction Method — start with a clean answer, then build the problem backward. Verify each answer by solving forward.

${modifierInstructions.length > 0 ? `Modifiers: ${modifierInstructions.join(". ")}.\n` : ""}
Problems to replace:
${problemDescriptions.join("\n\n")}

Generate ${failedNumbers.length} NEW replacement problems with these EXACT problem numbers: ${failedNumbers.join(", ")}.

Return ONLY valid JSON (no markdown fences):
{
  "problems": [{"number": N, "content": "...", "choices": {"A": "...", "B": "...", "C": "...", "D": "..."}, "isGridIn": false, "hasVisual": false}],
  "answers": [{"number": N, "correctAnswer": "B", "solution": "Step-by-step..."}]
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: prompt },
      { role: "assistant", content: "{" },  // Force JSON output
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  let jsonText = ("{" + content.text).trim();
  if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
  else if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
  if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
  jsonText = jsonText.trim();

  const parsed = JSON.parse(jsonText);
  const newProblems: Problem[] = parsed.problems || [];
  const newAnswers: Answer[] = parsed.answers || [];

  // Merge: replace failed problems/answers with new ones
  const replacedProblems = worksheet.problems.map((p) => {
    const replacement = newProblems.find((np) => np.number === p.number);
    return replacement || p;
  });
  const replacedAnswers = worksheet.answers.map((a) => {
    const replacement = newAnswers.find((na) => na.number === a.number);
    return replacement || a;
  });

  return {
    ...worksheet,
    problems: replacedProblems,
    answers: replacedAnswers,
  };
}

/** Normalise an answer for comparison (handles numeric grid-in variations). */
function normalizeAnswer(ans: string): string {
  const s = ans.trim().toUpperCase();
  // If it's a letter answer, return as-is
  if (/^[A-D]$/.test(s)) return s;
  // For numeric answers, parse to number and back to handle "3/2" vs "1.5" etc.
  try {
    if (s.includes("/")) {
      const [num, den] = s.split("/").map(Number);
      if (!isNaN(num) && !isNaN(den) && den !== 0) return String(num / den);
    }
    const n = parseFloat(s);
    if (!isNaN(n)) return String(n);
  } catch {
    // fall through
  }
  return s;
}
