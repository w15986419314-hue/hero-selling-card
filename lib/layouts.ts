/** Three 800×800 layout presets for Taobao hero selling cards. */

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
  /** Title weight hint */
  weight?: 600 | 700 | 800;
}

export type PointStyle = "bullets" | "pills" | "bars";

export interface PointsBlock extends TextBlock {
  gap: number;
  style: PointStyle;
  /** Pill/bar background (opacity in rgba) */
  chipBg?: string;
  chipPaddingX?: number;
  chipPaddingY?: number;
  chipRadius?: number;
}

export interface BadgeStyle {
  x: number;
  y: number;
  fontSize: number;
  paddingX: number;
  paddingY: number;
  bg: string;
  color: string;
  radius: number;
  /** Anchor edge for overflow-safe placement */
  anchor?: "left" | "right";
}

export interface LayoutPreset {
  id: LayoutId;
  name: string;
  description: string;
  imageFit: "cover-center" | "contain-right" | "contain-center";
  /** Soft canvas fill behind contain fits */
  canvasBg?: string;
  overlays?: OverlaySpec[];
  title: TextBlock;
  points: PointsBlock;
  badge: BadgeStyle;
}

export const CANVAS_SIZE = 800;
/** Keep copy ≥ this many px from canvas edge */
export const SAFE_MARGIN = 40;

export const LAYOUTS: LayoutPreset[] = [
  {
    id: "bottom-band",
    name: "底部条",
    description: "渐变沉底卖点，角标左上——适合白底/浅色商品图",
    imageFit: "cover-center",
    overlays: [
      {
        kind: "gradient",
        x: 0,
        y: 380,
        w: 800,
        h: 420,
        direction: "up",
        stops: [
          [0, "rgba(0,0,0,0)"],
          [0.35, "rgba(0,0,0,0.35)"],
          [0.7, "rgba(0,0,0,0.72)"],
          [1, "rgba(0,0,0,0.88)"],
        ],
      },
    ],
    title: {
      x: SAFE_MARGIN,
      y: 520,
      maxWidth: 720,
      fontSize: 40,
      lineHeight: 48,
      align: "left",
      color: "#ffffff",
      shadow: true,
      weight: 800,
    },
    points: {
      x: SAFE_MARGIN,
      y: 620,
      maxWidth: 720,
      fontSize: 24,
      lineHeight: 32,
      gap: 10,
      align: "left",
      color: "#f8fafc",
      shadow: true,
      style: "bullets",
      weight: 600,
    },
    badge: {
      x: SAFE_MARGIN,
      y: SAFE_MARGIN,
      fontSize: 22,
      paddingX: 18,
      paddingY: 11,
      bg: "#e11d48",
      color: "#ffffff",
      radius: 10,
      anchor: "left",
    },
  },
  {
    id: "left-panel",
    name: "左侧栏",
    description: "深色信息栏 + 右侧商品，角标右上——适合竖构图/模特图",
    imageFit: "contain-right",
    canvasBg: "#eef2f7",
    overlays: [
      {
        kind: "rect",
        x: 0,
        y: 0,
        w: 340,
        h: 800,
        color: "#0f172a",
      },
      {
        kind: "gradient",
        x: 300,
        y: 0,
        w: 60,
        h: 800,
        direction: "right",
        stops: [
          [0, "rgba(15,23,42,0.55)"],
          [1, "rgba(15,23,42,0)"],
        ],
      },
    ],
    title: {
      x: 36,
      y: 72,
      maxWidth: 268,
      fontSize: 34,
      lineHeight: 42,
      align: "left",
      color: "#f8fafc",
      shadow: false,
      weight: 800,
    },
    points: {
      x: 36,
      y: 220,
      maxWidth: 268,
      fontSize: 22,
      lineHeight: 30,
      gap: 12,
      align: "left",
      color: "#e2e8f0",
      shadow: false,
      style: "bars",
      chipBg: "rgba(255,255,255,0.08)",
      chipPaddingX: 12,
      chipPaddingY: 10,
      chipRadius: 8,
      weight: 600,
    },
    badge: {
      x: 760,
      y: SAFE_MARGIN,
      fontSize: 22,
      paddingX: 18,
      paddingY: 11,
      bg: "#f59e0b",
      color: "#1c1917",
      radius: 10,
      anchor: "right",
    },
  },
  {
    id: "corner-stack",
    name: "胶囊叠层",
    description: "顶栏标题 + 右下卖点胶囊，角标左下——适合深色/杂乱背景",
    imageFit: "cover-center",
    overlays: [
      {
        kind: "gradient",
        x: 0,
        y: 0,
        w: 800,
        h: 180,
        direction: "down",
        stops: [
          [0, "rgba(0,0,0,0.72)"],
          [0.55, "rgba(0,0,0,0.4)"],
          [1, "rgba(0,0,0,0)"],
        ],
      },
      {
        kind: "gradient",
        x: 0,
        y: 480,
        w: 800,
        h: 320,
        direction: "up",
        stops: [
          [0, "rgba(0,0,0,0)"],
          [0.45, "rgba(0,0,0,0.25)"],
          [1, "rgba(0,0,0,0.55)"],
        ],
      },
    ],
    title: {
      x: 400,
      y: 52,
      maxWidth: 700,
      fontSize: 36,
      lineHeight: 44,
      align: "center",
      color: "#ffffff",
      shadow: true,
      weight: 800,
    },
    points: {
      x: 760,
      y: 520,
      maxWidth: 360,
      fontSize: 22,
      lineHeight: 28,
      gap: 12,
      align: "right",
      color: "#0f172a",
      shadow: false,
      style: "pills",
      chipBg: "rgba(255,255,255,0.92)",
      chipPaddingX: 16,
      chipPaddingY: 10,
      chipRadius: 999,
      weight: 700,
    },
    badge: {
      x: SAFE_MARGIN,
      y: 708,
      fontSize: 22,
      paddingX: 20,
      paddingY: 12,
      bg: "#2563eb",
      color: "#ffffff",
      radius: 999,
      anchor: "left",
    },
  },
];

export function getLayout(id: LayoutId): LayoutPreset {
  const found = LAYOUTS.find((l) => l.id === id);
  if (!found) throw new Error(`Unknown layout: ${id}`);
  return found;
}
