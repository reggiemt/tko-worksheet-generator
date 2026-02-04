import type { GeneratedRWWorksheet, RWProblem, RWAnswer } from "./rw-types";
import { getRWSubcategoryName } from "./rw-categories";
import type { CustomBranding } from "./latex-templates";

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeLatex(text: string): string {
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

function sanitizeRWContent(text: string): string {
  // For AI-generated R/W content — mostly plain text with occasional LaTeX math
  const parts = text.split(/(\$[^$]*\$)/g);
  return parts
    .map((part) => {
      if (part.startsWith("$") && part.endsWith("$")) {
        return part; // Leave math untouched
      }
      return part
        .replace(/(?<!\\)%/g, "\\%")
        .replace(/(?<!\\)&(?!\\)/g, "\\&")
        .replace(/(?<!\\)#/g, "\\#")
        .replace(/(?<!\\)_(?![{])/g, "\\_");
    })
    .join("");
}

function formatPassage(passage: string): string {
  // Handle dual passages (Text 1 / Text 2)
  if (passage.includes("Text 1:") && passage.includes("Text 2:")) {
    const parts = passage.split(/Text 2:/);
    const text1 = parts[0].replace(/Text 1:/, "").trim();
    const text2 = parts.slice(1).join("Text 2:").trim();

    return `\\textbf{Text 1}

\\begin{quote}
\\small ${sanitizeRWContent(text1)}
\\end{quote}

\\textbf{Text 2}

\\begin{quote}
\\small ${sanitizeRWContent(text2)}
\\end{quote}`;
  }

  // Handle rhetorical synthesis (bullet points)
  if (passage.includes("•")) {
    const lines = passage.split("\n").map((l) => l.trim()).filter(Boolean);
    const introLines: string[] = [];
    const bulletLines: string[] = [];
    let inBullets = false;

    for (const line of lines) {
      if (line.startsWith("•")) {
        inBullets = true;
        bulletLines.push(line.replace(/^•\s*/, ""));
      } else if (!inBullets) {
        introLines.push(line);
      } else {
        // Text after bullets — treat as intro
        introLines.push(line);
      }
    }

    let result = "";
    if (introLines.length > 0) {
      result += `\\small ${sanitizeRWContent(introLines.join(" "))}\n\n`;
    }
    if (bulletLines.length > 0) {
      result += `\\begin{itemize}[nosep, leftmargin=2em]\n`;
      for (const bullet of bulletLines) {
        result += `    \\item ${sanitizeRWContent(bullet)}\n`;
      }
      result += `\\end{itemize}`;
    }
    return result;
  }

  // Standard passage
  return `\\begin{quote}\n\\small ${sanitizeRWContent(passage)}\n\\end{quote}`;
}

function buildRWProblemLatex(problem: RWProblem): string {
  let latex = `\\rwproblem\n\n`;

  // Passage
  latex += formatPassage(problem.passage);
  latex += "\n\n";

  // Data (table/chart) if present
  if (problem.hasData && problem.dataContent) {
    latex += `\\begin{center}\n`;
    // If the dataContent looks like raw LaTeX (contains \begin), use it directly
    if (problem.dataContent.includes("\\begin")) {
      latex += `${problem.dataContent}\n`;
    } else {
      // Otherwise treat it as a description
      latex += `\\small\\textit{${sanitizeRWContent(problem.dataContent)}}\n`;
    }
    latex += `\\end{center}\n\n`;
  }

  // Question
  latex += `${sanitizeRWContent(problem.question)}\n`;

  // Choices
  latex += `
\\begin{enumerate}[label=\\Alph*), itemsep=0.3em, leftmargin=2em]
    \\item ${sanitizeRWContent(problem.choices.A)}
    \\item ${sanitizeRWContent(problem.choices.B)}
    \\item ${sanitizeRWContent(problem.choices.C)}
    \\item ${sanitizeRWContent(problem.choices.D)}
\\end{enumerate}
`;

  return latex;
}

export function buildRWWorksheetLatex(worksheet: GeneratedRWWorksheet, customBranding?: CustomBranding): string {
  const { problems, metadata } = worksheet;
  const topicName = getRWSubcategoryName(metadata.category, metadata.subcategory);

  const hasCustomLogo = customBranding?.logoBase64;
  const hasOrgName = customBranding?.orgName;
  const graphicsPackage = hasCustomLogo ? "\\usepackage{graphicx}\n" : "";

  // Build the title block
  let titleBlock: string;
  if (hasCustomLogo && hasOrgName) {
    titleBlock = `\\begin{center}
    \\includegraphics[height=1.2cm]{customlogo.png}\\\\[0.4em]
    {\\Large\\bfseries ${escapeLatex(customBranding.orgName!)}}\\\\[0.3em]
    {\\LARGE\\bfseries SAT Reading \\& Writing Practice}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  } else if (hasCustomLogo) {
    titleBlock = `\\begin{center}
    \\includegraphics[height=1.2cm]{customlogo.png}\\\\[0.5em]
    {\\LARGE\\bfseries SAT Reading \\& Writing Practice}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  } else if (hasOrgName) {
    titleBlock = `\\begin{center}
    {\\Large\\bfseries ${escapeLatex(customBranding.orgName!)}}\\\\[0.3em]
    {\\LARGE\\bfseries SAT Reading \\& Writing Practice}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  } else {
    titleBlock = `\\begin{center}
    {\\LARGE\\bfseries SAT Reading \\& Writing Practice}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  }

  const footerText = hasOrgName
    ? `{\\small\\textit{Generated by ${escapeLatex(customBranding.orgName!)} using TKO Prep $|$ testprepsheets.com}}`
    : `{\\small\\textit{Generated by TKO Prep $|$ testprepsheets.com $|$ Free SAT \\& ACT Test Preparation}}`;

  return `\\documentclass[11pt, letterpaper]{article}

% Page geometry
\\usepackage[margin=1in]{geometry}

% Math packages (for occasional math in passages)
\\usepackage{amsmath, amssymb}

% Tables
\\usepackage{array}
\\usepackage{booktabs}
${graphicsPackage}
% Formatting
\\usepackage{enumitem}
\\usepackage{fancyhdr}
\\usepackage{lastpage}

% URLs
\\usepackage{hyperref}
\\hypersetup{hidelinks}

% Fonts
\\usepackage[T1]{fontenc}

% No paragraph indent, add spacing
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.4em}

% Fix header height warning
\\setlength{\\headheight}{14pt}

% Header/Footer
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{SAT Reading \\& Writing Practice --- ${capitalize(metadata.difficulty)}}
\\fancyhead[R]{${escapeLatex(topicName)}}
\\fancyfoot[C]{Page \\thepage\\ of \\pageref{LastPage}}
\\renewcommand{\\headrulewidth}{0.4pt}
\\renewcommand{\\footrulewidth}{0.4pt}

% Problem counter
\\newcounter{rwprob}

% R/W Problem environment
\\newcommand{\\rwproblem}{%
    \\stepcounter{rwprob}%
    \\vspace{1.5em}%
    \\textbf{\\therwprob.}\\hspace{0.5em}%
}

\\begin{document}

${titleBlock}

\\vspace{1em}

\\textbf{Directions:} Each question is accompanied by one or more passages and in some cases a table, graph, or other data. Read each passage and choose the best answer to the question based on what is stated or implied in the passage(s) and any accompanying data.

\\vspace{1em}
\\hrule
\\vspace{0.5em}

%%% PROBLEMS %%%
${problems.map((p) => buildRWProblemLatex(p)).join("\n\\vspace{0.8em}\n\\hrule\n\\vspace{0.5em}\n")}

\\vspace{2em}
\\begin{center}
\\rule{0.6\\textwidth}{0.4pt}\\\\[0.8em]
${footerText}
\\end{center}

\\end{document}
`;
}

function buildRWAnswerLatex(answer: RWAnswer): string {
  const rawSteps = answer.explanation.split(/\\n|\n/).filter((s) => s.trim());
  const formattedExplanation = rawSteps
    .map((step) => sanitizeRWContent(step.trim()))
    .join("\n\n");

  const answerText = sanitizeRWContent(answer.correctAnswer);

  return `\\begin{minipage}{\\textwidth}
\\vspace{0.8em}
{\\large\\textbf{Problem ${answer.number}}} \\hfill {\\large\\fbox{\\textbf{\\strut\\ ${answerText}\\ }}}

\\vspace{0.4em}
{\\small\\textit{Explanation:}}

\\vspace{0.2em}
{\\small ${formattedExplanation}}
\\vspace{0.4em}
\\end{minipage}`;
}

export function buildRWAnswerKeyLatex(worksheet: GeneratedRWWorksheet, customBranding?: CustomBranding): string {
  const { answers, metadata } = worksheet;
  const topicName = getRWSubcategoryName(metadata.category, metadata.subcategory);

  const hasCustomLogo = customBranding?.logoBase64;
  const hasOrgName = customBranding?.orgName;
  const graphicsPackage = hasCustomLogo ? "\\usepackage{graphicx}\n" : "";

  let titleBlock: string;
  if (hasCustomLogo && hasOrgName) {
    titleBlock = `\\begin{center}
    \\includegraphics[height=1.2cm]{customlogo.png}\\\\[0.4em]
    {\\Large\\bfseries ${escapeLatex(customBranding.orgName!)}}\\\\[0.3em]
    {\\LARGE\\bfseries Answer Key --- Reading \\& Writing}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  } else if (hasCustomLogo) {
    titleBlock = `\\begin{center}
    \\includegraphics[height=1.2cm]{customlogo.png}\\\\[0.5em]
    {\\LARGE\\bfseries Answer Key --- Reading \\& Writing}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  } else if (hasOrgName) {
    titleBlock = `\\begin{center}
    {\\Large\\bfseries ${escapeLatex(customBranding.orgName!)}}\\\\[0.3em]
    {\\LARGE\\bfseries Answer Key --- Reading \\& Writing}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  } else {
    titleBlock = `\\begin{center}
    {\\LARGE\\bfseries Answer Key --- Reading \\& Writing}\\\\[0.5em]
    {\\large ${escapeLatex(topicName)} --- ${capitalize(metadata.difficulty)}}\\\\[0.3em]
    {${metadata.questionCount} Questions}
\\end{center}`;
  }

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

% Formatting
\\usepackage{enumitem}
\\usepackage{fancyhdr}
\\usepackage{lastpage}

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
\\fancyhead[L]{Answer Key --- Reading \\& Writing}
\\fancyhead[R]{${escapeLatex(topicName)}}
\\fancyfoot[C]{Page \\thepage\\ of \\pageref{LastPage}}
\\renewcommand{\\headrulewidth}{0.4pt}
\\renewcommand{\\footrulewidth}{0.4pt}

\\begin{document}

${titleBlock}

\\vspace{1em}
\\hrule
\\vspace{1em}

%%% ANSWERS %%%
${answers.map((a) => buildRWAnswerLatex(a)).join("\n\n{\\color{gray}\\hrule}\n")}

\\vspace{2em}
\\begin{center}
\\rule{0.7\\textwidth}{0.4pt}\\\\[0.8em]
${footerText}
\\end{center}

\\end{document}
`;
}
