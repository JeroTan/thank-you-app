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
): MapMarkerRenderSpec[] {
  const baseWidthAtScaleOne = options.baseWidthAtScaleOne ?? resolveMarkerBaseWidthAtReference();
  const worldPositions = createStableMarkerWorldPositions(data.length, {
    seed: options.seed,
    markerBaseWidth: baseWidthAtScaleOne,
    minDistance: Math.max(96, Math.round(baseWidthAtScaleOne * 2.35))
  });

  return data.map((item, index) => {
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
}
