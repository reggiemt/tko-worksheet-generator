export interface LatexResource {
  path: string;
  file: string; // base64-encoded binary content
}

interface CompileOptions {
  compiler?: "pdflatex" | "xelatex" | "lualatex";
  additionalResources?: LatexResource[];
}

async function tryCompile(
  latexContent: string,
  compiler: string,
  additionalResources?: LatexResource[]
): Promise<{ ok: boolean; buffer?: Buffer; error?: string }> {
  try {
    const resources: Record<string, unknown>[] = [
      {
        main: true,
        content: latexContent,
      },
    ];

    // Add any additional resource files (e.g., custom logo images)
    if (additionalResources) {
      for (const res of additionalResources) {
        resources.push({
          path: res.path,
          file: res.file,
        });
      }
    }

    const response = await fetch("https://latex.ytotech.com/builds/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        compiler,
        resources,
      }),
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
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
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
  // More aggressive sanitization for retry attempts
  let cleaned = stripTikz(latex);

  // Remove any bare backslashes that aren't commands
  // Fix common AI-generated LaTeX errors
  cleaned = cleaned
    // Fix double-escaped backslashes
    .replace(/\\\\\\\\/g, "\\\\")
    // Remove undefined commands that might sneak in
    .replace(/\\text\{([^}]*)\}/g, (_, content) => content)
    // Fix common fraction issues
    .replace(/\\frac\s+/g, "\\frac")
    // Remove any \n literals that should be newlines
    .replace(/(?<!\\)\\n/g, "\n");

  return cleaned;
}

export async function compileLaTeX(
  latexContent: string,
  options: CompileOptions = {}
): Promise<Buffer> {
  const compiler = options.compiler || "pdflatex";
  const additionalResources = options.additionalResources;

  // Attempt 1: Full document as-is
  console.log("LaTeX compile: attempt 1 (full document)");
  const result1 = await tryCompile(latexContent, compiler, additionalResources);
  if (result1.ok && result1.buffer) {
    return result1.buffer;
  }
  console.warn("LaTeX compile attempt 1 failed:", result1.error);

  // Attempt 2: Strip TikZ graphics (most common failure point)
  console.log("LaTeX compile: attempt 2 (stripped TikZ)");
  const strippedLatex = stripTikz(latexContent);
  const result2 = await tryCompile(strippedLatex, compiler, additionalResources);
  if (result2.ok && result2.buffer) {
    console.log("LaTeX compile: succeeded after stripping TikZ");
    return result2.buffer;
  }
  console.warn("LaTeX compile attempt 2 failed:", result2.error);

  // Attempt 3: Aggressive sanitization
  console.log("LaTeX compile: attempt 3 (aggressive sanitization)");
  const sanitizedLatex = sanitizeForRetry(latexContent);
  const result3 = await tryCompile(sanitizedLatex, compiler, additionalResources);
  if (result3.ok && result3.buffer) {
    console.log("LaTeX compile: succeeded after aggressive sanitization");
    return result3.buffer;
  }
  console.warn("LaTeX compile attempt 3 failed:", result3.error);

  // All attempts failed
  throw new Error(
    `LaTeX compilation failed after 3 attempts. Last error: ${result3.error}`
  );
}
