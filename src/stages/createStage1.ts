import { Block } from "../constants.ts";

export default function createStage1(gridX: number): Block[][] {
  const gridRow0 = new Array(gridX).fill(Block.block);
  const gridRow1 = new Array(gridX).fill(Block.air);
  gridRow1[7] = Block.block;
  const gridRow2 = new Array(gridX).fill(Block.air);
  gridRow2[7] = Block.block;
  const gridRow3 = new Array(gridX).fill(Block.air);
  gridRow3[7] = Block.block;
  for (let i = 13; i < gridX; i++) {
    gridRow3[i] = Block.block;
  }
  const gridRow4 = new Array(gridX).fill(Block.air);
  gridRow4[7] = Block.movable;
  for (let i = 13; i < gridX; i++) {
    gridRow4[i] = Block.block;
  }
  const gridRow5 = new Array(gridX).fill(Block.block);

  return [gridRow0, gridRow1, gridRow2, gridRow3, gridRow4, gridRow5];
}
