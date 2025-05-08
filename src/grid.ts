import { type Container, Sprite } from "pixi.js";
import { Block } from "./constants.ts";
import type { Context, MovableObject } from "./public-types.ts";
import { rockTexture } from "./resources.ts";
import type { StageDefinition } from "./stages.ts";

type GridCell =
  | {
      block: Block.block;
      sprite: Sprite;
      objectId?: undefined;
    }
  | {
      block: Block.movable;
      sprite: Sprite;
      objectId: string;
    }
  | {
      block: Block.air;
      sprite?: undefined;
      objectId?: undefined;
    };

export class Grid {
  private stage: Container;
  cells: GridCell[][];
  marginY: number; // windowの上端とy=0上端の距離(px)
  oobSprites: Sprite[]; // 画面外にあるやつ (ブラーがかかってるブロックのこと？)
  constructor(
    stage: Container,
    height: number,
    cellSize: number,
    stageDefinition: StageDefinition,
  ) {
    this.stage = stage;

    this.oobSprites = [];
    this.marginY = (height - cellSize * stageDefinition.stage.length) / 2;
    const cells: GridCell[][] = [];
    for (let y = 0; y < stageDefinition.stage.length; y++) {
      const rowDefinition = stageDefinition.stage[y].split("");
      const row: GridCell[] = [];
      for (let x = 0; x < rowDefinition.length; x++) {
        const cellDef = rowDefinition[x];
        const block = blockFromDefinition(cellDef);
        switch (block) {
          case Block.air:
            row.push({
              block,
            });
            break;
          case Block.movable: {
            const sprite = createSprite(cellSize, block, x, y, this.marginY);
            stage.addChild(sprite);
            const group = stageDefinition.blockGroups.find(
              (b) => b.x === x && b.y === y,
            );
            const objectId = group ? group.objectId : Math.random().toString();
            const cell: GridCell = {
              block,
              sprite,
              objectId,
            };
            row.push(cell);
            break;
          }
          case Block.block: {
            const sprite = createSprite(cellSize, block, x, y, this.marginY);
            stage.addChild(sprite);
            const cell: GridCell = {
              block,
              sprite,
            };
            row.push(cell);
            break;
          }
          default:
            block satisfies never;
        }
      }
      cells.push(row);
    }
    this.cells = cells;

    this.initOOBSprites(cellSize);
  }
  diffAndUpdateTo(newGrid: GridCell[][]) {
    // TODO
    console.log("TODO: implement diffing alg");
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
    return grid.cells.map((cell) => cell.slice());
  }
  getBlock(x: number, y: number): Block | undefined {
    return this.cells[y]?.[x]?.block;
  }
  getMovableObject(x: number, y: number): MovableObject | undefined {
    const cell = this.cells[y]?.[x];
    if (!cell) return undefined;
    if (cell.block !== Block.movable) return undefined;
    const objectId = cell.objectId;
    const retrievedBlocks: { x: number; y: number }[] = [];
    for (let y = 0; y < this.cells.length; y++) {
      for (let x = 0; x < this.cells[y].length; x++) {}
      if (this.cells[y][x].objectId === cell.objectId) {
        retrievedBlocks.push({ x, y });
      }
    }
    const retrievedObject: MovableObject = {
      block: cell.block,
      objectId,
      relativePositions: retrievedBlocks.map((block) => ({
        x: block.x - x,
        y: block.y - y,
      })),
    };
    return retrievedObject;
  }
  setBlock(cx: Context, x: number, y: number, cell: GridCell) {
    const prev = this.cells[y][x];
    if (prev.block !== Block.air) {
      this.stage.removeChild(prev.sprite);
    }
    this.cells[y][x] = cell;
    if (cell.block !== Block.air) {
      const sprite = createSprite(cx.blockSize, cell.block, x, y, cx.marginY);
      this.stage.addChild(sprite);
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
