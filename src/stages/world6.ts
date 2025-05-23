import { usages } from "./_proto.ts";
import type { StageDefinition } from "./type.ts";

export namespace world6 {
  export const stage1: StageDefinition = {
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

  export const stage2: StageDefinition = {
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
