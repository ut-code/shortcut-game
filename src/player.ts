import { Sprite, type SpriteOptions, type Texture, type Ticker } from "pixi.js";
import { get } from "svelte/store";
import * as Ability from "./ability.ts";
import * as consts from "./constants.ts";
import { Inputs } from "./constants.ts";
import { Block } from "./constants.ts";
import type { AbilityInit, Context } from "./public-types.ts";
import { highlightHoldTexture, highlightTexture } from "./resources.ts";

export function init(
  cx: Context,
  spriteOptions?: SpriteOptions | Texture,
  options?: {
    ability?: AbilityInit;
  },
) {
  const sprite = new Sprite(spriteOptions);
  // Center the sprite's anchor point
  sprite.anchor.set(0.5, 1);
  const { blockSize, initialPlayerX, initialPlayerY, marginY } = get(cx.config);

  const coords = {
    x: blockSize * initialPlayerX,
    y: blockSize * initialPlayerY + marginY,
  };

  sprite.x = coords.x;
  sprite.y = coords.y;
  sprite.width = consts.playerWidth * blockSize;
  sprite.height = consts.playerHeight * blockSize;
  cx.dynamic.player.x = coords.x;
  cx.dynamic.player.y = coords.y;
  cx._stage_container.addChild(sprite);

  // Move the sprite to the center of the screen
  document.addEventListener("keydown", (event) => handleInput(cx, event, true));
  document.addEventListener("keyup", (event) => handleInput(cx, event, false));
  console.log("player init");
  Ability.init(cx, options?.ability);
  return {
    sprite,
    coords() {
      return { x: this.x, y: this.y };
    },
    get x() {
      return this.sprite.x;
    },
    set x(v) {
      this.sprite.x = v;
    },
    get y() {
      return this.sprite.y;
    },
    set y(v) {
      this.sprite.y = v;
    },
    vx: 0,
    vy: 0,
    onGround: false,
    jumpingBegin: null,
    holdingKeys: {},
    facing: consts.Facing.right,
  };
}

export function getCoords(cx: Context) {
  const { blockSize, marginY } = get(cx.config);
  const coords = cx.dynamic.player.coords();
  const x = Math.floor(coords.x / blockSize);
  const y = Math.round((coords.y - marginY) / blockSize) - 1; // it was not working well so take my patch
  return { x, y };
}
export function createHighlight(cx: Context) {
  const state = get(cx.state);
  const player = cx.dynamic.player;
  const { blockSize, marginY } = get(cx.config);
  if (!player.holdingKeys[Inputs.Ctrl] || !player.onGround) return;
  const texture =
    state.inventory === null ? highlightTexture : highlightHoldTexture;
  const highlight: Sprite = new Sprite(texture);
  highlight.width = blockSize;
  highlight.height = blockSize;
  const highlightCoords = Ability.focusCoord(getCoords(cx), player.facing);
  highlight.x = highlightCoords.x * blockSize;
  highlight.y = highlightCoords.y * blockSize + marginY;
  return highlight;
}

export function handleInput(
  cx: Context,
  event: KeyboardEvent,
  eventIsKeyDown: boolean,
) {
  const player = cx.dynamic.player;
  switch (event.key) {
    case "Control":
      player.holdingKeys[Inputs.Ctrl] = eventIsKeyDown;
      break;
    case "Meta":
      if (eventIsKeyDown) {
        player.holdingKeys[Inputs.Ctrl] = true;
      } else {
        // MacではCommand(Meta)を押している間他のキーのkeyupが発動しない仕様らしい
        // workaroundとしてMetaを離したときに他のすべてのキーも離したものとして扱う
        player.holdingKeys = {};
      }
      break;
    case "ArrowLeft":
    case "a":
      player.holdingKeys[Inputs.Left] = eventIsKeyDown;
      event.preventDefault();
      if (eventIsKeyDown) {
        player.facing = consts.Facing.left;
      }
      break;
    case "ArrowRight":
    case "d":
      player.holdingKeys[Inputs.Right] = eventIsKeyDown;
      event.preventDefault();
      if (eventIsKeyDown) {
        player.facing = consts.Facing.right;
      }
      break;
    case "ArrowUp":
    case "w":
    case " ":
      player.holdingKeys[Inputs.Up] = eventIsKeyDown;
      event.preventDefault();
      break;
  }
}

export function tick(cx: Context, ticker: Ticker) {
  const { blockSize, gridX, gridY, marginY } = get(cx.config);
  const player = cx.dynamic.player;
  player.vx = 0;
  if (player.holdingKeys[Inputs.Left]) {
    player.vx -= consts.moveVX * blockSize;
  }
  if (player.holdingKeys[Inputs.Right]) {
    player.vx += consts.moveVX * blockSize;
  }
  const elapsed = get(cx.elapsed);
  if (player.holdingKeys[Inputs.Up]) {
    if (player.onGround) {
      player.vy = -consts.jumpVY * blockSize;
      player.jumpingBegin = elapsed;
    } else if (
      player.jumpingBegin &&
      elapsed - player.jumpingBegin < consts.jumpFrames
    ) {
      player.vy = -consts.jumpVY * blockSize;
    } else {
      player.jumpingBegin = null;
    }
  } else {
    player.jumpingBegin = null;
  }

  const isBlock = (x: number, y: number) =>
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) !== Block.air &&
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) !== Block.switch &&
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) !==
      Block.switchPressed &&
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) !==
      Block.switchingBlockON &&
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) !== Block.goal &&
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) !== undefined;
  const isSwitchBase = (x: number, y: number) =>
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) === Block.switchBase;
  const isGoal = (x: number, y: number) =>
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) === Block.goal;
  const isOutOfWorldLeft = (x: number) => x < 0;
  const isOutOfWorldRight = (x: number) => x >= gridX;
  const isOutOfWorldBottom = (y: number) => y >= gridY + marginY / blockSize;

  // next〜 は次フレームの座標、inner〜 は前フレームでかつ1px内側の座標
  const nextX = (player.x + player.vx * ticker.deltaTime) / blockSize;
  const nextBottomY =
    (player.y - marginY + player.vy * ticker.deltaTime) / blockSize;
  const nextTopY = nextBottomY - consts.playerHeight;
  const nextLeftX = nextX - consts.playerWidth / 2;
  const nextRightX = nextX + consts.playerWidth / 2;
  const innerBottomY = (player.y - marginY - 1) / blockSize;
  const innerTopY = (player.y - marginY + 1) / blockSize - consts.playerHeight;
  const innerLeftX = (player.x + 1) / blockSize - consts.playerWidth / 2;
  const innerRightX = (player.x - 1) / blockSize + consts.playerWidth / 2;

  // 天井
  const hittingCeil =
    isBlock(innerLeftX, nextTopY) || isBlock(innerRightX, nextTopY);
  // プレイヤーの下がブロック
  // = プレイヤーの左下端がブロック or プレイヤーの右下端がブロック
  // 壁に触れている際にバグるのを避けるためx方向は±1
  player.onGround =
    player.vy >= 0 &&
    (isBlock(innerLeftX, nextBottomY) || isBlock(innerRightX, nextBottomY));
  if (hittingCeil && player.onGround) {
    player.vy = 0;
  } else if (hittingCeil) {
    player.y =
      (Math.ceil(nextTopY) + consts.playerHeight) * blockSize + marginY;
    player.vy = 0;
    player.jumpingBegin = null;
  } else if (player.onGround) {
    // 自分の位置は衝突したブロックの上
    player.y = Math.floor(nextBottomY) * blockSize + marginY;
    player.vy = 0;
  }
  // プレイヤーの右上端または右下端がブロック または右画面端
  // = プレイヤーの右上端がブロック or 右下端がブロック or プレイヤーの右側が世界の外 (世界は長方形のため、チェックは 1 回でいい)
  // 地面に触れている際にバグるのを避けるためy方向は-1
  const rightHit =
    isBlock(nextRightX, innerBottomY) ||
    isBlock(nextRightX, innerTopY) ||
    isOutOfWorldRight(nextRightX);
  // 左も同様
  const leftHit =
    isBlock(nextLeftX, innerBottomY) ||
    isBlock(nextLeftX, innerTopY) ||
    isOutOfWorldLeft(nextLeftX);
  if (leftHit && rightHit) {
    // todo: この場合どうするべき?
    player.vx = 0;
  } else if (rightHit) {
    player.x = (Math.floor(nextRightX) - consts.playerWidth / 2) * blockSize;
    player.vx = 0;
  } else if (leftHit) {
    player.x = (Math.ceil(nextLeftX) + consts.playerWidth / 2) * blockSize;
    player.vx = 0;
  }
  // ステージの下の端にプレイヤーが落ちると、元の場所にもどる
  // Todo: 本当はブロックの移動状況含むステージの状況すべてをリセットすべき
  // Todo: ステージ個別に用意される初期座標に移動させる
  // Todo: 直接移動させるのではなく、ゲームオーバー処理を切り分ける
  if (isOutOfWorldBottom(innerTopY)) {
    player.x = 2 * blockSize;
    player.y = 3 * blockSize + marginY;
    player.vx = 0;
    player.vy = 0;
  }

  if (isSwitchBase(nextX, nextBottomY)) {
    const switchBlock = get(cx.state).cells[Math.floor(nextBottomY - 1)][
      Math.floor(nextX)
    ];
    if (switchBlock.block === Block.switch) {
      cx.state.update((prev) => {
        prev.switches = prev.switches.map((s) => {
          if (
            s.x === Math.floor(nextX) &&
            s.y === Math.floor(nextBottomY - 1)
          ) {
            return {
              ...s,
              pressedByPlayer: true,
            };
          }
          return s;
        });
        return prev;
      });
    }
  } else {
    cx.state.update((prev) => {
      prev.switches = prev.switches.map((s) => {
        return {
          ...s,
          pressedByPlayer: false,
        };
      });
      return prev;
    });
  }

  for (const sw of get(cx.state).switches) {
    if (
      sw.pressedByPlayer &&
      cx.grid.getBlock(cx, sw.x, sw.y) === Block.switch
    ) {
      cx.grid.setBlock(cx, sw.x, sw.y, { block: Block.switchPressed });
    }
    if (
      !sw.pressedByPlayer &&
      cx.grid.getBlock(cx, sw.x, sw.y) === Block.switchPressed
    ) {
      cx.grid.setBlock(cx, sw.x, sw.y, { block: Block.switch });
    }
  }

  // スイッチの状態を反映
  const switches = get(cx.state).switches;
  for (const s of switches) {
    const switchingBlock = get(cx.state).switchingBlocks.filter(
      (sb) => sb.id === s.id,
    );
    // スイッチが押されているとき
    if (s.pressedByPlayer || s.pressedByBlock) {
      for (const sb of switchingBlock) {
        if (cx.grid.getBlock(cx, sb.x, sb.y) === Block.switchingBlockOFF) {
          cx.grid.setBlock(cx, sb.x, sb.y, { block: Block.switchingBlockON });
        }
      }
    } else {
      // スイッチが押されていないとき
      for (const sb of switchingBlock) {
        if (cx.grid.getBlock(cx, sb.x, sb.y) === Block.switchingBlockON) {
          cx.grid.setBlock(cx, sb.x, sb.y, { block: Block.switchingBlockOFF });
        }
      }
    }
  }

  if (isGoal(nextX, nextTopY) && player.onGround) {
    cx.state.update((prev) => {
      prev.goaled = true;
      return prev;
    });
  }

  // 当たり判定結果を反映する
  player.x += player.vx * ticker.deltaTime;
  player.y += player.vy * ticker.deltaTime;
  player.vy += consts.gravity * blockSize * ticker.deltaTime;

  cx.dynamic.focus = Ability.focusCoord(getCoords(cx), player.facing);
}

export function resize(cx: Context) {
  const cfg = get(cx.config);
  const player = cx.dynamic.player;
  player.x = (player.x / cfg.blockSize) * cfg.blockSize;
  player.y =
    ((player.y - cfg.marginY) / cfg.blockSize) * cfg.blockSize + cfg.marginY;
  if (!player.sprite) return;
  player.sprite.width = consts.playerWidth * cfg.blockSize;
  player.sprite.height = consts.playerHeight * cfg.blockSize;
}
