import { describe, it, expect } from "vitest";
import { invertColor, toHexColorString } from "../../../utils/visual/color";

describe("Visual Color Utility", () => {
  describe("invertColor", () => {
    it("should correctly invert standard hex colors (Happy Path)", () => {
      expect(invertColor(0x000000)).toBe(0xffffff);
      expect(invertColor(0xffffff)).toBe(0x000000);
      expect(invertColor(0xeb0a1e)).toBe(0x14f5e1);
    });

    it("should throw RangeError for invalid inputs (Bad Path)", () => {
      expect(() => invertColor(-1)).toThrowError(RangeError);
      expect(() => invertColor(0x1000000)).toThrowError(RangeError);
      expect(() => invertColor(1.5)).toThrowError(RangeError);
      // @ts-expect-error Testing invalid types
      expect(() => invertColor("0xeb0a1e")).toThrowError(RangeError);
      // @ts-expect-error Testing invalid types
      expect(() => invertColor(null)).toThrowError(RangeError);
    });
  });

  describe("toHexColorString", () => {
    it("should correctly format hex colors to string (Happy Path)", () => {
      expect(toHexColorString(0x000000)).toBe("#000000");
      expect(toHexColorString(0xffffff)).toBe("#ffffff");
      expect(toHexColorString(0xeb0a1e)).toBe("#eb0a1e");
      expect(toHexColorString(0x00001e)).toBe("#00001e"); // Test padding
    });

    it("should throw RangeError for invalid inputs (Bad Path)", () => {
      expect(() => toHexColorString(-1)).toThrowError(RangeError);
      expect(() => toHexColorString(0x1000000)).toThrowError(RangeError);
      expect(() => toHexColorString(1.5)).toThrowError(RangeError);
      // @ts-expect-error Testing invalid types
      expect(() => toHexColorString("0xeb0a1e")).toThrowError(RangeError);
      // @ts-expect-error Testing invalid types
      expect(() => toHexColorString(undefined)).toThrowError(RangeError);
    });
  });
});
