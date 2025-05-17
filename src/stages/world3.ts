import type { StageDefinition } from "./type.ts";

export namespace world3 {
  export const stage1: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      ".........b........",
      ".........b......g.",
      ".........b...bbbbb",
      ".........b...bbbbb",
      ".........m...bbbbb",
      "bbbbbbbbbbbbbbbbbb",
    ],
    isTutorial: false,
    initialPlayerX: 1,
    initialPlayerY: 6,
    inventoryIsInfinite: true,
    blockGroups: [],
    switchGroups: [],
    usage: {
      copy: Number.POSITIVE_INFINITY,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  };
  export const stage2: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      "..................",
      "................g.",
      ".............bbbbb",
      "......f......bbbbb",
      "......f......bbbbb",
      "......f......bbbbb",
      "bbbbbbbbb.bb.bbbbb",
    ],
    isTutorial: false,
    initialPlayerX: 1,
    initialPlayerY: 6,
    inventoryIsInfinite: true,
    blockGroups: [],
    switchGroups: [],
    usage: {
      copy: Number.POSITIVE_INFINITY,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  };
  export const stage3: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbb",
      "g...W........w..b",
      "b...bb..bb..bb..b",
      "b...bb..bb..bb..b",
      "b....bf..bs..bm.b",
      "b..bbbbbbbSbbbbbb",
    ],
    isTutorial: false,
    initialPlayerX: 5,
    initialPlayerY: 1,
    inventoryIsInfinite: true,
    blockGroups: [],
    switchGroups: [
      { x: 4, y: 1, switchId: "1" },
      { x: 13, y: 1, switchId: "1" },
      { x: 10, y: 4, switchId: "1" },
    ],
    usage: {
      copy: Number.POSITIVE_INFINITY,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  };
  export const stage4: StageDefinition = {
    stage: [
      // 2345678901234567890123
      "bbbbbbbbbbbbbbbbbbbbbbbb",
      "bbbb..W..w......bmmmmW..", // 1
      "bbbb..bb.w..........W...", // 2
      ".......b.bbbbbbbbbbb....", // 3
      ".s............w....w....", // 4
      "bSbbb.........w..m.w...b", // 5
      "bbbbb.........bbbbbb..bb", // 6
      "bbbbb.........bg.....bbb", // 7
      "bbbbbssss...f.b.....bbbb", // 8
      "bbbbbSSSSbbbbbb....bbbbb",
    ],
    isTutorial: false,
    initialPlayerX: 10,
    initialPlayerY: 8,
    inventoryIsInfinite: true,
    blockGroups: [
      { x: 17, y: 1, objectId: "1" },
      { x: 18, y: 1, objectId: "1" },
      { x: 19, y: 1, objectId: "1" },
      { x: 20, y: 1, objectId: "1" },
    ],
    switchGroups: [
      { x: 5, y: 8, switchId: "1" },
      { x: 6, y: 8, switchId: "1" },
      { x: 7, y: 8, switchId: "1" },
      { x: 8, y: 8, switchId: "1" },
      { x: 1, y: 4, switchId: "2" },
      { x: 6, y: 1, switchId: "1" },
      { x: 9, y: 1, switchId: "1" },
      { x: 9, y: 2, switchId: "1" },
      { x: 14, y: 4, switchId: "2" },
      { x: 14, y: 5, switchId: "2" },
      { x: 19, y: 4, switchId: "2" },
      { x: 19, y: 5, switchId: "2" },
      { x: 20, y: 2, switchId: "2" },
      { x: 21, y: 1, switchId: "2" },
    ],
    usage: {
      copy: Number.POSITIVE_INFINITY,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  };
}
