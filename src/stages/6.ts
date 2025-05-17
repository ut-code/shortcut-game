import type { StageDefinition } from "./type.ts";

export const stage6: StageDefinition = {
  stage: [
    "bbbbbbbbbbbbbbbbbbbbbbbbb",
    ".........................",
    "......................g..",
    "...............wbbbbbbbbb",
    "m...............bbbbbbbbb",
    "bb..............w.....m..",
    "bb..............b....mm..",
    "bb.w....m..s...bb...mmm..",
    "bbbbbbbbbbbSbbbbb^bbbbbbb",
  ],
  initialPlayerX: 5,
  initialPlayerY: 8,
  blockGroups: [
    {
      x: 20,
      y: 7,
      objectId: "1",
    },
    {
      x: 21,
      y: 7,
      objectId: "1",
    },
    {
      x: 21,
      y: 6,
      objectId: "1",
    },
    {
      x: 22,
      y: 5,
      objectId: "1",
    },
    {
      x: 22,
      y: 6,
      objectId: "1",
    },
    {
      x: 22,
      y: 7,
      objectId: "1",
    },
  ],
  switchGroups: [
    {
      x: 3,
      y: 7,
      switchId: "1",
    },
    {
      x: 11,
      y: 7,
      switchId: "1",
    },
    {
      x: 15,
      y: 3,
      switchId: "1",
    },
    {
      x: 16,
      y: 5,
      switchId: "1",
    },
  ],
};
