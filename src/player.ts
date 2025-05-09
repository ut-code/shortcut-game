import { Sprite, type SpriteOptions, type Texture, type Ticker } from "pixi.js";
import { get } from "svelte/store";
import { AbilityControl } from "./ability.ts";
import * as consts from "./constants.ts";
import { Block } from "./constants.ts";
import type { AbilityInit, Context } from "./public-types.ts";
import { highlightHoldTexture, highlightTexture } from "./resources.ts";

enum Inputs {
  Left = 0,
  Right = 1,
  Up = 2,
  Ctrl = 3,
}
export class Player {
  sprite: Sprite;
  holdingKeys: { [key in Inputs]?: boolean };
  vx: number;
  vy: number;
  onGround: boolean;
  jumpingBegin: number | null;
  facing: consts.Facing = consts.Facing.right;
  ability: AbilityControl;
  constructor(
    cx: Context,
    spriteOptions?: SpriteOptions | Texture,
    options?: {
      ability?: AbilityInit;
    },
  ) {
    this.sprite = new Sprite(spriteOptions);
    // Center the sprite's anchor point
    this.sprite.anchor.set(0.5, 1);
    const { blockSize, initialPlayerX, initialPlayerY, marginY } = get(
      cx.config,
    );

    this.sprite.x = blockSize * initialPlayerX;
    this.sprite.y = blockSize * initialPlayerY + marginY;
    this.sprite.width = consts.playerWidth * blockSize;
    this.sprite.height = consts.playerHeight * blockSize;

    // Move the sprite to the center of the screen
    document.addEventListener("keydown", (event) =>
      this.handleInput(cx, event, true),
    );
    document.addEventListener("keyup", (event) =>
      this.handleInput(cx, event, false),
    );
    this.ability = new AbilityControl(cx, this, options?.ability);
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.jumpingBegin = null;
    this.holdingKeys = {};
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
  getCoords(cx: Context) {
    const { blockSize, marginY } = get(cx.config);
    const x = Math.floor(this.x / blockSize);
    const y = Math.round((this.y - marginY) / blockSize) - 1; // it was not working well so take my patch
    return { x, y };
  }
  createHighlight(cx: Context) {
    const { blockSize, marginY } = get(cx.config);
    if (!this.holdingKeys[Inputs.Ctrl] || !this.onGround) return;
    const texture =
      this.ability.inventory === null ? highlightTexture : highlightHoldTexture;
    const highlight: Sprite = new Sprite(texture);
    highlight.width = blockSize;
    highlight.height = blockSize;
    const highlightCoords = this.ability.highlightCoord(
      this.getCoords(cx),
      this.facing,
    );
    highlight.x = highlightCoords.x * blockSize;
    highlight.y = highlightCoords.y * blockSize + marginY;
    return highlight;
  }
  handleInput(_cx: Context, event: KeyboardEvent, eventIsKeyDown: boolean) {
    if (eventIsKeyDown) {
      const playerPosition = this.ability.handleKeyDown(
        _cx,
        event,
        this.onGround,
        this.facing,
        get(_cx.history),
        { x: this.x, y: this.y },
      );
      if (playerPosition) {
        this.x = playerPosition.x;
        this.y = playerPosition.y;
      }
    }
    switch (event.key) {
      case "Control":
        this.holdingKeys[Inputs.Ctrl] = eventIsKeyDown;
        break;
      case "Meta":
        if (eventIsKeyDown) {
          this.holdingKeys[Inputs.Ctrl] = true;
        } else {
          // MacではCommand(Meta)を押している間他のキーのkeyupが発動しない仕様らしい
          // workaroundとしてMetaを離したときに他のすべてのキーも離したものとして扱う
          this.holdingKeys = {};
        }
        break;
      case "ArrowLeft":
      case "a":
        this.holdingKeys[Inputs.Left] = eventIsKeyDown;
        event.preventDefault();
        if (eventIsKeyDown) {
          this.facing = consts.Facing.left;
        }
        break;
      case "ArrowRight":
      case "d":
        this.holdingKeys[Inputs.Right] = eventIsKeyDown;
        event.preventDefault();
        if (eventIsKeyDown) {
          this.facing = consts.Facing.right;
        }
        break;
      case "ArrowUp":
      case "w":
      case " ":
        this.holdingKeys[Inputs.Up] = eventIsKeyDown;
        event.preventDefault();
        break;
    }
  }
  tick(cx: Context, ticker: Ticker) {
    const state = get(cx.state);
    const { blockSize, gridX, gridY, marginY } = get(cx.config);
    this.vx = 0;
    if (this.holdingKeys[Inputs.Left]) {
      this.vx -= consts.moveVX * blockSize;
    }
    if (this.holdingKeys[Inputs.Right]) {
      this.vx += consts.moveVX * blockSize;
    }
    const elapsed = get(cx.elapsed);
    if (this.holdingKeys[Inputs.Up]) {
      if (this.onGround) {
        this.vy = -consts.jumpVY * blockSize;
        this.jumpingBegin = elapsed;
      } else if (
        this.jumpingBegin &&
        elapsed - this.jumpingBegin < consts.jumpFrames
      ) {
        this.vy = -consts.jumpVY * blockSize;
      } else {
        this.jumpingBegin = null;
      }
    } else {
      this.jumpingBegin = null;
    }

    const isBlock = (x: number, y: number) =>
      cx.grid.getBlock(Math.floor(x), Math.floor(y)) !== Block.air &&
      cx.grid.getBlock(Math.floor(x), Math.floor(y)) !== undefined;
    const isOutOfWorldLeft = (x: number) => x < 0;
    const isOutOfWorldRight = (x: number) => x >= gridX;
    const isOutOfWorldBottom = (y: number) => y >= gridY + marginY / blockSize;

    // next〜 は次フレームの座標、inner〜 は前フレームでかつ1px内側の座標
    const nextX = (this.x + this.vx * ticker.deltaTime) / blockSize;
    const nextBottomY =
      (this.y - marginY + this.vy * ticker.deltaTime) / blockSize;
    const nextTopY = nextBottomY - consts.playerHeight;
    const nextLeftX = nextX - consts.playerWidth / 2;
    const nextRightX = nextX + consts.playerWidth / 2;
    const innerBottomY = (this.y - marginY - 1) / blockSize;
    const innerTopY = (this.y - marginY + 1) / blockSize - consts.playerHeight;
    const innerLeftX = (this.x + 1) / blockSize - consts.playerWidth / 2;
    const innerRightX = (this.x - 1) / blockSize + consts.playerWidth / 2;

    // 天井
    const hittingCeil =
      isBlock(innerLeftX, nextTopY) || isBlock(innerRightX, nextTopY);
    // プレイヤーの下がブロック
    // = プレイヤーの左下端がブロック or プレイヤーの右下端がブロック
    // 壁に触れている際にバグるのを避けるためx方向は±1
    this.onGround =
      this.vy >= 0 &&
      (isBlock(innerLeftX, nextBottomY) || isBlock(innerRightX, nextBottomY));
    if (hittingCeil && this.onGround) {
      this.vy = 0;
    } else if (hittingCeil) {
      this.y =
        (Math.ceil(nextTopY) + consts.playerHeight) * blockSize + marginY;
      this.vy = 0;
      this.jumpingBegin = null;
    } else if (this.onGround) {
      // 自分の位置は衝突したブロックの上
      this.y = Math.floor(nextBottomY) * blockSize + marginY;
      this.vy = 0;
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
      this.vx = 0;
    } else if (rightHit) {
      this.x = (Math.floor(nextRightX) - consts.playerWidth / 2) * blockSize;
      this.vx = 0;
    } else if (leftHit) {
      this.x = (Math.ceil(nextLeftX) + consts.playerWidth / 2) * blockSize;
      this.vx = 0;
    }
    // ステージの下の端にプレイヤーが落ちると、元の場所にもどる
    // Todo: 本当はブロックの移動状況含むステージの状況すべてをリセットすべき
    // Todo: ステージ個別に用意される初期座標に移動させる
    // Todo: 直接移動させるのではなく、ゲームオーバー処理を切り分ける
    if (isOutOfWorldBottom(innerTopY)) {
      this.x = 2 * blockSize;
      this.y = 3 * blockSize + marginY;
      this.vx = 0;
      this.vy = 0;
    }

    // 当たり判定結果を反映する
    this.x += this.vx * ticker.deltaTime;
    this.y += this.vy * ticker.deltaTime;
    this.vy += consts.gravity * blockSize * ticker.deltaTime;
  }
  resize(cx: Context) {
    const state = get(cx.state);
    const cfg = get(cx.config);
    this.sprite.width = consts.playerWidth * cfg.blockSize;
    this.sprite.height = consts.playerHeight * cfg.blockSize;
    this.x = (this.x / cfg.blockSize) * cfg.blockSize;
    this.y =
      ((this.y - cfg.marginY) / cfg.blockSize) * cfg.blockSize + cfg.marginY;
  }
}
