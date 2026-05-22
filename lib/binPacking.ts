/**
 * 3D Bin Packing Algorithm — Extreme Point (EP) heuristic
 *
 * Sorts boxes by volume descending, then places each box at the best
 * extreme point that minimizes wasted space (lowest Y, then leftmost X,
 * then frontmost Z). Generates new extreme points after each placement.
 */

export interface BoxInput {
  id: string;
  label: string;
  width: number;
  height: number;
  depth: number;
  color: string;
}

export interface PlacedBox {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  width: number; // padded width for collision
  height: number;
  depth: number;
  renderWidth: number; // original width for rendering
  renderHeight: number;
  renderDepth: number;
  color: string;
}

export interface PackingResult {
  placed: PlacedBox[];
  unplaced: BoxInput[];
  containerWidth: number;
  containerHeight: number;
  containerDepth: number;
  totalVolume: number;
  usedVolume: number;
  utilizationPercent: number;
}

interface ExtremePoint {
  x: number;
  y: number;
  z: number;
}

interface Orientation {
  w: number; // padded width
  h: number;
  d: number;
  rw: number; // original width
  rh: number;
  rd: number;
}

/**
 * Generate all unique orientations (rotations) of a box.
 * A box with dimensions w×h×d can have up to 6 orientations,
 * but we deduplicate when dimensions repeat.
 */
function getOrientations(w: number, h: number, d: number, gap: number): Orientation[] {
  const set = new Set<string>();
  const orientations: Orientation[] = [];
  const perms: [number, number, number][] = [
    [w, h, d],
    [w, d, h],
    [h, w, d],
    [h, d, w],
    [d, w, h],
    [d, h, w],
  ];
  for (const [pw, ph, pd] of perms) {
    const key = `${pw},${ph},${pd}`;
    if (!set.has(key)) {
      set.add(key);
      orientations.push({ w: pw + gap, h: ph + gap, d: pd + gap, rw: pw, rh: ph, rd: pd });
    }
  }
  return orientations;
}

/**
 * Check if a box placed at (px, py, pz) with dimensions (bw, bh, bd)
 * fits within the container and does not overlap any already-placed box.
 */
function canPlace(
  px: number,
  py: number,
  pz: number,
  bw: number,
  bh: number,
  bd: number,
  containerW: number,
  containerH: number,
  containerD: number,
  placed: PlacedBox[]
): boolean {
  // Check container bounds
  if (px + bw > containerW + 0.001) return false;
  if (py + bh > containerH + 0.001) return false;
  if (pz + bd > containerD + 0.001) return false;

  // Check overlap with all placed boxes
  for (const box of placed) {
    const overlapX = px < box.x + box.width && px + bw > box.x;
    const overlapY = py < box.y + box.height && py + bh > box.y;
    const overlapZ = pz < box.z + box.depth && pz + bd > box.z;
    if (overlapX && overlapY && overlapZ) return false;
  }

  return true;
}

/**
 * Generate new extreme points after placing a box.
 * Creates points at three corners of the placed box:
 *   - (x + w, y, z) — right face
 *   - (x, y + h, z) — top face
 *   - (x, y, z + d) — front face
 */
function generateNewExtremePoints(box: PlacedBox): ExtremePoint[] {
  return [
    { x: box.x + box.width, y: box.y, z: box.z },
    { x: box.x, y: box.y + box.height, z: box.z },
    { x: box.x, y: box.y, z: box.z + box.depth },
  ];
}

/**
 * Remove extreme points that are inside any placed box.
 */
function filterValidExtremePoints(
  points: ExtremePoint[],
  placed: PlacedBox[],
  containerW: number,
  containerH: number,
  containerD: number
): ExtremePoint[] {
  return points.filter((p) => {
    // Must be within container bounds
    if (p.x > containerW + 0.001 || p.y > containerH + 0.001 || p.z > containerD + 0.001) {
      return false;
    }
    // Must not be strictly inside any placed box
    for (const box of placed) {
      if (
        p.x >= box.x &&
        p.x < box.x + box.width &&
        p.y >= box.y &&
        p.y < box.y + box.height &&
        p.z >= box.z &&
        p.z < box.z + box.depth
      ) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Sort extreme points by priority: lowest Y first, then leftmost X, then frontmost Z.
 */
function sortExtremePoints(points: ExtremePoint[]): ExtremePoint[] {
  return [...points].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    if (a.x !== b.x) return a.x - b.x;
    return a.z - b.z;
  });
}

/**
 * Deduplicate extreme points.
 */
function deduplicatePoints(points: ExtremePoint[]): ExtremePoint[] {
  const seen = new Set<string>();
  return points.filter((p) => {
    const key = `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.z.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Main bin packing function using the Extreme Point algorithm.
 */
export function packBoxes(
  containerWidth: number,
  containerHeight: number,
  containerDepth: number,
  boxes: BoxInput[],
  gap: number = 0
): PackingResult {
  // Sort by volume descending (Best Fit Decreasing)
  const sortedBoxes = [...boxes].sort((a, b) => {
    const volA = a.width * a.height * a.depth;
    const volB = b.width * b.height * b.depth;
    return volB - volA;
  });

  const placed: PlacedBox[] = [];
  const unplaced: BoxInput[] = [];

  // Initialize with one extreme point at origin
  let extremePoints: ExtremePoint[] = [{ x: 0, y: 0, z: 0 }];

  for (const box of sortedBoxes) {
    const orientations = getOrientations(box.width, box.height, box.depth, gap);
    let bestPlacement: { point: ExtremePoint; orientation: Orientation } | null = null;
    let bestScore = Infinity;

    // Sort extreme points by priority
    const sortedPoints = sortExtremePoints(extremePoints);

    for (const point of sortedPoints) {
      for (const orient of orientations) {
        if (
          canPlace(
            point.x,
            point.y,
            point.z,
            orient.w,
            orient.h,
            orient.d,
            containerWidth,
            containerHeight,
            containerDepth,
            placed
          )
        ) {
          // Score: prioritize lowest Y, then leftmost X, then frontmost Z
          // Also factor in how well the box fits against walls/other boxes
          const score =
            point.y * 10000 +
            point.x * 100 +
            point.z +
            (orient.w + orient.d) * 0.01;

          if (score < bestScore) {
            bestScore = score;
            bestPlacement = { point, orientation: orient };
          }
        }
      }
      // Early exit: if we found a placement at the lowest Y level, prefer it
      if (bestPlacement && bestPlacement.point.y === sortedPoints[0].y) {
        break;
      }
    }

    if (bestPlacement) {
      const placedBox: PlacedBox = {
        id: box.id,
        label: box.label,
        x: bestPlacement.point.x,
        y: bestPlacement.point.y,
        z: bestPlacement.point.z,
        width: bestPlacement.orientation.w,
        height: bestPlacement.orientation.h,
        depth: bestPlacement.orientation.d,
        renderWidth: bestPlacement.orientation.rw,
        renderHeight: bestPlacement.orientation.rh,
        renderDepth: bestPlacement.orientation.rd,
        color: box.color,
      };
      placed.push(placedBox);

      // Generate new extreme points
      const newPoints = generateNewExtremePoints(placedBox);
      extremePoints = [...extremePoints, ...newPoints];

      // Remove invalid extreme points and deduplicate
      extremePoints = deduplicatePoints(
        filterValidExtremePoints(
          extremePoints,
          placed,
          containerWidth,
          containerHeight,
          containerDepth
        )
      );
    } else {
      unplaced.push(box);
    }
  }

  const totalVolume = containerWidth * containerHeight * containerDepth;
  const usedVolume = placed.reduce(
    (sum, b) => sum + b.renderWidth * b.renderHeight * b.renderDepth,
    0
  );

  return {
    placed,
    unplaced,
    containerWidth,
    containerHeight,
    containerDepth,
    totalVolume,
    usedVolume,
    utilizationPercent: totalVolume > 0 ? (usedVolume / totalVolume) * 100 : 0,
  };
}
