"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LAYOUTS, type LayoutId } from "@/lib/layouts";
import {
  composeCard,
  downloadPng,
  exportPngDataUrl,
  exportPngFromDataUrl,
  loadImageFromFile,
  sanitizeExportFilename,
} from "@/lib/compose";
import { templateRewrite } from "@/lib/copy";
import {
  DEMO_SCENES,
  loadDemoImageFile,
  type DemoSceneId,
} from "@/lib/demo";
import {
  REAL_SKUS,
  REAL_SKU_LIST,
  loadRealSkuImageFile,
  type RealSkuId,
} from "@/lib/skus";
import {
  DEFAULT_PLATFORM_ID,
  getPlatform,
  PLATFORMS,
  type PlatformId,
} from "@/lib/platforms";

type Preview = {
  id: LayoutId;
  name: string;
  description: string;
  dataUrl: string;
};

const MIN_POINTS = 3;
const MAX_POINTS = 5;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [points, setPoints] = useState<string[]>(["", "", ""]);
  const [badgeText, setBadgeText] = useState("");
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [selected, setSelected] = useState<LayoutId | null>(null);
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [exportOk, setExportOk] = useState(false);
  const [copySource, setCopySource] = useState<"llm" | "template" | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [platformId, setPlatformId] = useState<PlatformId>(DEFAULT_PLATFORM_ID);
  const [activeSkuId, setActiveSkuId] = useState<RealSkuId | null>(null);
  const platform = useMemo(() => getPlatform(platformId), [platformId]);
  const activeSku = activeSkuId ? REAL_SKUS[activeSkuId] : null;
  const canvasSize = platform.width;
  const exportTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filledPoints = useMemo(
    () => points.map((p) => p.trim()).filter(Boolean),
    [points],
  );

  const canGenerate =
    !!file &&
    productName.trim().length > 0 &&
    filledPoints.length >= MIN_POINTS &&
    filledPoints.length <= MAX_POINTS &&
    !busy;

  const canExport = !!selected && previews.length > 0 && !busy;

  useEffect(() => {
    return () => {
      if (exportTimer.current) clearTimeout(exportTimer.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && error) {
        setError(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [error]);

  const validationMessage = useMemo(() => {
    if (!file) return "请先上传场景图";
    if (!productName.trim()) return "请填写产品名";
    if (filledPoints.length < MIN_POINTS) {
      return `请至少填写 ${MIN_POINTS} 条卖点（当前 ${filledPoints.length} 条）`;
    }
    if (filledPoints.length > MAX_POINTS) {
      return `卖点最多 ${MAX_POINTS} 条`;
    }
    return null;
  }, [file, productName, filledPoints.length]);

  const onFileChange = useCallback(async (f: File | null) => {
    setError(null);
    setHint(null);
    setExportOk(false);
    setPreviews([]);
    setSelected(null);
    setCopySource(null);
    setActiveSkuId(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      setError("请上传图片文件（JPG / PNG / WebP）");
      setFile(null);
      return;
    }
    if (f.size > 12 * 1024 * 1024) {
      setError("图片过大，请压缩到 12MB 以内");
      setFile(null);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setHint("图片已就绪，填写卖点后点击生成");
  }, []);

  const updatePoint = (index: number, value: string) => {
    setPoints((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setExportOk(false);
  };

  const addPoint = () => {
    if (points.length >= MAX_POINTS) return;
    setPoints((prev) => [...prev, ""]);
  };

  const removePoint = (index: number) => {
    if (points.length <= MIN_POINTS) {
      updatePoint(index, "");
      return;
    }
    setPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const fillDemo = async (sceneId: DemoSceneId = "dining") => {
    setError(null);
    setExportOk(false);
    setDemoBusy(true);
    try {
      const scene = DEMO_SCENES[sceneId];
      setProductName(scene.productName);
      setPoints([...scene.points]);
      setBadgeText(scene.badge);
      const demoFile = await loadDemoImageFile(sceneId);
      await onFileChange(demoFile);
      setActiveSkuId(null);
      setHint(
        `已填入「${scene.label}」，可直接点「生成 3 版预览」`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "示例加载失败");
    } finally {
      setDemoBusy(false);
    }
  };

  const fillRealSku = async (skuId: RealSkuId) => {
    setError(null);
    setExportOk(false);
    setDemoBusy(true);
    try {
      const sku = REAL_SKUS[skuId];
      setProductName(sku.productName);
      setPoints([...sku.points]);
      setBadgeText(sku.badge);
      const skuFile = await loadRealSkuImageFile(skuId);
      await onFileChange(skuFile);
      setActiveSkuId(sku.id);
      setHint(
        `已载入真实 SKU「${sku.productName}」，可直接点「生成 3 版预览」`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "真实 SKU 加载失败");
      setActiveSkuId(null);
    } finally {
      setDemoBusy(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setExportOk(false);
    setHint(null);

    if (!canGenerate) {
      setError(validationMessage ?? "请完善必填项后再生成");
      return;
    }

    setBusy(true);
    try {
      let name = productName.trim();
      let pts = filledPoints;
      let badge = badgeText.trim() || undefined;
      let source: "llm" | "template" = "template";

      try {
        const res = await fetch("/api/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: name,
            points: pts,
            badgeText: badge,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            productName: string;
            points: string[];
            badgeText?: string;
            source: "llm" | "template";
          };
          name = data.productName || name || "商品主图";
          pts = data.points?.length ? data.points : pts;
          badge = data.badgeText ?? badge;
          source = data.source;
        } else {
          const fb = templateRewrite({
            productName: name,
            points: pts,
            badgeText: badge,
          });
          name = fb.productName;
          pts = fb.points;
          badge = fb.badgeText;
        }
      } catch {
        const fb = templateRewrite({
          productName: name,
          points: pts,
          badgeText: badge,
        });
        name = fb.productName;
        pts = fb.points;
        badge = fb.badgeText;
      }

      const image = await loadImageFromFile(file!);
      const next: Preview[] = LAYOUTS.map((layout) => {
        const canvas = composeCard({
          image,
          productName: name,
          points: pts,
          badgeText: badge,
          layout,
          size: canvasSize,
        });
        return {
          id: layout.id,
          name: layout.name,
          description: layout.description,
          dataUrl: exportPngDataUrl(canvas),
        };
      });

      setPreviews(next);
      setSelected(next[0]?.id ?? null);
      setCopySource(source);
      setHint("三版已就绪，点选一版后导出 PNG");
    } catch (e) {
      setPreviews([]);
      setSelected(null);
      setError(e instanceof Error ? e.message : "生成失败，请重试");
    } finally {
      setBusy(false);
    }
  };

  const handleExport = async () => {
    setError(null);
    const item = previews.find((p) => p.id === selected);
    if (!item) {
      setError("请先生成并选择一版预览");
      return;
    }
    const safe = sanitizeExportFilename(
      productName.trim() || "商品",
      item.name,
      platform.slug,
      canvasSize,
      activeSkuId,
    );
    try {
      const png = await exportPngFromDataUrl(item.dataUrl, canvasSize);
      downloadPng(png, safe);
      setExportOk(true);
      setHint(`已导出 ${canvasSize}×${canvasSize}：${safe}`);
      if (exportTimer.current) clearTimeout(exportTimer.current);
      exportTimer.current = setTimeout(() => setExportOk(false), 2500);
    } catch {
      setExportOk(false);
      setError("导出失败，请重试或换浏览器再试");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    void onFileChange(f);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div>
            <h1 className="header-title">主图卖点卡</h1>
            <p className="header-sub">
              场景图 + 短卖点（每条≤6字）→ 三版主图预览 → 导出 PNG
            </p>
          </div>
          <span className="platform-pill">{platform.label}</span>
        </div>
      </header>

      <main className="app-main">
        <section className="panel form-panel">
          <div className="demo-row">
            <div className="demo-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => void fillDemo("dining")}
                disabled={busy || demoBusy}
              >
                {demoBusy ? "加载中…" : "餐厅示例"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => void fillDemo("living")}
                disabled={busy || demoBusy}
              >
                客厅示例
              </button>
            </div>
            <p className="demo-hint">
              场景示例：一键填入样图与短卖点，可直接生成；也可换成自己的场景图
            </p>
          </div>

          <div className="demo-row sku-row">
            <p className="section-label">真实 SKU</p>
            <div className="demo-actions">
              {REAL_SKU_LIST.map((sku) => (
                <button
                  key={sku.id}
                  type="button"
                  className={`btn btn-ghost ${activeSkuId === sku.id ? "btn-ghost-active" : ""}`}
                  onClick={() => void fillRealSku(sku.id)}
                  disabled={busy || demoBusy}
                >
                  {sku.label}
                </button>
              ))}
            </div>
            {activeSku && (
              <p className="sku-chip" aria-live="polite">
                SKU <span className="sku-chip-code">{activeSku.id}</span>
              </p>
            )}
            <p className="demo-hint">
              载入真实商品图与预设卖点，导出文件名会带上 SKU 编码
            </p>
          </div>

          <div className="field">
            <label htmlFor="product-image" className="field-label">
              场景图 <span className="req">必填</span>
            </label>
            <div
              className={`dropzone ${dragOver ? "dropzone-active" : ""} ${previewUrl ? "dropzone-filled" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="上传场景图"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                id="product-image"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg,image/svg+xml"
                className="sr-only"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              />
              {previewUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="上传预览"
                    className="upload-thumb"
                  />
                  <span className="dropzone-hint">点击或拖拽可更换</span>
                </>
              ) : (
                <>
                  <span className="dropzone-icon" aria-hidden>
                    ↑
                  </span>
                  <span className="dropzone-title">点击或拖入场景图</span>
                  <span className="dropzone-hint">JPG / PNG / WebP · 方图效果更好</span>
                </>
              )}
            </div>
            {!file && (
              <p className="field-help">先上传一张场景图，或点上方示例</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="name" className="field-label">
              产品名 <span className="req">必填</span>
            </label>
            <input
              id="name"
              type="text"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                setExportOk(false);
              }}
              placeholder="例如：白橡餐桌"
              className="input"
              maxLength={40}
            />
          </div>

          <div className="field">
            <label htmlFor="platform" className="field-label">
              平台尺寸
            </label>
            <select
              id="platform"
              className="input"
              value={platformId}
              onChange={(e) => {
                const next = e.target.value as PlatformId;
                setPlatformId(next);
                setExportOk(false);
                setPreviews([]);
                setSelected(null);
                const p = getPlatform(next);
                setHint(
                  `已切换到 ${p.label}，请重新点「生成 3 版预览」`,
                );
              }}
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <div className="field-row">
              <span className="field-label" id="points-label">
                卖点 <span className="req">3–5 条</span>
              </span>
              <button
                type="button"
                onClick={addPoint}
                disabled={points.length >= MAX_POINTS}
                className="link-btn"
              >
                + 添加
              </button>
            </div>
            <div className="points-list" role="group" aria-labelledby="points-label">
              {points.map((p, i) => (
                <div key={i} className="point-row">
                  <label htmlFor={`point-${i}`} className="point-idx">
                    {i + 1}
                  </label>
                  <input
                    id={`point-${i}`}
                    type="text"
                    value={p}
                    onChange={(e) => updatePoint(i, e.target.value)}
                    placeholder={
                      ["例如：原木榫卯", "例如：1.4米", "例如：环保漆", "例如：可拆洗", "例如：实木腿"][
                        i
                      ] ?? `卖点 ${i + 1}（≤6字）`
                    }
                    className="input"
                    maxLength={6}
                    aria-label={`卖点 ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removePoint(i)}
                    className="icon-btn"
                    aria-label={
                      points.length <= MIN_POINTS ? "清空卖点" : "删除卖点"
                    }
                    title={points.length <= MIN_POINTS ? "清空" : "删除"}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {filledPoints.length > 0 && filledPoints.length < MIN_POINTS && (
              <p className="field-help warn">
                还需再填 {MIN_POINTS - filledPoints.length} 条卖点
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="badge" className="field-label">
              促销角标 <span className="opt">可选</span>
            </label>
            <input
              id="badge"
              type="text"
              value={badgeText}
              onChange={(e) => {
                setBadgeText(e.target.value);
                setExportOk(false);
              }}
              placeholder="满减 / 爆款 / 新品"
              className="input"
              maxLength={12}
            />
          </div>

          {error && (
            <p role="alert" className="banner banner-error">
              {error}
              <span className="banner-esc"> · Esc 关闭</span>
            </p>
          )}
          {!error && hint && (
            <p role="status" className="banner banner-info">
              {hint}
            </p>
          )}
          {exportOk && (
            <p role="status" className="banner banner-success">
              导出成功，请查看浏览器下载
            </p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="btn btn-primary"
            title={!canGenerate ? (validationMessage ?? undefined) : undefined}
          >
            {busy ? (
              <span className="btn-loading">
                <span className="spinner" aria-hidden />
                生成中…
              </span>
            ) : (
              "生成 3 版预览"
            )}
          </button>
          {!canGenerate && !busy && validationMessage && (
            <p className="btn-hint">{validationMessage}</p>
          )}
        </section>

        <section className="panel preview-panel" aria-label="预览区">
          <div className="preview-head">
            <h2 className="preview-title">预览</h2>
            {copySource && (
              <span className="source-tag">
                文案：{copySource === "llm" ? "模型改写" : "模板润色"}
              </span>
            )}
          </div>

          {busy && previews.length === 0 ? (
            <div className="empty-state">
              <span className="spinner spinner-lg" aria-hidden />
              <p>正在合成三版场景主图…</p>
            </div>
          ) : previews.length === 0 ? (
            <div className="empty-state">
              <ol className="empty-steps">
                <li className={file ? "done" : ""}>
                  上传场景图，或点场景示例 / 真实 SKU
                </li>
                <li className={productName.trim() ? "done" : ""}>填写产品名</li>
                <li className={filledPoints.length >= MIN_POINTS ? "done" : ""}>
                  填满至少 3 条短卖点
                </li>
                <li>点「生成 3 版预览」，在此选版导出</li>
              </ol>
            </div>
          ) : (
            <div className="preview-list" role="list">
              {previews.map((p) => {
                const active = selected === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="listitem"
                    onClick={() => {
                      setSelected(p.id);
                      setExportOk(false);
                      setHint(`已选中「${p.name}」，可导出 PNG`);
                    }}
                    className={`preview-card ${active ? "preview-card-active" : ""}`}
                    aria-pressed={active}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.dataUrl}
                      alt={p.name}
                      className="preview-img"
                    />
                    <div className="preview-meta">
                      <p className="preview-name">
                        {p.name}
                        {active && <span className="selected-badge">已选</span>}
                      </p>
                      <p className="preview-desc">{p.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={!canExport}
            className="btn btn-secondary"
          >
            {exportOk ? "已导出 ✓" : "导出 PNG"}
          </button>
          <p className="btn-hint export-size-hint">
            导出尺寸 {canvasSize}×{canvasSize} PNG（{platform.label}）
          </p>
          {previews.length > 0 && !selected && (
            <p className="btn-hint">请先点选一版预览</p>
          )}
        </section>
      </main>
    </div>
  );
}
