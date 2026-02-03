import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserPrompt, buildMultiTopicUserPrompt } from "./prompts";
import type { Difficulty, GeneratedWorksheet, Problem, Answer, ProblemModifiers } from "./types";

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

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  // Extract text content from response
  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  // Parse JSON response
  const parsed = parseClaudeResponse(content.text);

  return {
    problems: parsed.problems,
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
