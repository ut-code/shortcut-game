import { Block } from "./constants.ts";
import type { StageDefinition } from "./stages.ts";

export type Grid = Block[][];
export function getBlock(grid: Grid, x: number, y: number): Block | undefined {
  return grid[y]?.[x];
}
export function setBlock(grid: Grid, x: number, y: number, block: Block) {
  grid[y][x] = block;
}

export default function createStage(
  stageDefinition: StageDefinition,
): Block[][] {
  const grid: Block[][] = [];
  for (const stageRow of stageDefinition) {
    const row: Block[] = [];
    for (const char of stageRow) {
      switch (char) {
        case " ":
          row.push(Block.air);
          break;
        case "b":
          row.push(Block.block);
          break;
        case "m":
          row.push(Block.movable);
          break;
        default:
          throw new Error(`unknown block type: '${char}'`);
      }
    }
    grid.push(row);
  }
  return grid;
}
