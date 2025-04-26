import { Assets, Container } from "pixi.js";
// Create a new application
export const stageContainer = new Container();

// assets
export const bunnyTexture = await Assets.load("/assets/bunny.png");
export const rockTexture = await Assets.load("/assets/block.png");
export const highlightTexture = await Assets.load("/assets/highlight.svg");
export const highlightHoldTexture = await Assets.load(
  "/assets/highlight-hold.webp",
);
