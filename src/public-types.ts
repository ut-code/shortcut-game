import type { Container, Sprite } from "pixi.js";
import type { Readable, Writable } from "svelte/store";
import type { Block, Facing, Inputs } from "./constants.ts";
import type { Grid, GridCell } from "./grid.ts";
import type { Player } from "./player.ts";

// GameState must be serializable
// because it is used in undo/redo
export type GameState = {
  // about the player
  inventory: MovableObject | null;
  inventoryIsInfinite: boolean;
  usage: AbilityUsage;
  cells: GridCell[][];
  paused: boolean;
  goaled: boolean;
  gameover: boolean;

  // about the gimmick
  switches: SwitchState[];
  switchingBlocks: SwitchingBlockState[];
};
export type SwitchState = {
  id: string;
  x: number;
  y: number;
  pressedByPlayer: boolean;
  pressedByBlock: boolean;
};
export type SwitchingBlockState = {
  id: string;
  x: number;
  y: number;
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
  stash?: StateSnapshot; // 最新の状態を放り込んでおくところ: ctrl + Y で最新の場所に戻るのに使う
  tree: StateSnapshot[]; // a linear tree.
  index: number;
};

export type GameDynamic = {
  focus: Coords | null; // current focus coordinates
  player: Player | null;
  isInventoryBlockLarge: boolean; // please forgive me
};

export type Context = {
  _stage_container: Container;

  // APIs
  grid: Grid;
  reset: () => void;

  // Game State
  state: Writable<GameState>; // state that changes frequently (but not every frame)
  config: Writable<GameConfig>; // not-so-dynamic data
  history: Writable<GameHistory>;

  // dynamic data used for communication between modules (aka just sparkling variables)
  // no need to serialize.
  dynamic: GameDynamic;
  // about time
  elapsed: number;
};

export type UIInfo = {
  inventory: MovableObject | null;
  inventoryIsLarge: boolean;
  inventoryIsInfinite: boolean;
  copy: number;
  paste: number;
  cut: number;
  undo: number;
  redo: number;
  paused: boolean;
  goaled: boolean;
  gameover: boolean;
};
export type Coords = {
  x: number;
  y: number;
};

// Ability
export type AbilityInit = {
  enabled?: AbilityUsage;
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
  originPosition: {
    // 基準ブロックの位置
    x: number;
    y: number;
  };
  // 基準ブロックからの相対位置
  // 基準ブロックは原則オブジェクトの左下で
  // 右を向くときに目の前に来るブロック
  relativePositions: {
    x: number;
    y: number;
  }[];
};
