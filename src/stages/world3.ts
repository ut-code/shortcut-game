import type { StageDefinition } from "./type.ts";

export namespace world3 {
  export const stage1: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      ".........b........",
      ".........b........",
      ".........w........",
      ".s....f..w.....g..",
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
  // fallable+スイッチのテスト用 あとでけす
  export const stage2: StageDefinition = {
    stage: [
      "bbbbbbbbbbbbbbbbbb",
      "..................",
      "........bb.....g..",
      ".......b.....bbbbb",
      "......b......bbbbb",
      ".....b.......bbbbb",
      "....b........bbbbb",
      "bbbbbbbbbb.bbbbbbb",
    ],
    initialPlayerX: 1,
    initialPlayerY: 2,
    blockGroups: [],
    switchGroups: [],
  };
}
