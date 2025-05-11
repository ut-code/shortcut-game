// 単位は blockSize * px
export const playerWidth = 0.6;
export const playerHeight = 0.9;
export const moveVX = 0.1;
export const jumpVY = 0.12;
export const jumpFrames = 10;
export const gravity = 0.02;

export enum Block {
  air = "air",
  block = "block",
  movable = "movable",
  switch = "switch",
  switchBase = "switch-base",
  switchWithObject = "switch-with-object",
  switchingBlockOFF = "switching-block-off",
  switchingBlockON = "switching-block-on",
}
export enum Facing {
  left = "left",
  right = "right",
}
export enum Inputs {
  Left = 0,
  Right = 1,
  Up = 2,
  Ctrl = 3,
}
