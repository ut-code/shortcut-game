import { stagePreprocess } from "@/stage-preprocessor.ts";
import type { StageDefinition } from "./type.ts";

export namespace world1 {
  export const stage1: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      "..................",
      "..................",
      "...............g..",
      "............bbbbbb",
      "......bbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbbbb",
    ],
    isTutorial: false,
    initialPlayerX: 1,
    initialPlayerY: 6,
    inventoryIsInfinite: false,
    blockGroups: [],
    switchGroups: [],
    usage: {
      copy: 0,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  };
  export const stage2: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      "........b.........",
      "........b.........",
      "........b.........",
      "........b.........",
      "........m.......g.",
      "bbbbbbbbbbbbbbbbbb",
    ],
    isTutorial: false,
    initialPlayerX: 2,
    initialPlayerY: 6,
    inventoryIsInfinite: false,
    blockGroups: [],
    switchGroups: [],
    usage: {
      copy: 0,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  };
  export const stage3: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      "..................",
      "..................",
      "..................",
      "..................",
      "..................",
      "mmmm............g.",
      "bbbbbbbb....bbbbbb",
    ],
    isTutorial: false,
    initialPlayerX: 5,
    initialPlayerY: 6,
    inventoryIsInfinite: false,
    blockGroups: [
      {
        x: 0,
        y: 6,
        objectId: "1",
      },
      {
        x: 1,
        y: 6,
        objectId: "1",
      },
      {
        x: 2,
        y: 6,
        objectId: "1",
      },
      {
        x: 3,
        y: 6,
        objectId: "1",
      },
    ],
    switchGroups: [],
    usage: {
      copy: 0,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  };
  export const stage4: StageDefinition = stagePreprocess({
    stage: [
      "bbbbbbbbbbbbbbbbbbbbb",
      ".....................",
      "...g.................",
      "bbbbbbbbbb...........",
      ".....................",
      ".....................",
      "............bbbbbbbbb",
      "....m.........m......",
      "....mm.......mm......",
      "bbbbbbbbbbbbbbbbbbbbb",
    ],
    overlay: [
      "bbbbbbbbbbbbbbbbbbbbb",
      ".....................",
      "...g.................",
      "bbbbbbbbbb...........",
      ".....................",
      ".....................",
      "............bbbbbbbbb",
      "....1.........2......",
      ".S..11.......22......",
      "bbbbbbbbbbbbbbbbbbbbb",
    ],
    isTutorial: false,
    inventoryIsInfinite: false,
    usage: {
      copy: 0,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  });
}
