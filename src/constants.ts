/// 単位は blockSize * px
// global
export const gravity = 0.02;
// Player 関連
export const playerWidth = 0.8;
export const playerHeight = 0.8;
export const maxMoveVX = 0.1; // これを超えると player の入力では加速しなくなるが、ジャンプで加速できる
export const playerAccelOnGround = 0.05;
export const playerDecelOnGround = 0.05;
export const playerAccelInAir = 0.01;
export const playerDecelInAir = 0.01;
export const jumpAccelRate = 1.05; // ジャンプした瞬間に加速
export const jumpVY = 0.12;
export const jumpFrames = 10;
// Fallable block 関連
export const maxObjectFallSpeed = 2;
// アニメーション関連
export const elapsedTimePerFrame = 30;

export const laserWidth = 0.3;

export const LARGE_BLOCK_COLOR = 0xff00a0; // 大きなブロックは別の色で表示する
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
  spike = "spike",
  laserUp = "laser-up",
  laserDown = "laser-down",
  laserLeft = "laser-left",
  laserRight = "laser-right",
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
  ["^", Block.spike],
  ["z", Block.laserUp],
  ["g", Block.goal],
]);

export const ReverseBlockMap = new Map<Block | null, string>();
BlockDefinitionMap.forEach((value, key) => {
  ReverseBlockMap.set(value, key);
});
