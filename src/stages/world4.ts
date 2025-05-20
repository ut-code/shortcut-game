import { usages } from "./_proto.ts";
import type { StageDefinition } from "./type.ts";

export namespace world4 {
  export const stage1: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      "..................",
      "..z....z..........",
      "..................",
      ".........z.....z..",
      "...........mmm....",
      "bbbbbbbbbbbbbbbbbb",
    ],
    initialPlayerX: 3,
    initialPlayerY: 6,
    usage: usages.allInf,
    blockGroups: [],
    switchGroups: [],
    laserDirections: [
      { x: 2, y: 2, direction: "down" },
      { x: 7, y: 2, direction: "right" },
      { x: 9, y: 4, direction: "left" },
      { x: 15, y: 4, direction: "up" },
    ],
  };

  export const stage2: StageDefinition = {
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
    initialPlayerX: 3,
    initialPlayerY: 5,
    usage: usages.allInf,
    blockGroups: [],
    switchGroups: [],
  };

  export const stage3: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbb",
      "...d.........D..",
      "....bb..bb..bb..",
      "....bb..bb..bb..",
      "....bbf.bbs.bbm.",
      "...bbbbbbbbbbbbb",
    ],
    initialPlayerX: 4,
    initialPlayerY: 2,
    usage: usages.allInf,
    blockGroups: [],
    switchGroups: [
      {
        x: 3,
        y: 1,
        switchId: "1",
      },
    ],
  };

  // TODO
  export const stage4 = {
    stage: [
      // (s -> d,D  s' -> d',D')
      "bbbbbbbbbbbbbbbbbbbbbbb",
      "bbbb..d..D.....bmmmmd'.",
      "bbbb..bb.D.........d'",
      ".......b.bbbbbbbbbbb...",
      ".s'...........D'......",
      "bbbbb.........D'..m..",
      "bbbbb.........bbbbbb",
      "bbbbb.........bG......b",
      "bbbbb.sss.S.f.b......bb",
      "bbbbbbbbbbbbbbb.....bbb",
    ],
    usage: usages.allInf,
    blockGroups: [],
    switchGroups: [],
  };
}
