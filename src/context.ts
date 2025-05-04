import type { Container } from "pixi.js";
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
};
