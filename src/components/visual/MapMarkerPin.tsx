// DO NOT DELETE THIS COMMENT

import { useId } from "react";

import { invertColor, toHexColorString, type HexColor } from "../../utils/visual/color";

// THe only purpose of this component is to show a marker pin! If you want to add a handler please wrap it with something!
export function MapMarkerPin({
  hexColor = 0xeb0a1e,
  picture = null!,
  name = "User"
}: {
  hexColor?: HexColor;
  picture?: string;
  name: string;
}) {
  const clipId = useId();
  const hasPicture = Boolean(picture);
  const markerColor = toHexColorString(hexColor);
  const fallbackColor = toHexColorString(invertColor(hexColor));
  const initial = name.trim().charAt(0).toUpperCase() || "U";

  return (
    <>
      {/** It is 100% on width and height to make it responsive */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 387 486"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Marker vector design */}
        <g filter="url(#filter0_d_1_8)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M193.5 4C297.606 4 382 88.3943 382 192.5C382 272.322 332.385 340.557 262.312 368.046L202.732 474.43C201.522 476.091 199.914 477.448 198.045 478.384C196.177 479.321 194.102 479.81 191.996 479.81C189.89 479.81 187.815 479.321 185.947 478.384C184.078 477.448 182.47 476.091 181.26 474.43L124.683 368.043C54.6123 340.553 5 272.32 5 192.5C5 88.3943 89.3943 4 193.5 4Z"
            fill={markerColor}
          />
        </g>

        {/* This is the circle where the picture of the user will be masked */}
        <circle cx="193.5" cy="192.5" r="158.5" fill={hasPicture ? "#D9D9D9" : fallbackColor} />

        {hasPicture ? (
          <image
            href={picture}
            x="35"
            y="34"
            width="317"
            height="317"
            preserveAspectRatio="xMidYMid slice"
            clipPath={"url(#" + clipId + ")"}
          />
        ) : (
          <text
            x="193.5"
            y="192.5"
            fill={markerColor}
            fontSize="140"
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {initial}
          </text>
        )}

        {/* Drop Shadow Filter */}
        <defs>
          <clipPath id={clipId}>
            <circle cx="193.5" cy="192.5" r="158.5" />
          </clipPath>

          <filter
            id="filter0_d_1_8"
            x="0"
            y="0"
            width="387"
            height="485.81"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="2.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_8" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_8" result="shape" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
