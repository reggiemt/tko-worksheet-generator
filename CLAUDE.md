# SAT Math Worksheet Generator

## Project Purpose
Generate SAT-style math practice worksheets with mathematically verified answers and professional presentation matching authentic College Board quality.

## Core Problems to Solve
1. **Complexity** — Problems must match true SAT difficulty, not simplified versions
2. **Verification** — Every answer must be mathematically proven correct
3. **Presentation** — Professional graphics, charts, and figures using LaTeX + TikZ/pgfplots

---

## Quality Standards

### Problem Authenticity
- Problems should be indistinguishable from real SAT problems in complexity and style
- Include multi-step reasoning where appropriate
- Use realistic contexts (science, economics, everyday scenarios)
- Vary problem formats: algebraic manipulation, word problems, graph interpretation, data analysis

### Reverse Construction Method
For every problem:
1. Start with a clean answer (integer, simple fraction, or clean decimal)
2. Build the problem working backward from that answer
3. Ensure the problem requires genuine SAT-level reasoning to solve
4. Verify by solving forward — must arrive at the intended answer

### Answer Verification Protocol
Before including ANY problem:
```
1. Solve the problem step-by-step (forward direction)
2. Confirm answer matches intended answer exactly
3. For multiple choice: verify each distractor is plausible but definitively wrong
4. For grid-in: confirm answer fits grid constraints (0-9999, fractions, decimals)
5. Document the solution path in the answer key
```

---

## Problem Tagging Schema

### 1. Algebra (13-15 questions per test)
- `algebra.linear_one_var` — Solving, simplifying, interpreting solutions
- `algebra.linear_two_var` — Slope, intercepts, graphing, writing equations from context
- `algebra.systems` — Substitution, elimination, graphical solutions, number of solutions
- `algebra.inequalities` — Linear inequalities, compound inequalities, graphing
- `algebra.absolute_value` — Equations and inequalities with absolute value

### 2. Advanced Math (13-15 questions per test)
- `advanced.quadratics` — Factoring, completing square, quadratic formula, vertex form, parabolas
- `advanced.polynomials` — Operations, factoring higher-degree, finding roots
- `advanced.rational` — Simplifying, multiplying/dividing, solving rational equations
- `advanced.radicals_exponents` — Simplifying radicals, rational exponents, radical equations
- `advanced.exponential` — Growth/decay modeling, graphing, linear vs exponential comparison
- `advanced.functions` — Notation, composition, graph interpretation, transformations

### 3. Problem-Solving and Data Analysis (5-7 questions per test)
- `data.ratios_rates` — Unit rates, scaling, direct/inverse variation
- `data.percentages` — Percent change, percent of quantity, multi-step percent problems
- `data.units` — Dimensional analysis, unit conversion
- `data.interpretation` — Tables, bar graphs, histograms, scatterplots, line graphs
- `data.statistics` — Mean, median, mode, range, standard deviation, comparing distributions
- `data.probability` — Basic/conditional probability, sampling, margin of error, surveys

### 4. Geometry and Trigonometry (5-7 questions per test)
- `geometry.area_perimeter` — Polygons, circles, composite figures
- `geometry.volume_surface` — Prisms, cylinders, cones, spheres, pyramids
- `geometry.lines_angles_triangles` — Parallel lines, transversals, triangle properties, similarity, congruence
- `geometry.right_triangle_trig` — Sine, cosine, tangent, solving for sides/angles
- `geometry.circles` — Arc length, sector area, central/inscribed angles, circle equations
- `geometry.coordinate` — Distance, midpoint, line equations, transformations

---

## Output Format: LaTeX + TikZ/pgfplots

### Required Packages
```latex
\usepackage{amsmath, amssymb}
\usepackage{tikz}
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}
\usetikzlibrary{calc, patterns, angles, quotes}
```

### Visual Element Requirements
- ~30% of problems should include visual elements
- Coordinate planes for linear/quadratic function problems
- Data tables for statistics problems
- Scatterplots for regression/correlation problems
- Geometric figures for geometry problems
- Bar/line graphs for data interpretation

### TikZ Templates to Use

#### Coordinate Plane with Function
```latex
\begin{tikzpicture}
\begin{axis}[
    axis lines=middle,
    xlabel={$x$}, ylabel={$y$},
    xmin=-5, xmax=5,
    ymin=-5, ymax=5,
    xtick={-4,-2,0,2,4},
    ytick={-4,-2,0,2,4},
    grid=both,
    width=8cm, height=8cm
]
\addplot[domain=-4:4, samples=100, thick, blue] {x^2 - 2*x - 3};
\end{axis}
\end{tikzpicture}
```

#### Data Table
```latex
\begin{tabular}{|c|c|c|c|c|}
\hline
$x$ & 1 & 2 & 3 & 4 \\
\hline
$y$ & 3 & 7 & 11 & 15 \\
\hline
\end{tabular}
```

#### Right Triangle
```latex
\begin{tikzpicture}
\coordinate (A) at (0,0);
\coordinate (B) at (4,0);
\coordinate (C) at (4,3);
\draw[thick] (A) -- (B) node[midway, below] {4} 
             -- (C) node[midway, right] {3} 
             -- cycle node[midway, above left] {5};
\draw (3.7,0) -- (3.7,0.3) -- (4,0.3);
\end{tikzpicture}
```

#### Scatterplot with Best-Fit Line
```latex
\begin{tikzpicture}
\begin{axis}[
    xlabel={Hours Studied},
    ylabel={Test Score},
    xmin=0, xmax=10,
    ymin=50, ymax=100,
    grid=both
]
\addplot[only marks, mark=*, blue] coordinates {
    (1,58) (2,64) (3,68) (4,72) (5,75) (6,79) (7,83) (8,88) (9,91)
};
\addplot[domain=0:10, red, thick] {52 + 4.5*x};
\end{axis}
\end{tikzpicture}
```

### TikZ Arc and Angle Marker Rules (Critical)

When drawing arcs and angle markers on circle diagrams, **always follow these rules** to avoid incorrect sweeps:

1. **Set `start` and `end` angles to the actual angular positions of the relevant points/rays on the circle**, not from 0°. The sweep of the arc should equal the intended angle measure.

2. **For highlighted arcs on a circle**: Use counterclockwise direction. If you want to highlight arc from point A to point B going counterclockwise, set `start` to A's angle and `end` to B's angle (adding 360° if needed to ensure counterclockwise traversal).

3. **For angle markers (small arcs showing a central angle)**: The `start` angle must be the angular position of one ray and `end` must be the angular position of the other ray, with the sweep equaling the actual angle measure.

**Common mistakes to avoid:**
- Starting an angle marker at `start=0` when the rays don't begin at 0° — always use the ray's actual angular position
- Using clockwise arcs when counterclockwise is intended (or vice versa) — verify direction matches the intended arc
- Setting sweep to the angle value without accounting for where the rays actually are on the circle

**Examples of correct usage:**
```latex
% Point C at 120°, Point D at -30° (330°), showing angle COD = 150°
% Angle marker from ray OD to ray OC:
\draw[thick, red] (O) +(-30:0.6) arc[start angle=-30, end angle=120, radius=0.6];

% Major arc from C (120°) counterclockwise through bottom to D (330°):
\draw[very thick, red] (O) +(120:2) arc[start angle=120, end angle=330, radius=2];

% Point A at 200°, Point B at 310°, showing central angle AOB = 110°
% Angle marker from OA to OB:
\draw[thick] (O) +(200:0.5) arc[start angle=200, end angle=310, radius=0.5];
```

---

## File Structure

```
/sat-worksheets/
├── CLAUDE.md              # This file
├── /problems/             # Problem bank (LaTeX snippets by tag)
│   ├── algebra/
│   ├── advanced/
│   ├── data/
│   └── geometry/
├── /worksheets/           # Compiled PDFs
├── /answers/              # Answer keys with worked solutions
├── /templates/            # LaTeX document templates
│   ├── worksheet.tex      # Main worksheet template
│   └── answerkey.tex      # Answer key template
└── /verification/         # Solution verification scripts
```

---

## Difficulty Calibration

### Easy (Section 1 / Module 1 level)
- Single concept, 1-2 steps
- Straightforward application of formulas
- Clear, direct wording

### Medium (Section 1 / Module 2 level)
- Combines 2 concepts or requires 2-3 steps
- May require setting up equations from context
- Some interpretation needed

### Hard (Section 2 level)
- Multi-step reasoning (3+ steps)
- Combines multiple concepts
- Abstract or complex contexts
- Requires strategic problem-solving approach

---

## Multiple Choice Distractor Guidelines

When creating wrong answers:
- **Computational errors**: Result of common arithmetic mistakes
- **Conceptual errors**: Result of misunderstanding the concept (e.g., adding instead of multiplying)
- **Partial solutions**: Stopping before the final step
- **Sign errors**: Negative instead of positive or vice versa
- **Misread problems**: Answer to a slightly different question

All distractors must be:
- Plausible (a real student might choose it)
- Definitively wrong (not an edge case)
- Different from each other

---

## Compilation

Use `pdflatex` to compile:
```bash
pdflatex worksheet.tex
```

For documents with TikZ/pgfplots, may need two passes:
```bash
pdflatex worksheet.tex
pdflatex worksheet.tex
```

---

## Session Workflow

1. Read this file at session start
2. Check existing problems in /problems/ to avoid duplicates
3. Generate problems using reverse construction
4. Verify each problem mathematically
5. Tag problems appropriately
6. Add TikZ graphics where needed
7. **Always generate both .tex and .pdf files** (compile using pdflatex)
8. Generate corresponding answer key with worked solutions

---

## IMPORTANT: PDF Generation Required

**Every worksheet must be delivered as a PDF.** The workflow is:

1. Create the worksheet content in LaTeX (.tex file)
2. Compile to PDF using: `/Library/TeX/texbin/pdflatex -interaction=nonstopmode filename.tex`
3. Both .tex and .pdf files should be saved in `/worksheets/`

Do NOT deliver markdown-only worksheets. Students need printable PDFs.

If pdflatex fails, troubleshoot the LaTeX syntax before delivering.

---

# SAT Reading & Writing Worksheet Generation Guide

## Overview

This document provides comprehensive guidance for generating realistic, professional-quality SAT Reading & Writing practice worksheets. All worksheets should mimic the authentic digital SAT format introduced in 2024.

## IMPORTANT: PDF Generation Required

**Every R/W worksheet must be delivered as a PDF.** Use LaTeX for consistency with Math worksheets.

### Workflow:
1. Create the worksheet content in LaTeX (.tex file)
2. Compile to PDF using: `/Library/TeX/texbin/pdflatex -interaction=nonstopmode filename.tex`
3. Run pdflatex twice to resolve references (page numbers, etc.)
4. Both .tex and .pdf files should be saved in `/worksheets/`

Do NOT deliver markdown-only or docx-only worksheets. Students need printable PDFs.

If pdflatex fails, troubleshoot the LaTeX syntax before delivering.

### LaTeX Package Notes:
- Use only packages available in TeX Live Basic installation
- Avoid: `tcolorbox`, `framed`, `mdframed` (may not be installed)
- Use instead: `\fbox{\parbox{...}}` for boxed content
- Standard packages that work: `geometry`, `amsmath`, `amssymb`, `enumitem`, `fancyhdr`, `lastpage`, `parskip`, `array`

---

## Technical Stack (Alternative: docx-js)

If LaTeX is unavailable, use docx-js as a fallback:

### Required Packages
```bash
# Document generation
npm install -g docx                    # For .docx creation
pip install python-docx --break-system-packages  # Alternative Python option

# PDF generation (if needed)
# Use soffice for conversion: soffice --headless --convert-to pdf document.docx
```

### Document Setup (docx-js)
```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel,
        PageBreak } = require('docx');

// US Letter, 1-inch margins
const PAGE_CONFIG = {
  page: {
    size: { width: 12240, height: 15840 },  // 8.5" x 11" in DXA
    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
  }
};
```

---

## SAT Reading & Writing Section Structure

### Format Overview
- **Total Questions**: 54 (27 per module × 2 modules)
- **Total Time**: 64 minutes (32 minutes per module)
- **Time per Question**: ~71 seconds average
- **Passage Length**: 25-150 words per passage
- **Questions per Passage**: 1 (each passage has exactly one question)
- **Answer Choices**: 4 (A, B, C, D)
- **Adaptive**: Module 2 difficulty adjusts based on Module 1 performance

### Content Domains & Question Distribution

| Domain | Skill | Avg. Questions | % of Section |
|--------|-------|----------------|--------------|
| **Craft & Structure** | Words in Context | 10-11 | 19.6% |
| | Text Structure and Purpose | 2-3 | 3.7% |
| | Cross-Text Connections | 1 | 1.9% |
| **Information & Ideas** | Central Ideas and Details | 4-5 | 8.5% |
| | Command of Evidence (Textual) | 4 | 7.4% |
| | Command of Evidence (Quantitative) | 3-4 | 6.7% |
| | Inferences | 3-4 | 6.6% |
| **Expression of Ideas** | Transitions | 5-6 | 10.4% |
| | Rhetorical Synthesis | 5-6 | 10.4% |
| **Standard English Conventions** | Boundaries (Punctuation) | 5-6 | 10.4% |
| | Form, Structure, and Sense | 7-8 | 14.4% |

### Question Order in Modules
Questions are grouped by type and arranged from easiest to hardest within each group:
1. Words in Context (first)
2. Text Structure and Purpose
3. Cross-Text Connections
4. Central Ideas and Details
5. Command of Evidence (Textual)
6. Command of Evidence (Quantitative)
7. Inferences
8. Transitions
9. Rhetorical Synthesis (last)
10. Standard English Conventions (interspersed by difficulty only)

---

## Passage Types & Topics

### Subject Areas
Generate passages from these four categories:
1. **Literature**: Prose fiction, poetry (often early 1900s and before), drama, literary nonfiction
2. **History/Social Studies**: Historical contexts, social sciences, economics, psychology, sociology
3. **Humanities**: Arts, philosophy, media, cultural studies, music, architecture
4. **Science**: Biology, chemistry, physics, Earth science, astronomy, technology, medicine

### Passage Characteristics
- Length: 25-150 words (most are 50-100 words)
- Tone: Academic but accessible
- No long historical document excerpts (format doesn't support them)
- May include tables, bar graphs, or line graphs (for quantitative evidence questions)
- May include poetry excerpts (answer choices can be lines of poetry)
- May include bullet-point notes (for rhetorical synthesis questions)

---

## Question Type Specifications

### 1. WORDS IN CONTEXT (Craft & Structure)
**Frequency**: ~10-11 questions per test (highest frequency)

**Question Stem**:
- "Which choice completes the text with the most logical and precise word or phrase?"
- "As used in the text, what does the word [X] most nearly mean?"

**Passage Format**: Short passage (50-100 words) with a blank or underlined word

**Answer Choice Format**: Single words or short phrases

**Example**:
```
The process of mechanical recycling plastics is often considered ______
because of the environmental impact and the loss of material quality
that often occurs. But chemist Takunda Chazovachii has helped develop
a cleaner process of chemical recycling that converts superabsorbent
polymers from diapers into a desirable reusable adhesive.

Which choice completes the text with the most logical and precise word
or phrase?

A) funded
B) token
C) funded
D) problematic
```

**Generation Guidelines**:
- Test high-utility academic vocabulary
- Context must clearly support one answer
- Distractors should be plausible but not fit the context
- Words should be relevant across multiple disciplines

---

### 2. TEXT STRUCTURE AND PURPOSE (Craft & Structure)
**Frequency**: ~2-3 questions per test

**Question Stems**:
- "Which choice best states the main purpose of the text?"
- "Which choice best describes the overall structure of the text?"
- "Which choice best describes the function of the underlined sentence?"

**Passage Format**: Complete short passage (75-150 words)

**Example**:
```
[Passage about an artist's technique]

Which choice best describes the function of the underlined portion
in the text as a whole?

A) It establishes a context for portraying the brutality of war.
B) It introduces a contrast between expectations and reality.
C) It serves as an example showing disorientation.
D) It serves as a transition to describe the setting.
```

**Generation Guidelines**:
- Passages should have clear organizational structure
- Test understanding of rhetorical purpose, not content
- Functions include: introduce, contrast, illustrate, qualify, transition

---

### 3. CROSS-TEXT CONNECTIONS (Craft & Structure)
**Frequency**: ~1 question per test (rarest type)

**Question Stems**:
- "Based on the texts, how would the author of Text 2 most likely respond to [claim from Text 1]?"
- "Based on the texts, both authors would most likely agree with which statement?"

**Passage Format**: Two short passages (Text 1 and Text 2) on the same topic

**Example**:
```
Text 1:
[Position A on a topic - 50-75 words]

Text 2:
[Position B on the same topic - 50-75 words]

Based on the texts, how would the author of Text 2 most likely
respond to the claim in Text 1 that [specific claim]?
```

**Generation Guidelines**:
- Texts must relate to the same topic
- Clear points of agreement or disagreement
- Test comparison/contrast skills
- Don't require outside knowledge

---

### 4. CENTRAL IDEAS AND DETAILS (Information & Ideas)
**Frequency**: ~4-5 questions per test

**Question Stems**:
- "Which choice best states the main idea of the text?"
- "According to the text, what is [specific detail]?"
- "Based on the text, [specific comprehension question]?"

**Passage Format**: Complete passage (75-150 words)

**Example**:
```
[Passage about a scientific discovery or historical event]

Which choice best states the main idea of the text?

A) [Summary focusing on one aspect]
B) [Summary focusing on another aspect]
C) [Correct comprehensive summary]
D) [Summary that goes beyond the text]
```

**Generation Guidelines**:
- Main idea should be clearly supported
- Detail questions should reference specific textual evidence
- Distractors may be true but not the main point
- Don't require inference (that's a separate skill)

---

### 5. COMMAND OF EVIDENCE - TEXTUAL (Information & Ideas)
**Frequency**: ~4 questions per test

**Question Stems**:
- "Which choice best supports the claim that [X]?"
- "Which finding, if true, would most directly support the hypothesis?"
- "Which quotation from [author] most effectively illustrates the claim?"

**Passage Format**: Passage presenting a claim or hypothesis + answer choices with evidence

**Example - Scientific**:
```
[Passage presenting a researcher's hypothesis about animal behavior]

Which finding, if true, would most directly support the researcher's
hypothesis?

A) [Finding that doesn't relate]
B) [Finding that partially supports]
C) [Finding that directly supports]
D) [Finding that contradicts]
```

**Example - Literary**:
```
[Claim about an author's work]

Which quotation from [Author's work] most effectively illustrates
the claim?

A) "[Quote 1]"
B) "[Quote 2]"
C) "[Quote 3]"
D) "[Quote 4]"
```

**Generation Guidelines**:
- Scientific: Present hypothesis, test ability to identify supporting data
- Literary: Present claim about text, provide quote options
- Evidence must directly (not tangentially) support claim

---

### 6. COMMAND OF EVIDENCE - QUANTITATIVE (Information & Ideas)
**Frequency**: ~3-4 questions per test

**Question Stems**:
- "Which choice most effectively uses data from the [table/graph] to complete the text?"
- "Which choice most effectively uses data from the [table/graph] to support the claim?"

**Passage Format**: Short passage + table/bar graph/line graph

**Example**:
```
[Short passage introducing a study or data context]

[TABLE or GRAPH with relevant data]

Which choice most effectively uses data from the table to complete
the text?

A) [Statement using data point A]
B) [Statement using data point B]
C) [Correct statement accurately using data]
D) [Statement misusing or misinterpreting data]
```

**Generation Guidelines**:
- Include simple tables, bar graphs, or line graphs
- Data should be straightforward to read
- Test accurate interpretation and appropriate use
- Distractors may misread or overstate data

---

### 7. INFERENCES (Information & Ideas)
**Frequency**: ~3-4 questions per test

**Question Stems**:
- "Which choice most logically completes the text?"
- "Based on the text, what can most reasonably be inferred about [X]?"

**Passage Format**: Passage with incomplete thought or implicit information

**Example**:
```
[Passage presenting information that leads to a logical conclusion]

Based on the text, what can most reasonably be inferred about
the researcher's findings?

A) [Inference not supported]
B) [Inference too broad]
C) [Correct logical inference]
D) [Inference contradicted by text]
```

**Generation Guidelines**:
- Inference must be directly supported by text
- Don't require "reading between the lines" too deeply
- Stay close to the text; straightforward inferences
- Distractors either overreach or contradict

---

### 8. TRANSITIONS (Expression of Ideas)
**Frequency**: ~5-6 questions per test

**Question Stem**:
- "Which choice completes the text with the most logical transition?"

**Passage Format**: 2-3 sentences with a blank for the transition word/phrase

**Example**:
```
Researchers Helena Mihaljević-Brandt, Lucía Santamaría, and Marco
Tullney report that while mathematicians may have traditionally
worked alone, evidence points to a shift in the opposite direction.
_______ mathematicians are choosing to collaborate with their
peers—a trend illustrated by a rise in the number of mathematics
publications credited to multiple authors.

Which choice completes the text with the most logical transition?

A) Similarly,
B) For this reason,
C) Furthermore,
D) Increasingly,
```

**Transition Categories to Test**:
| Category | Examples |
|----------|----------|
| Addition/Continuation | Furthermore, Moreover, Additionally, In addition |
| Contrast | However, Nevertheless, Conversely, On the other hand |
| Cause/Effect | Therefore, Consequently, As a result, Thus |
| Example/Illustration | For example, For instance, Specifically |
| Sequence/Time | Subsequently, Previously, Meanwhile, Increasingly |
| Comparison | Similarly, Likewise, In comparison |
| Concession | Although, Despite, Admittedly, Granted |
| Emphasis | Indeed, In fact, Certainly |

**Generation Guidelines**:
- Context must clearly indicate relationship type
- Only one transition should fit logically
- Test understanding of idea relationships
- Look for clue words that indicate the relationship

---

### 9. RHETORICAL SYNTHESIS (Expression of Ideas)
**Frequency**: ~5-6 questions per test

**Question Stem**:
- "Which choice most effectively uses relevant information from the notes to accomplish this goal?"

**Passage Format**: Bullet-pointed student notes + specific writing goal

**Example**:
```
While researching a topic, a student has taken the following notes:

• In 2019, researchers published a study on migratory birds.
• The study tracked 50 species across three continents.
• Species that traveled longer distances showed greater genetic diversity.
• The researchers suggested this diversity results from exposure to
  varied environments.
• Dr. Sarah Chen led the research team at Oxford University.

The student wants to emphasize the study's key finding. Which choice
most effectively uses relevant information from the notes to
accomplish this goal?

A) Dr. Sarah Chen led a study at Oxford University that tracked
   50 bird species.
B) The 2019 study found that migratory birds traveling longer
   distances exhibited greater genetic diversity.
C) Researchers tracked migratory birds across three continents in 2019.
D) According to the researchers, genetic diversity may result from
   environmental exposure.
```

**Common Writing Goals**:
- Emphasize the key finding/main result
- Introduce the topic to an unfamiliar audience
- Compare two aspects of the research
- Contrast two findings
- Present a cause-and-effect relationship
- Highlight the researcher's background

**Generation Guidelines**:
- Include 4-6 bullet points with varied information
- State a clear rhetorical goal
- Correct answer directly accomplishes the stated goal
- Distractors use notes but don't match the goal

---

### 10. BOUNDARIES (Standard English Conventions)
**Frequency**: ~5-6 questions per test

**Question Stem**:
- "Which choice completes the text so that it conforms to the conventions of Standard English?"

**Passage Format**: Passage with blank requiring punctuation choice

**Focus Areas**:
- Comma usage (lists, introductory phrases, nonessential clauses)
- Semicolons (joining independent clauses)
- Colons (introducing lists, explanations)
- Periods (avoiding run-ons and comma splices)
- Dashes (setting off nonessential information)

**Example**:
```
Archaeologist Laila Nehmé recently traveled to Hegra to study its
ancient _______ into the rocky outcrops of a vast desert, these
burial chambers seem to blend seamlessly with nature.

Which choice completes the text so that it conforms to the
conventions of Standard English?

A) tombs. Carved
B) tombs, carved
C) tombs; carved
D) tombs carved
```

**Key Rules to Test**:
1. **Comma splices are always wrong**: Two independent clauses cannot be joined by just a comma
2. **Semicolons join independent clauses**: Each side must be a complete sentence
3. **Colons follow complete sentences**: Must introduce a list or explanation
4. **Fragments are wrong**: Every sentence needs subject + verb + complete thought
5. **Nonessential info needs matching punctuation**: Two commas, two dashes, or two parentheses

**Generation Guidelines**:
- Test one punctuation rule per question
- Answer choices differ primarily in punctuation
- Create clear independent vs. dependent clause distinctions
- Include common error types (comma splice, run-on, fragment)

---

### 11. FORM, STRUCTURE, AND SENSE (Standard English Conventions)
**Frequency**: ~7-8 questions per test (second highest frequency)

**Question Stem**:
- "Which choice completes the text so that it conforms to the conventions of Standard English?"

**Focus Areas**:
- Subject-verb agreement
- Pronoun-antecedent agreement
- Verb tense/form consistency
- Modifier placement (dangling/misplaced modifiers)
- Parallel structure
- Possessives vs. plurals

**Example - Subject-Verb Agreement**:
```
The vest frottoir, _______ a wearable washboard that is played by
rubbing spoons or bottle openers against it.

Which choice completes the text so that it conforms to the
conventions of Standard English?

A) are
B) is
C) were
D) being
```

**Example - Modifier Placement**:
```
_______ the Mayan ruins, the archaeologist discovered ancient pottery
fragments scattered across the excavation site.

Which choice completes the text so that it conforms to the
conventions of Standard English?

A) Exploring carefully,
B) While carefully exploring
C) Having been explored,
D) The careful exploration of
```

**Key Rules to Test**:

1. **Subject-Verb Agreement**:
   - Ignore interrupters between subject and verb
   - "Each," "every," "anyone," "everyone" = singular
   - Compound subjects with "or"/"nor" = match nearest subject
   - Collective nouns typically singular (team, company)

2. **Pronoun-Antecedent Agreement**:
   - Pronoun must match antecedent in number
   - Avoid ambiguous antecedents
   - "It," "they" must have clear referents

3. **Verb Tense Consistency**:
   - Maintain consistent tense within passage
   - Shift only when time changes
   - Perfect tenses for completed actions

4. **Modifiers**:
   - Modifier must be next to what it modifies
   - Dangling: no clear subject to modify
   - Misplaced: modifies wrong element

5. **Parallel Structure**:
   - Lists must use same grammatical form
   - "Running, swimming, and biking" (not "to bike")

**Generation Guidelines**:
- Isolate one grammar rule per question
- Use interrupters to complicate subject-verb questions
- Include clear right/wrong distinctions
- Test common SAT error patterns

---

## Worksheet Formatting Standards

### Document Structure
```
[HEADER: TKO PREP - SAT Reading & Writing Practice]

[WORKSHEET TITLE: e.g., "Transitions Practice - Set 1"]
[SKILL FOCUS: e.g., "Expression of Ideas: Transitions"]
[QUESTION COUNT: e.g., "10 Questions"]

[INSTRUCTIONS]

[QUESTIONS - numbered 1-10 or as specified]

[PAGE BREAK for Answer Key]

[ANSWER KEY with explanations]
```

### Question Formatting
```
[Question Number].
[Passage text - indented or in a visible box]

[Question stem]

A) [Choice A]
B) [Choice B]
C) [Choice C]
D) [Choice D]

[Space for student answer: ___]
```

### For Quantitative Questions
- Tables: Clear headers, borders, readable data
- Graphs: Labeled axes, legend if needed, source note

### Answer Key Format
```
ANSWER KEY

1. [Correct Letter] - [Brief explanation of why correct]
   Why not [Wrong Letter]: [Brief explanation of error]

2. [Continue format...]
```

---

## Difficulty Calibration

### Easy Questions
- Clear, direct passages
- Obvious answer with less tempting distractors
- Common vocabulary
- Straightforward grammar rules
- No complex interrupters

### Medium Questions
- More nuanced passages
- Closer distractors
- Academic vocabulary
- Combined concepts
- Some complexity in sentence structure

### Hard Questions
- Complex, layered passages
- Very tempting wrong answers
- Sophisticated vocabulary
- Multiple grammar concepts
- Long sentences with multiple interrupters
- Subtle rhetorical purposes

---

## Quality Checklist

Before finalizing any worksheet:

- [ ] Passage length is 25-150 words
- [ ] Only ONE clearly correct answer per question
- [ ] Distractors are plausible but definitively wrong
- [ ] Question matches authentic SAT phrasing
- [ ] No outside knowledge required
- [ ] Grammar rules are correctly applied
- [ ] Explanations are clear and educational
- [ ] Format matches digital SAT style
- [ ] Difficulty is appropriately calibrated
- [ ] No typos or errors in passages/questions

---

## Sample Worksheet Template (JavaScript/docx-js)

```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, HeadingLevel, PageBreak } = require('docx');
const fs = require('fs');

// Question data structure
const questions = [
  {
    number: 1,
    passage: "Your passage text here...",
    question: "Which choice completes the text with the most logical transition?",
    choices: {
      A: "However,",
      B: "Therefore,",
      C: "Similarly,",
      D: "For instance,"
    },
    correct: "B",
    explanation: "The second sentence shows a result of the first, so 'Therefore' indicates cause-effect."
  }
  // ... more questions
];

// Create document
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 24 }  // 12pt
      }
    }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // Header
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "TKO PREP", bold: true, size: 28 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "SAT Reading & Writing Practice", size: 24 })]
      }),
      new Paragraph({ children: [] }),  // Spacer

      // Title
      new Paragraph({
        children: [new TextRun({ text: "Transitions Practice - Set 1", bold: true, size: 28 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: "Skill: Expression of Ideas", italics: true })]
      }),
      new Paragraph({ children: [] }),

      // Instructions
      new Paragraph({
        children: [new TextRun({
          text: "Instructions: Choose the answer that best completes each passage.",
          italics: true
        })]
      }),
      new Paragraph({ children: [] }),

      // Questions (loop through questions array and add formatted paragraphs)
      ...questions.flatMap((q, i) => [
        new Paragraph({
          children: [new TextRun({ text: `${q.number}. `, bold: true })]
        }),
        new Paragraph({
          indent: { left: 720 },
          children: [new TextRun({ text: q.passage })]
        }),
        new Paragraph({ children: [] }),
        new Paragraph({
          children: [new TextRun({ text: q.question, italics: true })]
        }),
        new Paragraph({ children: [] }),
        ...Object.entries(q.choices).map(([letter, text]) =>
          new Paragraph({
            indent: { left: 720 },
            children: [new TextRun({ text: `${letter}) ${text}` })]
          })
        ),
        new Paragraph({ children: [] }),
        new Paragraph({
          children: [new TextRun({ text: "Answer: _____" })]
        }),
        new Paragraph({ children: [] }),
        new Paragraph({ children: [] })
      ]),

      // Page break before answer key
      new Paragraph({ children: [new PageBreak()] }),

      // Answer Key
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "ANSWER KEY", bold: true, size: 28 })]
      }),
      new Paragraph({ children: [] }),

      ...questions.flatMap(q => [
        new Paragraph({
          children: [
            new TextRun({ text: `${q.number}. ${q.correct}`, bold: true }),
            new TextRun({ text: ` - ${q.explanation}` })
          ]
        }),
        new Paragraph({ children: [] })
      ])
    ]
  }]
});

// Save document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/mnt/user-data/outputs/transitions_practice.docx', buffer);
});
```

---

## Usage Notes

1. **Generate worksheets by skill type** - Focus on one question type per worksheet for targeted practice
2. **Include mixed practice** - Also create comprehensive worksheets with all question types
3. **Vary difficulty** - Create separate easy, medium, and hard versions
4. **Match authentic format** - Use exact SAT question stems and answer choice formatting
5. **Provide detailed explanations** - Answer keys should teach, not just provide correct answers
6. **Test before delivery** - Verify all answers are definitively correct and explanations are accurate

---

## Common Mistakes to Avoid

1. **Multiple correct answers** - Every question must have exactly one defensible answer
2. **Outside knowledge required** - All information should be in the passage
3. **Unrealistic passages** - Match SAT academic tone and length
4. **Wrong question stems** - Use exact SAT phrasing
5. **Poor distractors** - Wrong answers should be tempting but clearly wrong upon analysis
6. **Grammar errors in passages** - Unless testing that specific error
7. **Inconsistent formatting** - Maintain professional, consistent layout

---

## Integration with Math Worksheets

This document can be appended to existing SAT Math worksheet documentation. The same technical stack (docx-js) and formatting principles apply. Comprehensive practice tests should include both Reading/Writing and Math sections in the correct order and timing.
