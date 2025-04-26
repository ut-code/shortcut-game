import { Block } from "../constants.ts";

export default function createStage1(numGrid: number[][]): Block[][] {
  const grid: Block[][] = [];
  for (const numRow of numGrid) {
    const row: Block[] = [];
    for (const num of numRow) {
      switch (num) {
        case 0:
          row.push(Block.air);
          break;
        case 1:
          row.push(Block.block);
          break;
        case 2:
          row.push(Block.movable);
          break;
        default:
          throw new Error("no proper block");
      }
    }
    grid.push(row);
  }
  return grid;
}
