import { stagePreprocess } from "./stage-preprocessor.ts";
import { stage1 } from "./stages/1.ts";
import { stage2 } from "./stages/2.ts";
import { stage3 } from "./stages/3.ts";
import { stage4 } from "./stages/4.ts";
import { stage5 } from "./stages/5.ts";
import { stage6 } from "./stages/6.ts";
import { stage7 } from "./stages/7.ts";
import { stage8 } from "./stages/8.ts";
import type { StageDefinition } from "./stages/type.ts";
import { world1 } from "./stages/world1.ts";
import { world2 } from "./stages/world2.ts";
import { world3 } from "./stages/world3.ts";
import { world4 } from "./stages/world4.ts";

export const stages = new Map<string, StageDefinition>([
  ["1", stage1],
  ["2", stage2],
  ["3", stage3],
  ["4", stage4],
  ["5", stage5],
  ["6", stage6],
  ["7", stagePreprocess(stage7)],
  ["8", stage8],
  ["1-1", world1.stage1],
  ["1-2", world1.stage2],
  ["1-3", world1.stage3],
  ["1-4", world1.stage4],
  ["2-1", world2.stage1],
  ["2-2", world2.stage2],
  ["2-3", world2.stage3],
  ["2-4", world2.stage4],
  ["3-1", world3.stage1],
  ["3-2", world3.stage2],
  ["3-3", world3.stage3],
  ["3-4", world3.stage4],
  ["4-1", world4.stage1],
  ["4-2", world4.stage2],
]);
