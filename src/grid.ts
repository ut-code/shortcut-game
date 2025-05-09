import { type Container, Sprite } from "pixi.js";
import { get } from "svelte/store";
import { Block } from "./constants.ts";
import { assert } from "./lib.ts";
import type { Context, MovableObject } from "./public-types.ts";
import { rockTexture } from "./resources.ts";
import type { StageDefinition } from "./stages.ts";

// structuredClone cannot clone Sprite so we need to store it separately
type SpriteCell = {
  sprite: Sprite | null;
};
export type GridCell =
  | {
      block: Block.block;
      objectId?: unknown;
    }
  | {
      block: Block.movable;
      objectId: string;
    }
  | {
      block: Block.air;
      objectId?: unknown;
    };

export class Grid {
  private stage: Container;
  cells: GridCell[][];
  sprites: SpriteCell[][];
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
    const sprites: SpriteCell[][] = [];

    for (let y = 0; y < stageDefinition.stage.length; y++) {
      const rowDefinition = stageDefinition.stage[y].split("");
      const row: GridCell[] = [];
      const spriteRow: SpriteCell[] = [];
      for (let x = 0; x < rowDefinition.length; x++) {
        const cellDef = rowDefinition[x];
        const block = blockFromDefinition(cellDef);
        switch (block) {
          case Block.air:
            row.push({
              block,
            });
            spriteRow.push({ sprite: null });
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
              objectId,
            };
            row.push(cell);
            spriteRow.push({ sprite });

            break;
          }
          case Block.block: {
            const sprite = createSprite(cellSize, block, x, y, this.marginY);
            stage.addChild(sprite);
            const cell: GridCell = {
              block,
            };
            row.push(cell);
            spriteRow.push({ sprite });
            break;
          }
          default:
            block satisfies never;
        }
      }
      cells.push(row);
      sprites.push(spriteRow);
    }
    this.cells = cells;
    this.sprites = sprites;

    this.initOOBSprites(cellSize);
  }
  diffAndUpdateTo(newGrid: GridCell[][]) {
    // TODO
    console.log("TODO: implement diffing alg");
  }
  update(cx: Context, fn: (cell: GridCell, x: number, y: number) => GridCell) {
    const { blockSize } = get(cx.config);
    for (let y = 0; y < this.cells.length; y++) {
      for (let x = 0; x < this.cells[y].length; x++) {
        const cell = this.cells[y][x];
        const newCell = fn(cell, x, y);
        if (cell !== newCell) {
          this.setBlock(cx, x, y, newCell);
        }
      }
    }
  }
  snapshot(): GridCell[][] {
    console.log(this.cells);
    return structuredClone(this.cells);
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
      const row = this.sprites[y];
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
    console.log("setBlock called at", x, y);
    const prevSprite = this.sprites[y][x];
    const { blockSize, marginY } = get(cx.config);
    const prev = this.cells[y][x];
    if (prev.block === cell.block) return;
    if (prevSprite.sprite) {
      console.log("removing child at", x, y);
      cx._stage.removeChild(prevSprite.sprite);
    }
    if (prev.block === Block.air && prevSprite.sprite) {
      console.warn(
        "sprites is out of sync with cells: expected null, got sprite",
      );
    }
    if (prev.block !== Block.air && prevSprite.sprite === null) {
      console.warn(
        "sprites is out of sync with cells: expected sprite, got null",
      );
    }

    if (cell.block !== Block.movable && cell.objectId) {
      console.warn("Cell is not movable but has an objectId");
    }

    switch (cell.block) {
      case Block.air:
        this.cells[y][x] = {
          block: cell.block,
          objectId: undefined,
        };
        prevSprite.sprite = null;
        break;
      case Block.block: {
        const blockSprite = createSprite(blockSize, cell.block, x, y, marginY);
        this.stage.addChild(blockSprite);
        this.cells[y][x] = {
          block: cell.block,
          objectId: undefined,
        };
        prevSprite.sprite = blockSprite;
        break;
      }
      case Block.movable: {
        const movableSprite = createSprite(
          blockSize,
          cell.block,
          x,
          y,
          marginY,
        );
        this.stage.addChild(movableSprite);
        assert(cell.objectId !== undefined, "movable block must have objectId");
        this.cells[y][x] = {
          block: cell.block,
          objectId: cell.objectId,
        };
        prevSprite.sprite = movableSprite;
        break;
      }
      default:
        cell satisfies never;
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
