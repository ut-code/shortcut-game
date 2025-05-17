import { Application, Container, type Ticker } from "pixi.js";
import { derived, get, writable } from "svelte/store";
import { Facing } from "./constants.ts";
import { Grid, createCellsFromStageDefinition } from "./grid.ts";
import * as Player from "./player.ts";
import type { Context, GameState, UIInfo } from "./public-types.ts";
import { bunnyTexture } from "./resources.ts";
import type { StageDefinition } from "./stages.ts";
import { useUI } from "./ui-info.ts";

export async function setup(
  el: HTMLElement,
  stageDefinition: StageDefinition,
  bindings: {
    onpause: () => void;
    onresume: () => void;
    ongoal: () => void;
    ondestroy: () => void;
    uiInfo: UIInfo;
  },
): Promise<void> {
  bindings.onpause = () => {
    cx.state.update((prev) => {
      prev.paused = true;
      return prev;
    });
  };
  const cleanups: (() => void)[] = [];
  const unlessStopped = (f: (ticker: Ticker) => void) => (ticker: Ticker) => {
    const stopped = get(cx.state).paused || get(cx.state).goaled;
    if (!stopped) {
      f(ticker);
    }
  };

  function tick() {
    // highlight is re-rendered every tick
    const highlight = Player.createHighlight(cx);
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
  cleanups.push(() => {
    app.destroy(true, { children: true });
  });

  const gridX = stageDefinition.stage[0].length;
  const gridY = stageDefinition.stage.length;

  // Initialize the application
  await app.init({ background: "white", resizeTo: window });
  const blockSize = Math.min(
    app.screen.width / gridX,
    app.screen.height / gridY,
  );

  const gridMarginY =
    (app.screen.height - blockSize * stageDefinition.stage.length) / 2;
  const config = writable({
    gridX,
    gridY,
    marginY: gridMarginY,
    blockSize,
    initialPlayerX: stageDefinition.initialPlayerX,
    initialPlayerY: stageDefinition.initialPlayerY,
  });
  const state = writable<GameState>({
    inventory: null,
    inventoryIsInfinite: false,
    usage: {
      // TODO
      copy: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
      cut: Number.POSITIVE_INFINITY,
    },
    cells: createCellsFromStageDefinition(stageDefinition),
    paused: false,
    goaled: false,
    switches: [],
    switchingBlocks: [],
  });
  const grid = new Grid(
    {
      _stage_container: stage,
      state,
      config,
    },
    app.screen.height,
    blockSize,
    stageDefinition,
  );
  const history = writable({
    index: -1,
    tree: [],
  });
  const uiContext = derived([state, history], ([$state, $history]) => {
    return useUI($state, $history);
  });
  const cx: Context = {
    _stage_container: stage,
    grid,
    dynamic: {
      focus: null,
      player: {
        // HACK: these values are immediately overwritten inside Player.init().
        sprite: null,
        coords() {
          return { x: this.x, y: this.y };
        },
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        onGround: false,
        jumpingBegin: null,
        holdingKeys: {},
        facing: Facing.right,
      },
    },
    state: state,
    history,
    uiContext,
    config,
    elapsed: writable(0),
  };

  app.ticker.add(
    unlessStopped((ticker) => {
      cx.elapsed.update((prev) => prev + ticker.deltaTime);
    }),
  );

  cx.dynamic.player = Player.init(cx, bunnyTexture);
  app.ticker.add(unlessStopped((ticker) => Player.tick(cx, ticker)));

  let cleanup: undefined | (() => void) = undefined;
  app.ticker.add(
    unlessStopped(() => {
      if (cleanup) cleanup();
      cleanup = tick();
    }),
  );

  // Append the application canvas to the document body
  el.appendChild(app.canvas);
  const onresize = useOnResize(cx, app, grid, gridX, gridY);
  window.addEventListener("resize", onresize);
  cleanups.push(() => {
    window.removeEventListener("resize", onresize);
  });

  bindings.ondestroy = () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
  bindings.onresume = () => {
    cx.state.update((prev) => {
      prev.paused = false;
      prev.goaled = false;
      return prev;
    });
  };
  bindings.onpause = () => {
    cx.state.update((prev) => {
      prev.paused = true;
      return prev;
    });
  };
  bindings.ongoal = () => {
    cx.state.update((prev) => {
      prev.goaled = true;
      return prev;
    });
  };
  uiContext.subscribe((uiInfo) => {
    bindings.uiInfo = uiInfo;
  });
}

function useOnResize(
  cx: Context,
  app: Application,
  grid: Grid,
  gridX: number,
  gridY: number,
) {
  return () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    const blockSize = Math.min(
      app.screen.width / gridX,
      app.screen.height / gridY,
    );
    cx.config.update((prev) => {
      prev.blockSize = blockSize;
      prev.marginY = grid.marginY;
      return prev;
    });
    cx.grid.rerender(cx, app.screen.height, blockSize);
    Player.resize(cx);
  };
}
