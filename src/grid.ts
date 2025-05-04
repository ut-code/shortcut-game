import { type Container, Sprite } from "pixi.js";
import { Block } from "./constants.ts";
import type { Context } from "./context.ts";
import { rockTexture } from "./resources.ts";
import type { StageDefinition } from "./stages.ts";

type GridCell =
  | {
      block: Block.block | Block.movable;
      sprite: Sprite;
    }
  | {
      block: Block.air;
      sprite: null;
    };

export class Grid {
  private stage: Container;
  cells: GridCell[][];
  marginY: number; // windowの上端とy=0上端の距離(px)
  oobSprites: Sprite[];
  constructor(
    stage: Container,
    height: number,
    cellSize: number,
    stageDefinition: StageDefinition,
  ) {
    this.stage = stage;
    this.oobSprites = [];
    this.marginY = (height - cellSize * stageDefinition.length) / 2;
    const cells: GridCell[][] = [];
    for (let y = 0; y < stageDefinition.length; y++) {
      const rowDefinition = stageDefinition[y].split("");
      const row: GridCell[] = [];
      for (let x = 0; x < rowDefinition.length; x++) {
        const cellDef = rowDefinition[x];
        const block = blockFromDefinition(cellDef);
        if (block === Block.air) {
          const cell: GridCell = {
            block,
            sprite: null,
          };
          row.push(cell);
        } else {
          const sprite = createSprite(cellSize, block, x, y, this.marginY);
          stage.addChild(sprite);
          const cell: GridCell = {
            block,
            sprite,
          };
          row.push(cell);
        }
      }
      cells.push(row);
    }
    this.cells = cells;

    this.initOOBSprites(cellSize);
  }
  initOOBSprites(cellSize: number) {
    this.oobSprites = [];
    // y < 0 にはy=0のblockをコピー
    for (let y = -1; y >= -Math.ceil(this.marginY / cellSize); y--) {
      for (let x = 0; x < this.cells[0].length; x++) {
        const cell = this.cells[0][x];
        if (cell.block === Block.block) {
          const sprite = createSprite(cellSize, cell.block, x, y, this.marginY);
          this.stage.addChild(sprite);
          this.oobSprites.push(sprite);
        }
      }
    }
    // y > gridY にはy=gridY-1のblockをコピー
    for (
      let y = this.cells.length;
      y < this.cells.length + Math.ceil(this.marginY / cellSize);
      y++
    ) {
      for (let x = 0; x < this.cells[this.cells.length - 1].length; x++) {
        const cell = this.cells[this.cells.length - 1][x];
        if (cell.block === Block.block) {
          const sprite = createSprite(cellSize, cell.block, x, y, this.marginY);
          this.stage.addChild(sprite);
          this.oobSprites.push(sprite);
        }
      }
    }
  }
  rerender(height: number, cellSize: number) {
    this.marginY = (height - cellSize * this.cells.length) / 2;
    // oobSpritesをすべて削除
    for (const sprite of this.oobSprites) {
      this.stage.removeChild(sprite);
    }
    for (let y = 0; y < this.cells.length; y++) {
      const row = this.cells[y];
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        if (cell.sprite) {
          updateSprite(cell.sprite, cellSize, x, y, this.marginY);
        }
      }
    }
    this.initOOBSprites(cellSize);
  }
  clone(grid: Grid) {
    return {
      _stage: grid.stage,
      cells: grid.cells.map((cell) => cell.slice()),
    };
  }
  getBlock(x: number, y: number): Block | undefined {
    return this.cells[y]?.[x]?.block;
  }
  setBlock(cx: Context, x: number, y: number, block: Block) {
    const prev = this.cells[y][x];
    if (block === prev.block) return;
    if (prev.block !== Block.air) {
      this.stage.removeChild(prev.sprite);
    }
    if (block === Block.air) {
      this.cells[y][x] = {
        block,
        sprite: null,
      };
    } else {
      const sprite = createSprite(cx.blockSize, block, x, y, this.marginY);
      this.stage.addChild(sprite);
      this.cells[y][x] = {
        block,
        sprite,
      };
    }
  }
}

export function blockFromDefinition(n: string) {
  switch (n) {
    case ".":
      return Block.air;
    case "b":
      return Block.block;
    case "m":
      return Block.movable;
    default:
      throw new Error("no proper block");
  }
}
function createSprite(
  blockSize: number,
  block: Block,
  x: number,
  y: number,
  marginY: number,
) {
  const sprite = new Sprite(rockTexture);
  sprite.tint = block === Block.movable ? 0xff0000 : 0xffffff;
  updateSprite(sprite, blockSize, x, y, marginY);
  return sprite;
}
function updateSprite(
  sprite: Sprite,
  blockSize: number,
  x: number,
  y: number,
  marginY: number,
) {
  sprite.width = blockSize;
  sprite.height = blockSize;
  sprite.x = x * blockSize;
  sprite.y = y * blockSize + marginY;
}
