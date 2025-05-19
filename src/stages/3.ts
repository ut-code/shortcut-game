import type { StageDefinition } from "./type.ts";

export const stage3: StageDefinition = {
  stage: [
    "bbbbbbbbbbbbbbbbbb",
    "...b............g.",
    "...b....m......bbb",
    "...bm..........bbb",
    "...bbb.........bbb",
    "...mm..........bbb",
    "bbbbbbbbbbb....bbb",
  ],
  initialPlayerX: 1,
  initialPlayerY: 6,
  blockGroups: [
    {
      x: 3,
      y: 5,
      objectId: "1",
    },
    {
      x: 4,
      y: 5,
      objectId: "1",
    },
  ],
  switchGroups: [],
};
