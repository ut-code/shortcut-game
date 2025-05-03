import type { Container } from "pixi.js";
import type { Grid } from "./grid.ts";

export type Context = {
  stage: Container;

  // about grid system
  gridX: number; // total grid in X direction, NOT width of single glid
  gridY: number; // total grid in Y direction
  grid: Grid;
  blockSize: number;

  // about player
  initialPlayerX: number; // initial player position in X direction
  initialPlayerY: number; // initial player position in Y direction

  // about time
  elapsed: number;
};
