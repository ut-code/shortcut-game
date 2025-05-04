import type { Container } from "pixi.js";
import type { Writable } from "svelte/store";
import type { Block } from "./constants.ts";
import type { Grid } from "./grid.ts";

export type Context = {
  stage: Container;

  // about grid system
  gridX: number; // total grid in X direction, NOT width of single glid
  gridY: number; // total grid in Y direction
  marginY: number; // windowの上端とy=0上端の距離(px)
  grid: Grid;
  blockSize: number;

  // about time
  elapsed: number;

  uiContext: Writable<UIContext>;
};

export type UIContext = {
  inventory: Block | null;
  inventoryIsInfinite: boolean;
  copy: number;
  paste: number;
  cut: number;
  undo: number;
  redo: number;
};
