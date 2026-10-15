/** Three 800×800 layout presets for Taobao hero selling cards. */

export type LayoutId = "bottom-band" | "left-panel" | "corner-stack";

export interface TextBlock {
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  lineHeight: number;
  align: CanvasTextAlign;
  color: string;
  shadow?: boolean;
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
}

export interface LayoutPreset {
  id: LayoutId;
  name: string;
  description: string;
  /** How product image is fitted into the canvas */
  imageFit: "cover-center" | "contain-right" | "contain-center";
  /** Optional dim overlay over product for text contrast */
  overlay?: { x: number; y: number; w: number; h: number; color: string };
  title: TextBlock;
  points: TextBlock & { gap: number };
  badge: BadgeStyle;
}

export const CANVAS_SIZE = 800;

export const LAYOUTS: LayoutPreset[] = [
  {
    id: "bottom-band",
    name: "底部条",
    description: "卖点沉底，角标左上",
    imageFit: "cover-center",
    overlay: { x: 0, y: 520, w: 800, h: 280, color: "rgba(0,0,0,0.55)" },
    title: {
      x: 40,
      y: 560,
      maxWidth: 720,
      fontSize: 36,
      lineHeight: 44,
      align: "left",
      color: "#ffffff",
      shadow: true,
    },
    points: {
      x: 40,
      y: 620,
      maxWidth: 720,
      fontSize: 24,
      lineHeight: 34,
      gap: 8,
      align: "left",
      color: "#ffffff",
      shadow: true,
    },
    badge: {
      x: 28,
      y: 28,
      fontSize: 22,
      paddingX: 16,
      paddingY: 10,
      bg: "#e11d48",
      color: "#ffffff",
      radius: 8,
    },
  },
  {
    id: "left-panel",
    name: "左侧栏",
    description: "左侧卖点区，角标右上",
    imageFit: "contain-right",
    overlay: { x: 0, y: 0, w: 320, h: 800, color: "rgba(15,23,42,0.88)" },
    title: {
      x: 28,
      y: 80,
      maxWidth: 264,
      fontSize: 32,
      lineHeight: 40,
      align: "left",
      color: "#f8fafc",
      shadow: false,
    },
    points: {
      x: 28,
      y: 200,
      maxWidth: 264,
      fontSize: 22,
      lineHeight: 32,
      gap: 14,
      align: "left",
      color: "#e2e8f0",
      shadow: false,
    },
    badge: {
      x: 560,
      y: 28,
      fontSize: 22,
      paddingX: 16,
      paddingY: 10,
      bg: "#f59e0b",
      color: "#1c1917",
      radius: 8,
    },
  },
  {
    id: "corner-stack",
    name: "角标叠层",
    description: "标题顶栏，卖点右下，角标左下",
    imageFit: "cover-center",
    overlay: { x: 0, y: 0, w: 800, h: 120, color: "rgba(0,0,0,0.45)" },
    title: {
      x: 400,
      y: 48,
      maxWidth: 720,
      fontSize: 34,
      lineHeight: 42,
      align: "center",
      color: "#ffffff",
      shadow: true,
    },
    points: {
      x: 760,
      y: 560,
      maxWidth: 340,
      fontSize: 22,
      lineHeight: 30,
      gap: 10,
      align: "right",
      color: "#ffffff",
      shadow: true,
    },
    badge: {
      x: 28,
      y: 700,
      fontSize: 24,
      paddingX: 18,
      paddingY: 12,
      bg: "#2563eb",
      color: "#ffffff",
      radius: 999,
    },
  },
];

export function getLayout(id: LayoutId): LayoutPreset {
  const found = LAYOUTS.find((l) => l.id === id);
  if (!found) throw new Error(`Unknown layout: ${id}`);
  return found;
}
