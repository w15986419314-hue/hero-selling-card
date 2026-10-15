/** Template-based selling-point polish when no LLM API key is available. */

const PREFIXES = ["主打", "卖点", "亮点", "核心"];
const SUFFIXES = ["更省心", "更耐用", "更划算", "日常必备"];

function stripNoise(s: string): string {
  return s
    .replace(/^[\s·•\-\d\.\)）]+/, "")
    .replace(/[！!。．.？?]+$/g, "")
    .trim();
}

/** Shorten / normalize one selling point for card display. */
export function polishPoint(raw: string, index: number): string {
  let t = stripNoise(raw);
  if (!t) return "";

  // Keep short points as-is
  if (t.length <= 12) return t;

  // Trim overly long lines
  if (t.length > 18) {
    t = t.slice(0, 17) + "…";
  }

  // Occasionally add a light prefix if the line is plain
  if (t.length >= 6 && t.length <= 10 && !PREFIXES.some((p) => t.startsWith(p))) {
    const prefix = PREFIXES[index % PREFIXES.length];
    if (!t.includes(prefix)) {
      return `${prefix}${t}`;
    }
  }

  return t;
}

export function polishPoints(points: string[]): string[] {
  return points
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((p, i) => polishPoint(p, i))
    .filter(Boolean);
}

/** Slightly tighten product name for title area. */
export function polishProductName(name: string): string {
  const t = name.trim().replace(/\s+/g, " ");
  if (t.length <= 16) return t;
  return t.slice(0, 15) + "…";
}

export function templateRewrite(input: {
  productName: string;
  points: string[];
  badgeText?: string;
}): {
  productName: string;
  points: string[];
  badgeText?: string;
  source: "template";
} {
  const points = polishPoints(input.points);
  // If somehow empty after polish, keep originals trimmed
  const fallback =
    points.length > 0
      ? points
      : input.points.map((p) => stripNoise(p)).filter(Boolean).slice(0, 5);

  // Ensure at least visual variety: append soft suffix only when very short set
  const enriched =
    fallback.length === 1 && fallback[0].length < 8
      ? [fallback[0], SUFFIXES[0]]
      : fallback;

  const badge = input.badgeText?.trim();
  return {
    productName: polishProductName(input.productName || "商品主图"),
    points: enriched,
    badgeText: badge ? (badge.length > 10 ? badge.slice(0, 10) : badge) : undefined,
    source: "template",
  };
}
