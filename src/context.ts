import type { Container } from "pixi.js";
import type { Grid } from "./grid.ts";

export type Context = {
  stage: Container;
  gridX: number; // total grid in X direction, NOT width of single glid
  gridY: number; // total grid in Y direction
  grid: Grid;
  pixelSize: number;
};
