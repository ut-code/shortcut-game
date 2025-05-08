import type { Container } from "pixi.js";
import type { Writable } from "svelte/store";
import type { Block } from "./constants.ts";
import type { Grid } from "./grid.ts";

export type GameState = {
  inventory: MovableObject | null;
  abilities: AbilityUsage;
};

export type StateSnapshot = GameState;
export type GameHistory = {
  tree: StateSnapshot[];
  index: number;
};

export type Context = {
  stage: Container;

  // about grid system
  gridX: number; // total grid in X direction, NOT width of single glid
  gridY: number; // total grid in Y direction
  marginY: number; // windowの上端とy=0上端の距離(px)
  grid: Grid;
  blockSize: number;

  // about player
  initialPlayerX: number; // initial player position in X direction
  initialPlayerY: number; // initial player position in Y direction

  // about time
  elapsed: number;

  uiContext: Writable<UIContext>;
};

export type UIContext = {
  inventory: MovableObject | null;
  inventoryIsInfinite: boolean;
  copy: number;
  paste: number;
  cut: number;
  undo: number;
  redo: number;
  paused: boolean;
};
export type Coords = {
  x: number;
  y: number;
};

// Ability
export type AbilityInit = {
  enabled?: AbilityUsage;
  inventoryIsInfinite?: boolean;
};
export type AbilityUsage = {
  // 回数 or Number.POSITIVE_INFINITY
  copy: number;
  paste: number;
  cut: number;
};

// Grid
export type MovableObject = {
  block: Block;
  objectId: string;
  // 基準ブロックからの相対位置
  // 基準ブロックは原則オブジェクトの左下で
  // 右を向くときに目の前に来るブロック
  relativePositions: {
    x: number;
    y: number;
  }[];
};
