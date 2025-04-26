import { app } from "./resources.ts";
import { Block } from "./constants.ts";
import createStage1 from "./stages/createStage1.ts";

export const gridX = 18;
export const gridY = 6;
export const grid: Block[][] = createStage1(gridX);
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
