/** Three 800×800 scene-first presets — commercially distinct, light overlays only. */

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
    // Commercial A: bottom promo strip — horizontal chips + tiny title + price tag
    id: "bottom-band",
    name: "底边筹码",
    description: "底边促销条：横排白筹码 + 小标题 + 左上价签，适合场景下半留白",
    imageFit: "cover-center",
    overlays: [
      {
        kind: "gradient",
        x: 0,
        y: 668,
        w: 800,
        h: 132,
        direction: "up",
        stops: [
          [0, "rgba(0,0,0,0)"],
          [0.4, "rgba(0,0,0,0.16)"],
          [1, "rgba(0,0,0,0.48)"],
        ],
      },
    ],
    title: {
      x: SAFE_MARGIN,
      y: 686,
      maxWidth: 320,
      fontSize: 15,
      lineHeight: 18,
      align: "left",
      color: "rgba(255,255,255,0.95)",
      shadow: true,
      weight: 700,
    },
    titleMode: "tiny",
    points: {
      x: SAFE_MARGIN,
      y: 722,
      maxWidth: 752,
      fontSize: 18,
      lineHeight: 22,
      gap: 10,
      align: "left",
      color: "#0f172a",
      shadow: false,
      style: "pills",
      chipBg: "rgba(255,255,255,0.96)",
      chipStroke: "rgba(15,23,42,0.1)",
      chipPaddingX: 16,
      chipPaddingY: 9,
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
    // Commercial B: left selling column — vertical accent-bar chips + amber tag
    id: "left-panel",
    name: "左边筹码",
    description: "左侧卖点列：竖排暖色描边筹码 + 右上琥珀标，适合右侧留主体",
    imageFit: "cover-center",
    overlays: [
      {
        kind: "gradient",
        x: 0,
        y: 0,
        w: 176,
        h: 800,
        direction: "right",
        stops: [
          [0, "rgba(0,0,0,0.36)"],
          [0.5, "rgba(0,0,0,0.14)"],
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
      y: 248,
      maxWidth: 156,
      fontSize: 17,
      lineHeight: 20,
      gap: 14,
      align: "left",
      color: "#0f172a",
      shadow: false,
      style: "bars",
      chipBg: "rgba(255,255,255,0.95)",
      chipStroke: "rgba(249,115,22,0.35)",
      chipPaddingX: 14,
      chipPaddingY: 10,
      chipRadius: 10,
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
    // Commercial C: floating corner stack — dark glass chips + classic ribbon
    id: "corner-stack",
    name: "浮层筹码",
    description: "右下浮层：深色玻璃筹码叠放 + 左上丝带角标，场景几乎不挡",
    imageFit: "cover-center",
    overlays: [
      {
        kind: "gradient",
        x: 480,
        y: 600,
        w: 320,
        h: 200,
        direction: "left",
        stops: [
          [0, "rgba(0,0,0,0)"],
          [0.45, "rgba(0,0,0,0.1)"],
          [1, "rgba(0,0,0,0.32)"],
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
      y: 598,
      maxWidth: 210,
      fontSize: 17,
      lineHeight: 20,
      gap: 11,
      align: "right",
      color: "#ffffff",
      shadow: false,
      style: "pills",
      chipBg: "rgba(15,23,42,0.72)",
      chipStroke: "rgba(255,255,255,0.18)",
      chipPaddingX: 16,
      chipPaddingY: 10,
      chipRadius: 999,
      weight: 700,
      maxItems: 3,
    },
    pointsFlow: "vertical",
    badge: {
      x: 18,
      y: 18,
      fontSize: 15,
      paddingX: 10,
      paddingY: 5,
      bg: "#e11d48",
      color: "#ffffff",
      radius: 4,
      shape: "ribbon",
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
