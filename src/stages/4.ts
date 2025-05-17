import type { StageDefinition } from "./type.ts";

export const stage4: StageDefinition = {
  stage: [
    "bbbbbbbbbbbbbbbbbbbbbb",
    "......................",
    "....................g.",
    "m..................bbb",
    "bb.................bbb",
    "bb..........m......bbb",
    "bb.........mm......bbb",
    "bb..bb...bbbbb.....bbb",
    "bb..bbb............bbb",
    "bb..bbbb..m........bbb",
    "bb..bbbbbbbbbbb....bbb",
  ],
  initialPlayerX: 5,
  initialPlayerY: 7,
  blockGroups: [
    {
      x: 11,
      y: 6,
      objectId: "1",
    },
    {
      x: 12,
      y: 6,
      objectId: "1",
    },
    {
      x: 12,
      y: 5,
      objectId: "1",
    },
  ],
  switchGroups: [],
};
