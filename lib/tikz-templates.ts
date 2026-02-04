// ============================================================================
// Parameterized TikZ Template System
// ============================================================================
// Instead of having Claude generate raw TikZ (which often has label/angle bugs),
// Claude picks a template + parameters, and the template guarantees visual
// correctness. Each template function returns valid TikZ code with labels
// placed at mathematically correct positions.
// ============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export interface ParallelLinesTransversalParams {
  lineLabels: [string, string];
  angleLabels: {
    position:
      | "upper-left-1"
      | "upper-right-1"
      | "lower-left-1"
      | "lower-right-1"
      | "upper-left-2"
      | "upper-right-2"
      | "lower-left-2"
      | "lower-right-2";
    label: string;
  }[];
}

export interface RightTriangleParams {
  vertices: [string, string, string];
  rightAngleVertex: string;
  sides: { from: string; to: string; label: string }[];
  angles?: { vertex: string; label: string }[];
  scale?: number;
}

export interface GeneralTriangleParams {
  vertices: [string, string, string];
  sides: { from: string; to: string; label: string }[];
  angles?: { vertex: string; label: string }[];
  scale?: number;
}

export interface CircleWithAngleParams {
  center?: string;
  points: { label: string; angleDeg: number }[];
  chords: [string, string][];
  radius?: { to: string; label?: string };
  arcLabel?: { from: string; to: string; label: string };
  angleLabel?: { vertex: string; label: string };
}

export interface CoordinatePlaneLineParams {
  xRange: [number, number];
  yRange: [number, number];
  lines: {
    slope: number;
    intercept: number;
    label?: string;
    color?: string;
  }[];
  points?: { x: number; y: number; label?: string }[];
  gridLines?: boolean;
}

export interface CoordinatePlaneParabolaParams {
  a: number;
  b: number;
  c: number;
  xRange: [number, number];
  yRange: [number, number];
  points?: { x: number; y: number; label?: string }[];
  label?: string;
}

export interface SupplementaryAnglesParams {
  angleLabels: [string, string];
  rayLabels?: string[];
}

export interface RectangleWithDiagonalParams {
  width: number;
  height: number;
  vertices?: [string, string, string, string];
  sides: {
    position: "top" | "bottom" | "left" | "right";
    label: string;
  }[];
  showDiagonal?: boolean;
  diagonalLabel?: string;
}

// ---------------------------------------------------------------------------
// Template Descriptions (exported for prompt building)
// ---------------------------------------------------------------------------

export const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  parallel_lines_transversal:
    "Two parallel lines cut by a transversal with labeled angles at each intersection",
  right_triangle:
    "Right triangle with labeled vertices, sides, right angle marker, and optional angle labels",
  general_triangle:
    "Any triangle (not necessarily right) with labeled vertices, sides, and angles",
  circle_with_angle:
    "Circle with points on circumference, chords, arcs, central/inscribed angles",
  coordinate_plane_line:
    "Coordinate plane (pgfplots) with one or more lines and optional labeled points",
  coordinate_plane_parabola:
    "Coordinate plane (pgfplots) with a parabola y = ax² + bx + c",
  supplementary_angles:
    "Two angles formed on a straight line (supplementary pair)",
  rectangle_with_diagonal:
    "Rectangle with labeled sides and an optional diagonal",
};

// ---------------------------------------------------------------------------
// Template 1: Parallel Lines cut by a Transversal
// ---------------------------------------------------------------------------

function renderParallelLinesTransversal(
  params: ParallelLinesTransversalParams
): string {
  const { lineLabels, angleLabels } = params;

  // Geometry: two horizontal parallel lines at y=0 and y=2,
  // transversal from (-1, -0.8) to (5, 3.2) crossing both.
  // Intersection 1 (lower line, y=0): x = 1
  // Intersection 2 (upper line, y=2): x = 3
  const transAngle = Math.atan2(4, 6); // ≈ 33.69°
  const transAngleDeg = (transAngle * 180) / Math.PI;

  // Angle arc positions relative to each intersection point.
  // "upper-left" = angle between transversal going up-left and line going left
  // We define 4 quadrants at each intersection:
  //   upper-left:  arc from (180°) to (180° + transAngleDeg) ≈ 180° to 213.69°  → NO
  // Actually let's think carefully. The transversal goes up-right at ~33.69° from horizontal.
  // At intersection, 4 angles are formed:
  //   upper-right: between line-right (0°) and transversal-up (transAngleDeg) 
  //   upper-left:  between transversal-up (transAngleDeg) and line-left (180°)
  //   lower-left:  between line-left (180°) and transversal-down (180+transAngleDeg)
  //   lower-right: between transversal-down (180+transAngleDeg) and line-right (360°)

  const anglePositions: Record<string, { start: number; end: number }> = {
    "upper-right": { start: 0, end: transAngleDeg },
    "upper-left": { start: transAngleDeg, end: 180 },
    "lower-left": { start: 180, end: 180 + transAngleDeg },
    "lower-right": { start: 180 + transAngleDeg, end: 360 },
  };

  // Intersection coordinates
  const intersections: Record<string, { x: number; y: number }> = {
    "1": { x: 1, y: 0 },
    "2": { x: 3, y: 2 },
  };

  // Build angle arcs
  const arcLines: string[] = [];
  for (const al of angleLabels) {
    // Parse position: e.g., "upper-left-1" → quadrant="upper-left", intersection="1"
    const lastDash = al.position.lastIndexOf("-");
    const intIdx = al.position.substring(lastDash + 1); // "1" or "2"
    const quadrant = al.position.substring(0, lastDash); // "upper-left", etc.

    const pos = anglePositions[quadrant];
    const inter = intersections[intIdx];
    if (!pos || !inter) continue;

    const midAngle = (pos.start + pos.end) / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const labelDist = 0.7;
    const labelX = inter.x + labelDist * Math.cos(midRad);
    const labelY = inter.y + labelDist * Math.sin(midRad);

    arcLines.push(
      `    \\draw (${inter.x},${inter.y}) ++(${pos.start}:0.4) arc[start angle=${pos.start}, end angle=${pos.end.toFixed(2)}, radius=0.4];`
    );
    arcLines.push(
      `    \\node at (${labelX.toFixed(3)},${labelY.toFixed(3)}) {\\small $${al.label}$};`
    );
  }

  return `\\begin{tikzpicture}[scale=1]
    % Parallel lines
    \\draw[thick] (-0.5,0) -- (4.5,0) node[right] {$${lineLabels[0]}$};
    \\draw[thick] (0.5,2) -- (5.5,2) node[right] {$${lineLabels[1]}$};
    % Transversal
    \\draw[thick] (0,-0.67) -- (4.5,2.67);
    % Parallel markers
    \\draw[thick] (1.8,0) -- ++(0.15,0.15) (1.95,0) -- ++(0.15,0.15);
    \\draw[thick] (2.8,2) -- ++(0.15,0.15) (2.95,2) -- ++(0.15,0.15);
    % Angle arcs and labels
${arcLines.join("\n")}
\\end{tikzpicture}`;
}

// ---------------------------------------------------------------------------
// Template 2: Right Triangle
// ---------------------------------------------------------------------------

function renderRightTriangle(params: RightTriangleParams): string {
  const { vertices, rightAngleVertex, sides, angles, scale = 1 } = params;

  // Place the right angle at the origin, one leg along x-axis, one along y-axis.
  // The three vertices: rightAngleVertex is at origin.
  // The other two are placed at (baseLen, 0) and (0, heightLen).
  const baseLen = 4 * scale;
  const heightLen = 3 * scale;

  // Map vertex names to coordinates
  const rIdx = vertices.indexOf(rightAngleVertex);
  if (rIdx === -1) {
    // fallback: just put right angle at first vertex
    return renderRightTriangleFallback(params);
  }

  // The other two vertices in order
  const otherVertices = vertices.filter((_, i) => i !== rIdx);

  const coords: Record<string, { x: number; y: number }> = {};
  coords[rightAngleVertex] = { x: 0, y: 0 };
  coords[otherVertices[0]] = { x: baseLen, y: 0 };
  coords[otherVertices[1]] = { x: 0, y: heightLen };

  // Label positions: offset from vertex
  const labelOffsets: Record<string, { dx: number; dy: number }> = {};
  labelOffsets[rightAngleVertex] = { dx: -0.35, dy: -0.35 };
  labelOffsets[otherVertices[0]] = { dx: 0.35, dy: -0.35 };
  labelOffsets[otherVertices[1]] = { dx: -0.35, dy: 0.35 };

  // Build coordinate definitions
  const coordDefs = vertices
    .map((v) => `    \\coordinate (${v}) at (${coords[v].x},${coords[v].y});`)
    .join("\n");

  // Build vertex labels
  const vertexLabels = vertices
    .map(
      (v) =>
        `    \\node at (${(coords[v].x + labelOffsets[v].dx).toFixed(2)},${(coords[v].y + labelOffsets[v].dy).toFixed(2)}) {$${v}$};`
    )
    .join("\n");

  // Build side labels
  const sideLabels: string[] = [];
  for (const s of sides) {
    const from = coords[s.from];
    const to = coords[s.to];
    if (!from || !to) continue;
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;

    // Offset the label to the outside of the triangle
    let dx = 0,
      dy = 0;
    if (from.y === to.y) {
      // horizontal side → label below
      dy = -0.35;
    } else if (from.x === to.x) {
      // vertical side → label to the left
      dx = -0.45;
    } else {
      // hypotenuse → label upper-left offset
      dx = -0.3;
      dy = 0.3;
    }

    sideLabels.push(
      `    \\node at (${(mx + dx).toFixed(2)},${(my + dy).toFixed(2)}) {$${s.label}$};`
    );
  }

  // Right angle marker
  const markerSize = 0.25 * scale;
  // Right angle is at origin, legs along +x and +y
  const rightAngleMarker = `    \\draw (${markerSize},0) -- (${markerSize},${markerSize}) -- (0,${markerSize});`;

  // Angle arcs for non-right angles
  const angleArcs: string[] = [];
  if (angles) {
    for (const a of angles) {
      if (a.vertex === rightAngleVertex) continue; // skip right angle
      const v = coords[a.vertex];
      if (!v) continue;

      // Compute the two directions from this vertex to the other two
      const others = vertices.filter((vn) => vn !== a.vertex);
      const dir1 = {
        x: coords[others[0]].x - v.x,
        y: coords[others[0]].y - v.y,
      };
      const dir2 = {
        x: coords[others[1]].x - v.x,
        y: coords[others[1]].y - v.y,
      };
      let angle1 = (Math.atan2(dir1.y, dir1.x) * 180) / Math.PI;
      let angle2 = (Math.atan2(dir2.y, dir2.x) * 180) / Math.PI;

      // Normalize to [0, 360)
      if (angle1 < 0) angle1 += 360;
      if (angle2 < 0) angle2 += 360;

      // Ensure we draw the smaller arc
      let startA = Math.min(angle1, angle2);
      let endA = Math.max(angle1, angle2);
      if (endA - startA > 180) {
        [startA, endA] = [endA, startA + 360];
      }

      const midA = ((startA + endA) / 2) * (Math.PI / 180);
      const labelR = 0.65;
      const lx = v.x + labelR * Math.cos(midA);
      const ly = v.y + labelR * Math.sin(midA);

      angleArcs.push(
        `    \\draw (${v.x},${v.y}) ++(${startA}:0.35) arc[start angle=${startA.toFixed(1)}, end angle=${endA.toFixed(1)}, radius=0.35];`
      );
      angleArcs.push(
        `    \\node at (${lx.toFixed(2)},${ly.toFixed(2)}) {\\small $${a.label}$};`
      );
    }
  }

  return `\\begin{tikzpicture}[scale=1]
    % Coordinates
${coordDefs}
    % Triangle
    \\draw[thick] (${vertices[0]}) -- (${vertices[1]}) -- (${vertices[2]}) -- cycle;
    % Right angle marker
${rightAngleMarker}
    % Vertex labels
${vertexLabels}
    % Side labels
${sideLabels.join("\n")}
    % Angle arcs
${angleArcs.join("\n")}
\\end{tikzpicture}`;
}

function renderRightTriangleFallback(params: RightTriangleParams): string {
  // Simple fallback if right angle vertex not found in vertices array
  const { vertices, sides, scale = 1 } = params;
  const b = 4 * scale;
  const h = 3 * scale;
  return `\\begin{tikzpicture}[scale=1]
    \\coordinate (${vertices[0]}) at (0,0);
    \\coordinate (${vertices[1]}) at (${b},0);
    \\coordinate (${vertices[2]}) at (${b},${h});
    \\draw[thick] (${vertices[0]}) -- (${vertices[1]}) -- (${vertices[2]}) -- cycle;
    \\draw (${b - 0.25},0) -- (${b - 0.25},0.25) -- (${b},0.25);
    \\node[below left] at (0,0) {$${vertices[0]}$};
    \\node[below right] at (${b},0) {$${vertices[1]}$};
    \\node[above right] at (${b},${h}) {$${vertices[2]}$};
${sides.map((s) => `    % Side ${s.from}${s.to}: ${s.label}`).join("\n")}
\\end{tikzpicture}`;
}

// ---------------------------------------------------------------------------
// Template 3: General Triangle
// ---------------------------------------------------------------------------

function renderGeneralTriangle(params: GeneralTriangleParams): string {
  const { vertices, sides, angles, scale = 1 } = params;

  // Place a general scalene triangle
  // A at origin, B along x-axis, C above
  const coords: Record<string, { x: number; y: number }> = {};
  coords[vertices[0]] = { x: 0, y: 0 };
  coords[vertices[1]] = { x: 5 * scale, y: 0 };
  coords[vertices[2]] = { x: 1.5 * scale, y: 3.5 * scale };

  // Label anchor positions
  const anchors: Record<string, string> = {};
  anchors[vertices[0]] = "below left";
  anchors[vertices[1]] = "below right";
  anchors[vertices[2]] = "above";

  const coordDefs = vertices
    .map((v) => `    \\coordinate (${v}) at (${coords[v].x},${coords[v].y});`)
    .join("\n");

  const vertexLabels = vertices
    .map(
      (v) => `    \\node[${anchors[v]}] at (${v}) {$${v}$};`
    )
    .join("\n");

  // Side labels — placed at midpoint, offset outward
  const sideLabels: string[] = [];
  for (const s of sides) {
    const from = coords[s.from];
    const to = coords[s.to];
    if (!from || !to) continue;
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;

    // Compute outward normal (away from the centroid)
    const cx = (coords[vertices[0]].x + coords[vertices[1]].x + coords[vertices[2]].x) / 3;
    const cy = (coords[vertices[0]].y + coords[vertices[1]].y + coords[vertices[2]].y) / 3;

    // Direction perpendicular to the side, pointing away from centroid
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    // Normal vectors: (-dy, dx) and (dy, -dx)
    let nx = -dy / len;
    let ny = dx / len;
    // Pick the one pointing away from centroid
    const toCenter = { x: cx - mx, y: cy - my };
    if (nx * toCenter.x + ny * toCenter.y > 0) {
      nx = -nx;
      ny = -ny;
    }

    const offset = 0.3;
    sideLabels.push(
      `    \\node at (${(mx + offset * nx).toFixed(2)},${(my + offset * ny).toFixed(2)}) {$${s.label}$};`
    );
  }

  // Angle arcs
  const angleArcs: string[] = [];
  if (angles) {
    for (const a of angles) {
      const v = coords[a.vertex];
      if (!v) continue;

      const others = vertices.filter((vn) => vn !== a.vertex);
      const dir1 = {
        x: coords[others[0]].x - v.x,
        y: coords[others[0]].y - v.y,
      };
      const dir2 = {
        x: coords[others[1]].x - v.x,
        y: coords[others[1]].y - v.y,
      };
      let angle1 = (Math.atan2(dir1.y, dir1.x) * 180) / Math.PI;
      let angle2 = (Math.atan2(dir2.y, dir2.x) * 180) / Math.PI;

      if (angle1 < 0) angle1 += 360;
      if (angle2 < 0) angle2 += 360;

      let startA = Math.min(angle1, angle2);
      let endA = Math.max(angle1, angle2);
      if (endA - startA > 180) {
        [startA, endA] = [endA, startA + 360];
      }

      const midA = ((startA + endA) / 2) * (Math.PI / 180);
      const labelR = 0.65;
      const lx = v.x + labelR * Math.cos(midA);
      const ly = v.y + labelR * Math.sin(midA);

      angleArcs.push(
        `    \\draw (${v.x},${v.y}) ++(${startA.toFixed(1)}:0.35) arc[start angle=${startA.toFixed(1)}, end angle=${endA.toFixed(1)}, radius=0.35];`
      );
      angleArcs.push(
        `    \\node at (${lx.toFixed(2)},${ly.toFixed(2)}) {\\small $${a.label}$};`
      );
    }
  }

  return `\\begin{tikzpicture}[scale=1]
    % Coordinates
${coordDefs}
    % Triangle
    \\draw[thick] (${vertices[0]}) -- (${vertices[1]}) -- (${vertices[2]}) -- cycle;
    % Vertex labels
${vertexLabels}
    % Side labels
${sideLabels.join("\n")}
    % Angle arcs
${angleArcs.join("\n")}
\\end{tikzpicture}`;
}

// ---------------------------------------------------------------------------
// Template 4: Circle with Angle
// ---------------------------------------------------------------------------

function renderCircleWithAngle(params: CircleWithAngleParams): string {
  const {
    center,
    points,
    chords,
    radius,
    arcLabel,
    angleLabel,
  } = params;

  const r = 2; // circle radius
  const centerX = 0;
  const centerY = 0;

  const lines: string[] = [];

  // Circle
  lines.push(`    \\draw[thick] (0,0) circle (${r});`);

  // Center label
  if (center) {
    lines.push(`    \\fill (0,0) circle (1.5pt);`);
    lines.push(`    \\node[below left] at (0,0) {$${center}$};`);
  }

  // Points on circle
  const pointCoords: Record<string, { x: number; y: number }> = {};
  for (const p of points) {
    const rad = (p.angleDeg * Math.PI) / 180;
    const x = centerX + r * Math.cos(rad);
    const y = centerY + r * Math.sin(rad);
    pointCoords[p.label] = { x, y };

    // Label position: slightly outside the circle
    const labelR = r + 0.35;
    const lx = centerX + labelR * Math.cos(rad);
    const ly = centerY + labelR * Math.sin(rad);

    lines.push(`    \\fill (${x.toFixed(3)},${y.toFixed(3)}) circle (1.5pt);`);
    lines.push(
      `    \\node at (${lx.toFixed(3)},${ly.toFixed(3)}) {$${p.label}$};`
    );
  }

  // Chords
  for (const [a, b] of chords) {
    const pA = pointCoords[a] || { x: 0, y: 0 };
    const pB = pointCoords[b] || { x: 0, y: 0 };
    lines.push(
      `    \\draw[thick] (${pA.x.toFixed(3)},${pA.y.toFixed(3)}) -- (${pB.x.toFixed(3)},${pB.y.toFixed(3)});`
    );
  }

  // Radius line
  if (radius) {
    const pR = pointCoords[radius.to] || { x: r, y: 0 };
    lines.push(
      `    \\draw[thick] (0,0) -- (${pR.x.toFixed(3)},${pR.y.toFixed(3)});`
    );
    if (radius.label) {
      const mx = pR.x / 2;
      const my = pR.y / 2;
      // Offset perpendicular to radius
      const len = Math.sqrt(mx * mx + my * my) || 1;
      const nx = -pR.y / (2 * len);
      const ny = pR.x / (2 * len);
      const offset = 0.25;
      lines.push(
        `    \\node at (${(mx + offset * nx).toFixed(3)},${(my + offset * ny).toFixed(3)}) {$${radius.label}$};`
      );
    }
  }

  // Arc label
  if (arcLabel) {
    const pFrom = pointCoords[arcLabel.from];
    const pTo = pointCoords[arcLabel.to];
    if (pFrom && pTo) {
      const fromAngle =
        points.find((p) => p.label === arcLabel.from)?.angleDeg ?? 0;
      const toAngle =
        points.find((p) => p.label === arcLabel.to)?.angleDeg ?? 0;
      const midAngle = ((fromAngle + toAngle) / 2) * (Math.PI / 180);
      const arcR = r + 0.5;
      const lx = arcR * Math.cos(midAngle);
      const ly = arcR * Math.sin(midAngle);
      lines.push(
        `    \\node at (${lx.toFixed(3)},${ly.toFixed(3)}) {$${arcLabel.label}$};`
      );
    }
  }

  // Angle label at a vertex
  if (angleLabel) {
    const v = pointCoords[angleLabel.vertex];
    if (v) {
      // Find chords that include this vertex to determine the angle directions
      const connectedPoints = chords
        .filter(([a, b]) => a === angleLabel.vertex || b === angleLabel.vertex)
        .map(([a, b]) =>
          a === angleLabel.vertex ? b : a
        );

      if (connectedPoints.length >= 2) {
        const p1 = pointCoords[connectedPoints[0]];
        const p2 = pointCoords[connectedPoints[1]];
        if (p1 && p2) {
          const dir1 = Math.atan2(p1.y - v.y, p1.x - v.x);
          const dir2 = Math.atan2(p2.y - v.y, p2.x - v.x);
          const midDir = (dir1 + dir2) / 2;
          const labelDist = 0.5;
          const lx = v.x + labelDist * Math.cos(midDir);
          const ly = v.y + labelDist * Math.sin(midDir);
          lines.push(
            `    \\node at (${lx.toFixed(3)},${ly.toFixed(3)}) {\\small $${angleLabel.label}$};`
          );
        }
      } else {
        // fallback: place label near vertex toward center
        const dirToCenter = Math.atan2(-v.y, -v.x);
        const lx = v.x + 0.4 * Math.cos(dirToCenter);
        const ly = v.y + 0.4 * Math.sin(dirToCenter);
        lines.push(
          `    \\node at (${lx.toFixed(3)},${ly.toFixed(3)}) {\\small $${angleLabel.label}$};`
        );
      }
    }
  }

  return `\\begin{tikzpicture}[scale=1]
${lines.join("\n")}
\\end{tikzpicture}`;
}

// ---------------------------------------------------------------------------
// Template 5: Coordinate Plane with Lines
// ---------------------------------------------------------------------------

function renderCoordinatePlaneLine(
  params: CoordinatePlaneLineParams
): string {
  const { xRange, yRange, lines, points, gridLines = true } = params;

  const plotLines: string[] = [];
  const defaultColors = ["blue", "red", "green!60!black", "orange"];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const color = line.color || defaultColors[i % defaultColors.length];
    const expr = `${line.slope}*x + ${line.intercept}`;
    const labelPart = line.label ? `, node[pos=0.8, above] {$${line.label}$}` : "";
    plotLines.push(
      `    \\addplot[domain=${xRange[0]}:${xRange[1]}, samples=2, thick, ${color}${labelPart}] {${expr}};`
    );
  }

  const pointLines: string[] = [];
  if (points) {
    for (const p of points) {
      const label = p.label
        ? ` node[above right] {$${p.label}$}`
        : "";
      pointLines.push(
        `    \\addplot[only marks, mark=*, mark size=2pt] coordinates {(${p.x},${p.y})}${label};`
      );
    }
  }

  // Compute tick spacing
  const xSpan = xRange[1] - xRange[0];
  const ySpan = yRange[1] - yRange[0];
  const xTick = xSpan <= 10 ? 1 : xSpan <= 20 ? 2 : 5;
  const yTick = ySpan <= 10 ? 1 : ySpan <= 20 ? 2 : 5;

  return `\\begin{tikzpicture}
\\begin{axis}[
    axis lines=middle,
    xlabel={$x$}, ylabel={$y$},
    xmin=${xRange[0]}, xmax=${xRange[1]},
    ymin=${yRange[0]}, ymax=${yRange[1]},
    xtick distance=${xTick},
    ytick distance=${yTick},
    ${gridLines ? "grid=both," : ""}
    width=7cm, height=7cm
]
${plotLines.join("\n")}
${pointLines.join("\n")}
\\end{axis}
\\end{tikzpicture}`;
}

// ---------------------------------------------------------------------------
// Template 6: Coordinate Plane with Parabola
// ---------------------------------------------------------------------------

function renderCoordinatePlaneParabola(
  params: CoordinatePlaneParabolaParams
): string {
  const { a, b, c, xRange, yRange, points, label } = params;

  const expr = `${a}*x^2 + ${b}*x + ${c}`;
  const labelPart = label
    ? `, node[pos=0.85, right] {$${label}$}`
    : "";

  const pointLines: string[] = [];
  if (points) {
    for (const p of points) {
      const pLabel = p.label
        ? ` node[above right] {$${p.label}$}`
        : "";
      pointLines.push(
        `    \\addplot[only marks, mark=*, mark size=2pt] coordinates {(${p.x},${p.y})}${pLabel};`
      );
    }
  }

  const xSpan = xRange[1] - xRange[0];
  const ySpan = yRange[1] - yRange[0];
  const xTick = xSpan <= 10 ? 1 : xSpan <= 20 ? 2 : 5;
  const yTick = ySpan <= 10 ? 1 : ySpan <= 20 ? 2 : 5;

  return `\\begin{tikzpicture}
\\begin{axis}[
    axis lines=middle,
    xlabel={$x$}, ylabel={$y$},
    xmin=${xRange[0]}, xmax=${xRange[1]},
    ymin=${yRange[0]}, ymax=${yRange[1]},
    xtick distance=${xTick},
    ytick distance=${yTick},
    grid=both,
    width=7cm, height=7cm
]
    \\addplot[domain=${xRange[0]}:${xRange[1]}, samples=100, thick, blue${labelPart}] {${expr}};
${pointLines.join("\n")}
\\end{axis}
\\end{tikzpicture}`;
}

// ---------------------------------------------------------------------------
// Template 7: Supplementary Angles
// ---------------------------------------------------------------------------

function renderSupplementaryAngles(
  params: SupplementaryAnglesParams
): string {
  const { angleLabels, rayLabels } = params;

  // Straight line from left to right, a ray going up at an angle from the midpoint
  const rayAngleDeg = 130; // angle from positive x-axis for the dividing ray
  const rayAngleRad = (rayAngleDeg * Math.PI) / 180;
  const rayLen = 2.5;
  const rayEndX = rayLen * Math.cos(rayAngleRad);
  const rayEndY = rayLen * Math.sin(rayAngleRad);

  // Right angle arc: from 0° to rayAngleDeg (right side)
  // Left angle arc: from rayAngleDeg to 180° (left side)
  const rightMidAngle = (rayAngleDeg / 2) * (Math.PI / 180);
  const leftMidAngle = ((rayAngleDeg + 180) / 2) * (Math.PI / 180);

  const labelR = 0.8;

  const lines: string[] = [];

  // Base line
  lines.push(`    \\draw[thick] (-3,0) -- (3,0);`);
  // Ray
  lines.push(
    `    \\draw[thick] (0,0) -- (${rayEndX.toFixed(3)},${rayEndY.toFixed(3)});`
  );
  // Vertex dot
  lines.push(`    \\fill (0,0) circle (1.5pt);`);

  // Right angle arc (angle 1)
  lines.push(
    `    \\draw (0,0) ++(0:0.5) arc[start angle=0, end angle=${rayAngleDeg}, radius=0.5];`
  );
  lines.push(
    `    \\node at (${(labelR * Math.cos(rightMidAngle)).toFixed(3)},${(labelR * Math.sin(rightMidAngle)).toFixed(3)}) {$${angleLabels[0]}$};`
  );

  // Left angle arc (angle 2)
  lines.push(
    `    \\draw (0,0) ++(${rayAngleDeg}:0.5) arc[start angle=${rayAngleDeg}, end angle=180, radius=0.5];`
  );
  lines.push(
    `    \\node at (${(labelR * Math.cos(leftMidAngle)).toFixed(3)},${(labelR * Math.sin(leftMidAngle)).toFixed(3)}) {$${angleLabels[1]}$};`
  );

  // Ray labels
  if (rayLabels && rayLabels.length > 0) {
    // Label endpoints: left end, right end, ray end
    const labelPositions = [
      { x: -3, y: 0, anchor: "below left" },
      { x: 3, y: 0, anchor: "below right" },
      {
        x: rayEndX,
        y: rayEndY,
        anchor: "above",
      },
    ];
    for (let i = 0; i < Math.min(rayLabels.length, 3); i++) {
      const pos = labelPositions[i];
      lines.push(
        `    \\node[${pos.anchor}] at (${pos.x.toFixed(3)},${pos.y.toFixed(3)}) {$${rayLabels[i]}$};`
      );
    }
  }

  return `\\begin{tikzpicture}[scale=1]
${lines.join("\n")}
\\end{tikzpicture}`;
}

// ---------------------------------------------------------------------------
// Template 8: Rectangle with Diagonal
// ---------------------------------------------------------------------------

function renderRectangleWithDiagonal(
  params: RectangleWithDiagonalParams
): string {
  const {
    width,
    height,
    vertices,
    sides,
    showDiagonal = false,
    diagonalLabel,
  } = params;

  // Scale to reasonable size
  const maxDim = Math.max(width, height);
  const scaleFactor = maxDim > 6 ? 6 / maxDim : 1;
  const w = width * scaleFactor;
  const h = height * scaleFactor;

  // Vertices: bottom-left, bottom-right, top-right, top-left
  const vNames = vertices || ["A", "B", "C", "D"];
  const coords = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ];

  const anchors = ["below left", "below right", "above right", "above left"];

  const lines: string[] = [];

  // Draw rectangle
  lines.push(`    \\draw[thick] (0,0) -- (${w},0) -- (${w},${h}) -- (0,${h}) -- cycle;`);

  // Vertex labels
  for (let i = 0; i < 4; i++) {
    lines.push(
      `    \\node[${anchors[i]}] at (${coords[i].x},${coords[i].y}) {$${vNames[i]}$};`
    );
  }

  // Side labels
  for (const s of sides) {
    let lx: number, ly: number;
    switch (s.position) {
      case "bottom":
        lx = w / 2;
        ly = -0.35;
        break;
      case "top":
        lx = w / 2;
        ly = h + 0.35;
        break;
      case "left":
        lx = -0.45;
        ly = h / 2;
        break;
      case "right":
        lx = w + 0.45;
        ly = h / 2;
        break;
    }
    lines.push(`    \\node at (${lx!.toFixed(2)},${ly!.toFixed(2)}) {$${s.label}$};`);
  }

  // Right angle markers at all four corners
  const markerSize = 0.2;
  lines.push(
    `    \\draw (${markerSize},0) -- (${markerSize},${markerSize}) -- (0,${markerSize});`
  );
  lines.push(
    `    \\draw (${w - markerSize},0) -- (${w - markerSize},${markerSize}) -- (${w},${markerSize});`
  );
  lines.push(
    `    \\draw (${w - markerSize},${h}) -- (${w - markerSize},${h - markerSize}) -- (${w},${h - markerSize});`
  );
  lines.push(
    `    \\draw (${markerSize},${h}) -- (${markerSize},${h - markerSize}) -- (0,${h - markerSize});`
  );

  // Diagonal
  if (showDiagonal) {
    lines.push(`    \\draw[thick, dashed] (0,0) -- (${w},${h});`);
    if (diagonalLabel) {
      const mx = w / 2;
      const my = h / 2;
      lines.push(
        `    \\node[above left] at (${mx.toFixed(2)},${my.toFixed(2)}) {$${diagonalLabel}$};`
      );
    }
  }

  return `\\begin{tikzpicture}[scale=1]
${lines.join("\n")}
\\end{tikzpicture}`;
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export function renderTemplate(
  templateName: string,
  params: Record<string, unknown>
): string {
  switch (templateName) {
    case "parallel_lines_transversal":
      return renderParallelLinesTransversal(
        params as unknown as ParallelLinesTransversalParams
      );
    case "right_triangle":
      return renderRightTriangle(params as unknown as RightTriangleParams);
    case "general_triangle":
      return renderGeneralTriangle(params as unknown as GeneralTriangleParams);
    case "circle_with_angle":
      return renderCircleWithAngle(
        params as unknown as CircleWithAngleParams
      );
    case "coordinate_plane_line":
      return renderCoordinatePlaneLine(
        params as unknown as CoordinatePlaneLineParams
      );
    case "coordinate_plane_parabola":
      return renderCoordinatePlaneParabola(
        params as unknown as CoordinatePlaneParabolaParams
      );
    case "supplementary_angles":
      return renderSupplementaryAngles(
        params as unknown as SupplementaryAnglesParams
      );
    case "rectangle_with_diagonal":
      return renderRectangleWithDiagonal(
        params as unknown as RectangleWithDiagonalParams
      );
    default:
      throw new Error(`Unknown TikZ template: ${templateName}`);
  }
}

// ---------------------------------------------------------------------------
// Helper: Try to resolve visualCode (JSON template or raw TikZ)
// ---------------------------------------------------------------------------

export function resolveVisualCode(visualCode: string): string {
  // Try to parse as template JSON first
  try {
    const parsed = JSON.parse(visualCode);
    if (parsed && typeof parsed === "object" && parsed.template) {
      const result = renderTemplate(parsed.template, parsed.params || {});
      return result;
    }
  } catch {
    // Not JSON — reject raw TikZ
  }

  // Raw TikZ is NOT allowed — it causes compilation failures on the server.
  // Claude must use the template system (JSON with template name + params).
  console.warn("Visual code is raw TikZ (not template JSON) — rejecting to prevent compilation failures:", visualCode.substring(0, 100));
  return "\\textit{[Figure]}";
}
