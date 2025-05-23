import { stagePreprocess } from "@/stage-preprocessor.ts";
import type { StageDefinition } from "./type.ts";

export const stage4: StageDefinition = stagePreprocess({
  stage: [
    "bbbbbbbbbbbbbbbbbbbbbb",
    "......................",
    "....................g.",
    "...................bbb",
    "m..................bbb",
    "bb.................bbb",
    "bb..........m......bbb",
    "bb.........mm......bbb",
    "bb..bb...bbbbb.....bbb",
    "bb..bbb............bbb",
    "bb..bbbb..m........bbb",
    "bb..bbbbbbbbbbb....bbb",
  ],
  overlay: [
    "bbbbbbbbbbbbbbbbbbbbbb",
    "......................",
    "....................g.",
    "...................bbb",
    "1..................bbb",
    "bb.................bbb",
    "bb..........2......bbb",
    "bb...S.....22......bbb",
    "bb..bb...bbbbb.....bbb",
    "bb..bbb............bbb",
    "bb..bbbb..3........bbb",
    "bb..bbbbbbbbbbb....bbb",
  ],
});
