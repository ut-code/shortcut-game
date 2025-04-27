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
    const isOutOfWorld = (x: number, y: number) =>
      getBlock(cx.grid, Math.floor(x), Math.floor(y)) === undefined;

    const nextX = (this.x + this.vx * ticker.deltaTime) / cx.blockSize;
    const bottomY = (this.y + this.vy * ticker.deltaTime) / cx.blockSize;
    const topY = bottomY - c.playerHeight;
    const leftX = nextX - c.playerWidth / 2;
    const rightX = nextX + c.playerWidth / 2;

    const innerBottomY = (this.y - 1) / cx.blockSize;
    const innerTopY = (this.y + 1) / cx.blockSize - c.playerHeight;
    const innerLeftX = (this.x + 1) / cx.blockSize - c.playerWidth / 2;
    const innerRightX = (this.x - 1) / cx.blockSize + c.playerWidth / 2;

    // 天井
    const hittingCeil = isBlock(innerLeftX, topY) || isBlock(innerRightX, topY);
    if (this.vy < 0 && hittingCeil) {
      this.y = Math.ceil(bottomY) * cx.blockSize;
      this.vy = 0;
      this.jumpingBegin = null;
    }
    this.x += this.vx * ticker.deltaTime;
    this.y += this.vy * ticker.deltaTime;
    this.vy += c.gravity * cx.blockSize * ticker.deltaTime;

    // プレイヤーの下がブロック
    // = プレイヤーの左下端がブロック or プレイヤーの右下端がブロック
    // 壁に触れている際にバグるのを避けるためx方向は±1
    this.onGround =
      this.vy >= 0 &&
      (isBlock(innerLeftX, bottomY) || isBlock(innerRightX, bottomY));
    if (this.onGround) {
      // 自分の位置は衝突したブロックの上
      if (!hittingCeil) {
        this.y = Math.floor(bottomY) * cx.blockSize;
      }
      this.vy = 0;
    }
    // プレイヤーの右上端または右下端がブロック または右画面端
    // = プレイヤーの右上端がブロック or 右下端がブロック or プレイヤーの右側が世界の外 (世界は長方形のため、チェックは 1 回でいい)
    // 地面に触れている際にバグるのを避けるためy方向は-1
    if (
      isBlock(rightX, innerBottomY) ||
      isBlock(rightX, innerTopY) ||
      isOutOfWorld(rightX, topY)
    ) {
      this.x =
        (Math.floor(nextX + c.playerWidth / 2) - c.playerWidth / 2) *
        cx.blockSize;
      this.vx = 0;
    }
    // プレイヤーの左側がブロック
    if (
      isBlock(leftX, innerBottomY) ||
      isBlock(leftX, innerTopY) ||
      isOutOfWorld(leftX, topY)
    ) {
      this.x =
        (Math.ceil(nextX - c.playerWidth / 2) + c.playerWidth / 2) *
        cx.blockSize;
      this.vx = 0;
    }
    // ステージの下の端にプレイヤーが落ちると、元の場所にもどる
    // Todo: 本当はブロックの移動状況含むステージの状況すべてをリセットすべき
    // Todo: ステージ個別に用意される初期座標に移動させる
    // Todo: 直接移動させるのではなく、ゲームオーバー処理を切り分ける
    if (isOutOfWorld(nextX, topY)) {
      this.x = 2 * cx.blockSize;
      this.y = 3 * cx.blockSize;
    }

    // if (bunny.x >= app.screen.width / 2 + 200) {
    //   app.stage.removeChild(bunny);
    // }
  }
}
