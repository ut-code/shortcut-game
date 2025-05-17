import type { PreprocessInput } from "@/stage-preprocessor.ts";
import { usages } from "./_proto.ts";

export namespace world4 {
  export const stage1: PreprocessInput = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      "b.....b...........",
      "b.....b........G..",
      "b.....b.......bbbb",
      "b.....b.......bbbb",
      "b.....m........bbb",
      "bbbbbbbbbbbbbbbbbb",
    ],
    overlay: [
      "bbbbbbbbbbbbbbbbbb",
      "b.....b...........",
      "b.....b........G..",
      "b.....b.......bbbb",
      "b.....b.......bbbb",
      "b.S...m........bbb",
      "bbbbbbbbbbbbbbbbbb",
    ],
    usage: usages.allInf,
  };

  export const stage2: PreprocessInput = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      "..................",
      "...............G..",
      ".............bbbbb",
      ".......f.....bbbbb",
      ".......f.....bbbbb",
      ".......f.....bbbbb",
      "bbbbbbbbb.bb.bbbbb",
    ],
    overlay: [
      "bbbbbbbbbbbbbbbbbb",
      "..................",
      "...............G..",
      ".............bbbbb",
      ".......f.....bbbbb",
      ".......f.....bbbbb",
      ".S.....f.....bbbbb",
      "bbbbbbbbb.bb.bbbbb",
    ],
    usage: usages.allInf,
  };

  export const stage3: PreprocessInput = {
    stage: [
      "bbbbbbbbbbbbbbbb",
      "G..W.........w..",
      "....bb..bb..bb..",
      "....bb..bb..bb..",
      "....bbf.bbs.bbm.",
      "...bbbbbbbbbbbbb",
    ],
    overlay: [
      "bbbbbbbbbbbbbbbb",
      "...1.S.......1..",
      "....bb..bb..bb..",
      "....bb..bb..bb..",
      "....bbf.bb1.bbm.",
      "...bbbbbbbbbbbbb",
    ],
    usage: usages.allInf,
  };

  export const stage4: PreprocessInput = {
    stage: [
      // (s -> d,D  s' -> d',D')
      "bbbbbbbbbbbbbbbbbbbbbbb",
      "bbbb..W..w.....bmmmmW..",
      "bbbb..bb.w.........W...",
      ".......b.bbbbbbbbbbb...",
      ".s............w........",
      "bbbbb.........w....m...",
      "bbbbb.........bbbbbb...",
      "bbbbb.........bG......b",
      "bbbbb.sss...f.b......bb",
      "bbbbbbbbbbbbbbb.....bbb",
    ],
    overlay: [
      "bbbbbbbbbbbbbbbbbbbbbbb",
      "bbbb..1..1.....b99992..",
      "bbbb..bb.1.........2...",
      ".......b.bbbbbbbbbbb...",
      ".2............2........",
      "bbbbb.........2...m....",
      "bbbbb.........bbbbbb...",
      "bbbbb.........bG......b",
      "bbbbb.111.S.f.b......bb",
      "bbbbbbbbbbbbbbb.....bbb",
    ],
    usage: usages.allInf,
  };
}
