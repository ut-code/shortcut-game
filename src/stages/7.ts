import type { StageDefinition } from "./type.ts";

export const stage7: StageDefinition = {
  stage: [
    "bbbbbbbbbbbbbbbbbb",
    "..................",
    "................g.",
    "........w......bbb",
    "........w.....wbbb",
    ".....bm.w....w.bbb",
    ".....bbb...bbbbbbb",
    "...m.bbb...bbbbbbb",
    "...mm...s.........",
    "bbbbbbbbSbbbbbbbbb",
  ],
  initialPlayerX: 1,
  initialPlayerY: 9,
  blockGroups: [
    {
      x: 3,
      y: 7,
      objectId: "1",
    },
    {
      x: 3,
      y: 8,
      objectId: "1",
    },
    {
      x: 4,
      y: 8,
      objectId: "1",
    },
  ],
  switchGroups: [
    {
      x: 8,
      y: 3,
      switchId: "1",
    },
    {
      x: 8,
      y: 4,
      switchId: "1",
    },
    {
      x: 8,
      y: 5,
      switchId: "1",
    },
    {
      x: 8,
      y: 8,
      switchId: "1",
    },
    {
      x: 13,
      y: 5,
      switchId: "1",
    },
    {
      x: 14,
      y: 4,
      switchId: "1",
    },
  ],
};
