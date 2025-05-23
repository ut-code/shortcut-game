import { stagePreprocess } from "@/stage-preprocessor.ts";
import type { StageDefinition } from "./type.ts";

export namespace world4 {
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
  export const stage4: StageDefinition = stagePreprocess({
    stage: [
      "bbbbbbbbbbbbbbbbbbbbbbbb",
      "bbbb..W..w.....bmmmmW...",
      "bbbb..bb.w.........W....",
      ".......b.bbbbbbbbbbb....",
      ".s............w....w....",
      "bSbbb.........w..m.w....",
      "bbbbb.........bbbbbb...b",
      "bbbbb.........bg......bb",
      "bbbbbssss...f.b......bbb",
      "bbbbbSSSSbbbbbb.....bbbb",
    ],
    overlay: [
      "bbbbbbbbbbbbbbbbbbbbbbbb",
      "bbbb..1..1.....b33332...",
      "bbbb..bb.1.........2....",
      ".......b.bbbbbbbbbbb....",
      ".2............2....2....",
      "b-bbb.........2..m.2....",
      "bbbbb.........bbbbbb...b",
      "bbbbb.........bg......bb",
      "bbbbb1111.S.f.b......bbb",
      "bbbbb----bbbbbb.....bbbb",
    ],
    isTutorial: false,
    inventoryIsInfinite: true,
    usage: {
      copy: Number.POSITIVE_INFINITY,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  });
}
