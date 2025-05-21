import { Sprite, type SpriteOptions, type Texture, type Ticker } from "pixi.js";
import { get } from "svelte/store";
import * as Ability from "./ability.ts";
import * as consts from "./constants.ts";
import { Inputs } from "./constants.ts";
import { Block } from "./constants.ts";
import { assert } from "./lib.ts";
import type { AbilityInit, Context, GameConfig } from "./public-types.ts";
import { highlightHoldTexture, highlightTexture } from "./resources.ts";
import type { StageDefinition } from "./stages/type.ts";

export function init(cx: Context, spriteOptions?: SpriteOptions | Texture) {
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
  cx._stage_container.addChild(sprite);

  // Move the sprite to the center of the screen
  document.addEventListener("keydown", (event) => handleInput(cx, event, true));
  document.addEventListener("keyup", (event) => handleInput(cx, event, false));
  console.log("player init");
  return new Player(sprite);
}
export class Player {
  _sprite: Sprite;
  vx: number;
  vy: number;
  onGround: boolean;
  jumpingBegin: number | null;
  holdingKeys: Record<string, boolean>;
  facing: consts.Facing;
  constructor(sprite: Sprite) {
    this._sprite = sprite;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.jumpingBegin = null;
    this.holdingKeys = {};
    this.facing = consts.Facing.right;
  }
  reset(cx: Context, d: StageDefinition) {
    this.x = get(cx.config).blockSize * d.initialPlayerX;
    this.y = get(cx.config).blockSize * d.initialPlayerY + get(cx.config).marginY;
    this.facing = consts.Facing.right;
    this.vx = 0;
    this.vy = 0;
    this.jumpingBegin = null;
  }
  get sprite() {
    assert(!this._sprite.destroyed, "sprite is destroyed"); // appが破棄されたあとにどこかのイベントハンドラーがplayerやcontextへの参照を持ち続けていると起きる
    return this._sprite;
  }
  // MEMO: `coords` は抽象化失敗してるので、直すか消すほうが良い
  get coords() {
    return { x: this.x, y: this.y };
  }
  get x() {
    return this.sprite.x;
  }
  set x(v) {
    this.sprite.x = v;
  }
  get y() {
    return this.sprite.y;
  }
  set y(v) {
    this.sprite.y = v;
  }
}
export function getCoords(cx: Context) {
  const { blockSize, marginY } = get(cx.config);
  if (!cx.dynamic.player) {
    return { x: 0, y: 0 };
  }
  const coords = cx.dynamic.player.coords;
  const x = Math.floor(coords.x / blockSize);
  const y = Math.round((coords.y - marginY) / blockSize) - 1; // it was not working well so take my patch
  return { x, y };
}
export function createHighlight(cx: Context) {
  const state = get(cx.state);
  const player = cx.dynamic.player;
  const { blockSize, marginY } = get(cx.config);
  if (!player || !player.holdingKeys[Inputs.Ctrl] || !player.onGround) return;
  const texture = state.inventory === null ? highlightTexture : highlightHoldTexture;
  const highlight: Sprite = new Sprite(texture);
  highlight.width = blockSize;
  highlight.height = blockSize;
  const highlightCoords = Ability.focusCoord(getCoords(cx), player.facing);
  highlight.x = highlightCoords.x * blockSize;
  highlight.y = highlightCoords.y * blockSize + marginY;
  return highlight;
}

export function handleInput(cx: Context, event: KeyboardEvent, eventIsKeyDown: boolean) {
  const player = cx.dynamic.player;
  if (!player) return;
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
  if (!player) return;
  const grid = cx.grid;

  // movement
  // playerAccelInAirが遅すぎて空中で1マスの隙間に入ることができない問題があるため、
  // 静止状態のときのみ大きいaccelを適用させるクソ仕様
  const accel = player.onGround || player.vx === 0 ? consts.playerAccelOnGround : consts.playerAccelInAir;
  const decel = player.onGround || player.vx === 0 ? consts.playerDecelOnGround : consts.playerDecelInAir;
  let playerIntent = 0; // 0 -> no intent, 1 -> wants to go right, -1 -> wants to go left
  // positive direction
  if (player.holdingKeys[Inputs.Right]) {
    playerIntent = 1;
  }
  if (player.holdingKeys[Inputs.Left]) {
    playerIntent = -1;
  }
  switch (playerIntent) {
    case 1:
      if (player.vx < consts.maxMoveVX * blockSize) {
        player.vx += accel * blockSize;
      }
      break;
    case -1:
      if (player.vx > -consts.maxMoveVX * blockSize) {
        player.vx -= decel * blockSize;
      }
      break;
    case 0:
      if (player.vx > decel * blockSize) {
        player.vx -= decel * blockSize;
      } else if (player.vx < -decel * blockSize) {
        player.vx += decel * blockSize;
      } else {
        player.vx = 0;
      }
      break;
    default:
      throw new Error(`[Player.tick] Invalid playerIntent, got ${playerIntent}`);
  }
  const elapsed = cx.elapsed;
  if (player.holdingKeys[Inputs.Up]) {
    if (player.onGround) {
      player.vy = -consts.jumpVY * blockSize;
      player.jumpingBegin = elapsed;
      player.vx *= consts.jumpAccelRate;
    } else if (player.jumpingBegin && elapsed - player.jumpingBegin < consts.jumpFrames) {
      player.vy = -consts.jumpVY * blockSize;
    } else {
      player.jumpingBegin = null;
    }
  } else {
    player.jumpingBegin = null;
  }

  // collision
  const isBlock = (x: number, y: number) =>
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) !== null &&
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) !== Block.switch &&
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) !== Block.switchPressed &&
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) !== Block.switchingBlockON &&
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) !== Block.inverseSwitchingBlockOFF &&
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) !== Block.goal &&
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) !== undefined;
  const isSwitchBase = (x: number, y: number) =>
    cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) === Block.switchBase;
  const isGoal = (x: number, y: number) => cx.grid.getBlock(cx, Math.floor(x), Math.floor(y)) === Block.goal;
  const isOutOfWorldLeft = (x: number) => x < 0;
  const isOutOfWorldRight = (x: number) => x >= gridX;
  const isOutOfWorldBottom = (y: number) => y >= gridY + marginY / blockSize;

  // next〜 は次フレームの座標、inner〜 は前フレームでかつ1px内側の座標
  const nextX = (player.x + player.vx * ticker.deltaTime) / blockSize;
  const nextBottomY = (player.y - marginY + player.vy * ticker.deltaTime) / blockSize;
  const nextTopY = nextBottomY - consts.playerHeight;
  const nextLeftX = nextX - consts.playerWidth / 2;
  const nextRightX = nextX + consts.playerWidth / 2;
  const innerBottomY = (player.y - marginY - 1) / blockSize;
  const innerTopY = (player.y - marginY + 1) / blockSize - consts.playerHeight;
  const innerLeftX = (player.x + 1) / blockSize - consts.playerWidth / 2;
  const innerRightX = (player.x - 1) / blockSize + consts.playerWidth / 2;

  // 天井
  const hittingCeil = isBlock(innerLeftX, nextTopY) || isBlock(innerRightX, nextTopY);
  // プレイヤーの下がブロック
  // = プレイヤーの左下端がブロック or プレイヤーの右下端がブロック
  // 壁に触れている際にバグるのを避けるためx方向は±1
  player.onGround = player.vy >= 0 && (isBlock(innerLeftX, nextBottomY) || isBlock(innerRightX, nextBottomY));
  if (hittingCeil && player.onGround) {
    player.vy = 0;
  } else if (hittingCeil) {
    player.y = (Math.ceil(nextTopY) + consts.playerHeight) * blockSize + marginY;
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
  const rightHit = isBlock(nextRightX, innerBottomY) || isBlock(nextRightX, innerTopY) || isOutOfWorldRight(nextRightX);
  // 左も同様
  const leftHit = isBlock(nextLeftX, innerBottomY) || isBlock(nextLeftX, innerTopY) || isOutOfWorldLeft(nextLeftX);
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
  if (isOutOfWorldBottom(innerTopY)) {
    gameover(cx);
  }

  // switch activation
  if (isSwitchBase(nextX, nextBottomY)) {
    const switchBlock = get(cx.state).cells[Math.floor(nextBottomY - 1)][Math.floor(nextX)];
    if (switchBlock.block === Block.switch) {
      cx.state.update((prev) => {
        prev.switches = prev.switches.map((s) => {
          if (s.x === Math.floor(nextX) && s.y === Math.floor(nextBottomY - 1)) {
            return {
              ...s,
              pressedByPlayer: true,
            };
          }
          return {
            ...s,
            pressedByPlayer: false,
          };
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
    if (sw.pressedByPlayer && cx.grid.getBlock(cx, sw.x, sw.y) === Block.switch) {
      cx.grid.setBlock(cx, sw.x, sw.y, { block: Block.switchPressed });
    }
    if (!sw.pressedByPlayer && cx.grid.getBlock(cx, sw.x, sw.y) === Block.switchPressed) {
      cx.grid.setBlock(cx, sw.x, sw.y, { block: Block.switch });
    }
  }

  // スイッチの状態を反映
  const switches = get(cx.state).switches;
  const switchIds = [...new Set(switches.map((s) => s.id))]; // 重複削除
  for (const sId of switchIds) {
    const switchingBlock = get(cx.state).switchingBlocks.filter((sb) => sb.id === sId);
    // スイッチが押されているとき
    if (switches.filter((s) => s.id === sId).some((s) => s.pressedByPlayer || s.pressedByBlock)) {
      for (const sb of switchingBlock) {
        if (cx.grid.getBlock(cx, sb.x, sb.y) === Block.switchingBlockOFF) {
          cx.grid.setBlock(cx, sb.x, sb.y, { block: Block.switchingBlockON });
        }
        if (cx.grid.getBlock(cx, sb.x, sb.y) === Block.inverseSwitchingBlockOFF) {
          cx.grid.setBlock(cx, sb.x, sb.y, { block: Block.inverseSwitchingBlockON });
        }
      }
    } else {
      // スイッチが押されていないとき
      for (const sb of switchingBlock) {
        if (cx.grid.getBlock(cx, sb.x, sb.y) === Block.switchingBlockON) {
          cx.grid.setBlock(cx, sb.x, sb.y, { block: Block.switchingBlockOFF });
        }
        if (cx.grid.getBlock(cx, sb.x, sb.y) === Block.inverseSwitchingBlockON) {
          cx.grid.setBlock(cx, sb.x, sb.y, { block: Block.inverseSwitchingBlockOFF });
        }
      }
    }
  }

  // goal
  if (isGoal(nextX, nextTopY) && player.onGround) {
    cx.state.update((prev) => {
      prev.goaled = true;
      return prev;
    });
  }

  // gameover
  const coords = getCoords(cx);
  if (player.onGround && cx.grid.getBlock(cx, coords.x, coords.y + 1) === Block.spike) {
    gameover(cx);
  }
  if (cx.grid.getLaserBeam(cx, nextBottomY, nextTopY, nextLeftX, nextRightX)) {
    gameover(cx);
  }

  // movement? again?
  // 当たり判定結果を反映する
  player.x += player.vx * ticker.deltaTime;
  player.y += player.vy * ticker.deltaTime;
  player.vy += consts.gravity * blockSize * ticker.deltaTime;

  cx.dynamic.focus = Ability.focusCoord(getCoords(cx), player.facing);
}

export function resize(cx: Context, prevConfig: GameConfig) {
  const newConfig = get(cx.config);
  const player = cx.dynamic.player;
  if (!player) return;
  player.x = (player.x / prevConfig.blockSize) * newConfig.blockSize;
  player.y = ((player.y - prevConfig.marginY) / prevConfig.blockSize) * newConfig.blockSize + newConfig.marginY;
  player.sprite.width = consts.playerWidth * newConfig.blockSize;
  player.sprite.height = consts.playerHeight * newConfig.blockSize;
}

// Todo: 直接リセットさせるのではなく、ゲームオーバーシーンを切り分ける
export function gameover(cx: Context) {
  cx.state.update((prev) => {
    prev.gameover = true;
    return prev;
  });
}
