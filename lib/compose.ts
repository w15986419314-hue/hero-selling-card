/** Browser Canvas helpers to composite product image + copy into 800×800 PNG. */

import {
  CANVAS_SIZE,
  type LayoutPreset,
  type TextBlock,
} from "./layouts";

export interface ComposeInput {
  image: HTMLImageElement;
  productName: string;
  points: string[];
  badgeText?: string;
  layout: LayoutPreset;
}

const FONT_STACK =
  '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif';

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  size: number,
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(size / iw, size / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawContainRight(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  size: number,
  leftGutter: number,
) {
  const areaW = size - leftGutter;
  const areaH = size;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.min(areaW / iw, areaH / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = leftGutter + (areaW - dw) / 2;
  const dy = (areaH - dh) / 2;
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawContainCenter(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  size: number,
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.min(size / iw, size / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  if (!text) return [];
  const chars = Array.from(text);
  const lines: string[] = [];
  let current = "";
  for (const ch of chars) {
    const next = current + ch;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = ch;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  block: TextBlock,
  maxLines = 3,
) {
  ctx.font = `600 ${block.fontSize}px ${FONT_STACK}`;
  ctx.fillStyle = block.color;
  ctx.textAlign = block.align;
  ctx.textBaseline = "top";
  if (block.shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
  } else {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }
  const lines = wrapLines(ctx, text, block.maxWidth).slice(0, maxLines);
  lines.forEach((line, i) => {
    ctx.fillText(line, block.x, block.y + i * block.lineHeight);
  });
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  return lines.length;
}

function drawPoints(
  ctx: CanvasRenderingContext2D,
  points: string[],
  block: TextBlock & { gap: number },
) {
  ctx.font = `500 ${block.fontSize}px ${FONT_STACK}`;
  ctx.fillStyle = block.color;
  ctx.textAlign = block.align;
  ctx.textBaseline = "top";
  if (block.shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
  } else {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  let y = block.y;
  for (const raw of points.slice(0, 5)) {
    const label = raw.startsWith("·") || raw.startsWith("•") ? raw : `· ${raw}`;
    const lines = wrapLines(ctx, label, block.maxWidth).slice(0, 2);
    lines.forEach((line, i) => {
      ctx.fillText(line, block.x, y + i * block.lineHeight);
    });
    y += lines.length * block.lineHeight + block.gap;
  }
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  layout: LayoutPreset,
) {
  const b = layout.badge;
  ctx.font = `700 ${b.fontSize}px ${FONT_STACK}`;
  const metrics = ctx.measureText(text);
  const w = metrics.width + b.paddingX * 2;
  const h = b.fontSize + b.paddingY * 2;
  ctx.fillStyle = b.bg;
  roundRect(ctx, b.x, b.y, w, h, b.radius);
  ctx.fill();
  ctx.fillStyle = b.color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "transparent";
  ctx.fillText(text, b.x + b.paddingX, b.y + h / 2);
}

export function composeCard(input: ComposeInput): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 不可用");

  const { image, productName, points, badgeText, layout } = input;

  if (layout.imageFit === "contain-right") {
    drawContainRight(ctx, image, CANVAS_SIZE, 320);
  } else if (layout.imageFit === "contain-center") {
    drawContainCenter(ctx, image, CANVAS_SIZE);
  } else {
    drawCover(ctx, image, CANVAS_SIZE);
  }

  if (layout.overlay) {
    const o = layout.overlay;
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.w, o.h);
  }

  drawTextBlock(ctx, productName.trim() || "商品主图", layout.title, 2);
  drawPoints(ctx, points.filter((p) => p.trim()), layout.points);

  const badge = badgeText?.trim();
  if (badge) {
    drawBadge(ctx, badge, layout);
  }

  return canvas;
}

export function canvasToPngDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}

export function downloadPng(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("请上传图片文件"));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片加载失败"));
    };
    img.src = url;
  });
}
