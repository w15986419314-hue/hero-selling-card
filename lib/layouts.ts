/** Three 800×800 scene-first presets — Taobao lifestyle hero (overlays ≤~18% height). */

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
  chipStroke?: string;
  /** Max points drawn (scene heroes: ≤3) */
  maxItems?: number;
}

export type BadgeShape = "ribbon" | "tag" | "pill";

export interface BadgeStyle {
  x: number;
  y: number;
  fontSize: number;
  paddingX: number;
  paddingY: number;
  bg: string;
  color: string;
  radius: number;
  shape: BadgeShape;
  corner?: "top-left" | "top-right";
  anchor?: "left" | "right";
}

export type TitleMode = "none" | "plain" | "capsule" | "tiny";
export type PointsFlow = "horizontal" | "vertical";

export interface LayoutPreset {
  id: LayoutId;
  name: string;
  description: string;
  imageFit: "cover-center" | "contain-right" | "contain-center";
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
export const SAFE_MARGIN = 24;
/** Soft edge lift only — keep under ~18% of canvas height (≤144px) */
export const MAX_OVERLAY_BAND = 144;

export const LAYOUTS: LayoutPreset[] = [
  {
    // Full-bleed scene + soft bottom lift + 3 edge chips (no frosted panel)
    id: "bottom-band",
    name: "底边筹码",
    description: "场景满幅，底边轻阴影 + 2–3 个高对比短卖点筹码",
    imageFit: "cover-center",
    overlays: [
      {
        kind: "gradient",
        x: 0,
        y: 680,
        w: 800,
        h: 120,
        direction: "up",
        stops: [
          [0, "rgba(0,0,0,0)"],
          [0.45, "rgba(0,0,0,0.18)"],
          [1, "rgba(0,0,0,0.42)"],
        ],
      },
    ],
    title: {
      x: SAFE_MARGIN,
      y: 694,
      maxWidth: 280,
      fontSize: 16,
      lineHeight: 20,
      align: "left",
      color: "rgba(255,255,255,0.92)",
      shadow: true,
      weight: 700,
    },
    titleMode: "tiny",
    points: {
      x: SAFE_MARGIN,
      y: 732,
      maxWidth: 752,
      fontSize: 18,
      lineHeight: 22,
      gap: 10,
      align: "left",
      color: "#0f172a",
      shadow: false,
      style: "pills",
      chipBg: "rgba(255,255,255,0.94)",
      chipStroke: "rgba(15,23,42,0.08)",
      chipPaddingX: 14,
      chipPaddingY: 8,
      chipRadius: 999,
      weight: 700,
      maxItems: 3,
    },
    pointsFlow: "horizontal",
    badge: {
      x: 18,
      y: 18,
      fontSize: 14,
      paddingX: 10,
      paddingY: 5,
      bg: "#e11d48",
      color: "#ffffff",
      radius: 4,
      shape: "tag",
      anchor: "left",
      corner: "top-left",
    },
  },
  {
    // Full-bleed scene + soft left lift + vertical floating chips (no tall panel)
    id: "left-panel",
    name: "左边筹码",
    description: "场景满幅，左侧轻阴影 + 竖排短卖点筹码，不挡家具",
    imageFit: "cover-center",
    overlays: [
      {
        kind: "gradient",
        x: 0,
        y: 0,
        w: 160,
        h: 800,
        direction: "right",
        stops: [
          [0, "rgba(0,0,0,0.32)"],
          [0.55, "rgba(0,0,0,0.12)"],
          [1, "rgba(0,0,0,0)"],
        ],
      },
    ],
    title: {
      x: SAFE_MARGIN,
      y: 88,
      maxWidth: 140,
      fontSize: 15,
      lineHeight: 18,
      align: "left",
      color: "rgba(255,255,255,0.9)",
      shadow: true,
      weight: 700,
    },
    titleMode: "none",
    points: {
      x: SAFE_MARGIN,
      y: 280,
      maxWidth: 148,
      fontSize: 17,
      lineHeight: 20,
      gap: 12,
      align: "left",
      color: "#0f172a",
      shadow: false,
      style: "pills",
      chipBg: "rgba(255,255,255,0.94)",
      chipStroke: "rgba(15,23,42,0.08)",
      chipPaddingX: 12,
      chipPaddingY: 9,
      chipRadius: 999,
      weight: 700,
      maxItems: 3,
    },
    pointsFlow: "vertical",
    badge: {
      x: 782,
      y: 18,
      fontSize: 14,
      paddingX: 10,
      paddingY: 5,
      bg: "#f59e0b",
      color: "#1c1917",
      radius: 4,
      shape: "tag",
      anchor: "right",
      corner: "top-right",
    },
  },
  {
    // Scene almost untouched — 2–3 floating chips bottom-right only
    id: "corner-stack",
    name: "浮层筹码",
    description: "场景几乎不遮，右下角浮 2–3 个高对比短卖点筹码",
    imageFit: "cover-center",
    overlays: [
      {
        kind: "gradient",
        x: 520,
        y: 640,
        w: 280,
        h: 160,
        direction: "left",
        stops: [
          [0, "rgba(0,0,0,0)"],
          [0.5, "rgba(0,0,0,0.12)"],
          [1, "rgba(0,0,0,0.28)"],
        ],
      },
    ],
    title: {
      x: SAFE_MARGIN,
      y: 24,
      maxWidth: 200,
      fontSize: 14,
      lineHeight: 18,
      align: "left",
      color: "rgba(255,255,255,0.88)",
      shadow: true,
      weight: 600,
    },
    titleMode: "none",
    points: {
      x: 776,
      y: 620,
      maxWidth: 200,
      fontSize: 17,
      lineHeight: 20,
      gap: 10,
      align: "right",
      color: "#0f172a",
      shadow: false,
      style: "pills",
      chipBg: "rgba(255,255,255,0.94)",
      chipStroke: "rgba(15,23,42,0.08)",
      chipPaddingX: 14,
      chipPaddingY: 9,
      chipRadius: 999,
      weight: 700,
      maxItems: 3,
    },
    pointsFlow: "vertical",
    badge: {
      x: 18,
      y: 18,
      fontSize: 14,
      paddingX: 10,
      paddingY: 5,
      bg: "#e11d48",
      color: "#ffffff",
      radius: 4,
      shape: "tag",
      anchor: "left",
      corner: "top-left",
    },
  },
];

export function getLayout(id: LayoutId): LayoutPreset {
  const found = LAYOUTS.find((l) => l.id === id);
  if (!found) throw new Error(`Unknown layout: ${id}`);
  return found;
}
