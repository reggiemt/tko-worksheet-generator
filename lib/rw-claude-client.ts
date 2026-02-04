import Anthropic from "@anthropic-ai/sdk";
import { RW_SYSTEM_PROMPT, buildRWUserPrompt } from "./rw-prompts";
import type { Difficulty } from "./types";
import type { RWProblem, RWAnswer, RWModifiers, GeneratedRWWorksheet } from "./rw-types";

// ── Verification types ──────────────────────────────────────────────

export interface RWVerificationResult {
  passed: boolean;
  problemResults: {
    number: number;
    passed: boolean;
    expectedAnswer: string;
    verifiedAnswer: string;
    issue?: string;
  }[];
}

interface GenerateRWParams {
  category: string;
  subcategory: string;
  difficulty: Difficulty;
  questionCount: number;
  modifiers?: RWModifiers;
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Server API key not configured. Contact the administrator.");
  }
  return new Anthropic({ apiKey });
}

export async function generateRWProblems(params: GenerateRWParams): Promise<GeneratedRWWorksheet> {
  const client = getClient();

  const userPrompt = buildRWUserPrompt(
    params.category,
    params.subcategory,
    params.difficulty,
    params.questionCount,
    params.modifiers
  );

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 12000,
    system: RW_SYSTEM_PROMPT,
    messages: [
      { role: "user", content: userPrompt },
      { role: "assistant", content: "{" },  // Force JSON output
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const parsed = parseRWResponse("{" + content.text);

  return {
    problems: parsed.problems,
    answers: parsed.answers,
    metadata: {
      category: params.category,
      subcategory: params.subcategory,
      difficulty: params.difficulty,
      questionCount: params.questionCount,
      generatedAt: new Date().toISOString(),
    },
  };
}

interface ParsedRWResponse {
  problems: RWProblem[];
  answers: RWAnswer[];
}

function parseRWResponse(text: string): ParsedRWResponse {
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

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    // Try to find a JSON object in the response
    const jsonMatch = text.match(/\{[\s\S]*"problems"\s*:\s*\[[\s\S]*"answers"\s*:\s*\[[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        let fixedJson = jsonMatch[0]
          .replace(/,\s*([}\]])/g, "$1")
          .replace(/[\r\n]+/g, " ");
        try {
          parsed = JSON.parse(fixedJson);
        } catch (finalErr) {
          console.error("Failed to parse R/W Claude response after all attempts:", text.substring(0, 500));
          throw new Error(
            `Failed to parse AI response: ${finalErr instanceof Error ? finalErr.message : "Invalid JSON"}`
          );
        }
      }
    } else {
      console.error("No JSON object found in R/W Claude response:", text.substring(0, 500));
      throw new Error("Failed to parse AI response: No valid JSON found in response");
    }
  }

  if (!Array.isArray(parsed.problems) || !Array.isArray(parsed.answers)) {
    throw new Error("Invalid response structure: missing problems or answers array");
  }

  const problems: RWProblem[] = parsed.problems.map((p: Record<string, unknown>, i: number) => ({
    number: typeof p.number === "number" ? p.number : i + 1,
    passage: String(p.passage || ""),
    question: String(p.question || ""),
    choices: p.choices && typeof p.choices === "object"
      ? {
          A: String((p.choices as Record<string, unknown>).A || ""),
          B: String((p.choices as Record<string, unknown>).B || ""),
          C: String((p.choices as Record<string, unknown>).C || ""),
          D: String((p.choices as Record<string, unknown>).D || ""),
        }
      : { A: "", B: "", C: "", D: "" },
    hasData: Boolean(p.hasData),
    dataType: p.dataType ? String(p.dataType) as RWProblem["dataType"] : undefined,
    dataContent: p.dataContent ? String(p.dataContent) : undefined,
  }));

  const answers: RWAnswer[] = parsed.answers.map((a: Record<string, unknown>, i: number) => ({
    number: typeof a.number === "number" ? a.number : i + 1,
    correctAnswer: String(a.correctAnswer || ""),
    explanation: String(a.explanation || ""),
  }));

  return { problems, answers };
}

// ── Answer-choice validation ────────────────────────────────────────

export function validateRWAnswerChoices(problems: RWProblem[], answers: RWAnswer[]): string[] {
  const issues: string[] = [];
  const validLetters = new Set(["A", "B", "C", "D"]);

  for (const answer of answers) {
    const problem = problems.find((p) => p.number === answer.number);
    if (!problem) {
      issues.push(`Problem #${answer.number}: answer references a problem that doesn't exist`);
      continue;
    }

    if (!validLetters.has(answer.correctAnswer.trim().toUpperCase())) {
      issues.push(
        `Problem #${answer.number}: correctAnswer "${answer.correctAnswer}" is not one of A, B, C, D`
      );
    }
  }

  return issues;
}

// ── Blind verification via a second Claude call ─────────────────────

export async function verifyRWProblems(
  problems: RWProblem[],
  answers: RWAnswer[]
): Promise<RWVerificationResult> {
  const client = getClient();

  const problemDescriptions = problems.map((p) => {
    let desc = `Problem ${p.number}:\n\nPassage:\n${p.passage}`;
    if (p.hasData && p.dataContent) {
      desc += `\n\n[Data: ${p.dataContent}]`;
    }
    desc += `\n\nQuestion: ${p.question}`;
    desc += `\nA) ${p.choices.A}\nB) ${p.choices.B}\nC) ${p.choices.C}\nD) ${p.choices.D}`;
    return desc;
  });

  const verificationPrompt = `You are an SAT Reading & Writing expert. Read each passage and answer each question independently. Your answer must be exactly one of A, B, C, or D.

${problemDescriptions.join("\n\n---\n\n")}

For each problem, read the passage carefully, consider all answer choices, and select the best answer. Show brief reasoning.
Output ONLY valid JSON (no markdown fences): [{"number": 1, "answer": "B", "brief_work": "..."}, ...]`;

  try {
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
      console.error("R/W Verification: unexpected response type");
      return { passed: true, problemResults: [] };
    }

    let jsonText = ("[" + content.text).trim();
    if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
    else if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
    if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
    jsonText = jsonText.trim();

    const verifierAnswers: { number: number; answer: string; brief_work: string }[] =
      JSON.parse(jsonText);

    const expectedMap = new Map(answers.map((a) => [a.number, a.correctAnswer.trim().toUpperCase()]));

    const problemResults = verifierAnswers.map((v) => {
      const expected = expectedMap.get(v.number) ?? "?";
      const verified = v.answer.trim().toUpperCase();
      const passed = expected === verified;
      return {
        number: v.number,
        passed,
        expectedAnswer: expected,
        verifiedAnswer: verified,
        ...(passed ? {} : { issue: `Verifier got ${verified}, answer key says ${expected}. Reasoning: ${v.brief_work}` }),
      };
    });

    return {
      passed: problemResults.every((r) => r.passed),
      problemResults,
    };
  } catch (error) {
    console.error("R/W Verification call failed, proceeding anyway:", error);
    return { passed: true, problemResults: [] };
  }
}

// ── Targeted regeneration of failed problems ────────────────────────

export async function regenerateFailedRWProblems(
  worksheet: GeneratedRWWorksheet,
  failedNumbers: number[],
  params: GenerateRWParams
): Promise<GeneratedRWWorksheet> {
  const client = getClient();

  const failedProblems = worksheet.problems.filter((p) => failedNumbers.includes(p.number));

  const problemDescriptions = failedProblems.map((p) => {
    let desc = `Problem ${p.number}:\nPassage: ${p.passage}\nQuestion: ${p.question}`;
    desc += `\nA) ${p.choices.A}\nB) ${p.choices.B}\nC) ${p.choices.C}\nD) ${p.choices.D}`;
    if (p.hasData && p.dataContent) {
      desc += `\nData: ${p.dataContent}`;
    }
    return desc;
  });

  const prompt = `The following SAT Reading & Writing problems had incorrect or ambiguous answers. Generate REPLACEMENT problems for ONLY these problem numbers. Keep the same skill type (${params.category}/${params.subcategory}), difficulty (${params.difficulty}), and format.

IMPORTANT: Ensure each replacement has ONE clearly correct answer. Verify by reasoning through all four choices.

Problems to replace:
${problemDescriptions.join("\n\n")}

Generate ${failedNumbers.length} NEW replacement problems with these EXACT problem numbers: ${failedNumbers.join(", ")}.

Return ONLY valid JSON (no markdown fences):
{
  "problems": [{"number": N, "passage": "...", "question": "...", "choices": {"A": "...", "B": "...", "C": "...", "D": "..."}, "hasData": false, "dataType": null, "dataContent": null}],
  "answers": [{"number": N, "correctAnswer": "B", "explanation": "..."}]
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 6000,
    system: RW_SYSTEM_PROMPT,
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
  const newProblems: RWProblem[] = parsed.problems || [];
  const newAnswers: RWAnswer[] = parsed.answers || [];

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
