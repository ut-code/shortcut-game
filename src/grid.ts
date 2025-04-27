import { Block } from "./constants.ts";

export type Grid = Block[][];
export function getRandom() {
  switch (Math.floor(Math.random() * 3)) {
    case 0:
      return Block.air;
    case 1:
      return Block.block;
    case 2:
      return Block.movable;
    default:
      throw new Error("oops!");
  }
}
export function getBlock(grid: Grid, x: number, y: number): Block | undefined {
  return grid[y]?.[x];
}
export function setBlock(grid: Grid, x: number, y: number, block: Block) {
  grid[y][x] = block;
}

export default function createStage(numGrid: number[][]): Block[][] {
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
