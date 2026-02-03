import { z } from "zod";

export const problemModifiersSchema = z.object({
  includeFractions: z.boolean().default(false),
  includeUnknownConstants: z.boolean().default(false),
  noDesmos: z.boolean().default(false),
  wordProblemsOnly: z.boolean().default(false),
  gridInOnly: z.boolean().default(false),
}).optional();

export const topicSchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().min(1),
});

export const generateRequestSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionCount: z.union([z.literal(10), z.literal(15), z.literal(20)]),
  modifiers: problemModifiersSchema,
  topics: z.array(topicSchema).min(1).max(3).optional(),
});

export type GenerateRequestInput = z.infer<typeof generateRequestSchema>;

export const analyzeRequestSchema = z.object({
  image: z.string().min(1, "Image data is required"),
});

export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>;

// Max image size: 10MB in base64 (~13.3MB string)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_IMAGE_BASE64_LENGTH = Math.ceil(MAX_IMAGE_SIZE * 1.37);
