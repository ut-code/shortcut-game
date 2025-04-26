import { Sprite, type SpriteOptions, type Texture, type Ticker } from "pixi.js";
import * as c from "./constants.ts";
import { Block } from "./constants.ts";
import { getBlock, pixelSize } from "./grid.ts";
import { app } from "./resources.ts";
import { AbilityControl, type AbilityEnableOptions } from "./ability.ts";

enum Inputs {
  Left = 0,
  Right = 1,
  Up = 2,
}
export class Player extends Sprite {
  holdingKeys: { [key in Inputs]?: boolean };
  vx: number;
  vy: number;
  onGround: boolean;
  jumpingBegin: number | null;
  // elapsed time (1 = 1/60s?)
  elapsed: number;
  facing: c.Facing = c.Facing.right;
  ability: AbilityControl;
  constructor(
    superOptions?: SpriteOptions | Texture,
    thisOptions?: {
      ability?: AbilityEnableOptions;
    },
  ) {
    super(superOptions);
    // Center the sprite's anchor point
    this.anchor.set(0.5, 1);
    // Move the sprite to the center of the screen
    document.addEventListener("keydown", (event) =>
      this.handleInput(event, true),
    );
    document.addEventListener("keyup", (event) =>
      this.handleInput(event, false),
    );
    app.ticker.add((ticker) => this.tick(ticker));

    // todo: 初期座標をフィールドとともにどこかで決定
    this.x = 2 * pixelSize;
    this.y = 2 * pixelSize;

    this.width = c.playerWidth * pixelSize;
    this.height = c.playerHeight * pixelSize;

    this.ability = new AbilityControl(thisOptions?.ability);
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.jumpingBegin = null;
    this.elapsed = 0;
    this.holdingKeys = {};
  }
  getCoords() {
    const x = this.x / 32;
    const y = this.y / 32; // pixelSize 後で考える
    return { x, y };
  }
  handleInput(event: KeyboardEvent, eventIsKeyDown: boolean) {
    if (eventIsKeyDown) {
      this.ability.handleKeyDown(event);
    } else {
      this.ability.handleKeyUp(event);
    }
    console.log(event.key);
    switch (event.key) {
      case "ArrowLeft":
      case "a":
        this.holdingKeys[Inputs.Left] = eventIsKeyDown;
        this.facing = c.Facing.left;
        break;
      case "ArrowRight":
      case "d":
        this.holdingKeys[Inputs.Right] = eventIsKeyDown;
        this.facing = c.Facing.right;
        break;
      case "ArrowUp":
      case "w":
        this.holdingKeys[Inputs.Up] = eventIsKeyDown;
        break;
    }
  }
  tick(ticker: Ticker) {
    this.vx = 0;
    if (this.holdingKeys[Inputs.Left]) {
      this.vx -= c.moveVX * pixelSize;
    }
    if (this.holdingKeys[Inputs.Right]) {
      this.vx += c.moveVX * pixelSize;
    }
    if (this.holdingKeys[Inputs.Up]) {
      if (this.onGround) {
        this.vy = -c.jumpVY * pixelSize;
        this.jumpingBegin = this.elapsed;
      } else if (
        this.jumpingBegin &&
        this.elapsed - this.jumpingBegin < c.jumpFrames
      ) {
        this.vy = -c.jumpVY * pixelSize;
      } else {
        this.jumpingBegin = null;
      }
    }

    const isBlock = (x: number, y: number) =>
      getBlock(Math.floor(x), Math.floor(y)) !== Block.air &&
      getBlock(Math.floor(x), Math.floor(y)) !== undefined;
    // プレイヤーの下がブロック
    // = プレイヤーの左下端がブロック or プレイヤーの右下端がブロック
    // 壁に触れている際にバグるのを避けるためx方向は±1
    this.onGround =
      isBlock(
        (this.x + 1) / pixelSize - c.playerWidth / 2,
        (this.y + this.vy * ticker.deltaTime) / pixelSize,
      ) ||
      isBlock(
        (this.x - 1) / pixelSize + c.playerWidth / 2,
        (this.y + this.vy * ticker.deltaTime) / pixelSize,
      );
    if (this.onGround) {
      // 自分の位置は衝突したブロックの上
      this.y =
        Math.floor((this.y + this.vy * ticker.deltaTime) / pixelSize) *
        pixelSize;
      this.vy = 0;
    }
    // 右に動いていて、プレイヤーの右上端または右下端がブロック
    // 地面に触れている際にバグるのを避けるためy方向は-1
    if (
      this.vx > 0 &&
      (isBlock(
        (this.x + this.vx * ticker.deltaTime) / pixelSize + c.playerWidth / 2,
        (this.y - 1) / pixelSize,
      ) ||
        isBlock(
          (this.x + this.vx * ticker.deltaTime) / pixelSize + c.playerWidth / 2,
          (this.y + 1) / pixelSize - c.playerHeight,
        ))
    ) {
      console.log("hit right");
      this.x =
        (Math.floor(
          (this.x + this.vx * ticker.deltaTime) / pixelSize + c.playerWidth / 2,
        ) -
          c.playerWidth / 2) *
        pixelSize;
      this.vx = 0;
    }
    // 左に動いていて、プレイヤーの左上端または左下端がブロック
    if (
      this.vx < 0 &&
      (isBlock(
        (this.x + this.vx * ticker.deltaTime) / pixelSize - c.playerWidth / 2,
        (this.y - 1) / pixelSize,
      ) ||
        isBlock(
          (this.x + this.vx * ticker.deltaTime) / pixelSize - c.playerWidth / 2,
          (this.y + 1) / pixelSize - c.playerHeight,
        ))
    ) {
      console.log("hit left");
      this.x =
        (Math.ceil(
          (this.x + this.vx * ticker.deltaTime) / pixelSize - c.playerWidth / 2,
        ) +
          c.playerWidth / 2) *
        pixelSize;
      this.vx = 0;
    }

    this.x += this.vx * ticker.deltaTime;
    this.y += this.vy * ticker.deltaTime;
    this.vy += c.gravity * pixelSize;
    this.elapsed += ticker.deltaTime;

    // if (bunny.x >= app.screen.width / 2 + 200) {
    //   app.stage.removeChild(bunny);
    // }
  }
}
