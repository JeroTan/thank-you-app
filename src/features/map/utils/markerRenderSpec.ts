import type { ThankYouDataType } from "@/components/mockdata/thankYouData";
import type { MapWorldOffset } from "@/utils/map/scale";
import type { HexColor } from "@/utils/visual/color";

import { createVariableMarkerWorldLayout } from "./markerPositioning";
import {
  resolveMarkerBaseWidthAtReference,
  resolveMarkerSizeMultiplier,
  resolveMarkerWidthAtScaleOne,
  resolveThankYouCount,
  type MarkerSizeDistributionOptions
} from "./markerSize";

export type MapMarkerRenderSpec = {
  id: number;
  frameColor: HexColor;
  label: string;
  fallbackInitial: string;
  pictureSource: string | null;
  worldPosition: MapWorldOffset;
  baseWidthAtScaleOne: number;
  thankYouCount: number;
  sizeMultiplier: number;
  widthAtScaleOne: number;
};

export type MarkerFeatureData = {
  specs: MapMarkerRenderSpec[];
  worldSize: { width: number; height: number };
};

type MarkerRenderSpecOptions = {
  seed?: number;
  baseWidthAtScaleOne?: number;
  sizeDistribution?: MarkerSizeDistributionOptions;
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
  const maxThankYouCount = data.reduce(
    (maxCount, item) => Math.max(maxCount, resolveThankYouCount(item.thank_you_id_from)),
    0
  );
  const sizedMarkers = data.map((item) => {
    const thankYouCount = resolveThankYouCount(item.thank_you_id_from);
    const sizeMultiplier = resolveMarkerSizeMultiplier(
      thankYouCount,
      maxThankYouCount,
      options.sizeDistribution
    );

    return {
      item,
      thankYouCount,
      sizeMultiplier,
      widthAtScaleOne: resolveMarkerWidthAtScaleOne(baseWidthAtScaleOne, sizeMultiplier)
    };
  });

  const layout = createVariableMarkerWorldLayout(
    sizedMarkers.map((marker) => ({ widthAtScaleOne: marker.widthAtScaleOne })),
    {
      seed: options.seed,
      markerBaseWidth: baseWidthAtScaleOne
    }
  );

  const specs = sizedMarkers.map((marker, index) => {
    const { item } = marker;
    const label = resolveMarkerLabel(item.full_name);

    return {
      id: item.id,
      frameColor: item.frame_color,
      label,
      fallbackInitial: resolveFallbackInitial(label),
      pictureSource: item.picture,
      worldPosition: layout.positions[index] ?? { x: 0, y: 0 },
      baseWidthAtScaleOne,
      thankYouCount: marker.thankYouCount,
      sizeMultiplier: marker.sizeMultiplier,
      widthAtScaleOne: marker.widthAtScaleOne
    };
  });

  return { specs, worldSize: layout.worldSize };
}
