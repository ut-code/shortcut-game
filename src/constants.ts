// 単位は blockSize * px
export const playerWidth = 0.6;
export const playerHeight = 0.9;
export const moveVX = 0.1;
export const jumpVY = 0.12;
export const jumpFrames = 10;
export const gravity = 0.02;
export const maxObjectFallSpeed = 2;

export enum Block {
  block = "block",
  movable = "movable",
  fallable = "fallable",
  switch = "switch",
  switchBase = "switch-base",
  switchingBlockOFF = "switching-block-off",
  switchingBlockON = "switching-block-on",
  switchPressed = "switch-pressed",
  goal = "goal",
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
