/** Template-based selling-point polish when no LLM API key is available. */

function stripNoise(s: string): string {
  return s
    .replace(/^[\s·•\-\d\.\)）]+/, "")
    .replace(/[！!。．.？?]+$/g, "")
    .trim();
}

/** Shorten / normalize one selling point for card chips (≤10 chars). */
export function polishPoint(raw: string, _index: number): string {
  let t = stripNoise(raw);
  if (!t) return "";
  if (t.length > 10) t = t.slice(0, 10);
  return t;
}

export function polishPoints(points: string[]): string[] {
  return points
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 4)
    .map((p, i) => polishPoint(p, i))
    .filter(Boolean);
}

/** Tighten product name for title area. */
export function polishProductName(name: string): string {
  const t = name.trim().replace(/\s+/g, " ");
  if (t.length <= 12) return t;
  return t.slice(0, 12);
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
  const fallback =
    points.length > 0
      ? points
      : input.points
          .map((p) => stripNoise(p))
          .filter(Boolean)
          .map((p) => (p.length > 10 ? p.slice(0, 10) : p))
          .slice(0, 4);

  const badge = input.badgeText?.trim();
  return {
    productName: polishProductName(input.productName || "商品主图"),
    points: fallback,
    badgeText: badge ? (badge.length > 6 ? badge.slice(0, 6) : badge) : undefined,
    source: "template",
  };
}
