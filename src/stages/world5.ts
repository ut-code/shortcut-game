import { stagePreprocess } from "@/stage-preprocessor.ts";
import { usages } from "./_proto.ts";
import type { StageDefinition } from "./type.ts";

export namespace world5 {
  export const stage1: StageDefinition = stagePreprocess({
    stage: [
      "bbbbbbbbbbbbbbbbbbbbbbbb",
      "....w...................",
      "....w...................",
      ".g..w...................",
      "bbbbbbb.................",
      ".................bb.....",
      "....f............bbbbb..",
      "bbbbbbb.bbwwwwwb.bbm....",
      "bbbbbbb.bbm..m.b.......m",
      "bbbbbbbsbbmm.mmb.....smm",
      "bbbbbbbSbbbbbbbb^bbbbSbb",
    ],
    overlay: [
      "bbbbbbbbbbbbbbbbbbbbbbbb",
      "....2...................",
      "....2...................",
      ".g..2...................",
      "bbbbbbb.................",
      ".................bb.....",
      "..S.f............bbbbb..",
      "bbbbbbb.bb11111b.bbm....",
      "bbbbbbb.bb5..3.b.......4",
      "bbbbbbb1bb55.33b.....244",
      "bbbbbbb-bbbbbbbb^bbbb-bb",
    ],
    inventoryIsInfinite: false,
    usage: {
      copy: 0,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  });
  export const stage2: StageDefinition = stagePreprocess({
    stage: [
      "bbbbbbbbbbbbbbbbbbbbb",
      "...........f.........",
      "...........fmm......g",
      "..........bbbb.....bb",
      ".f...................",
      "bbbbbb.m.............",
      "bbbbb..m.............",
      "bbbbb.mm.............",
      "bbbbb.^^^^^^^^^^^^^^^",
    ],
    overlay: [
      "bbbbbbbbbbbbbbbbbbbbb",
      "...........f.........",
      "...........f22......g",
      "..........bbbb.....bb",
      ".f.S.................",
      "bbbbbb.1.............",
      "bbbbb..1.............",
      "bbbbb.11.............",
      "bbbbb.^^^^^^bbbbbbbbb",
    ],
    inventoryIsInfinite: false,
    usage: {
      copy: 0,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  });
  export const stage3: StageDefinition = stagePreprocess({
    stage: [
      "bbbbbbbbbbbbbbbbbbbbb",
      "...........f.........",
      "...........fmm......g",
      "..........bbbb.....bb",
      ".f...................",
      "bbbbbb.m.............",
      "bbbbb..m.............",
      "bbbbb.mm.............",
      "bbbbb.^^^^^^^^^^^^^^^",
    ],
    overlay: [
      "bbbbbbbbbbbbbbbbbbbbb",
      "...........f.........",
      "...........f22......g",
      "..........bbbb.....bb",
      ".f.S.................",
      "bbbbbb.1.............",
      "bbbbb..1.............",
      "bbbbb.11.............",
      "bbbbb.^^^^^^bbbbbbbbb",
    ],
    inventoryIsInfinite: false,
    usage: {
      copy: 0,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  });

  export const stage4: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbbbbb",
      ".....................",
      ".....................",
      ".....................",
      ".....................",
      ".....................",
      ".....................",
      ".....................",
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
