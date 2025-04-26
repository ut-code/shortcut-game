import { Block } from "./constants.ts";
import createStage from "./createStage.ts";
import { app } from "./resources.ts";
import { grid1, grid2, grid3 } from "./stages.ts";

const stage = 1 as 1 | 2 | 3;
const numGrid = (() => {
  switch (stage) {
    case 1:
      return grid1;
    case 2:
      return grid2;
    case 3:
      return grid3;
    default:
      throw new Error("hoge");
  }
})();

export const gridX = numGrid[0].length;
export const gridY = numGrid.length;

export const grid: Block[][] = createStage(numGrid);
export const pixelSize = Math.min(
  app.screen.width / gridX,
  app.screen.height / gridY,
);
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
export function getBlock(x: number, y: number): Block | undefined {
  return grid[y]?.[x];
}
export function setBlock(x: number, y: number, block: Block) {
  grid[y][x] = block;
}
