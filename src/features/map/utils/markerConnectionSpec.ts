import type { ThankYouDataType } from "@/components/mockdata/thankYouData";
import type { HexColor } from "@/utils/visual/color";

import type { MapMarkerRenderSpec } from "./markerRenderSpec";

export type DirectedThankYouConnection = {
  fromMarkerId: number;
  toMarkerId: number;
  duplicateCount: number;
};

export type MapMarkerConnectionSpec = {
  key: string;
  markerAId: number;
  markerBId: number;
  markerAFrameColor: HexColor;
  markerBFrameColor: HexColor;
  directedConnections: DirectedThankYouConnection[];
  isMutual: boolean;
};

type PendingConnection = Omit<MapMarkerConnectionSpec, "isMutual">;

function createConnectionKey(firstMarkerId: number, secondMarkerId: number): string {
  const markerAId = Math.min(firstMarkerId, secondMarkerId);
  const markerBId = Math.max(firstMarkerId, secondMarkerId);

  return `${markerAId}-${markerBId}`;
}

function countUniqueSenderIds(senderIds: number[]): Map<number, number> {
  const senderCounts = new Map<number, number>();

  for (const senderId of senderIds) {
    senderCounts.set(senderId, (senderCounts.get(senderId) ?? 0) + 1);
  }

  return senderCounts;
}

function hasMutualDirections(directedConnections: DirectedThankYouConnection[]): boolean {
  const directedKeys = new Set(
    directedConnections.map((connection) => `${connection.fromMarkerId}->${connection.toMarkerId}`)
  );

  for (const connection of directedConnections) {
    if (directedKeys.has(`${connection.toMarkerId}->${connection.fromMarkerId}`)) {
      return true;
    }
  }

  return false;
}

export function createMarkerConnectionSpecs(
  data: ThankYouDataType[],
  markerSpecs: Pick<MapMarkerRenderSpec, "id" | "frameColor">[]
): MapMarkerConnectionSpec[] {
  const markersById = new Map(markerSpecs.map((spec) => [spec.id, spec]));
  const pendingConnections = new Map<string, PendingConnection>();

  for (const recipient of data) {
    const recipientMarker = markersById.get(recipient.id);

    if (!recipientMarker) {
      continue;
    }

    for (const [senderId, duplicateCount] of countUniqueSenderIds(recipient.thank_you_id_from)) {
      if (senderId === recipient.id) {
        continue;
      }

      const senderMarker = markersById.get(senderId);

      if (!senderMarker) {
        continue;
      }

      const markerAId = Math.min(senderId, recipient.id);
      const markerBId = Math.max(senderId, recipient.id);
      const key = createConnectionKey(senderId, recipient.id);
      const existingConnection = pendingConnections.get(key);

      if (existingConnection) {
        existingConnection.directedConnections.push({
          fromMarkerId: senderId,
          toMarkerId: recipient.id,
          duplicateCount
        });
        continue;
      }

      const markerASpec = markersById.get(markerAId);
      const markerBSpec = markersById.get(markerBId);

      if (!markerASpec || !markerBSpec) {
        continue;
      }

      pendingConnections.set(key, {
        key,
        markerAId,
        markerBId,
        markerAFrameColor: markerASpec.frameColor,
        markerBFrameColor: markerBSpec.frameColor,
        directedConnections: [
          {
            fromMarkerId: senderId,
            toMarkerId: recipient.id,
            duplicateCount
          }
        ]
      });
    }
  }

  return Array.from(pendingConnections.values())
    .map((connection) => ({
      ...connection,
      isMutual: hasMutualDirections(connection.directedConnections)
    }))
    .sort((firstConnection, secondConnection) =>
      firstConnection.key.localeCompare(secondConnection.key)
    );
}
