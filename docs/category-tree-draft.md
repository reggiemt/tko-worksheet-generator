# SAT Math Worksheet Generator — Expanded Category Tree (Draft)

> **Structure:** Category → Subcategory → Sub-skill
> **ID format:** `category.subcategory.sub_skill`
> Each sub-skill includes a UI description (concise, tutor-facing).

---

## 1. ALGEBRA

### 1.1 Linear Equations — One Variable (`algebra.linear_one_var`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `algebra.linear_one_var.basic_solving` | One- & Two-Step Equations | Solve simple equations like 3x + 5 = 14 |
| `algebra.linear_one_var.multi_step` | Multi-Step Equations | Distribute, combine like terms, then solve |
| `algebra.linear_one_var.variables_both_sides` | Variables on Both Sides | Equations with variable terms on each side of the equal sign |
| `algebra.linear_one_var.with_fractions` | With Fractions | Equations with fractional coefficients requiring LCD or cross-multiplication |
| `algebra.linear_one_var.with_unknown_constants` | With Unknown Constants | Solve for x in terms of a, b, c — or find the constant that produces a given solution |
| `algebra.linear_one_var.no_solution_infinite` | Number of Solutions | Determine if an equation has one solution, no solution, or infinitely many |
| `algebra.linear_one_var.word_problems` | Word Problems | Translate real-world scenarios into one-variable linear equations and solve |

### 1.2 Linear Equations — Two Variables (`algebra.linear_two_var`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `algebra.linear_two_var.slope_from_equation` | Slope from an Equation | Identify slope from slope-intercept, point-slope, or standard form |
| `algebra.linear_two_var.slope_from_context` | Slope from Points, Tables & Graphs | Calculate slope from two points, a table of values, or a graph |
| `algebra.linear_two_var.intercepts` | Finding Intercepts | Find x- and y-intercepts from an equation or graph |
| `algebra.linear_two_var.graphing` | Graphing Linear Equations | Graph a line from its equation; identify the equation of a graphed line |
| `algebra.linear_two_var.writing_from_context` | Writing Equations from Context | Write a linear equation from a word problem or real-world scenario |
| `algebra.linear_two_var.parallel_perpendicular` | Parallel & Perpendicular Lines | Use slope relationships to write or identify parallel/perpendicular lines |
| `algebra.linear_two_var.form_conversion` | Converting Between Forms | Convert between slope-intercept, point-slope, and standard form |
| `algebra.linear_two_var.with_fractions` | With Fractions | Linear equations with fractional slopes, intercepts, or coefficients |

### 1.3 Systems of Equations (`algebra.systems`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `algebra.systems.substitution` | Solving by Substitution | Solve a system by isolating one variable and substituting |
| `algebra.systems.elimination` | Solving by Elimination | Solve a system by adding or subtracting equations to eliminate a variable |
| `algebra.systems.graphical` | Graphical Interpretation | Interpret the solution of a system as an intersection point on a graph |
| `algebra.systems.no_solution_infinite` | Number of Solutions | Determine if a system has one, zero, or infinitely many solutions |
| `algebra.systems.with_fractions` | With Fractions | Systems with fractional coefficients |
| `algebra.systems.with_unknown_constants` | With Unknown Constants | Find the value of a constant that makes a system have no/infinite solutions |
| `algebra.systems.word_problems` | Word Problems | Set up and solve a system of equations from a real-world context |

### 1.4 Inequalities (`algebra.inequalities`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `algebra.inequalities.one_variable` | One-Variable Inequalities | Solve linear inequalities (including sign-flip on multiply/divide by negative) |
| `algebra.inequalities.compound` | Compound Inequalities | Solve and graph "and" / "or" compound inequalities |
| `algebra.inequalities.graphing_number_line` | Graphing on a Number Line | Graph solution sets on a number line (open vs. closed circles) |
| `algebra.inequalities.graphing_coordinate` | Graphing on the Coordinate Plane | Graph linear inequalities as shaded half-planes |
| `algebra.inequalities.systems` | Systems of Inequalities | Identify or shade feasible regions for systems of linear inequalities |
| `algebra.inequalities.with_fractions` | With Fractions | Inequalities with fractional coefficients |
| `algebra.inequalities.word_problems` | Word Problems | Translate a constraint or real-world limit into an inequality and solve |

### 1.5 Absolute Value (`algebra.absolute_value`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `algebra.absolute_value.equations_basic` | Basic Equations | Solve |x + a| = b by splitting into two cases |
| `algebra.absolute_value.equations_multi_step` | Multi-Step Equations | Isolate the absolute value expression before splitting |
| `algebra.absolute_value.inequalities` | Inequalities | Solve |expression| < k and |expression| > k |
| `algebra.absolute_value.no_solution_extraneous` | No Solution & Extraneous Solutions | Recognize when an absolute value equation has no solution or produces extraneous roots |
| `algebra.absolute_value.word_problems` | Word Problems | Apply absolute value to tolerance, distance, and error-margin contexts |

---

## 2. ADVANCED MATH

### 2.1 Quadratics (`advanced_math.quadratics`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `advanced_math.quadratics.factoring_basic` | Factoring (a = 1) | Factor x² + bx + c into two binomials |
| `advanced_math.quadratics.factoring_advanced` | Factoring (a ≠ 1) & Special Patterns | Factor ax² + bx + c; recognize difference of squares, perfect-square trinomials |
| `advanced_math.quadratics.quadratic_formula` | Quadratic Formula | Apply the quadratic formula to find exact solutions |
| `advanced_math.quadratics.completing_square` | Completing the Square | Rewrite a quadratic by completing the square |
| `advanced_math.quadratics.vertex_form` | Vertex Form & Graphing | Convert to/from vertex form; identify vertex, axis of symmetry, direction |
| `advanced_math.quadratics.discriminant` | Discriminant & Number of Solutions | Use b² − 4ac to determine the number and type of solutions |
| `advanced_math.quadratics.with_unknown_constants` | With Unknown Constants | Find values of constants that produce a given number of solutions, vertex, or root |
| `advanced_math.quadratics.word_problems` | Word Problems | Projectile motion, area optimization, revenue/profit modeling |

### 2.2 Polynomials (`advanced_math.polynomials`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `advanced_math.polynomials.add_subtract_multiply` | Adding, Subtracting & Multiplying | Perform arithmetic operations on polynomials |
| `advanced_math.polynomials.factoring` | Factoring Higher-Degree Polynomials | Factor by grouping, sum/difference of cubes, GCF extraction |
| `advanced_math.polynomials.finding_zeros` | Finding Zeros & Roots | Find zeros of a polynomial from factored or expanded form |
| `advanced_math.polynomials.remainder_factor_theorem` | Remainder & Factor Theorems | Use synthetic division; determine if (x − a) is a factor |
| `advanced_math.polynomials.end_behavior` | End Behavior | Determine end behavior from the leading term |
| `advanced_math.polynomials.graph_interpretation` | Graph Interpretation | Read zeros, multiplicity, and turning points from a polynomial graph |

### 2.3 Rational Expressions (`advanced_math.rational`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `advanced_math.rational.simplifying` | Simplifying | Factor and cancel common factors in rational expressions |
| `advanced_math.rational.multiply_divide` | Multiplying & Dividing | Multiply and divide rational expressions (factor first) |
| `advanced_math.rational.add_subtract` | Adding & Subtracting | Find LCD and combine rational expressions |
| `advanced_math.rational.solving_equations` | Solving Rational Equations | Solve equations containing rational expressions |
| `advanced_math.rational.extraneous_solutions` | Extraneous Solutions | Check solutions against domain restrictions |
| `advanced_math.rational.word_problems` | Word Problems | Work/rate problems and other real-world rational equation setups |

### 2.4 Radicals & Exponents (`advanced_math.radicals_exponents`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `advanced_math.radicals_exponents.exponent_rules` | Exponent Rules | Apply product, quotient, and power rules for exponents |
| `advanced_math.radicals_exponents.negative_zero_exponents` | Negative & Zero Exponents | Simplify expressions with negative or zero exponents |
| `advanced_math.radicals_exponents.rational_exponents` | Rational Exponents | Convert between radical and rational exponent notation; simplify |
| `advanced_math.radicals_exponents.simplifying_radicals` | Simplifying Radicals | Simplify square roots, cube roots; rationalize denominators |
| `advanced_math.radicals_exponents.solving_radical_equations` | Solving Radical Equations | Isolate a radical and solve by squaring both sides |
| `advanced_math.radicals_exponents.extraneous_solutions` | Extraneous Solutions | Identify and reject solutions introduced by squaring |

### 2.5 Exponential Functions (`advanced_math.exponential`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `advanced_math.exponential.growth_decay` | Growth & Decay Models | Identify and interpret exponential growth/decay in context |
| `advanced_math.exponential.writing_equations` | Writing Equations from Context | Write an exponential function from a table, description, or scenario |
| `advanced_math.exponential.graphing` | Graphing | Graph exponential functions; identify asymptotes, intercepts |
| `advanced_math.exponential.linear_vs_exponential` | Linear vs. Exponential | Determine whether data or a scenario is best modeled linearly or exponentially |
| `advanced_math.exponential.compound_interest` | Compound Interest & Percent Growth | Apply compound interest and repeated percent change formulas |
| `advanced_math.exponential.word_problems` | Word Problems | Population growth, depreciation, half-life, and similar contexts |

### 2.6 Functions (`advanced_math.functions`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `advanced_math.functions.notation_evaluation` | Notation & Evaluation | Evaluate f(x) for given values; interpret function notation |
| `advanced_math.functions.composition` | Composition | Compute f(g(x)) and g(f(x)) |
| `advanced_math.functions.domain_range` | Domain & Range | Determine domain and range from equations or graphs |
| `advanced_math.functions.transformations` | Transformations | Apply shifts, reflections, and stretches to function graphs |
| `advanced_math.functions.graph_interpretation` | Graph Interpretation | Read increasing/decreasing intervals, maxima/minima, zeros from a graph |
| `advanced_math.functions.inverse` | Inverse Functions | Find or interpret inverse functions; reflect across y = x |
| `advanced_math.functions.nonlinear_systems` | Nonlinear Systems | Solve a system where one equation is linear and one is nonlinear (e.g., line meets parabola) |

---

## 3. PROBLEM-SOLVING & DATA ANALYSIS

### 3.1 Ratios & Rates (`data_analysis.ratios_rates`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `data_analysis.ratios_rates.unit_rates` | Unit Rates | Calculate and compare unit rates |
| `data_analysis.ratios_rates.proportions` | Setting Up & Solving Proportions | Write and cross-multiply proportions |
| `data_analysis.ratios_rates.scaling` | Scale & Scale Drawings | Use scale factors to find actual or model measurements |
| `data_analysis.ratios_rates.direct_variation` | Direct Variation | Identify and apply y = kx relationships |
| `data_analysis.ratios_rates.inverse_variation` | Inverse Variation | Identify and apply xy = k relationships |
| `data_analysis.ratios_rates.word_problems` | Word Problems | Ratios and rates in real-world contexts (recipes, speed, density) |

### 3.2 Percentages (`data_analysis.percentages`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `data_analysis.percentages.of_quantity` | Percent of a Quantity | Find a given percent of a number, or find the whole given a part |
| `data_analysis.percentages.percent_change` | Percent Increase & Decrease | Calculate percent change between two values |
| `data_analysis.percentages.successive` | Successive Percent Changes | Apply back-to-back percent changes (e.g., two consecutive discounts) |
| `data_analysis.percentages.tax_tip_discount` | Tax, Tip, Discount & Markup | Calculate final prices after markups, discounts, tax, or gratuity |
| `data_analysis.percentages.word_problems` | Word Problems | Multi-step percent problems in real-world contexts |

### 3.3 Units & Conversions (`data_analysis.units`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `data_analysis.units.single_conversion` | Single-Step Conversions | Convert between units using a single conversion factor |
| `data_analysis.units.dimensional_analysis` | Multi-Step Dimensional Analysis | Chain multiple conversion factors to convert complex units |
| `data_analysis.units.rate_conversion` | Rate Conversion | Convert compound rates (e.g., miles/hour → feet/second) |
| `data_analysis.units.word_problems` | Word Problems | Unit conversion embedded in real-world problem contexts |

### 3.4 Data Interpretation (`data_analysis.interpretation`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `data_analysis.interpretation.tables` | Tables | Read and extract information from data tables |
| `data_analysis.interpretation.bar_line_graphs` | Bar Graphs & Line Graphs | Interpret values, trends, and comparisons from bar and line graphs |
| `data_analysis.interpretation.histograms` | Histograms | Read frequencies, intervals, and shapes from histograms |
| `data_analysis.interpretation.scatterplots` | Scatterplots | Describe associations, identify outliers, and read data points |
| `data_analysis.interpretation.line_of_best_fit` | Line of Best Fit | Interpret slope and intercept of a regression line; make predictions |
| `data_analysis.interpretation.two_way_tables` | Two-Way Frequency Tables | Read joint, marginal, and conditional frequencies from two-way tables |

### 3.5 Statistics (`data_analysis.statistics`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `data_analysis.statistics.mean_median_mode` | Mean, Median & Mode | Calculate and interpret measures of center |
| `data_analysis.statistics.range_spread` | Range, IQR & Spread | Calculate and interpret measures of variability |
| `data_analysis.statistics.standard_deviation` | Standard Deviation (Conceptual) | Compare standard deviations without calculating; understand what affects spread |
| `data_analysis.statistics.comparing_distributions` | Comparing Distributions | Compare center and spread across two data sets |
| `data_analysis.statistics.outlier_effects` | Effects of Outliers | Determine how adding/removing outliers changes mean, median, range, SD |
| `data_analysis.statistics.box_dot_plots` | Box Plots & Dot Plots | Read and interpret box plots and dot plots |

### 3.6 Probability (`data_analysis.probability`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `data_analysis.probability.basic` | Basic Probability | Calculate P(event) as favorable/total outcomes |
| `data_analysis.probability.conditional` | Conditional Probability | Calculate probability given a condition; use two-way table data |
| `data_analysis.probability.from_tables` | Probability from Tables | Compute probabilities from provided frequency or relative-frequency tables |
| `data_analysis.probability.sampling_bias` | Sampling Methods & Bias | Identify random vs. biased samples; evaluate survey methods |
| `data_analysis.probability.margin_of_error` | Margin of Error & Confidence | Interpret confidence intervals and margin of error in context |
| `data_analysis.probability.experimental_design` | Experimental Design | Distinguish observational studies from experiments; understand randomization |

---

## 4. GEOMETRY & TRIGONOMETRY

### 4.1 Area & Perimeter (`geometry.area_perimeter`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `geometry.area_perimeter.rectangles_parallelograms` | Rectangles & Parallelograms | Area and perimeter of rectangles, squares, and parallelograms |
| `geometry.area_perimeter.triangles` | Triangles | Area and perimeter of triangles (including with height drawn) |
| `geometry.area_perimeter.trapezoids` | Trapezoids | Area of trapezoids using the formula A = ½(b₁ + b₂)h |
| `geometry.area_perimeter.circles` | Circles — Circumference & Area | Calculate circumference and area of circles |
| `geometry.area_perimeter.composite_figures` | Composite & Shaded Figures | Find area/perimeter of irregular shapes by combining or subtracting regions |
| `geometry.area_perimeter.word_problems` | Word Problems | Area and perimeter in real-world contexts (flooring, fencing, painting) |

### 4.2 Volume & Surface Area (`geometry.volume_surface`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `geometry.volume_surface.prisms` | Prisms | Volume and surface area of rectangular and triangular prisms |
| `geometry.volume_surface.cylinders` | Cylinders | Volume and surface area of cylinders |
| `geometry.volume_surface.cones` | Cones | Volume of cones (V = ⅓πr²h) |
| `geometry.volume_surface.spheres` | Spheres | Volume and surface area of spheres |
| `geometry.volume_surface.pyramids` | Pyramids | Volume of pyramids (V = ⅓Bh) |
| `geometry.volume_surface.word_problems` | Word Problems | Volume and surface area in real-world contexts (containers, tanks, packaging) |

### 4.3 Lines, Angles & Triangles (`geometry.lines_angles_triangles`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `geometry.lines_angles_triangles.angle_relationships` | Angle Relationships | Complementary, supplementary, vertical, and adjacent angles |
| `geometry.lines_angles_triangles.parallel_transversal` | Parallel Lines & Transversals | Identify corresponding, alternate interior/exterior, and co-interior angles |
| `geometry.lines_angles_triangles.triangle_angles` | Triangle Angle Sum & Exterior Angles | Use the 180° rule and exterior angle theorem |
| `geometry.lines_angles_triangles.similar_triangles` | Similar Triangles | Set up and solve proportions from similar triangles; AA similarity |
| `geometry.lines_angles_triangles.congruence` | Congruent Triangles | Identify congruence criteria (SSS, SAS, ASA, AAS) and apply |
| `geometry.lines_angles_triangles.special_right_triangles` | Special Right Triangles | Apply 30-60-90 and 45-45-90 side ratios |
| `geometry.lines_angles_triangles.pythagorean_theorem` | Pythagorean Theorem | Apply a² + b² = c² to find missing side lengths |
| `geometry.lines_angles_triangles.word_problems` | Word Problems | Angle and triangle problems in real-world contexts |

### 4.4 Right Triangle Trigonometry (`geometry.right_triangle_trig`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `geometry.right_triangle_trig.soh_cah_toa` | SOH-CAH-TOA Setup | Identify opposite, adjacent, hypotenuse and write the correct trig ratio |
| `geometry.right_triangle_trig.find_side` | Solving for a Side | Use sin/cos/tan to find an unknown side length |
| `geometry.right_triangle_trig.find_angle` | Solving for an Angle | Use inverse trig functions to find an unknown angle |
| `geometry.right_triangle_trig.complementary_angles` | Complementary Angle Relationship | sin(x) = cos(90° − x) and related identities |
| `geometry.right_triangle_trig.word_problems` | Word Problems | Angle of elevation/depression, ladder problems, shadow problems |

### 4.5 Circles (`geometry.circles`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `geometry.circles.arc_length` | Arc Length | Calculate arc length using the central angle proportion |
| `geometry.circles.sector_area` | Sector Area | Calculate the area of a sector |
| `geometry.circles.central_inscribed_angles` | Central & Inscribed Angles | Relate central angles, inscribed angles, and intercepted arcs |
| `geometry.circles.tangent_lines` | Tangent Lines | Apply properties of tangent lines (perpendicular to radius at point of tangency) |
| `geometry.circles.equation_standard` | Circle Equations — Standard Form | Write and interpret (x − h)² + (y − k)² = r² |
| `geometry.circles.equation_general` | Circle Equations — Completing the Square | Convert general form to standard form by completing the square |

### 4.6 Coordinate Geometry (`geometry.coordinate`)

| Sub-skill ID | Name | UI Description |
|---|---|---|
| `geometry.coordinate.distance` | Distance Formula | Find the distance between two points |
| `geometry.coordinate.midpoint` | Midpoint Formula | Find the midpoint of a segment |
| `geometry.coordinate.line_equations` | Equations of Lines | Write equations of lines through given points or with given conditions |
| `geometry.coordinate.transformations` | Coordinate Transformations | Apply translations, reflections, rotations, and dilations on the coordinate plane |
| `geometry.coordinate.word_problems` | Word Problems | Coordinate geometry applied to real-world mapping and distance problems |

---

## Summary Statistics

| Category | Subcategories | Total Sub-skills |
|---|---|---|
| Algebra | 5 | 33 |
| Advanced Math | 6 | 39 |
| Problem-Solving & Data Analysis | 6 | 33 |
| Geometry & Trigonometry | 6 | 35 |
| **Total** | **23** | **140** |

---

## Design Notes

### "With Fractions" Placement
Applied to topics where fractional coefficients create a meaningfully harder variant that tutors specifically want to drill:
- ✅ `algebra.linear_one_var.with_fractions` — LCD and cross-multiplication
- ✅ `algebra.linear_two_var.with_fractions` — fractional slopes/intercepts
- ✅ `algebra.systems.with_fractions` — fractional coefficients in systems
- ✅ `algebra.inequalities.with_fractions` — fraction + sign-flip interaction
- ❌ Not applied to: Data Analysis, Probability, Geometry (fractions appear naturally but aren't a distinct SAT-tested skill)

### "With Unknown Constants" Placement
Applied to topics where the SAT regularly asks "for what value of k…" or "in terms of a":
- ✅ `algebra.linear_one_var.with_unknown_constants` — solve in terms of constants
- ✅ `algebra.systems.with_unknown_constants` — find k for no/infinite solutions
- ✅ `advanced_math.quadratics.with_unknown_constants` — discriminant-based constant problems
- ❌ Not applied to: Data Analysis, Geometry, Probability, Statistics (constants don't appear as a tested pattern)

### "Word Problems" Placement
Applied to nearly every subcategory where context-based problem setup is a distinct skill:
- ✅ All Algebra subcategories
- ✅ Most Advanced Math subcategories
- ✅ Most Data Analysis subcategories (where "context" is the default mode, word_problems emphasizes multi-step setups)
- ✅ Most Geometry subcategories
- ❌ Not applied to: `data_analysis.interpretation`, `data_analysis.statistics`, `data_analysis.probability` — these are inherently contextual

### Multi-Select UX Implications
- A tutor can pick `algebra.linear_one_var.basic_solving` + `algebra.linear_one_var.with_fractions` to generate a mixed worksheet
- Or pick all sub-skills under `algebra.systems` for a comprehensive systems review
- The generator should support "select all" at both the subcategory and category levels
