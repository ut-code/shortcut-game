import { Sprite } from "pixi.js";
import { Block, getBlock, gridX, gridY } from "./grid.ts";
import { Player } from "./player.ts";
import { app, bunnyTexture, rockTexture, stageContainer } from "./resources.ts";

export function rerender() {
  const pixelSize = Math.min(
    app.screen.width / gridX,
    app.screen.height / gridY,
  );
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

(async () => {
  // Create a bunny Sprite
  const bunny = new Player(bunnyTexture);

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Move the sprite to the center of the screen
  bunny.position.set(app.screen.width / 2 + 30, app.screen.height / 2 - 20);

  // Add the bunny to the stage
  app.stage.addChild(bunny);

  document.addEventListener("keydown", (event) =>
    bunny.handleInput(event, true),
  );
  document.addEventListener("keyup", (event) =>
    bunny.handleInput(event, false),
  );
  app.ticker.add((ticker) => bunny.update(ticker));
})();
