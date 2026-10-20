/** Real SKU presets — product refs distinct from scene demos. */

export type RealSkuId = "folding-bed-01";

export type RealSku = {
  id: RealSkuId;
  /** Display name shown in the product name field */
  productName: string;
  /** Short selling points, each ≤6 chars */
  points: string[];
  badge: string;
  /** Public path under /public */
  imagePath: string;
  fileName: string;
  /** Button label, e.g. 折叠床 folding-bed-01 */
  label: string;
};

export const REAL_SKUS: Record<RealSkuId, RealSku> = {
  "folding-bed-01": {
    id: "folding-bed-01",
    productName: "便携折叠床",
    points: ["六腿承重", "高度可调", "双折收纳"],
    badge: "新品",
    imagePath: "/skus/folding-bed-01.jpg",
    fileName: "folding-bed-01.jpg",
    label: "折叠床 folding-bed-01",
  },
};

export const REAL_SKU_LIST: RealSku[] = Object.values(REAL_SKUS);

export async function loadRealSkuImageFile(
  skuId: RealSkuId,
): Promise<File> {
  const sku = REAL_SKUS[skuId];
  const res = await fetch(sku.imagePath);
  if (!res.ok) {
    throw new Error("真实 SKU 图片加载失败");
  }
  const blob = await res.blob();
  const type = blob.type || "image/jpeg";
  return new File([blob], sku.fileName, { type });
}
