import { Sprite } from "pixi.js";
import { Block, getBlock, gridX, gridY, shuffleGrid } from "./grid.ts";
import { app, bunnyTexture, rockTexture, stageContainer } from "./resources.ts";

export function rerender() {
  const pixelSize = Math.min(
    app.screen.width / gridX,
    app.screen.height / gridY,
  );
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
setInterval(() => {
  if (cleanup) cleanup();
  cleanup = rerender();
}, 1000 / 60);

(async () => {
  // Create a bunny Sprite
  const bunny = new Sprite(bunnyTexture);

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Move the sprite to the center of the screen
  bunny.position.set(app.screen.width / 2 + 30, app.screen.height / 2 - 20);

  // Add the bunny to the stage
  app.stage.addChild(bunny);

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      bunnyTexture.x -= 10;
    }
    if (event.key === "ArrowRight") {
      bunnyTexture.x += 10;
    }
    console.log(event.key);
    if (bunnyTexture.x >= app.screen.width / 2 + 200) {
      app.stage.removeChild(bunnyTexture);
    }
    return;
  });
  // Listen for animate update
})();
