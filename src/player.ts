import { Sprite, type SpriteOptions, type Texture, type Ticker } from "pixi.js";
import * as constants from "./constants.ts";

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
      this.vx -= constants.moveVX;
    }
    if (this.holdingKeys[Inputs.Right]) {
      this.vx += constants.moveVX;
    }
    if (this.holdingKeys[Inputs.Up]) {
      if (this.onGround) {
        this.vy = -constants.jumpVY;
        this.jumpingBegin = this.elapsed;
      } else if (
        this.jumpingBegin &&
        this.elapsed - this.jumpingBegin < constants.jumpFrames
      ) {
        this.vy = -constants.jumpVY;
      } else {
        this.jumpingBegin = null;
      }
    }

    this.x += this.vx * ticker.deltaTime;
    this.y += this.vy * ticker.deltaTime;
    this.vy += constants.gravity;
    this.elapsed += ticker.deltaTime;

    // 当たり判定実装前の仮の地面 (todo)
    if (this.y >= 400) {
      this.y = 400;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // if (bunny.x >= app.screen.width / 2 + 200) {
    //   app.stage.removeChild(bunny);
    // }
  }
}
