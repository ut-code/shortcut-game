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
  constructor(
    stage: Container,
    cellSize: number,
    stageDefinition: StageDefinition,
  ) {
    this.stage = stage;
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
      const sprite = createSprite(cx.blockSize, block, x, y);
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
function createSprite(blockSize: number, block: Block, x: number, y: number) {
  const sprite = new Sprite(rockTexture);
  sprite.tint = block === Block.movable ? 0xff0000 : 0xffffff;
  sprite.width = blockSize;
  sprite.height = blockSize;
  sprite.x = x * blockSize;
  sprite.y = y * blockSize;
  return sprite;
}
