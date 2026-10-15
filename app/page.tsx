"use client";

import { useCallback, useMemo, useState } from "react";
import { LAYOUTS, type LayoutId } from "@/lib/layouts";
import {
  canvasToPngDataUrl,
  composeCard,
  downloadPng,
  loadImageFromFile,
} from "@/lib/compose";
import { templateRewrite } from "@/lib/copy";

type Preview = {
  id: LayoutId;
  name: string;
  description: string;
  dataUrl: string;
};

const PLATFORM_LABEL = "淘宝 800×800";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [points, setPoints] = useState<string[]>(["", "", ""]);
  const [badgeText, setBadgeText] = useState("");
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [selected, setSelected] = useState<LayoutId | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySource, setCopySource] = useState<"llm" | "template" | null>(null);

  const filledPoints = useMemo(
    () => points.map((p) => p.trim()).filter(Boolean),
    [points],
  );

  const onFileChange = useCallback(async (f: File | null) => {
    setError(null);
    setPreviews([]);
    setSelected(null);
    setCopySource(null);
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      setError("请上传图片文件（JPG / PNG / WebP）");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const updatePoint = (index: number, value: string) => {
    setPoints((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addPoint = () => {
    if (points.length >= 5) return;
    setPoints((prev) => [...prev, ""]);
  };

  const removePoint = (index: number) => {
    if (points.length <= 3) {
      updatePoint(index, "");
      return;
    }
    setPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    setError(null);
    if (!file) {
      setError("请先上传商品图");
      return;
    }
    if (filledPoints.length < 1) {
      setError("请至少填写 1 条卖点");
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

      const image = await loadImageFromFile(file);
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
          dataUrl: canvasToPngDataUrl(canvas),
        };
      });

      setPreviews(next);
      setSelected(next[0]?.id ?? null);
      setCopySource(source);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败，请重试");
    } finally {
      setBusy(false);
    }
  };

  const handleExport = () => {
    setError(null);
    const item = previews.find((p) => p.id === selected);
    if (!item) {
      setError("请先生成并选择一版预览");
      return;
    }
    const safe =
      (productName.trim() || "hero-card").replace(/[\\/:*?"<>|]/g, "_") +
      `-${item.id}.png`;
    try {
      downloadPng(item.dataUrl, safe);
    } catch {
      setError("导出失败，请重试");
    }
  };

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              主图卖点卡
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              上传商品图，填卖点，生成 3 版布局并导出 PNG
            </p>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
            {PLATFORM_LABEL}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2">
        <section className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <label className="mb-2 block text-sm font-medium">商品图</label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center transition hover:border-zinc-400 hover:bg-zinc-100">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              />
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="上传预览"
                  className="max-h-40 rounded-lg object-contain"
                />
              ) : (
                <>
                  <span className="text-sm font-medium text-zinc-700">
                    点击或拖拽上传
                  </span>
                  <span className="text-xs text-zinc-500">JPG / PNG / WebP</span>
                </>
              )}
            </label>
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              产品名
            </label>
            <input
              id="name"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="例如：轻薄羽绒服"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              平台尺寸
            </label>
            <input
              type="text"
              value={PLATFORM_LABEL}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-600"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">卖点（3–5 条）</label>
              <button
                type="button"
                onClick={addPoint}
                disabled={points.length >= 5}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-40"
              >
                + 添加
              </button>
            </div>
            <div className="space-y-2">
              {points.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={p}
                    onChange={(e) => updatePoint(i, e.target.value)}
                    placeholder={`卖点 ${i + 1}`}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => removePoint(i)}
                    className="shrink-0 rounded-lg px-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                    aria-label="清空或删除卖点"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="badge" className="mb-2 block text-sm font-medium">
              促销角标（可选）
            </label>
            <input
              id="badge"
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="例如：限时满减"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={busy}
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
          >
            {busy ? "生成中…" : "生成"}
          </button>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800">预览（3 版）</h2>
            {copySource && (
              <span className="text-xs text-zinc-500">
                文案：{copySource === "llm" ? "模型改写" : "模板润色"}
              </span>
            )}
          </div>

          {previews.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white text-sm text-zinc-500">
              生成后将在此显示三版布局
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1">
              {previews.map((p) => {
                const active = selected === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected(p.id)}
                    className={`overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
                      active
                        ? "border-zinc-900 ring-2 ring-zinc-900"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <div className="flex items-start gap-3 p-3 sm:p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.dataUrl}
                        alt={p.name}
                        className="h-28 w-28 shrink-0 rounded-lg object-cover sm:h-36 sm:w-36"
                      />
                      <div className="min-w-0 pt-1">
                        <p className="font-medium text-zinc-900">{p.name}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {p.description}
                        </p>
                        {active && (
                          <p className="mt-2 text-xs font-medium text-zinc-700">
                            已选中
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={handleExport}
            disabled={!selected || previews.length === 0}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            导出 PNG
          </button>
        </section>
      </main>
    </div>
  );
}
