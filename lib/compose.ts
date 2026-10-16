/** Browser Canvas helpers to composite product image + copy into 800×800 PNG. */

import {
  CANVAS_SIZE,
  type LayoutPreset,
  type OverlaySpec,
  type PointsBlock,
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
  canvasBg: string,
) {
  const areaW = size - leftGutter;
  const areaH = size;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  // Leave a little padding inside the product area
  const pad = 24;
  const scale = Math.min((areaW - pad * 2) / iw, (areaH - pad * 2) / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = leftGutter + (areaW - dw) / 2;
  const dy = (areaH - dh) / 2;
  ctx.fillStyle = canvasBg;
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawContainCenter(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  size: number,
  canvasBg: string,
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const pad = 48;
  const scale = Math.min((size - pad * 2) / iw, (size - pad * 2) / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;
  ctx.fillStyle = canvasBg;
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawOverlay(ctx: CanvasRenderingContext2D, o: OverlaySpec) {
  if (o.kind === "rect") {
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.w, o.h);
    return;
  }

  let x0 = o.x;
  let y0 = o.y;
  let x1 = o.x;
  let y1 = o.y;
  if (o.direction === "up") {
    x0 = o.x;
    y0 = o.y + o.h;
    x1 = o.x;
    y1 = o.y;
  } else if (o.direction === "down") {
    x0 = o.x;
    y0 = o.y;
    x1 = o.x;
    y1 = o.y + o.h;
  } else if (o.direction === "right") {
    x0 = o.x;
    y0 = o.y;
    x1 = o.x + o.w;
    y1 = o.y;
  } else {
    x0 = o.x + o.w;
    y0 = o.y;
    x1 = o.x;
    y1 = o.y;
  }

  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [offset, color] of o.stops) {
    g.addColorStop(Math.min(1, Math.max(0, offset)), color);
  }
  ctx.fillStyle = g;
  ctx.fillRect(o.x, o.y, o.w, o.h);
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

function applyShadow(ctx: CanvasRenderingContext2D, on: boolean, strong = false) {
  if (on) {
    ctx.shadowColor = strong ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.4)";
    ctx.shadowBlur = strong ? 10 : 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = strong ? 3 : 1;
  } else {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}

function clearShadow(ctx: CanvasRenderingContext2D) {
  applyShadow(ctx, false);
}

function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  block: TextBlock,
  maxLines = 2,
) {
  const weight = block.weight ?? 700;
  ctx.font = `${weight} ${block.fontSize}px ${FONT_STACK}`;
  ctx.fillStyle = block.color;
  ctx.textAlign = block.align;
  ctx.textBaseline = "top";
  applyShadow(ctx, !!block.shadow, true);
  const lines = wrapLines(ctx, text, block.maxWidth).slice(0, maxLines);
  lines.forEach((line, i) => {
    ctx.fillText(line, block.x, block.y + i * block.lineHeight);
  });
  clearShadow(ctx);
  return lines.length * block.lineHeight;
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

function drawPoints(ctx: CanvasRenderingContext2D, points: string[], block: PointsBlock) {
  const weight = block.weight ?? 600;
  const style = block.style;
  const padX = block.chipPaddingX ?? 14;
  const padY = block.chipPaddingY ?? 9;
  const radius = block.chipRadius ?? 8;
  const chipBg = block.chipBg ?? "rgba(255,255,255,0.9)";

  ctx.font = `${weight} ${block.fontSize}px ${FONT_STACK}`;
  ctx.textBaseline = "top";

  let y = block.y;
  const list = points.filter((p) => p.trim()).slice(0, 5);

  for (const raw of list) {
    const cleaned = raw.replace(/^[\s·•]+/, "").trim();
    if (!cleaned) continue;

    if (style === "bullets") {
      const label = `· ${cleaned}`;
      ctx.fillStyle = block.color;
      ctx.textAlign = block.align;
      applyShadow(ctx, !!block.shadow);
      const lines = wrapLines(ctx, label, block.maxWidth).slice(0, 2);
      lines.forEach((line, i) => {
        ctx.fillText(line, block.x, y + i * block.lineHeight);
      });
      clearShadow(ctx);
      y += lines.length * block.lineHeight + block.gap;
      continue;
    }

    // pills / bars: measure text, draw chip, then text
    const textW = Math.min(ctx.measureText(cleaned).width, block.maxWidth - padX * 2);
    const lines = wrapLines(ctx, cleaned, block.maxWidth - padX * 2).slice(0, 2);
    const textBlockH = lines.length * block.lineHeight;
    const chipW = Math.min(
      block.maxWidth,
      Math.max(...lines.map((l) => ctx.measureText(l).width)) + padX * 2,
    );
    const chipH = textBlockH + padY * 2;

    let chipX = block.x;
    if (block.align === "right") {
      chipX = block.x - chipW;
    } else if (block.align === "center") {
      chipX = block.x - chipW / 2;
    }

    ctx.fillStyle = chipBg;
    clearShadow(ctx);
    if (style === "pills") {
      // Soft drop shadow under pill for contrast on busy photos
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.28)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      roundRect(ctx, chipX, y, chipW, chipH, radius);
      ctx.fill();
      ctx.restore();
    } else {
      roundRect(ctx, chipX, y, chipW, chipH, radius);
      ctx.fill();
    }

    ctx.fillStyle = block.color;
    ctx.textAlign = "left";
    lines.forEach((line, i) => {
      ctx.fillText(line, chipX + padX, y + padY + i * block.lineHeight);
    });

    // silence unused
    void textW;

    y += chipH + block.gap;
  }
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

  let x = b.x;
  if (b.anchor === "right") {
    x = b.x - w;
  }

  // Keep badge inside canvas
  x = Math.max(16, Math.min(x, CANVAS_SIZE - w - 16));
  const y = Math.max(16, Math.min(b.y, CANVAS_SIZE - h - 16));

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = b.bg;
  roundRect(ctx, x, y, w, h, b.radius);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = b.color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  clearShadow(ctx);
  ctx.fillText(text, x + b.paddingX, y + h / 2);
}

export function composeCard(input: ComposeInput): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 不可用");

  const { image, productName, points, badgeText, layout } = input;
  const bg = layout.canvasBg ?? "#f1f5f9";

  if (layout.imageFit === "contain-right") {
    drawContainRight(ctx, image, CANVAS_SIZE, 340, bg);
  } else if (layout.imageFit === "contain-center") {
    drawContainCenter(ctx, image, CANVAS_SIZE, bg);
  } else {
    drawCover(ctx, image, CANVAS_SIZE);
  }

  for (const o of layout.overlays ?? []) {
    drawOverlay(ctx, o);
  }

  drawTextBlock(ctx, productName.trim() || "商品主图", layout.title, 2);
  drawPoints(ctx, points, layout.points);

  const badge = badgeText?.trim();
  if (badge) {
    drawBadge(ctx, badge, layout);
  }

  return canvas;
}

export function canvasToPngDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}

/** Safe download name: `{productName}-卖点卡-{layout}.png` */
export function sanitizeExportFilename(
  productName: string,
  layoutLabel: string,
): string {
  const clean = (s: string, fallback: string) => {
    const t = s
      .trim()
      .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
      .replace(/\s+/g, " ")
      .replace(/\.+$/g, "")
      .slice(0, 48);
    return t || fallback;
  };
  return `${clean(productName, "商品")}-卖点卡-${clean(layoutLabel, "布局")}.png`;
}

export function downloadPng(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
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
      reject(new Error("图片加载失败，请换一张重试"));
    };
    img.src = url;
  });
}
