# TikZ Arc and Angle Marker Rules

Universal rules for drawing arcs, highlighted arcs, and angle markers on circle diagrams in TikZ. These rules prevent the most common errors: wrong sweep direction, incorrect sweep size, and misplaced angle markers.

---

## Core Principle

**Every arc's `start angle` and `end angle` must correspond to the actual angular positions of the points or rays involved — never default to 0°.**

The angular position of a point on a circle is measured counterclockwise from the positive x-axis (standard mathematical convention). An arc drawn from `start angle` to `end angle` in TikZ sweeps **counterclockwise** when `end angle > start angle`.

---

## Rule 1: Determine Angular Positions First

Before drawing any arc, explicitly identify the angular position (in degrees) of every relevant point on the circle.

```
Point at 3 o'clock  →   0° (or 360°)
Point at 12 o'clock → 90°
Point at 9 o'clock  → 180°
Point at 6 o'clock  → 270° (or -90°)
```

If a point is at 40° from the positive x-axis, its angular position is 40°. Write these values down before writing any arc code.

---

## Rule 2: Angle Markers (Small Arcs Showing Central/Inscribed Angles)

An angle marker is a small arc drawn near the vertex to indicate the measure of an angle.

**Procedure:**
1. Identify the two rays forming the angle
2. Determine each ray's angular position on the circle
3. Set `start angle` = angular position of one ray
4. Set `end angle` = angular position of the other ray
5. Verify: `|end angle - start angle|` = the intended angle measure

**Correct:**
```latex
% Rays at 200° and 310°, central angle = 110°
% Sweep: 310° - 200° = 110° ✓
\draw[thick] (O) +(200:0.5) arc[start angle=200, end angle=310, radius=0.5];
```

**Wrong:**
```latex
% WRONG: Starting from 0° instead of the ray's actual position
% This draws a 200° sweep starting at the x-axis — not the intended angle
\draw[thick] (O) +(0:0.5) arc[start angle=0, end angle=200, radius=0.5];
```

---

## Rule 3: Highlighted Arcs on a Circle

A highlighted arc marks a portion of the circle's circumference between two points.

**Procedure:**
1. Identify the angular positions of the two endpoints
2. Determine which arc you want (minor arc or major arc)
3. For **counterclockwise** traversal: set `start` to the first point and `end` to the second point, ensuring `end > start` (add 360° to `end` if necessary)
4. For **clockwise** traversal: set `start` to the first point and `end` to the second point, ensuring `end < start` (subtract 360° from `end` if necessary)

**Example — Major arc from C (120°) to D (330°), going counterclockwise:**
```latex
% Counterclockwise from 120° to 330° = 210° of arc ✓
\draw[very thick, red] (O) +(120:2) arc[start angle=120, end angle=330, radius=2];
```

**Example — Minor arc from C (120°) to D (330°), going clockwise:**
```latex
% Clockwise from 120° to -30° (i.e., 330° expressed as -30°) = 150° of arc
\draw[very thick, blue] (O) +(120:2) arc[start angle=120, end angle=-30, radius=2];
```

---

## Rule 4: Verify the Sweep

After writing any arc command, perform this check:

```
Sweep = end angle - start angle

If sweep > 0  → arc goes counterclockwise
If sweep < 0  → arc goes clockwise
|sweep|       → total degrees of arc drawn
```

Ask yourself:
- Does the direction match what I intend to highlight?
- Does `|sweep|` equal the intended angle or arc measure?

If either answer is no, adjust `start angle` and/or `end angle`.

---

## Rule 5: Coordinate Consistency

The arc's starting coordinate must match `start angle`:

```latex
% The +(angle:radius) MUST use the same angle as start angle
\draw (center) +(START:r) arc[start angle=START, end angle=END, radius=r];
```

**Wrong:**
```latex
% Mismatch: coordinate says 120° but arc starts at 0°
\draw (O) +(120:2) arc[start angle=0, end angle=210, radius=2];
```

This will produce a disjointed arc that doesn't begin at the intended point.

---

## Common Mistakes Summary

| Mistake | What happens | Fix |
|---------|-------------|-----|
| `start angle=0` when ray is at 200° | Arc starts at x-axis, wrong position | Use `start angle=200` |
| `end angle=120` for a 120° angle at non-zero start | Sweep goes from start to 120° absolute, not 120° of sweep | Set `end angle = start angle + 120` |
| Major arc uses `end < start` | Arc goes clockwise (minor arc) instead of counterclockwise (major arc) | Add 360° to end angle |
| Coordinate angle ≠ start angle | Arc is disconnected from the intended point | Always match these values |

---

## Quick Reference Template

```latex
% === STEP 1: Define point positions ===
% Point A is at angle α on the circle
% Point B is at angle β on the circle

% === STEP 2: Angle marker (central angle AOB) ===
% Sweep = β - α = intended angle measure
\draw[thick] (O) +(α:0.5) arc[start angle=α, end angle=β, radius=0.5];

% === STEP 3: Highlighted arc from A to B (counterclockwise) ===
% If β > α: use as-is
% If β < α: use β+360 for counterclockwise
\draw[very thick, red] (O) +(α:R) arc[start angle=α, end angle=β, radius=R];

% === STEP 4: Verify ===
% Check: |β - α| = intended measure? Direction correct?
```

---

## Full Worked Example

**Goal:** Circle with center O, radius 2. Point C at 120°, Point D at 330° (= -30°). Show central angle COD = 150° with an angle marker, and highlight the major arc from C to D.

```latex
\begin{tikzpicture}
  % Circle
  \coordinate (O) at (0,0);
  \draw (O) circle[radius=2];

  % Points
  \coordinate (C) at (120:2);
  \coordinate (D) at (330:2);  % same as -30°
  \fill (C) circle[radius=2pt] node[above left] {$C$};
  \fill (D) circle[radius=2pt] node[below right] {$D$};

  % Radii
  \draw (O) -- (C);
  \draw (O) -- (D);

  % Angle marker: from ray OD (-30°) to ray OC (120°), counterclockwise
  % Sweep: 120 - (-30) = 150° ✓
  \draw[thick, red] (O) +(-30:0.6) arc[start angle=-30, end angle=120, radius=0.6];

  % Major arc: from C (120°) counterclockwise to D (330°)
  % Sweep: 330 - 120 = 210° ✓ (major arc)
  \draw[very thick, red] (O) +(120:2) arc[start angle=120, end angle=330, radius=2];

  % Label
  \node at (0.4, 0.6) {$150°$};
\end{tikzpicture}
```

**Verification:**
- Angle marker sweep: 120° - (-30°) = 150° ✓ (matches central angle)
- Major arc sweep: 330° - 120° = 210° ✓ (goes counterclockwise through bottom)
- All coordinate angles match their corresponding `start angle` values ✓
