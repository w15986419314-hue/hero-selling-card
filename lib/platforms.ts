/** Platform output sizes for hero main images (all square). */

export type PlatformId = "taobao" | "dtc" | "amazon";

export type PlatformSpec = {
  id: PlatformId;
  /** Short slug for filenames */
  slug: string;
  label: string;
  width: number;
  height: number;
};

export const PLATFORMS: PlatformSpec[] = [
  {
    id: "taobao",
    slug: "taobao",
    label: "淘宝 800×800",
    width: 800,
    height: 800,
  },
  {
    id: "dtc",
    slug: "dtc",
    label: "DTC 1080×1080",
    width: 1080,
    height: 1080,
  },
  {
    id: "amazon",
    slug: "amazon",
    label: "亚马逊 2000×2000",
    width: 2000,
    height: 2000,
  },
];

export const DEFAULT_PLATFORM_ID: PlatformId = "taobao";

export function getPlatform(id: PlatformId): PlatformSpec {
  const found = PLATFORMS.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown platform: ${id}`);
  return found;
}

/** Square edge length for a platform. */
export function platformSize(id: PlatformId): number {
  return getPlatform(id).width;
}
