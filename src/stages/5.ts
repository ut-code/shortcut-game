import type { StageDefinition } from "./type.ts";

export const stage5: StageDefinition = {
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
