import { Application, Container } from "pixi.js";
import type { Context } from "./context.ts";
import { Grid } from "./grid.ts";
import { Player } from "./player.ts";
import { bunnyTexture } from "./resources.ts";
import type { StageDefinition } from "./stages.ts";

export async function setup(el: HTMLElement, stageDefinition: StageDefinition) {
  function tick() {
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

  const gridX = stageDefinition[0].length;
  const gridY = stageDefinition.length;

  // Initialize the application
  await app.init({ background: "white", resizeTo: window });
  const blockSize = Math.min(
    app.screen.width / gridX,
    app.screen.height / gridY,
  );

  const grid = new Grid(stage, blockSize, stageDefinition);

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
  app.stage.addChild(player.sprite);

  let cleanup: undefined | (() => void) = undefined;
  app.ticker.add(() => {
    if (cleanup) cleanup();
    cleanup = tick();
  });

  // Append the application canvas to the document body
  el.appendChild(app.canvas);
}
