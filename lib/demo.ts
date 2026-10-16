/** Demo form values for one-click try-out (short copy fits card chips). */

export const DEMO_PRODUCT_NAME = "白橡实木餐桌";

export const DEMO_POINTS = [
  "榫卯结构",
  "1.4m四人",
  "水性无味漆",
  "可拆桌脚",
];

export const DEMO_BADGE = "限时满减";

/** Bundled placeholder under /public */
export const DEMO_IMAGE_PATH = "/sample-product.svg";

export async function loadDemoImageFile(): Promise<File> {
  const res = await fetch(DEMO_IMAGE_PATH);
  if (!res.ok) {
    throw new Error("示例商品图加载失败");
  }
  const blob = await res.blob();
  const type = blob.type || "image/svg+xml";
  return new File([blob], "sample-product.svg", { type });
}
