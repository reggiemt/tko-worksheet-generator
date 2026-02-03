export interface Subcategory {
  id: string;
  name: string;
  description: string;
  tag: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export const MATH_CATEGORIES: Category[] = [
  {
    id: "algebra",
    name: "Algebra",
    subcategories: [
      {
        id: "linear_one_var",
        name: "Linear Equations (One Variable)",
        description: "Solving, simplifying, interpreting solutions",
        tag: "algebra.linear_one_var",
      },
      {
        id: "linear_two_var",
        name: "Linear Equations (Two Variables)",
        description: "Slope, intercepts, graphing, writing equations from context",
        tag: "algebra.linear_two_var",
      },
      {
        id: "systems",
        name: "Systems of Equations",
        description: "Substitution, elimination, graphical solutions, number of solutions",
        tag: "algebra.systems",
      },
      {
        id: "inequalities",
        name: "Inequalities",
        description: "Linear inequalities, compound inequalities, graphing",
        tag: "algebra.inequalities",
      },
      {
        id: "absolute_value",
        name: "Absolute Value",
        description: "Equations and inequalities with absolute value",
        tag: "algebra.absolute_value",
      },
    ],
  },
  {
    id: "advanced",
    name: "Advanced Math",
    subcategories: [
      {
        id: "quadratics",
        name: "Quadratics",
        description: "Factoring, completing square, quadratic formula, vertex form, parabolas",
        tag: "advanced.quadratics",
      },
      {
        id: "polynomials",
        name: "Polynomials",
        description: "Operations, factoring higher-degree, finding roots",
        tag: "advanced.polynomials",
      },
      {
        id: "rational",
        name: "Rational Expressions",
        description: "Simplifying, multiplying/dividing, solving rational equations",
        tag: "advanced.rational",
      },
      {
        id: "radicals_exponents",
        name: "Radicals & Exponents",
        description: "Simplifying radicals, rational exponents, radical equations",
        tag: "advanced.radicals_exponents",
      },
      {
        id: "exponential",
        name: "Exponential Functions",
        description: "Growth/decay modeling, graphing, linear vs exponential comparison",
        tag: "advanced.exponential",
      },
      {
        id: "functions",
        name: "Functions",
        description: "Notation, composition, graph interpretation, transformations",
        tag: "advanced.functions",
      },
    ],
  },
  {
    id: "data",
    name: "Problem-Solving & Data Analysis",
    subcategories: [
      {
        id: "ratios_rates",
        name: "Ratios & Rates",
        description: "Unit rates, scaling, direct/inverse variation",
        tag: "data.ratios_rates",
      },
      {
        id: "percentages",
        name: "Percentages",
        description: "Percent change, percent of quantity, multi-step percent problems",
        tag: "data.percentages",
      },
      {
        id: "units",
        name: "Units & Conversions",
        description: "Dimensional analysis, unit conversion",
        tag: "data.units",
      },
      {
        id: "interpretation",
        name: "Data Interpretation",
        description: "Tables, bar graphs, histograms, scatterplots, line graphs",
        tag: "data.interpretation",
      },
      {
        id: "statistics",
        name: "Statistics",
        description: "Mean, median, mode, range, standard deviation, comparing distributions",
        tag: "data.statistics",
      },
      {
        id: "probability",
        name: "Probability",
        description: "Basic/conditional probability, sampling, margin of error, surveys",
        tag: "data.probability",
      },
    ],
  },
  {
    id: "geometry",
    name: "Geometry & Trigonometry",
    subcategories: [
      {
        id: "area_perimeter",
        name: "Area & Perimeter",
        description: "Polygons, circles, composite figures",
        tag: "geometry.area_perimeter",
      },
      {
        id: "volume_surface",
        name: "Volume & Surface Area",
        description: "Prisms, cylinders, cones, spheres, pyramids",
        tag: "geometry.volume_surface",
      },
      {
        id: "lines_angles_triangles",
        name: "Lines, Angles & Triangles",
        description: "Parallel lines, transversals, triangle properties, similarity, congruence",
        tag: "geometry.lines_angles_triangles",
      },
      {
        id: "right_triangle_trig",
        name: "Right Triangle Trig",
        description: "Sine, cosine, tangent, solving for sides/angles",
        tag: "geometry.right_triangle_trig",
      },
      {
        id: "circles",
        name: "Circles",
        description: "Arc length, sector area, central/inscribed angles, circle equations",
        tag: "geometry.circles",
      },
      {
        id: "coordinate",
        name: "Coordinate Geometry",
        description: "Distance, midpoint, line equations, transformations",
        tag: "geometry.coordinate",
      },
    ],
  },
];

export function getCategoryById(id: string): Category | undefined {
  return MATH_CATEGORIES.find((cat) => cat.id === id);
}

export function getSubcategoryById(
  categoryId: string,
  subcategoryId: string
): Subcategory | undefined {
  const category = getCategoryById(categoryId);
  return category?.subcategories.find((sub) => sub.id === subcategoryId);
}

export function getSubcategoryName(categoryId: string, subcategoryId: string): string {
  const subcategory = getSubcategoryById(categoryId, subcategoryId);
  return subcategory?.name ?? subcategoryId;
}
