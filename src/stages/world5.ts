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
      ".....................",
      ".....................",
      "m..........f.........",
      "bb.........f...^^....",
      "..........bb..^bb....",
      "f.............bbb..g.",
      "bbbb^b^b^bbb^^bbbbbbb",
    ],
    overlay: [
      "bbbbbbbbbbbbbbbbbbbbb",
      ".....................",
      ".....................",
      "m..........f.........",
      "bb.........f...^^....",
      "..........bb..^bb....",
      "f.S...........bbb..g.",
      "bbbb^b^b^bbb^^bbbbbbb",
    ],
    inventoryIsInfinite: false,
    usage: {
      copy: 0,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  });

  export const stage4: StageDefinition = stagePreprocess({
    stage: [
      "bbbbbbbbbbbbbbbbbbbbb",
      ".....................",
      "..fm...........b.....",
      "..fm...........b.....",
      "mmmm...........b.....",
      "bbbb...........b.g...",
      "bbbb..^.....^..bbbb..",
      "bbbb..b^..^^b.^b.....",
      "bbbb..bb..bbb.bb.....",
      "bbbb..bb..bbf........",
      "bbbb..bb..bbbbbbbbbbb",
    ],
    overlay: [
      "bbbbbbbbbbbbbbbbbbbbb",
      ".....................",
      "..fm...........b.....",
      ".Sfm...........b.....",
      "mmmm...........b.....",
      "bbbb...........b.g...",
      "bbbb..^.....^..bbbb..",
      "bbbb..b^..^^b.^b.....",
      "bbbb..bb..bbb.bb.....",
      "bbbb..bb..bbf........",
      "bbbb..bb..bbbbbbbbbbb",
    ],
    inventoryIsInfinite: false,
    usage: {
      copy: 0,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
  });
}
