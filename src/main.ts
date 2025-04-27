import { Application, Container, Sprite } from "pixi.js";
import { Block } from "./constants.ts";
import type { Context } from "./context.ts";
import createStage, { getBlock, type Grid } from "./grid.ts";
import { Player } from "./player.ts";
import { bunnyTexture, rockTexture } from "./resources.ts";

export async function setup(el: HTMLElement, gridDefinition: number[][]) {
  function rerender() {
    const rocks: Sprite[] = [];
    for (let y = 0; y < gridY; y++) {
      for (let x = 0; x < gridX; x++) {
        const type = getBlock(grid, x, y);
        if (type === Block.air) continue;
        const rock = new Sprite(rockTexture);
        if (type === Block.movable) rock.tint = 0xff0000;
        rock.width = pixelSize;
        rock.height = pixelSize;
        rock.x = x * pixelSize;
        rock.y = y * pixelSize;
        stage.addChild(rock);
        rocks.push(rock);
      }
    }
    const highlight = player.createHighlight(cx);
    if (highlight) {
      stage.addChild(highlight);
    }
    return () => {
      if (highlight) {
        stage.removeChild(highlight);
      }
      for (const rock of rocks) {
        stage.removeChild(rock);
      }
    };
  }

  // Create a new application
  const app = new Application();
  const stage = new Container();
  app.stage.addChild(stage);

  const gridX = gridDefinition[0].length;
  const gridY = gridDefinition.length;
  const grid: Grid = createStage(gridDefinition);

  // Initialize the application
  await app.init({ background: "white", resizeTo: window });
  const pixelSize = Math.min(
    app.screen.width / gridX,
    app.screen.height / gridY,
  );
  const cx: Context = {
    stage,
    gridX,
    gridY,
    pixelSize,
    grid,
  };
  const player = new Player(cx, bunnyTexture);
  app.ticker.add((ticker) => player.tick(cx, ticker));
  app.stage.addChild(player);

  let cleanup: undefined | (() => void);
  app.ticker.add(() => {
    if (cleanup) cleanup();
    cleanup = rerender();
  });

  // Append the application canvas to the document body
  el.appendChild(app.canvas);
}
