import { stagePreprocess } from "@/stage-preprocessor.ts";
import type { StageDefinition } from "./type.ts";

export const stage6: StageDefinition = stagePreprocess({
  stage: [
    "bbbbbbbbbbbbbbbbbbbbbbbbb",
    ".........................",
    "......................g..",
    "................bbbbbbbbb",
    "...............wbbbbbbbbb",
    "m...............bbbbbbbbb",
    "bb..............w.....m..",
    "bb..............b....mm..",
    "bb.w....m..s...bb...mmm..",
    "bbbbbbbbbbbSbbbbbbbbbbbbb",
  ],
  overlay: [
    "bbbbbbbbbbbbbbbbbbbbbbbbb",
    ".........................",
    "......................g..",
    "................bbbbbbbbb",
    "...............1bbbbbbbbb",
    "m...............bbbbbbbbb",
    "bb..............1.....2..",
    "bb..............b....22..",
    "bb.1..S.m..1...bb...222..",
    "bbbbbbbbbbb-bbbbbbbbbbbbb",
  ],
});
