import { app } from "./resources";

export enum Block {
  air = "air",
  block = "block",
  movable = "movable",
}

export const grid: Block[][] = [];
export const gridX = 17;
export const gridY = 16;
export const pixelSize = Math.min(
  app.screen.width / gridX,
  app.screen.height / gridY,
);
export function getRandom() {
  switch (Math.floor(Math.random() * 10)) {
    case 1:
      return Block.block;
    case 2:
      return Block.movable;
    default:
      return Block.air;
  }
}
export function getBlock(x: number, y: number) {
  return grid[y]?.[x];
}
export function setBlock(x: number, y: number, block: Block) {
  grid[y][x] = block;
}

export function shuffleGrid() {
  grid.length = 0;
  for (let y = 0; y < gridY; y++) {
    grid.push([]);
    for (let x = 0; x < gridX; x++) {
      grid[y].push(getRandom());
    }
  }
}
shuffleGrid();
