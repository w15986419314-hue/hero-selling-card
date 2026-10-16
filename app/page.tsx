"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CANVAS_SIZE, LAYOUTS, type LayoutId } from "@/lib/layouts";
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
  DEMO_BADGE,
  DEMO_POINTS,
  DEMO_PRODUCT_NAME,
  loadDemoImageFile,
} from "@/lib/demo";

type Preview = {
  id: LayoutId;
  name: string;
  description: string;
  dataUrl: string;
};

const PLATFORM_LABEL = "淘宝 800×800";
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

  const fillDemo = async () => {
    setError(null);
    setExportOk(false);
    setDemoBusy(true);
    try {
      setProductName(DEMO_PRODUCT_NAME);
      setPoints([...DEMO_POINTS]);
      setBadgeText(DEMO_BADGE);
      const demoFile = await loadDemoImageFile();
      await onFileChange(demoFile);
      setHint("已填入示例短卖点与场景图，可直接点「生成 3 版预览」");
    } catch (e) {
      setError(e instanceof Error ? e.message : "示例加载失败");
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
      setHint("已生成 3 版，点选一版后导出 PNG");
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
    );
    try {
      const png = await exportPngFromDataUrl(item.dataUrl);
      downloadPng(png, safe);
      setExportOk(true);
      setHint(`已导出 ${CANVAS_SIZE}×${CANVAS_SIZE}：${safe}`);
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
              上传场景图，填极短卖点（每条≤6字），生成 3 版场景主图并导出 PNG
            </p>
          </div>
          <span className="platform-pill">{PLATFORM_LABEL}</span>
        </div>
      </header>

      <main className="app-main">
        <section className="panel form-panel">
          <div className="demo-row">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => void fillDemo()}
              disabled={busy || demoBusy}
            >
              {demoBusy ? "加载示例…" : "填入示例"}
            </button>
            <p className="demo-hint">
              一键填入≤6字卖点与示例场景图，可直接生成；也可再换成自己的场景图
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
                  <span className="dropzone-title">点击或拖拽上传</span>
                  <span className="dropzone-hint">JPG / PNG / WebP · 建议方图</span>
                </>
              )}
            </div>
            {!file && (
              <p className="field-help">没有场景图无法生成主图卖点卡</p>
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
            <div id="platform" className="input input-disabled" aria-disabled="true">
              {PLATFORM_LABEL}
            </div>
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
                    placeholder={`卖点 ${i + 1}，≤6字如：榫卯`}
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
              placeholder="例如：满减"
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
                  上传场景图（或点「填入示例」）
                </li>
                <li className={productName.trim() ? "done" : ""}>填写产品名</li>
                <li className={filledPoints.length >= MIN_POINTS ? "done" : ""}>
                  填写至少 3 条卖点
                </li>
                <li>点击生成，在此查看三版布局</li>
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
            {exportOk ? "已导出 ✓" : "导出选中版 PNG"}
          </button>
          <p className="btn-hint export-size-hint">
            导出尺寸固定 {CANVAS_SIZE}×{CANVAS_SIZE} PNG（淘宝主图）
          </p>
          {previews.length > 0 && !selected && (
            <p className="btn-hint">请先点选一版预览</p>
          )}
        </section>
      </main>
    </div>
  );
}
