import { Particle } from "pixi.js";
import { assert } from "./lib.ts";
import type { BlockGroup, Stage, StageDefinition, SwitchGroup } from "./stages/type.ts";

export type PreprocessInput = {
  stage: Stage;
  overlay: string[]; // same as stage
  isTutorial?: boolean;
  inventoryIsInfinite?: boolean;
  usage?: {
    cut: number;
    copy: number;
    paste: number;
  };
};

/** supported overlay formats:
 - S -> player Starting point
 - [1-9] -> switchGroup or blockGroup, depending on the block at the same place in stage
   (will error if same number is used for switchGroup and blockGroup)
 */
export function stagePreprocess(input: PreprocessInput): StageDefinition {
  validate(input);
  const { overlay, ...rest } = input;
  const player = find(input.overlay, "S");
  assert(
    player != null,
    `[stagePreprocess.find] character not found: looking for "S" in
    ${input.overlay}`,
  );

  const switchGroups: SwitchGroup[] = [];
  const blockGroups: BlockGroup[] = [];
  for (const groupId of "0123456789") {
    const group = handleGrouping(input, groupId);
    if (!group) continue;
    switch (group.type) {
      case "switch":
        switchGroups.push(...group.group);
        break;
      case "block":
        blockGroups.push(...group.group);
        break;
      default:
        group satisfies never;
    }
  }

  return {
    ...rest,
    initialPlayerX: player.x,
    initialPlayerY: player.y,
    switchGroups,
    blockGroups,
  };
}

type handleGroupingRet =
  | {
      type: "switch";
      group: SwitchGroup[];
    }
  | {
      type: "block";
      group: BlockGroup[];
    };

function handleGrouping(input: PreprocessInput, id: string): handleGroupingRet | null {
  const switchGroups: SwitchGroup[] = [];
  const blockGroups: BlockGroup[] = [];
  let blockType: "switchId" | "groupId" | null = null;

  for (let y = 0; y < input.overlay.length; y++) {
    for (let x = 0; x < input.overlay[y].length; x++) {
      if (input.overlay[y][x] !== id) continue;
      switch (input.stage[y][x]) {
        case "m":
        case "f": {
          assert(blockType !== "switchId", `${id} seems to be used for switchGroup, but there's a block at that place`);
          blockType = "groupId";
          blockGroups.push({
            objectId: id,
            x,
            y,
          });
          break;
        }
        case "s":
        case "w":
        case "W": {
          assert(blockType !== "groupId", `${id} seems to be used for blockGroup, but there's a switch at that place`);
          blockType = "switchId";
          switchGroups.push({
            switchId: id,
            x,
            y,
          });
          break;
        }

        default: {
          throw new Error(
            `[stagePreprocess.handleGrouping] cannot find block for overlay ${id} at (${x},${y}), got ${input.stage[y][x]}`,
          );
        }
      }
    }
  }
  if (blockType === null) return null; // not found for that ID (happens often)
  return blockType === "switchId" ? { type: "switch", group: switchGroups } : { type: "block", group: blockGroups };
}

function find(stage: Stage, char: string) {
  for (let y = 0; y < stage.length; y++) {
    for (let x = 0; x < stage[y].length; x++) {
      if (stage[y][x] === char) return { x, y };
    }
  }
  return null;
}

function validate(input: PreprocessInput) {
  const expectY = input.stage.length;
  const expectX = input.stage[0].length;

  validateLen(input.stage, expectY, expectX);
  validateLen(input.overlay, expectY, expectX);
}

function validateLen(stage: Stage, expectY: number, expectX: number) {
  assert(stage.length === expectY, `stage length do not equal: expected ${expectY}, got ${stage.length}`);
  for (const row of stage) {
    assert(row.length === expectX, `stage rows' lengths are not equal: expected ${expectX}, got ${row.length}`);
  }
}
