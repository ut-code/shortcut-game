import { Application, Container, type Ticker } from "pixi.js";
import { derived, get, writable } from "svelte/store";
import * as Ability from "./ability.ts";
import { Grid, createCellsFromStageDefinition, createTutorialSprite } from "./grid.ts";
import * as History from "./history.ts";
import * as Player from "./player.ts";
import type { Context, GameDynamic, GameState, UIInfo } from "./public-types.ts";
import { characterNormalTexture } from "./resources.ts";
import type { StageDefinition } from "./stages/type.ts";
import { useUI } from "./ui-info.ts";

export async function setup(
  el: HTMLElement,
  stageDefinition: StageDefinition,
  bindings: {
    pause: () => void;
    resume: () => void;
    destroy: () => void;
    reset: () => void;
    uiInfo: UIInfo;
  },
): Promise<void> {
  const destroyer: (() => void)[] = [];
  const unlessStopped = (f: (ticker: Ticker) => void) => (ticker: Ticker) => {
    const stopped = get(cx.state).paused || get(cx.state).goaled || get(cx.state).gameover;
    if (!stopped) {
      f(ticker);
    }
  };

  function tick() {
    // highlight is re-rendered every tick
    const highlights = Player.createHighlight(cx);
    if (highlights) {
      for (const highlight of highlights) {
        stage.addChild(highlight);
      }
    }
    return () => {
      if (highlights) {
        for (const highlight of highlights) {
          stage.removeChild(highlight);
        }
      }
    };
  }

  // Create a new application
  const app = new Application();
  const stage = new Container();
  app.stage.addChild(stage);
  destroyer.push(() => {
    app.destroy(true, { children: true });
  });

  const gridX = stageDefinition.stage[0].length;
  const gridY = stageDefinition.stage.length;

  // Initialize the application
  await app.init({ background: "rgb(34, 34, 48)", resizeTo: window });
  destroyer.push(() => app.destroy(true, { children: true }));
  const blockSize = Math.min(app.screen.width / gridX, app.screen.height / gridY);

  const gridMarginY = (app.screen.height - blockSize * stageDefinition.stage.length) / 2;
  // things that don't need to reset on reset()
  const config = writable({
    gridX,
    gridY,
    marginY: gridMarginY,
    blockSize,
    initialPlayerX: stageDefinition.initialPlayerX,
    initialPlayerY: stageDefinition.initialPlayerY,
  });

  const initialHistory = {
    index: 0,
    tree: [],
  };
  const initialGameState = {
    inventory: null,
    inventoryIsInfinite: !!stageDefinition.inventoryIsInfinite,
    usage: stageDefinition.usage ?? {
      copy: 0,
      cut: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
    },
    cells: createCellsFromStageDefinition(stageDefinition),
    paused: false,
    goaled: false,
    gameover: false,
    switches: [],
    switchingBlocks: [],
  } satisfies GameState;
  const initialDynamic = {
    focus: null,
    player: null,
    isInventoryBlockLarge: false,
  } satisfies GameDynamic;
  const state = writable<GameState>(structuredClone(initialGameState));
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
  const history = writable(structuredClone(initialHistory));

  const cx: Context = {
    _stage_container: stage,
    grid,
    reset,
    dynamic: structuredClone(initialDynamic),
    state: state,
    history,
    config,
    elapsed: 0,
  };

  function reset() {
    cx.history = writable(structuredClone(initialHistory));
    cx.dynamic.player?.reset(cx, stageDefinition);
    cx.dynamic.focus = null;
    cx.elapsed = 0;
    cx.state.set({
      ...structuredClone(initialGameState),
      // switchはgridのコンストラクタで初期化されるので、初期状態はinitialGameStateではなくgridが持っている
      switches: cx.grid.initialSwitches,
      switchingBlocks: cx.grid.initialSwitchingBlocks,
    });
    cx.grid.clearLaser(cx);
    cx.grid.diffAndUpdateTo(cx, createCellsFromStageDefinition(stageDefinition));
    // 上に同じく。 init を使う？でも init は中で document.addEventListener してるので...
    History.record(cx);
  }

  app.ticker.add(
    unlessStopped((ticker) => {
      cx.elapsed += ticker.deltaTime;
    }),
  );

  // Stage 1,2のチュートリアル表示実装機構
  // isTutorialで表示の有無を決めている
  // Frm stands for Frames
  // ToDo: 現在の仕様では、メニューを開いているときも動き続ける。それを直すべきかそのままにするべきか
  if (stageDefinition.isTutorial === true) {
    let tutorialFrm = 0;
    app.ticker.add((ticker) => {
      tutorialFrm += ticker.deltaTime;
      // 1秒ごとにチュートリアルの画像が変わる
      createTutorialSprite(cx, Math.floor(tutorialFrm / 60 + 1));
      if (tutorialFrm >= 180) {
        tutorialFrm = 0;
      }
    });
  }

  cx.dynamic.player = Player.init(cx, characterNormalTexture);
  app.ticker.add(unlessStopped((ticker) => Player.tick(cx, ticker)));

  destroyer.push(Ability.init(cx)); // playerの初期化のあと
  destroyer.push(History.init(cx));

  let cleanup: undefined | (() => void) = undefined;
  app.ticker.add(
    unlessStopped(() => {
      if (cleanup) cleanup();
      cleanup = tick();
    }),
  );

  app.ticker.add(unlessStopped((ticker) => grid.fallableTick(cx, ticker)));
  app.ticker.add(unlessStopped((ticker) => grid.laserTick(cx)));

  // Append the application canvas to the document body
  el.appendChild(app.canvas);
  const onresize = useOnResize(cx, app, grid, gridX, gridY);
  window.addEventListener("resize", onresize);
  destroyer.push(() => {
    window.removeEventListener("resize", onresize);
  });

  bindings.destroy = () => {
    for (const cleanup of destroyer) {
      try {
        cleanup();
      } catch {}
    }
  };
  bindings.resume = () => {
    cx.state.update((prev) => {
      prev.paused = false;
      prev.goaled = false;
      return prev;
    });
  };
  bindings.pause = () => {
    cx.state.update((prev) => {
      prev.paused = true;
      return prev;
    });
  };
  bindings.reset = () => {
    cx.state.update((prev) => {
      prev.paused = false;
      prev.goaled = false;
      prev.gameover = false;
      return prev;
    });
    cx.reset();
  };

  const uiContext = derived([state, history], ([$state, $history]) => {
    return useUI($state, $history, cx.dynamic);
  });
  uiContext.subscribe((uiInfo) => {
    bindings.uiInfo = uiInfo;
  });
}

function useOnResize(cx: Context, app: Application, grid: Grid, gridX: number, gridY: number) {
  return () => {
    const prevConfig = { ...get(cx.config) };
    app.renderer.resize(window.innerWidth, window.innerHeight);
    const blockSize = Math.min(app.screen.width / gridX, app.screen.height / gridY);
    grid.rerender(cx, app.screen.height, blockSize);
    cx.config.update((prev) => {
      prev.blockSize = blockSize;
      prev.marginY = grid.marginY;
      return prev;
    });
    Player.resize(cx, prevConfig);
  };
}
