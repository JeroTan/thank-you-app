import { useEffect } from "react";

import {
  mapMarkerConnectionSpecStore,
  mapMarkerDragSessionStore,
  mapMarkerRenderSpecStore,
  mapPinnedMarkerIdsStore,
  mapStringPhysicsSnapshotStore,
  mapVisualPreferencesStore,
  setMapStringPhysicsSnapshots,
  updateMapMarkerWorldPosition
} from "@/store/mapStore";
import type { MapWorldOffset } from "@/utils/map/scale";

import {
  createStringPhysicsSnapshot,
  resolveConnectionAnchors,
  resolveRopeDrivenMarkerNudge,
  stepStringPhysicsSnapshot,
  type StringPhysicsSnapshotMap
} from "../utils/stringPhysics";

function mergeMarkerDelta(
  deltaMap: Map<number, MapWorldOffset>,
  markerId: number,
  delta: MapWorldOffset
): void {
  const currentDelta = deltaMap.get(markerId) ?? { x: 0, y: 0 };

  deltaMap.set(markerId, {
    x: currentDelta.x + delta.x,
    y: currentDelta.y + delta.y
  });
}

export function useStringPhysics(): void {
  useEffect(() => {
    let animationFrameId = 0;
    let isDisposed = false;

    const scheduleStep = () => {
      if (animationFrameId || isDisposed) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(runStep);
    };

    const runStep = () => {
      animationFrameId = 0;

      if (isDisposed) {
        return;
      }

      const connections = mapMarkerConnectionSpecStore.get();
      const markerSpecs = mapMarkerRenderSpecStore.get();
      const dragSession = mapMarkerDragSessionStore.get();
      const pinnedMarkerIds = mapPinnedMarkerIdsStore.get();
      const currentSnapshots = mapStringPhysicsSnapshotStore.get();
      const isReducedMotion = mapVisualPreferencesStore.get().reducedMotion;
      const nextSnapshots: StringPhysicsSnapshotMap = {};
      const markerDeltas = new Map<number, MapWorldOffset>();
      let shouldContinue = dragSession !== null && !isReducedMotion;

      if (connections.length === 0 || markerSpecs.length === 0) {
        if (Object.keys(currentSnapshots).length > 0) {
          setMapStringPhysicsSnapshots({});
        }

        return;
      }

      for (const connection of connections) {
        const anchors = resolveConnectionAnchors(connection, markerSpecs);

        if (!anchors) {
          continue;
        }

        const existingSnapshot =
          currentSnapshots[connection.key] ??
          createStringPhysicsSnapshot(connection, anchors, { segmentCount: 8 });
        const isDragConnected =
          dragSession !== null &&
          (dragSession.markerId === connection.markerAId ||
            dragSession.markerId === connection.markerBId);
        const nextSnapshot = isReducedMotion
          ? createStringPhysicsSnapshot(connection, anchors, { segmentCount: 8 })
          : stepStringPhysicsSnapshot(existingSnapshot, anchors, {
              active: isDragConnected
            });

        nextSnapshots[connection.key] = nextSnapshot;

        if (nextSnapshot.isSettling) {
          shouldContinue = true;
        }

        const markerNudge = isReducedMotion
          ? null
          : resolveRopeDrivenMarkerNudge(connection, anchors, nextSnapshot.restLength, {
              draggedMarkerId: dragSession?.markerId ?? null,
              pinnedMarkerIds
            });

        if (markerNudge) {
          mergeMarkerDelta(markerDeltas, markerNudge.markerId, markerNudge.delta);
        }
      }

      setMapStringPhysicsSnapshots(nextSnapshots);

      if (markerDeltas.size > 0) {
        const latestMarkerSpecs = mapMarkerRenderSpecStore.get();

        for (const [markerId, delta] of markerDeltas) {
          const markerSpec = latestMarkerSpecs.find((spec) => spec.id === markerId);

          if (!markerSpec) {
            continue;
          }

          updateMapMarkerWorldPosition(markerId, {
            x: markerSpec.worldPosition.x + delta.x,
            y: markerSpec.worldPosition.y + delta.y
          });
        }
      }

      if (shouldContinue) {
        scheduleStep();
      }
    };

    const unsubscribers = [
      mapMarkerConnectionSpecStore.subscribe(scheduleStep),
      mapMarkerRenderSpecStore.subscribe(scheduleStep),
      mapMarkerDragSessionStore.subscribe(scheduleStep),
      mapPinnedMarkerIdsStore.subscribe(scheduleStep),
      mapVisualPreferencesStore.subscribe(scheduleStep)
    ];

    scheduleStep();

    return () => {
      isDisposed = true;

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }, []);
}
