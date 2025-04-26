import { app } from "./resources.ts";
import createStage1 from "./stages/createStage1.ts";

export enum Block {
  air = "air",
  block = "block",
  movable = "movable",
}

export const gridX = 18;
export const gridY = 6;
export const grid: Block[][] = createStage1(gridX);
export const pixelSize = Math.min(
  app.screen.width / gridX,
  app.screen.height / gridY,
);
export function getBlock(x: number, y: number) {
  return grid[y]?.[x];
}
export function setBlock(x: number, y: number, block: Block) {
  grid[y][x] = block;
}
