import { Application, Container, Sprite } from "pixi.js";
import { Block } from "./constants.ts";
import { getBlock, getPixelSize, gridX, gridY, setPixelSize } from "./grid.ts";
import { Player } from "./player.ts";
import { bunnyTexture, rockTexture } from "./resources.ts";

export async function setup() {
  function rerender() {
    const rocks: Sprite[] = [];
    for (let y = 0; y < gridY; y++) {
      for (let x = 0; x < gridX; x++) {
        const type = getBlock(x, y);
        if (type === Block.air) continue;
        const rock = new Sprite(rockTexture);
        if (type === Block.movable) rock.tint = 0xff0000;
        rock.width = getPixelSize();
        rock.height = getPixelSize();
        rock.x = x * getPixelSize();
        rock.y = y * getPixelSize();
        stageContainer.addChild(rock);
        rocks.push(rock);
      }
    }
    const highlight = player.createHighlight();
    if (highlight) {
      stageContainer.addChild(highlight);
    }
    return () => {
      if (highlight) {
        stageContainer.removeChild(highlight);
      }
      for (const rock of rocks) {
        stageContainer.removeChild(rock);
      }
    };
  }

  // Create a new application
  const app = new Application();

  const stageContainer = new Container();
  app.stage.addChild(stageContainer);

  // Initialize the application
  await app.init({ background: "white", resizeTo: window });
  setPixelSize(Math.min(app.screen.width / gridX, app.screen.height / gridY));

  // Append the application canvas to the document body
  const container = document.getElementById("pixi-container");
  if (!container) {
    console.error("Container not found!");
    throw new Error("Container not found!");
  }
  container.appendChild(app.canvas);

  let cleanup: undefined | (() => void);
  app.ticker.add(() => {
    if (cleanup) cleanup();
    cleanup = rerender();
  });

  // Add the player to the stage
  const player = new Player(bunnyTexture);
  app.ticker.add((ticker) => player.tick(ticker));
  app.stage.addChild(player);
}
