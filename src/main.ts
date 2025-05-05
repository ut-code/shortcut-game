import { Application, Container, type Ticker } from "pixi.js";
import type { Writable } from "svelte/store";
import type { Context, UIContext } from "./context.ts";
import { Grid } from "./grid.ts";
import { Player } from "./player.ts";
import { bunnyTexture } from "./resources.ts";
import type { StageDefinition } from "./stages.ts";

export async function setup(
  el: HTMLElement,
  stageDefinition: StageDefinition,
  uiContext: Writable<UIContext>,
) {
  let paused = false;
  uiContext.subscribe((v) => {
    paused = v.paused;
  });
  const unlessPaused = (f: (ticker: Ticker) => void) => (ticker: Ticker) => {
    if (!paused) {
      f(ticker);
    }
  };

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

  const gridX = stageDefinition.stage[0].length;
  const gridY = stageDefinition.stage.length;

  // Initialize the application
  await app.init({ background: "white", resizeTo: window });
  const blockSize = Math.min(
    app.screen.width / gridX,
    app.screen.height / gridY,
  );
  const grid = new Grid(stage, app.screen.height, blockSize, stageDefinition);

  const cx: Context = {
    stage,
    gridX,
    gridY,
    marginY: grid.marginY,
    blockSize,
    initialPlayerX: stageDefinition.initialPlayerX,
    initialPlayerY: stageDefinition.initialPlayerY,
    grid,
    elapsed: 0,
    uiContext,
  };
  app.ticker.add(
    unlessPaused((ticker) => {
      cx.elapsed += ticker.deltaTime;
    }),
  );

  const player = new Player(cx, bunnyTexture);
  app.ticker.add(unlessPaused((ticker) => player.tick(cx, ticker)));
  app.stage.addChild(player.sprite);

  let cleanup: undefined | (() => void) = undefined;
  app.ticker.add(
    unlessPaused(() => {
      if (cleanup) cleanup();
      cleanup = tick();
    }),
  );

  // Append the application canvas to the document body
  el.appendChild(app.canvas);

  window.addEventListener("resize", () => {
    const prevCx = { ...cx };
    app.renderer.resize(window.innerWidth, window.innerHeight);
    const blockSize = Math.min(
      app.screen.width / gridX,
      app.screen.height / gridY,
    );
    cx.grid.rerender(app.screen.height, blockSize);
    cx.blockSize = blockSize;
    cx.marginY = grid.marginY;
    player.rerender(prevCx, cx);
  });
}
