import { stagePreprocess } from "@/stage-preprocessor.ts";
import type { StageDefinition } from "./type.ts";

export namespace world1 {
  export const stage1: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      ".........b........",
      ".........b......g.",
      ".........b...bbbbb",
      ".........m...bbbbb",
      "bbbbbbbbbbbbbbbbbb",
    ],
    isTutorial: true,
    initialPlayerX: 1,
    initialPlayerY: 5,
    blockGroups: [],
    switchGroups: [],
  };
  export const stage2: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      "..................",
      "...............g..",
      "m............bbbbb",
      "bb...........bbbbb",
      "bb.....m.....bbbbb",
      "bbbbbbbbbbbbbbbbbb",
    ],
    isTutorial: true,
    initialPlayerX: 3,
    initialPlayerY: 6,
    blockGroups: [],
    switchGroups: [],
  };

  export const stage3: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      "...b............g.",
      "...b....m......bbb",
      "...bm..........bbb",
      "...bbb.........bbb",
      "...mm..........bbb",
      "bbbbbbbbbbb....bbb",
    ],
    initialPlayerX: 1,
    initialPlayerY: 6,
    blockGroups: [
      {
        x: 3,
        y: 5,
        objectId: "1",
      },
      {
        x: 4,
        y: 5,
        objectId: "1",
      },
    ],
    switchGroups: [],
  };

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
}
