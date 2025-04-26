import { Sprite } from "pixi.js";
import { Block, getBlock, gridX, gridY, pixelSize } from "./grid.ts";
import { Player } from "./player.ts";
import { app, bunnyTexture, rockTexture, stageContainer } from "./resources.ts";

export function rerender() {
  const rocks: Sprite[] = [];
  for (let y = 0; y < gridY; y++) {
    for (let x = 0; x < gridX; x++) {
      if (getBlock(x, y) === Block.air) continue;
      const rock = new Sprite(rockTexture);

      rock.width = pixelSize;
      rock.height = pixelSize;
      rock.x = x * pixelSize;
      rock.y = y * pixelSize;
      stageContainer.addChild(rock);
      rocks.push(rock);
    }
  }
  return () => {
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

// Add the bunny to the stage
app.stage.addChild(new Player(bunnyTexture));
