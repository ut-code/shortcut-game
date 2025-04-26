import { Sprite, type SpriteOptions, type Texture, type Ticker } from "pixi.js";
import * as constants from "./constants.ts";
import { Block, getBlock, pixelSize } from "./grid.ts";
import { app } from "./resources.ts";

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
  constructor(options?: SpriteOptions | Texture) {
    super(options);
    // Center the sprite's anchor point
    this.anchor.set(0.5, 1);
    // Move the sprite to the center of the screen
    document.addEventListener("keydown", (event) =>
      this.handleInput(event, true),
    );
    document.addEventListener("keyup", (event) =>
      this.handleInput(event, false),
    );
    app.ticker.add((ticker) => this.update(ticker));

    // todo: 初期座標をフィールドとともにどこかで決定
    this.x = 2 * pixelSize;
    this.y = 2 * pixelSize;

    this.width = constants.playerWidth * pixelSize;
    this.height = constants.playerHeight * pixelSize;

    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.jumpingBegin = null;
    this.elapsed = 0;
    this.holdingKeys = {};
  }
  handleInput(event: KeyboardEvent, down: boolean) {
    console.log(event.key);
    switch (event.key) {
      case "ArrowLeft":
        this.holdingKeys[Inputs.Left] = down;
        break;
      case "ArrowRight":
        this.holdingKeys[Inputs.Right] = down;
        break;
      case "ArrowUp":
        this.holdingKeys[Inputs.Up] = down;
        break;
    }
  }
  update(ticker: Ticker) {
    this.vx = 0;
    if (this.holdingKeys[Inputs.Left]) {
      this.vx -= constants.moveVX * pixelSize;
    }
    if (this.holdingKeys[Inputs.Right]) {
      this.vx += constants.moveVX * pixelSize;
    }
    if (this.holdingKeys[Inputs.Up]) {
      if (this.onGround) {
        this.vy = -constants.jumpVY * pixelSize;
        this.jumpingBegin = this.elapsed;
      } else if (
        this.jumpingBegin &&
        this.elapsed - this.jumpingBegin < constants.jumpFrames
      ) {
        this.vy = -constants.jumpVY * pixelSize;
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
        (this.x + 1) / pixelSize - constants.playerWidth / 2,
        (this.y + this.vy * ticker.deltaTime) / pixelSize,
      ) ||
      isBlock(
        (this.x - 1) / pixelSize + constants.playerWidth / 2,
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
        (this.x + this.vx * ticker.deltaTime) / pixelSize +
          constants.playerWidth / 2,
        (this.y - 1) / pixelSize,
      ) ||
        isBlock(
          (this.x + this.vx * ticker.deltaTime) / pixelSize +
            constants.playerWidth / 2,
          (this.y + 1) / pixelSize - constants.playerHeight,
        ))
    ) {
      console.log("hit right");
      this.x =
        (Math.floor(
          (this.x + this.vx * ticker.deltaTime) / pixelSize +
            constants.playerWidth / 2,
        ) -
          constants.playerWidth / 2) *
        pixelSize;
      this.vx = 0;
    }
    // 左に動いていて、プレイヤーの左上端または左下端がブロック
    if (
      this.vx < 0 &&
      (isBlock(
        (this.x + this.vx * ticker.deltaTime) / pixelSize -
          constants.playerWidth / 2,
        (this.y - 1) / pixelSize,
      ) ||
        isBlock(
          (this.x + this.vx * ticker.deltaTime) / pixelSize -
            constants.playerWidth / 2,
          (this.y + 1) / pixelSize - constants.playerHeight,
        ))
    ) {
      console.log("hit left");
      this.x =
        (Math.ceil(
          (this.x + this.vx * ticker.deltaTime) / pixelSize -
            constants.playerWidth / 2,
        ) +
          constants.playerWidth / 2) *
        pixelSize;
      this.vx = 0;
    }

    this.x += this.vx * ticker.deltaTime;
    this.y += this.vy * ticker.deltaTime;
    this.vy += constants.gravity * pixelSize;
    this.elapsed += ticker.deltaTime;

    // if (bunny.x >= app.screen.width / 2 + 200) {
    //   app.stage.removeChild(bunny);
    // }
  }
}
