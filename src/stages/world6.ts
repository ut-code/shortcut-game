import { usages } from "./_proto.ts";
import type { StageDefinition } from "./type.ts";

export namespace world6 {
  export const stage1: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbzbbbbbbbb",
      ".....................",
      "..................g..",
      "................bbbbb",
      ".f..............bbbbb",
      ".m..............bbbbb.",
      "bbbbbbbb.bbbbbbbbbbbb",
      "bbbbbbbbzbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbbbbbbb",
    ],
    initialPlayerX: 4,
    initialPlayerY: 7,
    inventoryIsInfinite: false,
    usage: {
      copy: 0,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
    blockGroups: [],
    switchGroups: [],
    laserDirections: [
      { x: 8, y: 9, direction: "up" },
      { x: 12, y: 2, direction: "down" },
    ],
  };
  export const stage2: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbbbbb",
      "bbbbbbbbbbb..........",
      "bbbbbbbbbbb..........",
      "bbbbbbbbbbz..........",
      ".....................",
      ".....................",
      ".f...................",
      ".m.................g.",
      "bbbbb^^^^^^......bbbb",
    ],
    initialPlayerX: 4,
    initialPlayerY: 7,
    inventoryIsInfinite: true,
    usage: usages.allInf,
    blockGroups: [],
    switchGroups: [],
    laserDirections: [{ x: 10, y: 3, direction: "down" }],
  };
  export const stage3: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbbbbbbb",
      ".......................",
      ".......................",
      "f......................",
      "ff.............g.......",
      "bbb...........bbb......",
      "bz..................w..",
      "bbb...............m.w..",
      "bz................m.w.m",
      "bbbbbbbbbbzbbbb.bbbbbbb",
      "bbbbbbbbbbbbbbbsbbbbbbb",
      "bbbbbbbbbbbbbbbSbbbbbbb",
    ],
    initialPlayerX: 2,
    initialPlayerY: 5,
    inventoryIsInfinite: false,
    usage: {
      copy: 0,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
    blockGroups: [
      { x: 18, y: 7, objectId: "1" },
      { x: 18, y: 8, objectId: "1" },
    ],
    switchGroups: [
      { x: 15, y: 10, switchId: "1" },
      { x: 20, y: 6, switchId: "1" },
      { x: 20, y: 7, switchId: "1" },
      { x: 20, y: 8, switchId: "1" },
    ],
    laserDirections: [
      { x: 1, y: 6, direction: "right" },
      { x: 1, y: 8, direction: "right" },
      { x: 10, y: 9, direction: "up" },
    ],
  };
  export const stage4: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbbbbb",
      "..........g..........",
      ".........bbb.........",
      "....f...........z....",
      "...bbbbb^^^^^bbbbb...",
      "..b.......w.......b..",
      ".m........w........m.",
      "mm...s....w....f...mm",
      "bbbbbSbbbbbbbbbbbbbbb",
    ],
    initialPlayerX: 4,
    initialPlayerY: 4,
    blockGroups: [
      { x: 0, y: 7, objectId: "1" },
      { x: 1, y: 7, objectId: "1" },
      { x: 1, y: 6, objectId: "1" },
      { x: 19, y: 7, objectId: "2" },
      { x: 20, y: 7, objectId: "2" },
      { x: 19, y: 6, objectId: "2" },
    ],
    switchGroups: [
      { x: 5, y: 7, switchId: "1" },
      { x: 10, y: 7, switchId: "1" },
      { x: 10, y: 6, switchId: "1" },
      { x: 10, y: 5, switchId: "1" },
    ],
    laserDirections: [{ x: 16, y: 3, direction: "left" }],
  };
}
