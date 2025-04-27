import { Application, Container, Sprite } from "pixi.js";
import { Block } from "./constants.ts";
import type { Context } from "./context.ts";
import createStage, { getBlock, type Grid } from "./grid.ts";
import { Player } from "./player.ts";
import { bunnyTexture, rockTexture } from "./resources.ts";

export async function setup(el: HTMLElement, gridDefinition: number[][]) {
  const VSpriteOM: ({ type: Block; sprite: Sprite } | null)[][] = [];
  function rerender() {
    for (let y = 0; y < gridY; y++) {
      if (!VSpriteOM[y]) VSpriteOM.push([]);
      const layer = VSpriteOM[y];
      if (!layer) throw new Error("Something is seriously wrong");
      for (let x = 0; x < gridX; x++) {
        const type = getBlock(grid, x, y);
        if (!type) throw new Error("invalid gridX/Y size");
        const prev = layer[x];
        if (prev?.type === type || (prev == null && type === Block.air)) {
          // reuse previous sprite
          continue;
        }
        // update this block
        console.log("[renderer] updating block...");
        if (prev) stage.removeChild(prev.sprite);
        if (type === Block.air) {
          layer[x] = null;
        } else {
          const rock = new Sprite(rockTexture);
          rock.tint = type === Block.movable ? 0xff0000 : 0xffffff;
          rock.width = blockSize;
          rock.height = blockSize;
          rock.x = x * blockSize;
          rock.y = y * blockSize;
          stage.addChild(rock);
          layer[x] = {
            sprite: rock,
            type,
          };
        }
      }
    }
    // highlight is re-rendered every tick
    const highlight = player.createHighlight(cx);
    if (highlight) {
      stage.addChild(highlight);
    }
    return () => {
      if (highlight) {
        stage.removeChild(highlight);
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
  const blockSize = Math.min(
    app.screen.width / gridX,
    app.screen.height / gridY,
  );
  const cx: Context = {
    stage,
    gridX,
    gridY,
    blockSize,
    grid,
    elapsed: 0,
  };
  app.ticker.add((ticker) => {
    cx.elapsed += ticker.deltaTime;
  });
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
