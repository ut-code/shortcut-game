import { type Container, Sprite } from "pixi.js";
import { Block } from "./constants.ts";
import type { Context } from "./context.ts";
import { rockTexture } from "./resources.ts";
import type { StageDefinition } from "./stages.ts";

type GridCell =
  | {
      block: Block.block;
      sprite: Sprite;
    }
  | {
      block: Block.movable;
      sprite: Sprite;
      objectId: string;
      relativePosition: {
        x: number;
        y: number;
      };
    }
  | {
      block: Block.air;
      sprite: null;
    };

export type MovableBlocks = {
  x: number;
  y: number;
  objectId: string;
  // 基準ブロックからの相対位置
  relativeX: number;
  relativeY: number;
}[];

export type MovableObject = {
  objectId: string;
  x: number;
  y: number;
  relativePositions: {
    x: number;
    y: number;
  }[];
};

export class Grid {
  private stage: Container;
  cells: GridCell[][];
  movableBlocks: MovableBlocks;
  constructor(
    stage: Container,
    cellSize: number,
    stageDefinition: StageDefinition,
  ) {
    this.stage = stage;
    this.movableBlocks = stageDefinition.movableBlocks;
    const cells: GridCell[][] = [];
    for (let y = 0; y < stageDefinition.stage.length; y++) {
      const rowDefinition = stageDefinition.stage[y].split("");
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
        } else if (block === Block.movable) {
          const sprite = createSprite(cellSize, block, x, y);
          stage.addChild(sprite);
          const movableBlock = stageDefinition.movableBlocks.filter(
            (block) => block.x === x && block.y === y,
          )[0];
          const cell: GridCell = {
            block,
            sprite,
            objectId: movableBlock.objectId,
            // 同オブジェクトの基準ブロックに対する相対位置
            relativePosition: {
              x: movableBlock.relativeX,
              y: movableBlock.relativeY,
            },
          };
          row.push(cell);
        } else {
          const sprite = createSprite(cellSize, block, x, y);
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
  getMovableObject(x: number, y: number): MovableObject | undefined {
    const cell = this.cells[y]?.[x];
    if (!cell) return undefined;
    if (cell.block !== Block.movable) return undefined;
    const objectId = cell.objectId;
    const retrievedBlocks = this.movableBlocks.filter(
      (block) => block.objectId === objectId,
    );
    if (!retrievedBlocks) return undefined;
    const retrievedObject: MovableObject = {
      objectId,
      x: retrievedBlocks.filter(
        (block) => block.relativeX === 0 && block.relativeY === 0,
      )[0].x,
      y: retrievedBlocks.filter(
        (block) => block.relativeX === 0 && block.relativeY === 0,
      )[0].y,
      relativePositions: retrievedBlocks.map((block) => ({
        x: block.relativeX,
        y: block.relativeY,
      })),
    };
    if (!retrievedObject.x || !retrievedObject.y) return undefined;

    return retrievedObject;
  }
  setBlock(x: number, y: number, block: Block) {
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
    }
  }
  setMovableObject(cx: Context, x: number, y: number, object: MovableObject) {
    const prev = this.cells[y][x];
    if (prev.block !== Block.air) {
      this.stage.removeChild(prev.sprite);
    }
    // 既に同じobjectIdのオブジェクトが設置済みのとき、objectIdを変更して設置する
    // copy使用時に対応
    if (this.movableBlocks.filter((b) => b.objectId === object.objectId)) {
      object.objectId = self.crypto.randomUUID();
    }

    for (const i of object.relativePositions) {
      const positionX = x + i.x;
      const positionY = y + i.y;
      const sprite = createSprite(
        cx.blockSize,
        Block.movable,
        positionX,
        positionY,
      );
      this.stage.addChild(sprite);
      this.cells[positionY][positionX] = {
        block: Block.movable,
        sprite,
        objectId: object.objectId,
        relativePosition: {
          x: i.x,
          y: i.y,
        },
      };
      this.movableBlocks.push({
        x: positionX,
        y: positionY,
        objectId: object.objectId,
        relativeX: i.x,
        relativeY: i.y,
      });
    }

    // 座標基準で重複を削除
    this.movableBlocks = Array.from(
      new Map(this.movableBlocks.map((b) => [`${b.x},${b.y}`, b])).values(),
    );

    // オブジェクトの座標を更新
    object.x = x;
    object.y = y;
  }
  clearAllMovableBlocks() {
    for (const i of this.movableBlocks) {
      const prev = this.cells[i.y][i.x];
      if (prev.block !== Block.air) {
        this.stage.removeChild(prev.sprite);
      }
      this.setBlock(i.x, i.y, Block.air);
    }
  }
  setAllMovableBlocks(cx: Context) {
    const objectIds = Array.from(
      new Set(this.movableBlocks.map((block) => block.objectId)),
    );
    for (const objectId of objectIds) {
      const retrievedBlocks = this.movableBlocks.filter(
        (block) => block.objectId === objectId,
      );
      const movableObject: MovableObject = {
        objectId,
        x: retrievedBlocks.filter(
          (block) => block.relativeX === 0 && block.relativeY === 0,
        )[0].x,
        y: retrievedBlocks.filter(
          (block) => block.relativeX === 0 && block.relativeY === 0,
        )[0].y,
        relativePositions: retrievedBlocks.map((block) => ({
          x: block.relativeX,
          y: block.relativeY,
        })),
      };
      cx.grid.setMovableObject(
        cx,
        movableObject.x,
        movableObject.y,
        movableObject,
      );
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
function createSprite(blockSize: number, block: Block, x: number, y: number) {
  const sprite = new Sprite(rockTexture);
  sprite.tint = block === Block.movable ? 0xff0000 : 0xffffff;
  sprite.width = blockSize;
  sprite.height = blockSize;
  sprite.x = x * blockSize;
  sprite.y = y * blockSize;
  return sprite;
}
