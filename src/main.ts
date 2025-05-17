import { Application, Container, type Ticker } from "pixi.js";
import { derived, get, writable } from "svelte/store";
import { Facing } from "./constants.ts";
import { Grid, createCellsFromStageDefinition, createTutorialSprite } from "./grid.ts";
import * as History from "./history.ts";
import * as Player from "./player.ts";
import type { Context, GameState, UIInfo } from "./public-types.ts";
import { bunnyTexture } from "./resources.ts";
import type { StageDefinition } from "./stages.ts";
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
  const cleanups: (() => void)[] = [];
  const unlessPaused = (f: (ticker: Ticker) => void) => (ticker: Ticker) => {
    const paused = get(cx.state).paused;
    if (!paused) {
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
    inventoryIsInfinite: false,
    usage: {
      // TODO
      copy: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
      cut: Number.POSITIVE_INFINITY,
    },
    cells: createCellsFromStageDefinition(stageDefinition),
    paused: false,
    switches: [],
    switchingBlocks: [],
  };
  const initialDynamic = {
    focus: null,
    player: {
      // HACK: these values are immediately overwritten inside Player.init().
      sprite: null,
      coords: {
        x: stageDefinition.initialPlayerX,
        y: stageDefinition.initialPlayerY,
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
  };
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
    dynamic: structuredClone(initialDynamic),
    state: state,
    history,
    config,
    elapsed: 0, // does this need to be writable? like is anyone listening to this/
  };
  bindings.reset = () => {
    const d = stageDefinition;
    cx.history = writable(structuredClone(initialHistory));
    // 内部実装ゴリゴリに知ってるリセットなので、直したかったら直して。多分 coords の各プロパティのセッターをいい感じにしてやれば良い
    // MEMO: `coords` は抽象化失敗してるので、直すか消すほうが良い
    cx.dynamic.player.x = blockSize * d.initialPlayerX;
    cx.dynamic.player.y = blockSize * d.initialPlayerY + get(cx.config).marginY;
    cx.dynamic.focus = null;
    cx.elapsed = 0;
    cx.state.update((prev) => ({
      ...prev,
      paused: false,
    }));
    cx.grid.diffAndUpdateTo(cx, createCellsFromStageDefinition(stageDefinition));
    // 上に同じく。 init を使う？でも init は中で document.addEventListener してるので...
    History.record(cx);
  };

  app.ticker.add(
    unlessPaused((ticker) => {
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

  cx.dynamic.player = Player.init(cx, bunnyTexture);
  app.ticker.add(unlessPaused((ticker) => Player.tick(cx, ticker)));

  let cleanup: undefined | (() => void) = undefined;
  app.ticker.add(
    unlessPaused(() => {
      if (cleanup) cleanup();
      cleanup = tick();
    }),
  );

  app.ticker.add(unlessPaused((ticker) => grid.tick(cx, ticker)));

  // Append the application canvas to the document body
  el.appendChild(app.canvas);
  const onresize = useOnResize(cx, app, grid, gridX, gridY);
  window.addEventListener("resize", onresize);
  cleanups.push(() => {
    window.removeEventListener("resize", onresize);
  });

  bindings.destroy = () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
  bindings.resume = () => {
    cx.state.update((prev) => {
      prev.paused = false;
      return prev;
    });
  };
  bindings.pause = () => {
    cx.state.update((prev) => {
      prev.paused = true;
      return prev;
    });
  };

  const uiContext = derived([state, history], ([$state, $history]) => {
    return useUI($state, $history);
  });
  uiContext.subscribe((uiInfo) => {
    bindings.uiInfo = uiInfo;
  });
}

function useOnResize(cx: Context, app: Application, grid: Grid, gridX: number, gridY: number) {
  return () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    const blockSize = Math.min(app.screen.width / gridX, app.screen.height / gridY);
    cx.config.update((prev) => {
      prev.blockSize = blockSize;
      prev.marginY = grid.marginY;
      return prev;
    });
    cx.grid.rerender(cx, app.screen.height, blockSize);
    Player.resize(cx);
  };
}
