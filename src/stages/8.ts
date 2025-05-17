import type { StageDefinition } from "./type.ts";

export const stage8: StageDefinition = {
  stage: [
    "bbbbbbbbbbbbbbbbbbbbbbb",
    ".........w...b.........",
    ".........w.g.b...m.....",
    ".........bbbbb.........",
    "m.......w.....w......m.",
    "mm.....w.......w.....mm",
    "bbb..bb.........bb..bbb",
    ".......w.......w.......",
    "....s.m.w.....w...s....",
    "bbbbSbbbbbbbbbbbbbSbbbb",
  ],
  initialPlayerX: 1,
  initialPlayerY: 9,
  blockGroups: [
    {
      x: 0,
      y: 4,
      objectId: "1",
    },
    {
      x: 0,
      y: 5,
      objectId: "1",
    },
    {
      x: 1,
      y: 5,
      objectId: "1",
    },
    {
      x: 21,
      y: 4,
      objectId: "2",
    },
    {
      x: 21,
      y: 5,
      objectId: "2",
    },
    {
      x: 22,
      y: 5,
      objectId: "2",
    },
  ],
  switchGroups: [
    {
      x: 4,
      y: 8,
      switchId: "1",
    },
    {
      x: 7,
      y: 5,
      switchId: "2",
    },
    {
      x: 7,
      y: 7,
      switchId: "1",
    },
    {
      x: 8,
      y: 4,
      switchId: "2",
    },
    {
      x: 8,
      y: 8,
      switchId: "1",
    },
    {
      x: 9,
      y: 1,
      switchId: "2",
    },
    {
      x: 9,
      y: 2,
      switchId: "2",
    },
    {
      x: 14,
      y: 4,
      switchId: "1",
    },
    {
      x: 14,
      y: 8,
      switchId: "2",
    },
    {
      x: 15,
      y: 5,
      switchId: "1",
    },
    {
      x: 15,
      y: 7,
      switchId: "2",
    },
    {
      x: 18,
      y: 8,
      switchId: "2",
    },
  ],
};
