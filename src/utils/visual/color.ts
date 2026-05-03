export type HexColor = number;

const MIN_HEX_COLOR = 0x000000;
const MAX_HEX_COLOR = 0xffffff;

function assertHexColor(hexColor: HexColor): void {
  if (!Number.isInteger(hexColor) || hexColor < MIN_HEX_COLOR || hexColor > MAX_HEX_COLOR) {
    throw new RangeError("Expected a 24-bit RGB hex color like 0xeb0a1e.");
  }
}

export function invertColor(hexColor: HexColor): HexColor {
  assertHexColor(hexColor);

  return MAX_HEX_COLOR ^ hexColor;
}

export function toHexColorString(hexColor: HexColor): `#${string}` {
  assertHexColor(hexColor);

  return `#${hexColor.toString(16).padStart(6, "0")}`;
}
