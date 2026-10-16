/** Three 800×800 layout presets — Taobao lifestyle scene + selling-point overlays. */

export type LayoutId = "bottom-band" | "left-panel" | "corner-stack";

export type OverlaySpec =
  | { kind: "rect"; x: number; y: number; w: number; h: number; color: string }
  | {
      kind: "gradient";
      x: number;
      y: number;
      w: number;
      h: number;
      /** CSS-like stops: [offset 0–1, color] */
      stops: [number, string][];
      direction: "up" | "down" | "right" | "left";
    }
  | {
      kind: "roundRect";
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      radius: number;
      /** Optional glass rim */
      stroke?: string;
      strokeWidth?: number;
    };

export interface TextBlock {
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  lineHeight: number;
  align: CanvasTextAlign;
  color: string;
  shadow?: boolean;
  weight?: 600 | 700 | 800;
}

export type PointStyle = "bullets" | "pills" | "bars";

export interface PointsBlock extends TextBlock {
  gap: number;
  style: PointStyle;
  chipBg?: string;
  chipPaddingX?: number;
  chipPaddingY?: number;
  chipRadius?: number;
  /** Glass rim on pills */
  chipStroke?: string;
  /** Max points drawn (cards stay scannable) */
  maxItems?: number;
}

export type BadgeShape = "ribbon" | "tag" | "pill";

export interface BadgeStyle {
  /** For ribbon: corner; for tag/pill: top-left of shape */
  x: number;
  y: number;
  fontSize: number;
  paddingX: number;
  paddingY: number;
  bg: string;
  color: string;
  radius: number;
  shape: BadgeShape;
  /** Ribbon / tag corner */
  corner?: "top-left" | "top-right";
  /** tag/pill horizontal anchor */
  anchor?: "left" | "right";
}

export type TitleMode = "plain" | "capsule";
export type PointsFlow = "horizontal" | "vertical";

export interface LayoutPreset {
  id: LayoutId;
  name: string;
  description: string;
  /** Lifestyle heroes always cover the full scene */
  imageFit: "cover-center" | "contain-right" | "contain-center";
  /** Soft canvas fill behind contain fits (unused for lifestyle cover) */
  canvasBg?: string;
  leftGutter?: number;
  overlays?: OverlaySpec[];
  title: TextBlock;
  titleMode?: TitleMode;
  points: PointsBlock;
  pointsFlow?: PointsFlow;
  badge: BadgeStyle;
}

export const CANVAS_SIZE = 800;
/** ~5% safe margin — scene stays large */
export const SAFE_MARGIN = 40;

export const LAYOUTS: LayoutPreset[] = [
  {
    // Lifestyle: full-bleed scene + thin frosted bottom edge bar
    id: "bottom-band",
    name: "底边玻璃条",
    description: "场景满幅，底边轻玻璃条放标题与短卖点——适合餐桌/客厅场景图",
    imageFit: "cover-center",
    overlays: [
      // Soft lift under the bar — does not bury the room
      {
        kind: "gradient",
        x: 0,
        y: 560,
        w: 800,
        h: 240,
        direction: "up",
        stops: [
          [0, "rgba(0,0,0,0)"],
          [0.55, "rgba(0,0,0,0.12)"],
          [1, "rgba(0,0,0,0.38)"],
        ],
      },
      // Frosted glass edge bar
      {
        kind: "roundRect",
        x: 20,
        y: 648,
        w: 760,
        h: 132,
        radius: 18,
        color: "rgba(255,255,255,0.52)",
        stroke: "rgba(255,255,255,0.72)",
        strokeWidth: 1.5,
      },
    ],
    title: {
      x: 44,
      y: 666,
      maxWidth: 520,
      fontSize: 30,
      lineHeight: 36,
      align: "left",
      color: "#0f172a",
      shadow: false,
      weight: 800,
    },
    titleMode: "plain",
    points: {
      x: 44,
      y: 712,
      maxWidth: 712,
      fontSize: 18,
      lineHeight: 22,
      gap: 8,
      align: "left",
      color: "#0f172a",
      shadow: false,
      style: "pills",
      chipBg: "rgba(255,255,255,0.78)",
      chipStroke: "rgba(255,255,255,0.95)",
      chipPaddingX: 12,
      chipPaddingY: 6,
      chipRadius: 999,
      weight: 600,
      maxItems: 3,
    },
    pointsFlow: "horizontal",
    badge: {
      x: 0,
      y: 0,
      fontSize: 18,
      paddingX: 12,
      paddingY: 7,
      bg: "#e11d48",
      color: "#ffffff",
      radius: 0,
      shape: "ribbon",
      corner: "top-left",
    },
  },
  {
    // Lifestyle: full-bleed scene + narrow frosted left edge strip
    id: "left-panel",
    name: "左边玻璃条",
    description: "场景满幅，左侧窄玻璃条叠卖点——不裁切商品，适合竖向空间感",
    imageFit: "cover-center",
    overlays: [
      {
        kind: "gradient",
        x: 0,
        y: 0,
        w: 320,
        h: 800,
        direction: "right",
        stops: [
          [0, "rgba(15,23,42,0.42)"],
          [0.7, "rgba(15,23,42,0.12)"],
          [1, "rgba(15,23,42,0)"],
        ],
      },
      {
        kind: "roundRect",
        x: 20,
        y: 20,
        w: 200,
        h: 760,
        radius: 20,
        color: "rgba(15,23,42,0.48)",
        stroke: "rgba(255,255,255,0.28)",
        strokeWidth: 1.25,
      },
    ],
    title: {
      x: 40,
      y: 56,
      maxWidth: 160,
      fontSize: 26,
      lineHeight: 34,
      align: "left",
      color: "#ffffff",
      shadow: true,
      weight: 800,
    },
    titleMode: "plain",
    points: {
      x: 40,
      y: 200,
      maxWidth: 160,
      fontSize: 16,
      lineHeight: 20,
      gap: 10,
      align: "left",
      color: "#f8fafc",
      shadow: false,
      style: "pills",
      chipBg: "rgba(255,255,255,0.16)",
      chipStroke: "rgba(255,255,255,0.35)",
      chipPaddingX: 10,
      chipPaddingY: 8,
      chipRadius: 12,
      weight: 600,
      maxItems: 3,
    },
    pointsFlow: "vertical",
    badge: {
      x: 760,
      y: 36,
      fontSize: 17,
      paddingX: 12,
      paddingY: 7,
      bg: "#f59e0b",
      color: "#1c1917",
      radius: 4,
      shape: "tag",
      anchor: "right",
      corner: "top-right",
    },
  },
  {
    // Lifestyle: floating glass capsules — scene almost untouched
    id: "corner-stack",
    name: "角叠胶囊",
    description: "场景满幅，标题与卖点用玻璃胶囊角叠——适合深色/杂乱背景",
    imageFit: "cover-center",
    overlays: [
      {
        kind: "gradient",
        x: 0,
        y: 0,
        w: 800,
        h: 140,
        direction: "down",
        stops: [
          [0, "rgba(0,0,0,0.22)"],
          [1, "rgba(0,0,0,0)"],
        ],
      },
      {
        kind: "gradient",
        x: 480,
        y: 480,
        w: 320,
        h: 320,
        direction: "left",
        stops: [
          [0, "rgba(0,0,0,0)"],
          [1, "rgba(0,0,0,0.18)"],
        ],
      },
    ],
    title: {
      x: SAFE_MARGIN,
      y: 48,
      maxWidth: 420,
      fontSize: 28,
      lineHeight: 34,
      align: "left",
      color: "#0f172a",
      shadow: false,
      weight: 800,
    },
    titleMode: "capsule",
    points: {
      x: 760,
      y: 540,
      maxWidth: 260,
      fontSize: 17,
      lineHeight: 20,
      gap: 8,
      align: "right",
      color: "#0f172a",
      shadow: false,
      style: "pills",
      chipBg: "rgba(255,255,255,0.72)",
      chipStroke: "rgba(255,255,255,0.95)",
      chipPaddingX: 14,
      chipPaddingY: 8,
      chipRadius: 999,
      weight: 700,
      maxItems: 3,
    },
    pointsFlow: "vertical",
    badge: {
      x: 0,
      y: 0,
      fontSize: 17,
      paddingX: 12,
      paddingY: 7,
      bg: "#2563eb",
      color: "#ffffff",
      radius: 0,
      shape: "ribbon",
      corner: "top-right",
    },
  },
];

export function getLayout(id: LayoutId): LayoutPreset {
  const found = LAYOUTS.find((l) => l.id === id);
  if (!found) throw new Error(`Unknown layout: ${id}`);
  return found;
}
