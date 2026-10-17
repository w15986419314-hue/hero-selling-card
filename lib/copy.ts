/** Template-based selling-point polish when no LLM API key is available. */

function stripNoise(s: string): string {
  return s
    .replace(/^[\s·•\-\d\.\)）]+/, "")
    .replace(/[！!。．.？?]+$/g, "")
    .trim();
}

/** Shorten one selling point for scene-hero chips (≤6 Chinese chars). */
export function polishPoint(raw: string, _index: number): string {
  let t = stripNoise(raw);
  if (!t) return "";
  // Keep size chips like「1.4米」intact when already short.
  if (/\d/.test(t) && Array.from(t).length <= 6) return t;
  const chars = Array.from(t);
  if (chars.length > 6) t = chars.slice(0, 6).join("");
  return t;
}

export function polishPoints(points: string[]): string[] {
  return points
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((p, i) => polishPoint(p, i))
    .filter(Boolean);
}

/** Tiny optional title — keep short so scene dominates. */
export function polishProductName(name: string): string {
  const t = name.trim().replace(/\s+/g, " ");
  const chars = Array.from(t);
  if (chars.length <= 8) return t;
  return chars.slice(0, 8).join("");
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
          .map((p) => {
            const chars = Array.from(p);
            return chars.length > 6 ? chars.slice(0, 6).join("") : p;
          })
          .slice(0, 3);

  const badge = input.badgeText?.trim();
  return {
    productName: polishProductName(input.productName || "商品主图"),
    points: fallback,
    badgeText: badge
      ? Array.from(badge).length > 4
        ? Array.from(badge).slice(0, 4).join("")
        : badge
      : undefined,
    source: "template",
  };
}
