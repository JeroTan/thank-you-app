import { describe, expect, it } from "vitest";

import type { ThankYouDataType } from "../../../components/mockdata/thankYouData";
import { createMarkerConnectionSpecs } from "../../../features/map/utils/markerConnectionSpec";
import type { MapMarkerRenderSpec } from "../../../features/map/utils/markerRenderSpec";

function createMarkerSpec(id: number): Pick<MapMarkerRenderSpec, "id" | "frameColor"> {
  return {
    id,
    frameColor: (0x111111 * id) as MapMarkerRenderSpec["frameColor"]
  };
}

function createData(id: number, thankYouIdFrom: number[]): ThankYouDataType {
  return {
    id,
    full_name: `Marker ${id}`,
    thank_you_id_from: thankYouIdFrom,
    picture: null,
    frame_color: (0x111111 * id) as ThankYouDataType["frame_color"]
  };
}

describe("marker connection specs", () => {
  it("should collapse duplicate sender IDs into one visible connection (Happy Path)", () => {
    const connections = createMarkerConnectionSpecs(
      [createData(1, [2, 2, 2]), createData(2, [])],
      [createMarkerSpec(1), createMarkerSpec(2)]
    );

    expect(connections).toHaveLength(1);
    expect(connections[0]).toMatchObject({
      key: "1-2",
      markerAId: 1,
      markerBId: 2,
      isMutual: false
    });
    expect(connections[0]?.directedConnections).toEqual([
      {
        fromMarkerId: 2,
        toMarkerId: 1,
        duplicateCount: 3
      }
    ]);
  });

  it("should collapse reciprocal relationships into one mutual string (Happy Path)", () => {
    const connections = createMarkerConnectionSpecs(
      [createData(1, [2]), createData(2, [1])],
      [createMarkerSpec(1), createMarkerSpec(2)]
    );

    expect(connections).toHaveLength(1);
    expect(connections[0]?.key).toBe("1-2");
    expect(connections[0]?.isMutual).toBe(true);
    expect(connections[0]?.directedConnections).toEqual([
      {
        fromMarkerId: 2,
        toMarkerId: 1,
        duplicateCount: 1
      },
      {
        fromMarkerId: 1,
        toMarkerId: 2,
        duplicateCount: 1
      }
    ]);
  });

  it("should skip missing markers and self-links (Edge Case)", () => {
    const connections = createMarkerConnectionSpecs(
      [createData(1, [1, 99, 2]), createData(2, [])],
      [createMarkerSpec(1), createMarkerSpec(2)]
    );

    expect(connections).toHaveLength(1);
    expect(connections[0]?.key).toBe("1-2");
  });
});
