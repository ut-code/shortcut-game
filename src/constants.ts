// 単位はpixelSizeに比例
export const playerWidth = 0.6;
export const playerHeight = 0.9;
export const moveVX = 0.04;
export const jumpVY = 0.1;
export const jumpFrames = 10;
export const gravity = 0.02;

export enum Block {
  air = "air",
  block = "block",
  movable = "movable",
}
export enum Facing {
  left = "left",
  right = "right",
}
