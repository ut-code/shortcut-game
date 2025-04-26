import { Application, Assets, Container } from "pixi.js";
// Create a new application
export const app = new Application();

// Initialize the application
await app.init({ background: "white", resizeTo: window });

// Append the application canvas to the document body
document.getElementById("pixi-container")?.appendChild(app.canvas);

export const stageContainer = new Container();
app.stage.addChild(stageContainer);
// assets
export const bunnyTexture = await Assets.load("/assets/bunny.png");
export const rockTexture = await Assets.load("/assets/block.png");
export const highlightTexture = await Assets.load("/assets/highlight.svg");
export const highlightHoldTexture = await Assets.load(
  "/assets/highlight-hold.webp",
);
