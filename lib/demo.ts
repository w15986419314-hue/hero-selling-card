/** Demo form values — short chips for scene-first heroes. */

export type DemoSceneId = "dining" | "living";

export type DemoScene = {
  id: DemoSceneId;
  productName: string;
  points: string[];
  badge: string;
  imagePath: string;
  fileName: string;
  label: string;
};

export const DEMO_SCENES: Record<DemoSceneId, DemoScene> = {
  dining: {
    id: "dining",
    productName: "白橡餐桌",
    points: ["原木榫卯", "1.4米", "环保漆面"],
    badge: "满减",
    imagePath: "/sample-product.jpg",
    fileName: "sample-scene.jpg",
    label: "餐厅示例",
  },
  living: {
    id: "living",
    productName: "北欧单椅",
    points: ["棉麻面料", "实木腿", "可拆洗"],
    badge: "爆款",
    imagePath: "/sample-product-2.jpg",
    fileName: "sample-scene-2.jpg",
    label: "客厅示例",
  },
};

/** @deprecated prefer DEMO_SCENES.dining */
export const DEMO_PRODUCT_NAME = DEMO_SCENES.dining.productName;
export const DEMO_POINTS = DEMO_SCENES.dining.points;
export const DEMO_BADGE = DEMO_SCENES.dining.badge;
export const DEMO_IMAGE_PATH = DEMO_SCENES.dining.imagePath;

export async function loadDemoImageFile(
  sceneId: DemoSceneId = "dining",
): Promise<File> {
  const scene = DEMO_SCENES[sceneId];
  const res = await fetch(scene.imagePath);
  if (!res.ok) {
    throw new Error("示例场景图加载失败");
  }
  const blob = await res.blob();
  const type = blob.type || "image/jpeg";
  return new File([blob], scene.fileName, { type });
}
