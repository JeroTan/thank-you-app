import { describe, expect, it } from "vitest";

import {
  createStringPhysicsSnapshot,
  resolveRopeDrivenMarkerNudge,
  stepStringPhysicsSnapshot
} from "../../../features/map/utils/stringPhysics";

const connection = {
  key: "1-2",
  markerAId: 1,
  markerBId: 2
};

describe("string physics", () => {
  it("should initialize rope points between two marker anchors (Happy Path)", () => {
    const snapshot = createStringPhysicsSnapshot(
      connection,
      {
        start: { x: 0, y: 0 },
        end: { x: 100, y: 0 }
      },
      { segmentCount: 4 }
    );

    expect(snapshot.restLength).toBe(100);
    expect(snapshot.points).toHaveLength(5);
    expect(snapshot.points[0]).toMatchObject({ x: 0, y: 0 });
    expect(snapshot.points[4]).toMatchObject({ x: 100, y: 0 });
    expect(snapshot.points[2]?.y).toBeGreaterThan(0);
  });

  it("should swing and settle after an anchor moves (Happy Path)", () => {
    const snapshot = createStringPhysicsSnapshot(connection, {
      start: { x: 0, y: 0 },
      end: { x: 100, y: 0 }
    });
    const nextSnapshot = stepStringPhysicsSnapshot(
      snapshot,
      {
        start: { x: 0, y: 0 },
        end: { x: 150, y: 40 }
      },
      { active: true }
    );

    expect(nextSnapshot.isSettling).toBe(true);
    expect(nextSnapshot.points[0]).toMatchObject({ x: 0, y: 0 });
    expect(nextSnapshot.points[nextSnapshot.points.length - 1]).toMatchObject({
      x: 150,
      y: 40
    });
    expect(nextSnapshot.points[4]?.vx).not.toBe(0);
  });

  it("should nudge the connected unpinned marker when the rope stretches (Happy Path)", () => {
    const nudge = resolveRopeDrivenMarkerNudge(
      connection,
      {
        start: { x: 220, y: 0 },
        end: { x: 0, y: 0 }
      },
      100,
      {
        draggedMarkerId: 1,
        pinnedMarkerIds: []
      }
    );

    expect(nudge?.markerId).toBe(2);
    expect(nudge?.delta.x).toBeGreaterThan(0);
  });

  it("should not nudge pinned connected markers (Edge Case)", () => {
    const nudge = resolveRopeDrivenMarkerNudge(
      connection,
      {
        start: { x: 220, y: 0 },
        end: { x: 0, y: 0 }
      },
      100,
      {
        draggedMarkerId: 1,
        pinnedMarkerIds: [2]
      }
    );

    expect(nudge).toBeNull();
  });
});
