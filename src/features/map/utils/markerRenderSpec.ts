import type { ThankYouDataType } from "@/components/mockdata/thankYouData";
import type { MapWorldOffset } from "@/utils/map/scale";
import type { HexColor } from "@/utils/visual/color";

import { createStableMarkerWorldPositions } from "./markerPositioning";
import { resolveMarkerBaseWidthAtReference } from "./markerSize";

export type MapMarkerRenderSpec = {
  id: number;
  frameColor: HexColor;
  label: string;
  fallbackInitial: string;
  pictureSource: string | null;
  worldPosition: MapWorldOffset;
  baseWidthAtScaleOne: number;
};

export type MarkerFeatureData = {
  specs: MapMarkerRenderSpec[];
  worldSize: { width: number; height: number };
};

type MarkerRenderSpecOptions = {
  seed?: number;
  baseWidthAtScaleOne?: number;
};

function resolveMarkerLabel(name: string): string {
  const trimmedName = name.trim();

  return trimmedName.length > 0 ? trimmedName : "User";
}

function resolveFallbackInitial(label: string): string {
  return label.charAt(0).toUpperCase() || "U";
}

export function createMarkerRenderSpecs(
  data: ThankYouDataType[],
  options: MarkerRenderSpecOptions = {}
): MarkerFeatureData {
  const baseWidthAtScaleOne = options.baseWidthAtScaleOne ?? resolveMarkerBaseWidthAtReference();
  const worldPositions = createStableMarkerWorldPositions(data.length, {
    seed: options.seed,
    markerBaseWidth: baseWidthAtScaleOne,
    minDistance: Math.max(96, Math.round(baseWidthAtScaleOne * 2.35))
  });

  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  for (const pos of worldPositions) {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y);
  }
  
  // 50% padding equals to the total viewport size
  const paddingX = 1000; // MAP_REFERENCE_VIEWPORT.width
  const paddingY = 1000; // MAP_REFERENCE_VIEWPORT.height
  const worldSize = {
    width: Math.max(paddingX * 2, (maxX - minX) + paddingX),
    height: Math.max(paddingY * 2, (maxY - minY) + paddingY)
  };

  const specs = data.map((item, index) => {
    const label = resolveMarkerLabel(item.full_name);

    return {
      id: item.id,
      frameColor: item.frame_color,
      label,
      fallbackInitial: resolveFallbackInitial(label),
      pictureSource: item.picture,
      worldPosition: worldPositions[index] ?? { x: 0, y: 0 },
      baseWidthAtScaleOne
    };
  });

  return { specs, worldSize };
}
