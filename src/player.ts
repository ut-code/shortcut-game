import { Sprite, type SpriteOptions, type Texture, type Ticker } from "pixi.js";
import { AbilityControl, type AbilityInit } from "./ability.ts";
import * as c from "./constants.ts";
import { Block } from "./constants.ts";
import type { Context } from "./context.ts";
import { getBlock } from "./grid.ts";
import { highlightHoldTexture, highlightTexture } from "./resources.ts";

enum Inputs {
  Left = 0,
  Right = 1,
  Up = 2,
  Ctrl = 3,
}
export class Player extends Sprite {
  holdingKeys: { [key in Inputs]?: boolean };
  vx: number;
  vy: number;
  onGround: boolean;
  jumpingBegin: number | null;
  facing: c.Facing = c.Facing.right;
  ability: AbilityControl;
  constructor(
    cx: Context,
    superOptions?: SpriteOptions | Texture,
    thisOptions?: {
      ability?: AbilityInit;
    },
  ) {
    super(superOptions);
    // Center the sprite's anchor point
    this.anchor.set(0.5, 1);
    // Move the sprite to the center of the screen
    document.addEventListener("keydown", (event) =>
      this.handleInput(cx, event, true),
    );
    document.addEventListener("keyup", (event) =>
      this.handleInput(cx, event, false),
    );

    // todo: 初期座標をフィールドとともにどこかで決定
    this.x = 2 * cx.blockSize;
    this.y = 2 * cx.blockSize;

    this.width = c.playerWidth * cx.blockSize;
    this.height = c.playerHeight * cx.blockSize;

    this.ability = new AbilityControl(cx, thisOptions?.ability);
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.jumpingBegin = null;
    this.holdingKeys = {};
  }
  getCoords(cx: Context) {
    const x = Math.floor(this.x / cx.blockSize);
    const y = Math.floor((this.y - 1) / cx.blockSize);
    return { x, y };
  }
  createHighlight(cx: Context) {
    if (this.holdingKeys[Inputs.Ctrl] && this.onGround) {
      const texture =
        this.ability.inventory === null
          ? highlightTexture
          : highlightHoldTexture;
      const highlight: Sprite = new Sprite(texture);
      highlight.width = cx.blockSize;
      highlight.height = cx.blockSize;
      const highlightCoords = this.ability.highlightCoord(
        this.getCoords(cx),
        this.facing,
      );
      highlight.x = highlightCoords.x * cx.blockSize;
      highlight.y = highlightCoords.y * cx.blockSize;
      return highlight;
    }
  }
  handleInput(cx: Context, event: KeyboardEvent, eventIsKeyDown: boolean) {
    if (eventIsKeyDown) {
      this.ability.handleKeyDown(cx, event, this.onGround);
    }
    console.log(event.key);
    switch (event.key) {
      case "Control":
      case "Meta":
        this.holdingKeys[Inputs.Ctrl] = eventIsKeyDown;
        break;
      case "ArrowLeft":
      case "a":
        this.holdingKeys[Inputs.Left] = eventIsKeyDown;
        event.preventDefault();
        if (eventIsKeyDown) {
          this.facing = c.Facing.left;
        }
        break;
      case "ArrowRight":
      case "d":
        this.holdingKeys[Inputs.Right] = eventIsKeyDown;
        event.preventDefault();
        if (eventIsKeyDown) {
          this.facing = c.Facing.right;
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
    this.vx = 0;
    if (this.holdingKeys[Inputs.Left]) {
      this.vx -= c.moveVX * cx.blockSize;
    }
    if (this.holdingKeys[Inputs.Right]) {
      this.vx += c.moveVX * cx.blockSize;
    }
    if (this.holdingKeys[Inputs.Up]) {
      if (this.onGround) {
        this.vy = -c.jumpVY * cx.blockSize;
        this.jumpingBegin = cx.elapsed;
      } else if (
        this.jumpingBegin &&
        cx.elapsed - this.jumpingBegin < c.jumpFrames
      ) {
        this.vy = -c.jumpVY * cx.blockSize;
      } else {
        this.jumpingBegin = null;
      }
    }

    const isBlock = (x: number, y: number) =>
      getBlock(cx.grid, Math.floor(x), Math.floor(y)) !== Block.air &&
      getBlock(cx.grid, Math.floor(x), Math.floor(y)) !== undefined;
    // 天井
    const hittingCeil =
      isBlock(
        (this.x + 1) / cx.blockSize - c.playerWidth / 2,
        (this.y + this.vy * ticker.deltaTime) / cx.blockSize - c.playerHeight,
      ) ||
      isBlock(
        (this.x - 1) / cx.blockSize + c.playerWidth / 2,
        (this.y + this.vy * ticker.deltaTime) / cx.blockSize - c.playerHeight,
      );
    if (this.vy < 0 && hittingCeil) {
      this.y =
        (Math.ceil(
          (this.y + this.vy * ticker.deltaTime) / cx.blockSize - c.playerHeight,
        ) +
          c.playerHeight) *
        cx.blockSize;
      this.vy = 0;
      this.jumpingBegin = null;
    }
    // プレイヤーの下がブロック
    // = プレイヤーの左下端がブロック or プレイヤーの右下端がブロック
    // 壁に触れている際にバグるのを避けるためx方向は±1
    this.onGround =
      this.vy >= 0 &&
      (isBlock(
        (this.x + 1) / cx.blockSize - c.playerWidth / 2,
        (this.y + this.vy * ticker.deltaTime) / cx.blockSize,
      ) ||
        isBlock(
          (this.x - 1) / cx.blockSize + c.playerWidth / 2,
          (this.y + this.vy * ticker.deltaTime) / cx.blockSize,
        ));
    if (this.onGround) {
      // 自分の位置は衝突したブロックの上
      if (!hittingCeil) {
        this.y =
          Math.floor((this.y + this.vy * ticker.deltaTime) / cx.blockSize) *
          cx.blockSize;
      }
      this.vy = 0;
    }
    // 右に動いていて、プレイヤーの右上端または右下端がブロック
    // 地面に触れている際にバグるのを避けるためy方向は-1
    if (
      this.vx > 0 &&
      (isBlock(
        (this.x + this.vx * ticker.deltaTime) / cx.blockSize +
          c.playerWidth / 2,
        (this.y - 1) / cx.blockSize,
      ) ||
        isBlock(
          (this.x + this.vx * ticker.deltaTime) / cx.blockSize +
            c.playerWidth / 2,
          (this.y + 1) / cx.blockSize - c.playerHeight,
        ))
    ) {
      console.log("hit right");
      this.x =
        (Math.floor(
          (this.x + this.vx * ticker.deltaTime) / cx.blockSize +
            c.playerWidth / 2,
        ) -
          c.playerWidth / 2) *
        cx.blockSize;
      this.vx = 0;
    }
    // 左に動いていて、プレイヤーの左上端または左下端がブロック
    if (
      this.vx < 0 &&
      (isBlock(
        (this.x + this.vx * ticker.deltaTime) / cx.blockSize -
          c.playerWidth / 2,
        (this.y - 1) / cx.blockSize,
      ) ||
        isBlock(
          (this.x + this.vx * ticker.deltaTime) / cx.blockSize -
            c.playerWidth / 2,
          (this.y + 1) / cx.blockSize - c.playerHeight,
        ))
    ) {
      console.log("hit left");
      this.x =
        (Math.ceil(
          (this.x + this.vx * ticker.deltaTime) / cx.blockSize -
            c.playerWidth / 2,
        ) +
          c.playerWidth / 2) *
        cx.blockSize;
      this.vx = 0;
    }
    // ステージの下の端にプレイヤーが落ちると、元の場所にもどる
    // Todo: 本当はブロックの移動状況含むステージの状況すべてをリセットすべき
    // Todo: ステージ個別に用意される初期座標に移動させる
    if (this.y > 6.5 * cx.blockSize || this.y < -1) {
      this.x = 2 * cx.blockSize;
      this.y = 3 * cx.blockSize;
    }

    this.x += this.vx * ticker.deltaTime;
    this.y += this.vy * ticker.deltaTime;
    this.vy += c.gravity * cx.blockSize * ticker.deltaTime;

    // if (bunny.x >= app.screen.width / 2 + 200) {
    //   app.stage.removeChild(bunny);
    // }
  }
}
