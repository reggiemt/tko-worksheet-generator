import type { GeneratedWorksheet, Problem, Answer } from "./types";
import { getSubcategoryName } from "./categories";
import { resolveVisualCode } from "./tikz-templates";

export interface CustomBranding {
  orgName?: string;
  logoBase64?: string; // raw base64 (no data: prefix)
  logoMimeType?: string; // "image/png" or "image/jpeg"
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeLatex(text: string): string {
  // For known plain text (headers, labels) - escape everything
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/%/g, "\\%")
    .replace(/&/g, "\\&")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\$/g, "\\$")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}");
}

function sanitizeLatexContent(text: string): string {
  // For AI-generated content that mixes LaTeX commands/math with plain text.
  // Strategy: split on math delimiters ($...$), escape only the non-math parts.
  const parts = text.split(/(\$[^$]*\$)/g);
  return parts
    .map((part, i) => {
      // Odd indices are math segments (between $ delimiters)
      if (part.startsWith("$") && part.endsWith("$")) {
        return part; // Leave math untouched
      }
      // Plain text segment — escape special chars but preserve LaTeX commands
      return part
        .replace(/(?<!\\)%/g, "\\%")
        .replace(/(?<!\\)&(?!\\)/g, "\\&")
        .replace(/(?<!\\)#/g, "\\#")
        .replace(/(?<!\\)_(?![{])/g, "\\_");
    })
    .join("");
}

function buildProblemLatex(problem: Problem): string {
  let latex = `\\problem\n${sanitizeLatexContent(problem.content)}\n`;

  if (problem.hasVisual && problem.visualCode) {
    try {
      const tikzCode = resolveVisualCode(problem.visualCode);
      if (tikzCode && !tikzCode.includes("[Figure]")) {
        console.log(`[LATEX] Problem #${problem.number}: Including visual (${tikzCode.length} chars of TikZ)`);
        latex += `\n\\begin{center}\n${tikzCode}\n\\end{center}\n`;
      } else {
        console.warn(`[LATEX] Problem #${problem.number}: Visual resolved to [Figure] placeholder — skipping`);
      }
    } catch (err) {
      console.warn(`[LATEX] Problem #${problem.number}: Visual rendering failed:`, err);
      // Skip the figure rather than crash
    }
  } else if (problem.hasVisual && !problem.visualCode) {
    console.warn(`[LATEX] Problem #${problem.number}: hasVisual=true but visualCode is null/empty`);
  }

  if (problem.isGridIn) {
    latex += `\n\\textit{(Student-Produced Response)}\n`;
  } else if (problem.choices) {
    latex += `
\\begin{enumerate}[label=\\Alph*., itemsep=0.3em]
    \\item ${sanitizeLatexContent(problem.choices.A)}
    \\item ${sanitizeLatexContent(problem.choices.B)}
    \\item ${sanitizeLatexContent(problem.choices.C)}
    \\item ${sanitizeLatexContent(problem.choices.D)}
\\end{enumerate}
`;
  }

  return latex;
}

export function buildWorksheetLatex(worksheet: GeneratedWorksheet, customBranding?: CustomBranding): string {
  const { problems, metadata } = worksheet;
  const topicName = getSubcategoryName(metadata.category, metadata.subcategory);

  // Determine header branding
  const hasCustomLogo = customBranding?.logoBase64;
  const hasOrgName = customBranding?.orgName;
  const graphicsPackage = hasCustomLogo ? "\\usepackage{graphicx}\n" : "";

  // Build the title block
  let titleBlock: string;
  if (hasCustomLogo && hasOrgName) {
    titleBlock = `% Title with custom branding
\\begin{center}
    \\includegraphics[height=1.2cm]{customlogo.png}\\\\[0.4em]
    {\\Large\\bfseries ${escapeLatex(customBranding.orgName!)}}\\\\[0.3em]
    {\\LARGE\\bfseries SAT Math Practice}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  } else if (hasCustomLogo) {
    titleBlock = `% Title with custom logo
\\begin{center}
    \\includegraphics[height=1.2cm]{customlogo.png}\\\\[0.5em]
    {\\LARGE\\bfseries SAT Math Practice}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  } else if (hasOrgName) {
    titleBlock = `% Title with custom org name
\\begin{center}
    {\\Large\\bfseries ${escapeLatex(customBranding.orgName!)}}\\\\[0.3em]
    {\\LARGE\\bfseries SAT Math Practice}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  } else {
    titleBlock = `% Title
\\begin{center}
    {\\LARGE\\bfseries SAT Math Practice}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  }

  // Footer attribution
  const footerText = hasOrgName
    ? `{\\small\\textit{Generated by ${escapeLatex(customBranding.orgName!)} using TKO Prep $|$ testprepsheets.com}}`
    : `{\\small\\textit{Generated by TKO Prep $|$ tkoprep.com $|$ Free SAT \\& ACT Test Preparation}}`;

  return `\\documentclass[11pt, letterpaper]{article}

% Page geometry
\\usepackage[margin=1in]{geometry}

% Math packages
\\usepackage{amsmath, amssymb}

% Graphics packages
\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\usetikzlibrary{calc, patterns, angles, quotes, positioning}
${graphicsPackage}
% Tables
\\usepackage{array}
\\usepackage{booktabs}

% Formatting
\\usepackage{enumitem}
\\usepackage{fancyhdr}
% \\usepackage{lastpage} % removed: single-pass compilation

% URLs
\\usepackage{hyperref}
\\hypersetup{hidelinks}

% Fonts
\\usepackage[T1]{fontenc}

% No paragraph indent
\\setlength{\\parindent}{0pt}

% Fix header height warning
\\setlength{\\headheight}{14pt}

% Header/Footer
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{SAT Math Practice --- ${capitalize(metadata.difficulty)}}
\\fancyhead[R]{${escapeLatex(topicName)}}
\\fancyfoot[C]{Page \\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}
\\renewcommand{\\footrulewidth}{0.4pt}

% Problem counter
\\newcounter{prob}

% Problem environment
\\newcommand{\\problem}{%
    \\stepcounter{prob}%
    \\vspace{1.5em}%
    \\textbf{\\theprob.}\\hspace{0.5em}%
}

\\begin{document}

${titleBlock}

\\vspace{1em}

\\textbf{Directions:} Solve each problem and choose the best answer from the choices provided. For Student-Produced Response questions, solve the problem and enter your answer in the grid. Unless otherwise indicated, assume the following:
\\begin{itemize}[nosep, leftmargin=2em]
    \\item All variables and expressions represent real numbers.
    \\item Figures are drawn to scale unless noted otherwise.
    \\item All figures lie in a plane unless noted otherwise.
\\end{itemize}

\\vspace{1em}
\\hrule
\\vspace{1em}

%%% PROBLEMS %%%
${problems.map((p) => buildProblemLatex(p)).join("\n\\vspace{1em}\n")}

\\vspace{2em}
\\begin{center}
\\rule{0.6\\textwidth}{0.4pt}\\\\[0.8em]
${footerText}
\\end{center}

\\end{document}
`;
}

function buildAnswerLatex(answer: Answer): string {
  // Split solution into steps and format nicely
  const rawSteps = answer.solution.split(/\\n|\n/).filter((s) => s.trim());
  const formattedSteps = rawSteps
    .map((step) => {
      const sanitized = sanitizeLatexContent(step.trim());
      if (/^Step\s*\d/i.test(sanitized)) {
        return `\\textbf{${sanitized}}`;
      }
      if (/^Key\s*insight/i.test(sanitized)) {
        return `\\vspace{4pt}\\textit{${sanitized}}`;
      }
      return sanitized;
    })
    .join("\n\n");

  const answerText = sanitizeLatexContent(answer.correctAnswer);

  return `\\begin{tcolorbox}[colback=tkoLight, colframe=tkoBlue, boxrule=0.3pt, arc=2pt, left=8pt, right=8pt, top=6pt, bottom=6pt]
\\textbf{Problem ${answer.number}.} \\hfill \\fcolorbox{answerGreen}{white}{\\textbf{\\strut\\ ${answerText}\\ }}

\\vspace{6pt}
{\\small\\textit{Solution:}}

\\vspace{4pt}
{\\small ${formattedSteps}}
\\end{tcolorbox}`;
}

export function buildAnswerKeyLatex(worksheet: GeneratedWorksheet, customBranding?: CustomBranding): string {
  const { answers, metadata } = worksheet;
  const topicName = getSubcategoryName(metadata.category, metadata.subcategory);

  const hasCustomLogo = customBranding?.logoBase64;
  const hasOrgName = customBranding?.orgName;
  const graphicsPackage = hasCustomLogo ? "\\usepackage{graphicx}\n" : "";

  // Build the title block
  let titleBlock: string;
  if (hasCustomLogo && hasOrgName) {
    titleBlock = `% Title with custom branding
\\begin{center}
    \\includegraphics[height=1.2cm]{customlogo.png}\\\\[0.4em]
    {\\Large\\bfseries ${escapeLatex(customBranding.orgName!)}}\\\\[0.3em]
    {\\LARGE\\bfseries Answer Key}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  } else if (hasCustomLogo) {
    titleBlock = `% Title with custom logo
\\begin{center}
    \\includegraphics[height=1.2cm]{customlogo.png}\\\\[0.5em]
    {\\LARGE\\bfseries Answer Key}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  } else if (hasOrgName) {
    titleBlock = `% Title with custom org name
\\begin{center}
    {\\Large\\bfseries ${escapeLatex(customBranding.orgName!)}}\\\\[0.3em]
    {\\LARGE\\bfseries Answer Key}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  } else {
    titleBlock = `% Title
\\begin{center}
    {\\LARGE\\bfseries Answer Key}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  }

  // Footer attribution
  const footerText = hasOrgName
    ? `{\\small\\textit{Generated by ${escapeLatex(customBranding.orgName!)} using TKO Prep $|$ testprepsheets.com}}`
    : `{\\small\\textit{Need help mastering these concepts? Book a free consultation at \\textbf{tkoprep.com}}}`;

  return `\\documentclass[11pt, letterpaper]{article}

% Page geometry
\\usepackage[margin=1in]{geometry}

% Math packages
\\usepackage{amsmath, amssymb}
${graphicsPackage}
% Colors
\\usepackage{xcolor}
\\usepackage{tcolorbox}

\\definecolor{tkoBlue}{HTML}{1a365d}
\\definecolor{tkoGray}{HTML}{718096}
\\definecolor{tkoLight}{HTML}{EDF2F7}
\\definecolor{answerGreen}{HTML}{276749}

% Formatting
\\usepackage{enumitem}
\\usepackage{fancyhdr}
% \\usepackage{lastpage} % removed: single-pass compilation

% URLs
\\usepackage{hyperref}
\\hypersetup{hidelinks}

% Fonts
\\usepackage[T1]{fontenc}

% No paragraph indent
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.5em}

% Fix header height warning
\\setlength{\\headheight}{14pt}

% Header/Footer
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{Answer Key}
\\fancyhead[R]{${escapeLatex(topicName)}}
\\fancyfoot[C]{Page \\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}
\\renewcommand{\\footrulewidth}{0.4pt}

\\begin{document}

${titleBlock}

\\vspace{1em}
\\hrule
\\vspace{1em}

%%% ANSWERS %%%
${answers.map((a) => buildAnswerLatex(a)).join("\n\n\\vspace{0.3cm}\n")}

\\vspace{2em}
\\begin{center}
\\rule{0.7\\textwidth}{0.4pt}\\\\[0.8em]
${footerText}
\\end{center}

\\end{document}
`;
}
