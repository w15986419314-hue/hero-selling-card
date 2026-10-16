/** Demo form values for one-click try-out (furniture / ecommerce visual). */

export const DEMO_PRODUCT_NAME = "北欧白橡实木餐桌";

export const DEMO_POINTS = [
  "原木榫卯结构",
  "1.4m 四人位",
  "水性漆无异味",
  "可拆卸桌脚",
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
