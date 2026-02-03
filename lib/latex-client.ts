interface CompileOptions {
  compiler?: "pdflatex" | "xelatex" | "lualatex";
}

export async function compileLaTeX(
  latexContent: string,
  options: CompileOptions = {}
): Promise<Buffer> {
  const compiler = options.compiler || "pdflatex";

  const response = await fetch("https://latex.ytotech.com/builds/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      compiler,
      resources: [
        {
          main: true,
          content: latexContent,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("LaTeX compilation error:", errorText);
    throw new Error(`LaTeX compilation failed: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    // Error response is JSON
    const errorData = await response.json();
    throw new Error(`LaTeX compilation error: ${JSON.stringify(errorData)}`);
  }

  const pdfBuffer = await response.arrayBuffer();
  return Buffer.from(pdfBuffer);
}
