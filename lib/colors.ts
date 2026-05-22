/**
 * Color palette for box types.
 * 12+ distinct, vibrant colors that look great on dark backgrounds.
 */
export const BOX_COLORS: string[] = [
  "#f472b6", // pink
  "#60a5fa", // blue
  "#facc15", // yellow
  "#a78bfa", // violet
  "#fb923c", // orange
  "#34d399", // emerald
  "#f87171", // red
  "#38bdf8", // sky
  "#c084fc", // purple
  "#fbbf24", // amber
  "#4ade80", // green
  "#f9a8d4", // rose
  "#22d3ee", // cyan
  "#e879f9", // fuchsia
  "#a3e635", // lime
  "#fca5a5", // light red
];

/**
 * Get a color for a given box type index.
 */
export function getBoxColor(index: number): string {
  return BOX_COLORS[index % BOX_COLORS.length];
}
