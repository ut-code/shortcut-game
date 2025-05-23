import { stagePreprocess } from "@/stage-preprocessor.ts";
import type { StageDefinition } from "./type.ts";

export namespace world2 {
  export const stage1: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      ".........b........",
      ".........b........",
      ".........w........",
      ".s....m..w.....g..",
      "bSbbbbbbbbbbbbbbbb",
    ],
    initialPlayerX: 3,
    initialPlayerY: 5,
    blockGroups: [],
    switchGroups: [
      {
        x: 1,
        y: 4,
        switchId: "1",
      },
      {
        x: 9,
        y: 3,
        switchId: "1",
      },
      {
        x: 9,
        y: 4,
        switchId: "1",
      },
    ],
  };
  export const stage2: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbbbbbbbbb",
      ".........................",
      "......................g..",
      "...............wbbbbbbbbb",
      "m...............bbbbbbbbb",
      "bb..............w.....m..",
      "bb..............b....mm..",
      "bb.w....m..s...bb...mmm..",
      "bbbbbbbbbbbSbbbbbbbbbbbbb",
    ],
    initialPlayerX: 5,
    initialPlayerY: 8,
    blockGroups: [
      {
        x: 20,
        y: 7,
        objectId: "1",
      },
      {
        x: 21,
        y: 7,
        objectId: "1",
      },
      {
        x: 21,
        y: 6,
        objectId: "1",
      },
      {
        x: 22,
        y: 5,
        objectId: "1",
      },
      {
        x: 22,
        y: 6,
        objectId: "1",
      },
      {
        x: 22,
        y: 7,
        objectId: "1",
      },
    ],
    switchGroups: [
      {
        x: 3,
        y: 7,
        switchId: "1",
      },
      {
        x: 11,
        y: 7,
        switchId: "1",
      },
      {
        x: 15,
        y: 3,
        switchId: "1",
      },
      {
        x: 16,
        y: 5,
        switchId: "1",
      },
    ],
  };
  export const stage3 = stagePreprocess({
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      "..................",
      "................g.",
      "........w......bbb",
      "........w.....wbbb",
      ".....bm.w....w.bbb",
      ".....bbb...bbbbbbb",
      "...m.bbb...bbbbbbb",
      "...mm...s.........",
      "bbbbbbbbSbbbbbbbbb",
    ],
    overlay: [
      "bbbbbbbbbbbbbbbbbb",
      "..................",
      "................g.",
      "........1......bbb",
      "........1.....1bbb",
      ".....bm.1....1.bbb",
      ".....bbb...bbbbbbb",
      "...3 bbb...bbbbbbb",
      ".S.33...1.........",
      "bbbbbbbbbbbbbbbbbb",
    ],
  });
  export const stage4: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbbbbbbb",
      ".........w...b.........",
      ".........w.g.b...m.....",
      ".........bbbbb.........",
      "m.......w.....w......m.",
      "mm.....w.......w.....mm",
      "bbb..bb.........bb..bbb",
      ".......w.......w.......",
      "....s.m.w.....w...s....",
      "bbbbSbbbbbbbbbbbbbSbbbb",
    ],
    initialPlayerX: 1,
    initialPlayerY: 9,
    blockGroups: [
      {
        x: 0,
        y: 4,
        objectId: "1",
      },
      {
        x: 0,
        y: 5,
        objectId: "1",
      },
      {
        x: 1,
        y: 5,
        objectId: "1",
      },
      {
        x: 21,
        y: 4,
        objectId: "2",
      },
      {
        x: 21,
        y: 5,
        objectId: "2",
      },
      {
        x: 22,
        y: 5,
        objectId: "2",
      },
    ],
    switchGroups: [
      {
        x: 4,
        y: 8,
        switchId: "1",
      },
      {
        x: 7,
        y: 5,
        switchId: "2",
      },
      {
        x: 7,
        y: 7,
        switchId: "1",
      },
      {
        x: 8,
        y: 4,
        switchId: "2",
      },
      {
        x: 8,
        y: 8,
        switchId: "1",
      },
      {
        x: 9,
        y: 1,
        switchId: "2",
      },
      {
        x: 9,
        y: 2,
        switchId: "2",
      },
      {
        x: 14,
        y: 4,
        switchId: "1",
      },
      {
        x: 14,
        y: 8,
        switchId: "2",
      },
      {
        x: 15,
        y: 5,
        switchId: "1",
      },
      {
        x: 15,
        y: 7,
        switchId: "2",
      },
      {
        x: 18,
        y: 8,
        switchId: "2",
      },
    ],
  };
}
