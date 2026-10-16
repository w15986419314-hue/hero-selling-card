/** Three 800×800 layout presets — Taobao-style shoppable hero cards. */

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

export interface LayoutPreset {
  id: LayoutId;
  name: string;
  description: string;
  imageFit: "cover-center" | "contain-right" | "contain-center";
  /** Soft canvas fill behind contain fits */
  canvasBg?: string;
  /** Left gutter width when imageFit is contain-right */
  leftGutter?: number;
  overlays?: OverlaySpec[];
  title: TextBlock;
  points: PointsBlock;
  badge: BadgeStyle;
}

export const CANVAS_SIZE = 800;
/** ~6% safe margin — product stays large */
export const SAFE_MARGIN = 48;

export const LAYOUTS: LayoutPreset[] = [
  {
    // Classic e-comm: full-bleed product + compact solid bottom info strip
    id: "bottom-band",
    name: "底部条",
    description: "商品满幅，底栏短卖点 + 左上角飘带——适合白底/浅色商品图",
    imageFit: "cover-center",
    overlays: [
      // Tight solid band — not a muddy half-image gradient
      {
        kind: "rect",
        x: 0,
        y: 640,
        w: 800,
        h: 160,
        color: "rgba(15, 23, 42, 0.92)",
      },
      // Thin accent line on top of band
      {
        kind: "rect",
        x: 0,
        y: 640,
        w: 800,
        h: 3,
        color: "#f97316",
      },
    ],
    title: {
      x: SAFE_MARGIN,
      y: 656,
      maxWidth: 520,
      fontSize: 34,
      lineHeight: 40,
      align: "left",
      color: "#ffffff",
      shadow: false,
      weight: 800,
    },
    points: {
      x: SAFE_MARGIN,
      y: 706,
      maxWidth: 700,
      fontSize: 20,
      lineHeight: 24,
      gap: 10,
      align: "left",
      color: "#f8fafc",
      shadow: false,
      style: "pills",
      chipBg: "rgba(255,255,255,0.14)",
      chipPaddingX: 12,
      chipPaddingY: 6,
      chipRadius: 6,
      weight: 600,
      maxItems: 4,
    },
    badge: {
      x: 0,
      y: 0,
      fontSize: 20,
      paddingX: 14,
      paddingY: 8,
      bg: "#e11d48",
      color: "#ffffff",
      radius: 0,
      shape: "ribbon",
      corner: "top-left",
    },
  },
  {
    // Narrow info column + large product stage on the right
    id: "left-panel",
    name: "左侧栏",
    description: "窄信息栏 + 大图商品区，右上价签——适合竖构图/模特图",
    imageFit: "contain-right",
    canvasBg: "#f5f5f5",
    leftGutter: 268,
    overlays: [
      {
        kind: "rect",
        x: 0,
        y: 0,
        w: 268,
        h: 800,
        color: "#111827",
      },
      // Slim brand accent at top of panel
      {
        kind: "rect",
        x: 0,
        y: 0,
        w: 268,
        h: 6,
        color: "#f97316",
      },
    ],
    title: {
      x: 28,
      y: 48,
      maxWidth: 212,
      fontSize: 30,
      lineHeight: 38,
      align: "left",
      color: "#ffffff",
      shadow: false,
      weight: 800,
    },
    points: {
      x: 28,
      y: 200,
      maxWidth: 212,
      fontSize: 18,
      lineHeight: 24,
      gap: 12,
      align: "left",
      color: "#f9fafb",
      shadow: false,
      style: "bars",
      chipBg: "rgba(255,255,255,0.1)",
      chipPaddingX: 12,
      chipPaddingY: 10,
      chipRadius: 6,
      weight: 600,
      maxItems: 4,
    },
    badge: {
      x: 760,
      y: 36,
      fontSize: 18,
      paddingX: 14,
      paddingY: 8,
      bg: "#f59e0b",
      color: "#1c1917",
      radius: 4,
      shape: "tag",
      anchor: "right",
      corner: "top-right",
    },
  },
  {
    // Product-first: floating chips only — no heavy gradients
    id: "corner-stack",
    name: "胶囊叠层",
    description: "商品满幅，标题胶囊 + 右下卖点叠层，角标飘带——适合深色/场景图",
    imageFit: "cover-center",
    overlays: [
      // Soft vignette only at edges — product stays clear
      {
        kind: "gradient",
        x: 0,
        y: 0,
        w: 800,
        h: 100,
        direction: "down",
        stops: [
          [0, "rgba(0,0,0,0.28)"],
          [1, "rgba(0,0,0,0)"],
        ],
      },
      {
        kind: "gradient",
        x: 0,
        y: 700,
        w: 800,
        h: 100,
        direction: "up",
        stops: [
          [0, "rgba(0,0,0,0)"],
          [1, "rgba(0,0,0,0.22)"],
        ],
      },
    ],
    title: {
      x: SAFE_MARGIN,
      y: 44,
      maxWidth: 520,
      fontSize: 32,
      lineHeight: 38,
      align: "left",
      color: "#0f172a",
      shadow: false,
      weight: 800,
    },
    points: {
      x: 752,
      y: 520,
      maxWidth: 280,
      fontSize: 18,
      lineHeight: 22,
      gap: 10,
      align: "right",
      color: "#0f172a",
      shadow: false,
      style: "pills",
      chipBg: "rgba(255,255,255,0.94)",
      chipPaddingX: 14,
      chipPaddingY: 8,
      chipRadius: 999,
      weight: 700,
      maxItems: 4,
    },
    badge: {
      x: 0,
      y: 0,
      fontSize: 18,
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
