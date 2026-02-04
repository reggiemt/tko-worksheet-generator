import { getRedisClient } from "./redis";

export interface LatexResource {
  path: string;
  file: string; // base64-encoded binary content
}

interface CompileOptions {
  compiler?: "pdflatex" | "xelatex" | "lualatex";
  additionalResources?: LatexResource[];
}

// Use our own LaTeX service if configured, otherwise fall back to ytotech
const LATEX_SERVICE_URL = process.env.LATEX_SERVICE_URL;
const LATEX_API_KEY = process.env.LATEX_API_KEY;

async function tryCompileOwn(
  latexContent: string,
  additionalResources?: LatexResource[]
): Promise<{ ok: boolean; buffer?: Buffer; error?: string }> {
  if (!LATEX_SERVICE_URL) return { ok: false, error: "LATEX_SERVICE_URL not configured" };

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (LATEX_API_KEY) headers["x-api-key"] = LATEX_API_KEY;

    const response = await fetch(`${LATEX_SERVICE_URL}/compile`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        content: latexContent,
        resources: additionalResources?.map((r) => ({ path: r.path, file: r.file })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return { ok: false, error: `${response.status}: ${(errorData as Record<string, string>).details || (errorData as Record<string, string>).error || "Compilation failed"}` };
    }

    const pdfBuffer = await response.arrayBuffer();
    return { ok: true, buffer: Buffer.from(pdfBuffer) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

async function tryCompileYtotech(
  latexContent: string,
  compiler: string,
  additionalResources?: LatexResource[]
): Promise<{ ok: boolean; buffer?: Buffer; error?: string }> {
  try {
    const resources: Record<string, unknown>[] = [
      { main: true, content: latexContent },
    ];

    if (additionalResources) {
      for (const res of additionalResources) {
        resources.push({ path: res.path, file: res.file });
      }
    }

    const response = await fetch("https://latex.ytotech.com/builds/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compiler, resources }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { ok: false, error: `${response.status}: ${errorText.substring(0, 500)}` };
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      return { ok: false, error: JSON.stringify(errorData).substring(0, 500) };
    }

    const pdfBuffer = await response.arrayBuffer();
    return { ok: true, buffer: Buffer.from(pdfBuffer) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

async function tryCompile(
  latexContent: string,
  compiler: string,
  additionalResources?: LatexResource[]
): Promise<{ ok: boolean; buffer?: Buffer; error?: string }> {
  // Prefer our own service if configured
  if (LATEX_SERVICE_URL) {
    return tryCompileOwn(latexContent, additionalResources);
  }
  // Fall back to ytotech
  return tryCompileYtotech(latexContent, compiler, additionalResources);
}

function stripTikz(latex: string): string {
  // Remove TikZ/pgfplots blocks that might cause compilation errors
  return latex
    .replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g, "\\textit{[Figure omitted]}")
    .replace(
      /\\begin\{center\}\s*\\textit\{\[Figure omitted\]\}\s*\\end\{center\}/g,
      "\\begin{center}\\textit{[Figure omitted]}\\end{center}"
    );
}

function sanitizeForRetry(latex: string): string {
  // Sanitize escaping issues but KEEP TikZ figures intact.
  // IMPORTANT: Only sanitize the document BODY, never the preamble.
  // Escaping % in the preamble turns LaTeX comments into visible text.
  let cleaned = latex; // NOTE: was stripTikz(latex) — removed to preserve figures

  // Split at \begin{document} to protect the preamble
  const docStart = cleaned.indexOf("\\begin{document}");
  if (docStart === -1) {
    // No \begin{document} found — just do basic cleanup
    return cleaned;
  }

  const preamble = cleaned.substring(0, docStart + "\\begin{document}".length);
  let body = cleaned.substring(docStart + "\\begin{document}".length);

  body = body
    // Fix double-escaped backslashes
    .replace(/\\\\\\\\/g, "\\\\")
    // Fix common fraction issues
    .replace(/\\frac\s+/g, "\\frac")
    // Remove any \n literals that should be newlines
    .replace(/(?<!\\)\\n/g, "\n")
    // Escape unescaped & and # in body text (but NOT % — those are comments!)
    .replace(/(?<!\\)&(?!\\)/g, "\\&")
    .replace(/(?<!\\)#(?!\d)/g, "\\#")
    // Fix unmatched braces — remove orphan opening/closing
    // Remove \textbf, \textit etc. if they have unmatched braces
    .replace(/\\text(?:bf|it|rm|sf|tt)\{([^}]*$)/gm, "$1")
    // Remove problematic Unicode characters that pdflatex can't handle
    .replace(/[^\x00-\x7F]/g, (char) => {
      const replacements: Record<string, string> = {
        "≥": "$\\geq$", "≤": "$\\leq$", "≠": "$\\neq$",
        "±": "$\\pm$", "×": "$\\times$", "÷": "$\\div$",
        "°": "$^\\circ$", "√": "$\\sqrt{}$", "π": "$\\pi$",
        "∞": "$\\infty$", "→": "$\\to$", "←": "$\\leftarrow$",
        "′": "'", "″": "''", "−": "-", "–": "--", "—": "---",
        "\u2018": "'", "\u2019": "'", "\u201C": "``", "\u201D": "''",
      };
      return replacements[char] || "";
    });

  return preamble + body;
}

export interface CompileLog {
  attempt: number;
  strategy: string;
  success: boolean;
  error?: string;
}

export async function compileLaTeX(
  latexContent: string,
  options: CompileOptions = {}
): Promise<Buffer> {
  const compiler = options.compiler || "pdflatex";
  const additionalResources = options.additionalResources;
  const logs: CompileLog[] = [];

  const attempts: { name: string; transform: (latex: string) => string }[] = [
    { name: "full document", transform: (l) => l },
    { name: "full document (retry)", transform: (l) => l }, // Retry same content for transient 500s
    { name: "sanitized (keep TikZ)", transform: sanitizeForRetry }, // Fix escaping issues but KEEP figures
    // NOTE: TikZ-stripping fallbacks removed — we want to see real errors
    // instead of silently losing all figures. Re-enable once TikZ compilation is stable.
    // { name: "stripped TikZ", transform: stripTikz },
    // { name: "aggressive sanitization", transform: sanitizeForRetry },
    // { name: "nuclear sanitization", ... },
  ];

  for (let i = 0; i < attempts.length; i++) {
    const { name, transform } = attempts[i];
    
    // Small delay before retries to help with transient server errors
    if (i > 0) {
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
    
    console.log(`LaTeX compile: attempt ${i + 1} (${name})`);
    const transformed = transform(latexContent);
    const result = await tryCompile(transformed, compiler, additionalResources);
    
    logs.push({
      attempt: i + 1,
      strategy: name,
      success: result.ok,
      error: result.error,
    });

    if (result.ok && result.buffer) {
      if (i > 0) console.log(`LaTeX compile: succeeded on attempt ${i + 1} (${name})`);
      // Log to Redis for analysis (fire and forget)
      logCompileResult(logs).catch(() => {});
      return result.buffer;
    }
    console.warn(`LaTeX compile attempt ${i + 1} failed:`, result.error);
  }

  // All attempts failed — log for analysis
  await logCompileResult(logs).catch(() => {});

  throw new Error(
    `LaTeX compilation failed after ${attempts.length} attempts. Errors: ${logs.map((l) => `[${l.strategy}] ${l.error?.substring(0, 200)}`).join(" | ")}`
  );
}

async function logCompileResult(logs: CompileLog[]): Promise<void> {
  try {
    const redis = getRedisClient();
    if (!redis) return;
    
    const entry = {
      timestamp: new Date().toISOString(),
      attempts: logs,
      finalSuccess: logs.some((l) => l.success),
      succeededOn: logs.find((l) => l.success)?.strategy || null,
    };
    
    // Store in a Redis list, keep last 100 entries
    const key = "worksheet:latex-compile-log";
    await redis.lpush(key, JSON.stringify(entry));
    await redis.ltrim(key, 0, 99);
  } catch {
    // Never fail the main flow for logging
  }
}
