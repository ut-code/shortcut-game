import type { Container } from "pixi.js";
import type { Writable } from "svelte/store";
import type { Block, Facing } from "./constants.ts";
import type { Grid, GridCell } from "./grid.ts";

// GameState must be serializable
// because it is used in undo/redo
export type GameState = {
  // about the player
  inventory: MovableObject | null;
  inventoryIsInfinite: boolean;
  usage: AbilityUsage;
  cells: GridCell[][];
};

// config - things that won't update very often
export type GameConfig = {
  gridX: number; // total grid in X direction, NOT width of single grid
  gridY: number; // total grid in Y direction
  marginY: number; // windowの上端とy=0上端の距離(px)
  blockSize: number;
  initialPlayerX: number; // initial player position in X direction
  initialPlayerY: number; // initial player position in Y direction
};

export type StateSnapshot = {
  game: GameState;
  playerX: number; // player position at the time of snapshot
  playerY: number; // player position at the time of snapshot
  playerFacing: Facing; // player facing direction at the time of snapshot
};
export type GameHistory = {
  tree: StateSnapshot[];
  index: number;
};

export type Context = {
  _stage: Container;
  grid: Grid;

  // Game State
  state: Writable<GameState>; // state that changes frequently (but not every frame)
  config: Writable<GameConfig>; // not-so-dynamic data
  history: Writable<GameHistory>;

  // dynamic data used for communication between modules
  dynamic: {
    focus: Coords | null; // current focus coordinates
    playerX: number;
    playerY: number;
    playerFacing: Facing;
  };
  // about time
  elapsed: Writable<number>;
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
