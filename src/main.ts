import { Sprite } from "pixi.js";
import { Block } from "./constants.ts";
import * as c from "./constants.ts";
import { getBlock, gridX, gridY, pixelSize } from "./grid.ts";
import { Player } from "./player.ts";
import {
  app,
  bunnyTexture,
  highlightTexture,
  rockTexture,
  stageContainer,
} from "./resources.ts";

export function rerender() {
  const rocks: Sprite[] = [];
  for (let y = 0; y < gridY; y++) {
    for (let x = 0; x < gridX; x++) {
      const type = getBlock(x, y);
      if (type === Block.air) continue;
      const rock = new Sprite(rockTexture);
      if (type === Block.movable) rock.tint = 0xff0000;
      rock.width = pixelSize;
      rock.height = pixelSize;
      rock.x = x * pixelSize;
      rock.y = y * pixelSize;
      stageContainer.addChild(rock);
      rocks.push(rock);
    }
  }
  const highlight = player.createHighlight();
  stageContainer.addChild(highlight);
  return () => {
    stageContainer.removeChild(highlight);
    for (const rock of rocks) {
      stageContainer.removeChild(rock);
    }
  };
}

let cleanup: undefined | (() => void);
app.ticker.add(() => {
  if (cleanup) cleanup();
  cleanup = rerender();
});

// Add the player to the stage
const player = new Player(bunnyTexture);
app.ticker.add((ticker) => player.tick(ticker));
app.stage.addChild(player);
