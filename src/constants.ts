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
  switchingBlockOFF = "switching-block-off", // 初期状態で出現している
  switchingBlockON = "switching-block-on", // スイッチを押すと隠れる
  inverseSwitchingBlockOFF = "inverse-switching-block-off", // 初期状態で隠れている
  inverseSwitchingBlockON = "inverse-switching-block-on", // スイッチを押すと出現する
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

export const BlockDefinitionMap = new Map<string, Block | null>([
  [".", null],
  ["b", Block.block],
  ["m", Block.movable],
  ["f", Block.fallable],
  ["s", Block.switch],
  ["S", Block.switchBase],
  ["w", Block.switchingBlockOFF],
  ["W", Block.inverseSwitchingBlockOFF],
  ["g", Block.goal],
]);
