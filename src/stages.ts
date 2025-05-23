import { stagePreprocess } from "./stage-preprocessor.ts";
import type { StageDefinition } from "./stages/type.ts";
import { world1 } from "./stages/world1.ts";
import { world2 } from "./stages/world2.ts";
import { world3 } from "./stages/world3.ts";
import { world4 } from "./stages/world4.ts";
import { world5 } from "./stages/world5.ts";
import { world6 } from "./stages/world6.ts";

export const stages = new Map<string, StageDefinition>([
  ["1-1", world1.stage1],
  ["1-2", world1.stage2],
  ["1-3", world1.stage3],
  ["1-4", world1.stage4],
  ["2-1", world2.stage1],
  ["2-2", world2.stage2],
  ["2-3", world2.stage3],
  ["2-4", world2.stage4],
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
  ["4-3", world4.stage3],
  ["4-4", world4.stage4],
  ["5-1", world5.stage1],
  ["5-2", world5.stage2],
  ["5-3", world5.stage3],
  ["5-4", world5.stage4],
  ["6-1", world6.stage1],
  ["6-2", world6.stage2],
  ["6-3", world6.stage3],
  ["6-4", world6.stage4],
]);
