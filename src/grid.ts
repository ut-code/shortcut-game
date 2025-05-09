import { type Container, Sprite } from "pixi.js";
import { type Writable, get } from "svelte/store";
import { Block } from "./constants.ts";
import { assert } from "./lib.ts";
import type {
  Context,
  GameConfig,
  GameState,
  MovableObject,
} from "./public-types.ts";
import { rockTexture } from "./resources.ts";
import type { StageDefinition } from "./stages.ts";

// structuredClone cannot clone Sprite so we need to store it separately
type VirtualSpriteCell = {
  sprite: Sprite | null;
  block: Block;
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
  vsom: VirtualSpriteCell[][];
  marginY: number; // windowの上端とy=0上端の距離(px)
  oobSprites: Sprite[]; // グリッド定義の外を埋めるやつ
  constructor(
    cx: {
      _stage_container: Container;
      state: Writable<GameState>;
      config: Writable<GameConfig>;
    },
    height: number,
    cellSize: number,
    stageDefinition: StageDefinition,
  ) {
    const stage = cx._stage_container;
    this.oobSprites = [];
    this.marginY = (height - cellSize * stageDefinition.stage.length) / 2;
    const sprites: VirtualSpriteCell[][] = [];

    for (let y = 0; y < stageDefinition.stage.length; y++) {
      const rowDefinition = stageDefinition.stage[y].split("");
      const spriteRow: VirtualSpriteCell[] = [];
      for (let x = 0; x < rowDefinition.length; x++) {
        const cellDef = rowDefinition[x];
        const block = blockFromDefinition(cellDef);
        switch (block) {
          case Block.air:
            spriteRow.push({ sprite: null, block });
            break;
          case Block.movable: {
            const sprite = createSprite(cellSize, block, x, y, this.marginY);
            stage.addChild(sprite);
            spriteRow.push({ sprite, block });
            break;
          }
          case Block.block: {
            const sprite = createSprite(cellSize, block, x, y, this.marginY);
            stage.addChild(sprite);
            spriteRow.push({ sprite, block });
            break;
          }
          default:
            block satisfies never;
        }
      }
      sprites.push(spriteRow);
    }
    this.vsom = sprites;

    this.initOOBSprites(cx, cellSize);
  }
  diffAndUpdateTo(
    cx: {
      _stage_container: Container;
      config: Writable<GameConfig>;
      state: Writable<GameState>;
    },
    newGrid: GridCell[][],
  ) {
    for (let y = 0; y < this.vsom.length; y++) {
      for (let x = 0; x < this.vsom[y].length; x++) {
        const vsom = this.vsom[y][x];
        const newCell = newGrid[y][x];
        if (vsom.block !== newCell.block) {
          console.log("[diffing] place at", x, y);
          this.setBlock(cx, x, y, newCell);
        }
      }
    }
  }
  update(cx: Context, fn: (cell: GridCell, x: number, y: number) => GridCell) {
    const cells = get(cx.state).cells;
    for (let y = 0; y < cells.length; y++) {
      for (let x = 0; x < cells[y].length; x++) {
        const cell = cells[y][x];
        const newCell = fn(cell, x, y);
        if (cell !== newCell) {
          this.setBlock(cx, x, y, newCell);
          cells[y][x] = newCell;
        }
      }
    }
    cx.state.update((prev) => ({
      ...prev,
      cells: cells,
    }));
  }
  initOOBSprites(
    cx: { _stage_container: Container; state: Writable<GameState> },
    cellSize: number,
  ) {
    const cells = get(cx.state).cells;
    const stage = cx._stage_container;
    this.oobSprites = [];
    // y < 0 にはy=0のblockをコピー
    for (let y = -1; y >= -Math.ceil(this.marginY / cellSize); y--) {
      for (let x = 0; x < cells[0].length; x++) {
        const cell = cells[0][x];
        if (cell.block === Block.block) {
          const sprite = createSprite(cellSize, cell.block, x, y, this.marginY);
          stage.addChild(sprite);
          this.oobSprites.push(sprite);
        }
      }
    }
    // y > gridY にはy=gridY-1のblockをコピー
    for (
      let y = cells.length;
      y < cells.length + Math.ceil(this.marginY / cellSize);
      y++
    ) {
      for (let x = 0; x < cells[cells.length - 1].length; x++) {
        const cell = cells[cells.length - 1][x];
        if (cell.block === Block.block) {
          const sprite = createSprite(cellSize, cell.block, x, y, this.marginY);
          stage.addChild(sprite);
          this.oobSprites.push(sprite);
        }
      }
    }
  }
  rerender(
    cx: { _stage_container: Container; state: Writable<GameState> },
    height: number,
    cellSize: number,
  ) {
    const cells = get(cx.state).cells;
    const stage = cx._stage_container;
    this.marginY = (height - cellSize * cells.length) / 2;
    // oobSpritesをすべて削除
    for (const sprite of this.oobSprites) {
      stage.removeChild(sprite);
    }
    for (let y = 0; y < cells.length; y++) {
      const row = this.vsom[y];
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        if (cell.sprite) {
          updateSprite(cell.sprite, cellSize, x, y, this.marginY);
        }
      }
    }
    this.initOOBSprites(cx, cellSize);
  }
  getBlock(cx: Context, x: number, y: number): Block | undefined {
    return get(cx.state).cells[y]?.[x]?.block;
  }
  // satisfies: every(MovableObject.relativePositions, (pos) => pos.x >= 0)
  // satisfies: every(MovableObject.relativePositions, (pos) => pos.y <= 0)
  getMovableObject(
    cx: Context,
    x: number,
    y: number,
  ): MovableObject | undefined {
    const cells = get(cx.state).cells;
    const cell = cells[y]?.[x];
    if (!cell) return undefined;
    if (cell.block !== Block.movable) return undefined;
    const objectId = cell.objectId;
    const retrievedBlocks: { x: number; y: number }[] = [];
    for (let y = 0; y < cells.length; y++) {
      for (let x = 0; x < cells[y].length; x++) {
        if (cells[y][x].objectId === cell.objectId) {
          retrievedBlocks.push({ x, y });
        }
      }
    }
    const minX = retrievedBlocks
      .map((v) => v.x)
      .reduce((a, b) => Math.min(a, b), Number.POSITIVE_INFINITY);
    const maxY = retrievedBlocks
      .map((v) => v.y)
      .reduce((a, b) => Math.max(a, b), 0);

    const retrievedObject: MovableObject = {
      block: cell.block,
      objectId,
      relativePositions: retrievedBlocks.map((block) => ({
        x: block.x - minX,
        y: block.y - maxY,
      })),
    };
    return retrievedObject;
  }
  setBlock(
    cx: {
      _stage_container: Container;
      config: Writable<GameConfig>;
      state: Writable<GameState>;
    },
    x: number,
    y: number,
    cell: GridCell,
  ) {
    const stage = cx._stage_container;
    const cells = get(cx.state).cells;
    const prev = this.vsom[y][x];
    const { blockSize, marginY } = get(cx.config);
    if (prev.block === cell.block) return;
    if (prev.sprite) {
      cx._stage_container.removeChild(prev.sprite);
    }
    if (prev.block === Block.air && prev.sprite) {
      console.warn(
        "sprites is out of sync with cells: expected null, got sprite",
      );
    }
    if (prev.block !== Block.air && prev.sprite === null) {
      console.warn(
        "sprites is out of sync with cells: expected sprite, got null",
      );
    }

    if (cell.block !== Block.movable && cell.objectId) {
      console.warn("Cell is not movable but has an objectId");
    }

    switch (cell.block) {
      case Block.air:
        cells[y][x] = {
          block: cell.block,
          objectId: undefined,
        };
        prev.sprite = null;
        prev.block = cell.block;
        break;
      case Block.block: {
        const blockSprite = createSprite(blockSize, cell.block, x, y, marginY);
        stage.addChild(blockSprite);
        cells[y][x] = {
          block: cell.block,
          objectId: undefined,
        };
        prev.sprite = blockSprite;
        prev.block = cell.block;
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
        stage.addChild(movableSprite);
        assert(cell.objectId !== undefined, "movable block must have objectId");
        cells[y][x] = {
          block: cell.block,
          objectId: cell.objectId,
        };
        prev.sprite = movableSprite;
        prev.block = cell.block;
        break;
      }
      default:
        cell satisfies never;
    }
    cx.state.update((prev) => ({
      ...prev,
      cells: cells,
    }));
  }
}

export function createCellsFromStageDefinition(
  stageDefinition: StageDefinition,
): GridCell[][] {
  const cells: GridCell[][] = [];
  for (let y = 0; y < stageDefinition.stage.length; y++) {
    const rowDefinition = stageDefinition.stage[y].split("");
    const row: GridCell[] = [];
    for (let x = 0; x < rowDefinition.length; x++) {
      const cellDef = rowDefinition[x];
      const block = blockFromDefinition(cellDef);
      switch (block) {
        case Block.movable: {
          const group = stageDefinition.blockGroups.find(
            (b) => b.x === x && b.y === y,
          );
          const objectId = group ? group.objectId : Math.random().toString();
          const cell: GridCell = {
            block,
            objectId,
          };
          row.push(cell);

          break;
        }
        case Block.block:
        case Block.air: {
          const cell: GridCell = {
            block,
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
  return cells;
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

export function printCells(cells: GridCell[][], context?: string) {
  console.log(
    `${context ? context : "Grid"}:
     ${cells
       .map((row) =>
         row
           .map((cell) => {
             switch (cell.block) {
               case Block.air:
                 return ".";
               case Block.block:
                 return "b";
               case Block.movable:
                 return "m";
               default:
                 cell satisfies never;
             }
           })
           .join(""),
       )
       .join("\n")}`,
  );
}
