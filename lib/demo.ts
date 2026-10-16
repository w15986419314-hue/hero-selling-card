/** Demo form values for one-click try-out (short copy fits lifestyle chips). */

export const DEMO_PRODUCT_NAME = "白橡餐桌";

export const DEMO_POINTS = ["榫卯", "1.4m", "无味漆"];

export const DEMO_BADGE = "满减";

/** Bundled photorealistic dining-room scene under /public */
export const DEMO_IMAGE_PATH = "/sample-product.jpg";

export async function loadDemoImageFile(): Promise<File> {
  const res = await fetch(DEMO_IMAGE_PATH);
  if (!res.ok) {
    throw new Error("示例场景图加载失败");
  }
  const blob = await res.blob();
  const type = blob.type || "image/jpeg";
  return new File([blob], "sample-scene.jpg", { type });
}
