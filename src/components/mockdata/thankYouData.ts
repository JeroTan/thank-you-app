import type { HexColor } from "../../utils/visual/color";

export interface ThankYouDataType {
  id: number;
  full_name: string;
  thank_you_id_from: number[];
  picture: string | null;
  frame_color: HexColor;
}

export const thankYouData: ThankYouDataType[] = [
  {
    id: 1,
    full_name: "Jonathan",
    thank_you_id_from: [2, 3, 4],
    picture: null,
    frame_color: 0x554433,
  },
  {
    id: 2,
    full_name: "Karina",
    thank_you_id_from: [1, 1, 1],
    picture: "https://i.pravatar.cc/150?u=Karina",
    frame_color: 0xa54b33,
  },
  {
    id: 3,
    full_name: "Juliet",
    thank_you_id_from: [1],
    picture: null,
    frame_color: 0xc5c4c3,
  },
  {
    id: 4,
    full_name: "Agnes",
    thank_you_id_from: [3, 1],
    picture: "https://i.pravatar.cc/150?u=Agnes",
    frame_color: 0x511413,
  },
  {
    id: 5,
    full_name: "Marcus",
    thank_you_id_from: [1, 2, 6, 7],
    picture: "https://i.pravatar.cc/150?u=Marcus",
    frame_color: 0x112233,
  },
  {
    id: 6,
    full_name: "Eleanor",
    thank_you_id_from: [5],
    picture: null,
    frame_color: 0x99aa11,
  },
  {
    id: 7,
    full_name: "Dominic",
    thank_you_id_from: [5, 8],
    picture: "https://i.pravatar.cc/150?u=Dominic",
    frame_color: 0x336699,
  },
  {
    id: 8,
    full_name: "Sophia",
    thank_you_id_from: [7, 9, 10],
    picture: "https://i.pravatar.cc/150?u=Sophia",
    frame_color: 0xcc44bb,
  },
  {
    id: 9,
    full_name: "Lucas",
    thank_you_id_from: [8],
    picture: null,
    frame_color: 0x55dd22,
  },
  {
    id: 10,
    full_name: "Isabella",
    thank_you_id_from: [8, 1],
    picture: "https://i.pravatar.cc/150?u=Isabella",
    frame_color: 0xffaa00,
  }
];
