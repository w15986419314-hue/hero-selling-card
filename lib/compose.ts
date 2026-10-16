/** Browser Canvas helpers — composite product + copy into Taobao-style 800×800 PNG. */

import {
  CANVAS_SIZE,
  type BadgeStyle,
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
  // Tight pad so product fills the stage
  const pad = 20;
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
  const pad = 40;
  const scale = Math.min((size - pad * 2) / iw, (size - pad * 2) / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;
  ctx.fillStyle = canvasBg;
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function roundRectPath(
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

function drawOverlay(ctx: CanvasRenderingContext2D, o: OverlaySpec) {
  if (o.kind === "rect") {
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.w, o.h);
    return;
  }

  if (o.kind === "roundRect") {
    ctx.fillStyle = o.color;
    roundRectPath(ctx, o.x, o.y, o.w, o.h, o.radius);
    ctx.fill();
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
    ctx.shadowColor = strong ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.35)";
    ctx.shadowBlur = strong ? 8 : 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = strong ? 2 : 1;
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

/** Title: strong hierarchy; corner-stack draws as a white capsule. */
function drawTitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  block: TextBlock,
  asCapsule: boolean,
  maxLines = 2,
) {
  const weight = block.weight ?? 800;
  ctx.font = `${weight} ${block.fontSize}px ${FONT_STACK}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const lines = wrapLines(ctx, text, block.maxWidth).slice(0, maxLines);
  if (lines.length === 0) return 0;

  if (asCapsule) {
    const padX = 16;
    const padY = 10;
    const textW = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const chipW = textW + padX * 2;
    const chipH = lines.length * block.lineHeight + padY * 2;
    const chipX = block.x;
    const chipY = block.y;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.22)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    roundRectPath(ctx, chipX, chipY, chipW, chipH, 10);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = block.color;
    clearShadow(ctx);
    lines.forEach((line, i) => {
      ctx.fillText(line, chipX + padX, chipY + padY + i * block.lineHeight);
    });
    return chipH;
  }

  ctx.fillStyle = block.color;
  applyShadow(ctx, !!block.shadow, true);
  ctx.textAlign = block.align;
  lines.forEach((line, i) => {
    ctx.fillText(line, block.x, block.y + i * block.lineHeight);
  });
  clearShadow(ctx);
  return lines.length * block.lineHeight;
}

/**
 * Horizontal row of chips for bottom-band; vertical stack for others.
 */
function drawPoints(
  ctx: CanvasRenderingContext2D,
  points: string[],
  block: PointsBlock,
  horizontal: boolean,
) {
  const weight = block.weight ?? 600;
  const style = block.style;
  const padX = block.chipPaddingX ?? 12;
  const padY = block.chipPaddingY ?? 6;
  const radius = block.chipRadius ?? 6;
  const chipBg = block.chipBg ?? "rgba(255,255,255,0.9)";
  const maxItems = block.maxItems ?? 4;

  ctx.font = `${weight} ${block.fontSize}px ${FONT_STACK}`;
  ctx.textBaseline = "top";

  const list = points
    .map((p) => p.replace(/^[\s·•]+/, "").trim())
    .filter(Boolean)
    .slice(0, maxItems);

  if (horizontal && style === "pills") {
    let x = block.x;
    const y = block.y;
    for (const cleaned of list) {
      // Single-line chip only — truncate visually via wrap limit
      const lines = wrapLines(ctx, cleaned, block.maxWidth).slice(0, 1);
      const label = lines[0] ?? cleaned;
      const tw = ctx.measureText(label).width;
      const chipW = tw + padX * 2;
      const chipH = block.lineHeight + padY * 2;

      if (x + chipW > block.x + block.maxWidth) break;

      ctx.fillStyle = chipBg;
      clearShadow(ctx);
      roundRectPath(ctx, x, y, chipW, chipH, radius);
      ctx.fill();

      ctx.fillStyle = block.color;
      ctx.textAlign = "left";
      ctx.fillText(label, x + padX, y + padY);

      x += chipW + block.gap;
    }
    return;
  }

  let y = block.y;

  for (const cleaned of list) {
    if (style === "bullets") {
      const label = `● ${cleaned}`;
      ctx.fillStyle = block.color;
      ctx.textAlign = block.align;
      applyShadow(ctx, !!block.shadow);
      const lines = wrapLines(ctx, label, block.maxWidth).slice(0, 1);
      lines.forEach((line, i) => {
        ctx.fillText(line, block.x, y + i * block.lineHeight);
      });
      clearShadow(ctx);
      y += block.lineHeight + block.gap;
      continue;
    }

    const lines = wrapLines(ctx, cleaned, block.maxWidth - padX * 2).slice(0, 1);
    const textBlockH = lines.length * block.lineHeight;
    const chipW = Math.min(
      block.maxWidth,
      Math.max(...lines.map((l) => ctx.measureText(l).width), 0) + padX * 2,
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
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.22)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      roundRectPath(ctx, chipX, y, chipW, chipH, radius);
      ctx.fill();
      ctx.restore();
    } else {
      // bars: left accent bar + chip
      roundRectPath(ctx, chipX, y, chipW, chipH, radius);
      ctx.fill();
      ctx.fillStyle = "#f97316";
      ctx.fillRect(chipX, y + 4, 3, chipH - 8);
    }

    ctx.fillStyle = block.color;
    ctx.textAlign = "left";
    lines.forEach((line, i) => {
      ctx.fillText(line, chipX + padX, y + padY + i * block.lineHeight);
    });

    y += chipH + block.gap;
  }
}

/** Classic Taobao corner ribbon (diagonal banner). */
function drawCornerRibbon(
  ctx: CanvasRenderingContext2D,
  text: string,
  badge: BadgeStyle,
) {
  const corner = badge.corner ?? "top-left";
  const band = 42;
  const reach = 168;

  ctx.save();
  ctx.font = `700 ${badge.fontSize}px ${FONT_STACK}`;

  // Ribbon polygon into the corner
  ctx.beginPath();
  if (corner === "top-left") {
    ctx.moveTo(0, 0);
    ctx.lineTo(reach, 0);
    ctx.lineTo(0, reach);
  } else {
    ctx.moveTo(CANVAS_SIZE, 0);
    ctx.lineTo(CANVAS_SIZE - reach, 0);
    ctx.lineTo(CANVAS_SIZE, reach);
  }
  ctx.closePath();
  ctx.fillStyle = badge.bg;
  ctx.fill();

  // Fold shadow tip
  ctx.beginPath();
  if (corner === "top-left") {
    ctx.moveTo(reach * 0.55, 0);
    ctx.lineTo(reach, 0);
    ctx.lineTo(reach * 0.55, reach * 0.45);
  } else {
    ctx.moveTo(CANVAS_SIZE - reach * 0.55, 0);
    ctx.lineTo(CANVAS_SIZE - reach, 0);
    ctx.lineTo(CANVAS_SIZE - reach * 0.55, reach * 0.45);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fill();

  // Rotated label
  ctx.fillStyle = badge.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = text.length > 6 ? text.slice(0, 6) : text;

  if (corner === "top-left") {
    ctx.translate(52, 52);
    ctx.rotate(-Math.PI / 4);
  } else {
    ctx.translate(CANVAS_SIZE - 52, 52);
    ctx.rotate(Math.PI / 4);
  }
  ctx.fillText(label, 0, 0);
  // band unused except for visual density reference
  void band;
  ctx.restore();
}

/** Price-tag shape with pointed notch. */
function drawPriceTag(
  ctx: CanvasRenderingContext2D,
  text: string,
  badge: BadgeStyle,
) {
  ctx.font = `700 ${badge.fontSize}px ${FONT_STACK}`;
  const label = text.length > 8 ? text.slice(0, 8) : text;
  const tw = ctx.measureText(label).width;
  const notch = 14;
  const w = tw + badge.paddingX * 2 + notch;
  const h = badge.fontSize + badge.paddingY * 2;

  let x = badge.x;
  if (badge.anchor === "right") {
    x = badge.x - w;
  }
  x = Math.max(16, Math.min(x, CANVAS_SIZE - w - 16));
  const y = Math.max(16, Math.min(badge.y, CANVAS_SIZE - h - 16));

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  // Pointed left (or right for right-anchor) tag
  if (badge.anchor === "right") {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - notch, y);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w - notch, y + h);
    ctx.lineTo(x, y + h);
  } else {
    ctx.moveTo(x + notch, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + notch, y + h);
    ctx.lineTo(x, y + h / 2);
  }
  ctx.closePath();
  ctx.fillStyle = badge.bg;
  ctx.fill();
  ctx.restore();

  // Eyelet
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  const eyeX =
    badge.anchor === "right" ? x + w - notch / 2 - 2 : x + notch / 2 + 2;
  ctx.beginPath();
  ctx.arc(eyeX, y + h / 2, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = badge.color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  clearShadow(ctx);
  const textX =
    badge.anchor === "right" ? x + badge.paddingX : x + notch + badge.paddingX;
  ctx.fillText(label, textX, y + h / 2);
}

function drawPillBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  badge: BadgeStyle,
) {
  ctx.font = `700 ${badge.fontSize}px ${FONT_STACK}`;
  const label = text.length > 8 ? text.slice(0, 8) : text;
  const w = ctx.measureText(label).width + badge.paddingX * 2;
  const h = badge.fontSize + badge.paddingY * 2;
  let x = badge.x;
  if (badge.anchor === "right") x = badge.x - w;
  x = Math.max(16, Math.min(x, CANVAS_SIZE - w - 16));
  const y = Math.max(16, Math.min(badge.y, CANVAS_SIZE - h - 16));

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = badge.bg;
  roundRectPath(ctx, x, y, w, h, badge.radius || 999);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = badge.color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  clearShadow(ctx);
  ctx.fillText(label, x + badge.paddingX, y + h / 2);
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  layout: LayoutPreset,
) {
  const b = layout.badge;
  if (b.shape === "ribbon") {
    drawCornerRibbon(ctx, text, b);
  } else if (b.shape === "tag") {
    drawPriceTag(ctx, text, b);
  } else {
    drawPillBadge(ctx, text, b);
  }
}

export function composeCard(input: ComposeInput): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 不可用");

  const { image, productName, points, badgeText, layout } = input;
  const bg = layout.canvasBg ?? "#f5f5f5";

  if (layout.imageFit === "contain-right") {
    drawContainRight(
      ctx,
      image,
      CANVAS_SIZE,
      layout.leftGutter ?? 268,
      bg,
    );
  } else if (layout.imageFit === "contain-center") {
    drawContainCenter(ctx, image, CANVAS_SIZE, bg);
  } else {
    drawCover(ctx, image, CANVAS_SIZE);
  }

  for (const o of layout.overlays ?? []) {
    drawOverlay(ctx, o);
  }

  const titleText = productName.trim() || "商品主图";
  const asCapsule = layout.id === "corner-stack";
  drawTitle(ctx, titleText, layout.title, asCapsule, 2);

  const horizontalPoints = layout.id === "bottom-band";
  drawPoints(ctx, points, layout.points, horizontalPoints);

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
