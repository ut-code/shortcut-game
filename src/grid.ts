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
import {
  rockTexture,
  switchBaseTexture,
  switchPressedTexture,
  switchTexture,
} from "./resources.ts";
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
    }
  | {
      block: Block.switch;
      switchId?: string;
      objectId?: unknown;
    }
  | {
      block: Block.switchBase;
      objectId?: unknown;
    }
  | {
      block: Block.switchWithObject;
      switchId?: string;
      objectId: string; // Block.movableのID
    }
  | {
      block: Block.switchingBlockOFF;
      switchId?: string;
      objectId?: unknown;
    }
  | {
      block: Block.switchingBlockON;
      switchId?: string;
      objectId?: unknown;
    }
  | {
      block: Block.switchPressed;
      switchId?: string;
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
          case Block.switch: {
            const switchId = (
              get(cx.state).cells[y][x] as {
                block: Block.switch;
                switchId: string;
              }
            ).switchId;
            const sprite = createSprite(
              cellSize,
              block,
              x,
              y,
              this.marginY,
              switchColor(switchId),
            );
            stage.addChild(sprite);
            spriteRow.push({ sprite, block });
            get(cx.state).switches.push({
              id: switchId,
              x,
              y,
              pressedByPlayer: false,
              pressedByBlock: false,
            });
            break;
          }
          case Block.switchBase: {
            const sprite = createSprite(cellSize, block, x, y, this.marginY);
            stage.addChild(sprite);
            spriteRow.push({ sprite, block });
            break;
          }
          case Block.switchingBlockOFF: {
            const switchId = (
              get(cx.state).cells[y][x] as {
                block: Block.switch;
                switchId: string;
              }
            ).switchId;
            const sprite = createSprite(
              cellSize,
              block,
              x,
              y,
              this.marginY,
              switchColor(switchId),
            );
            stage.addChild(sprite);
            spriteRow.push({ sprite, block });
            get(cx.state).switchingBlocks.push({
              id: (
                get(cx.state).cells[y][x] as {
                  block: Block.switch;
                  switchId: string;
                }
              ).switchId,
              x,
              y,
            });
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
          console.log("[diffing] place at", x, y, newCell);
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
          console.log("[updating] place at", x, y);
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
        if (cell.block === Block.block || cell.block === Block.switchBase) {
          const sprite = createSprite(
            cellSize,
            Block.block,
            x,
            y,
            this.marginY,
          );
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
    if (cell.block !== Block.movable && cell.block !== Block.switchWithObject)
      return undefined;
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
      block: Block.movable,
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
    if (prev.block === cell.block) {
      console.warn("block is already the same");
      console.log("prev.block", prev.block);
      return;
    }
    if (prev.sprite) {
      cx._stage_container.removeChild(prev.sprite);
    }
    if (prev.block === Block.air && prev.sprite) {
      console.warn(
        "sprites is out of sync with cells: expected null, got sprite",
      );
    }
    if (
      prev.block !== Block.air &&
      prev.block !== Block.switch &&
      prev.sprite === null
    ) {
      console.warn(
        "sprites is out of sync with cells: expected sprite, got null",
      );
    }

    if (
      cell.block !== Block.movable &&
      cell.block !== Block.switchWithObject &&
      cell.objectId
    ) {
      console.warn("Cell is not movable but has an objectId");
    }

    const prevCell = cells[y][x];

    if (prev.block === Block.switch && cell.block === Block.switchPressed) {
      // switchがプレイヤーに押されるとき
      assert(
        prevCell.block === Block.switch ||
          prevCell.block === Block.switchPressed,
        "block is not switch or switchPressed",
      );
      const switchId = prevCell.switchId;
      if (!switchId) throw new Error("switchId is undefined");
      const blockSprite = createSprite(
        blockSize,
        Block.switchPressed,
        x,
        y,
        marginY,
        switchColor(switchId),
      );
      stage.addChild(blockSprite);
      cells[y][x] = {
        block: Block.switchPressed,
        switchId,
        objectId: undefined,
      };
      prev.sprite = blockSprite;
      prev.block = Block.switchPressed;
    } else if (prev.block === Block.switchPressed) {
      // switchがプレイヤーに押されているのが戻るとき
      assert(
        prevCell.block === Block.switchPressed ||
          prevCell.block === Block.switch,
        "block is not switch or switchPressed",
      );
      const switchId = prevCell.switchId;
      if (!switchId) throw new Error("switchId is undefined");
      const blockSprite = createSprite(
        blockSize,
        Block.switch,
        x,
        y,
        marginY,
        switchColor(switchId),
      );
      stage.addChild(blockSprite);
      cells[y][x] = {
        block: Block.switch,
        switchId,
        objectId: undefined,
      };
      prev.sprite = blockSprite;
      prev.block = Block.switch;
    }
    // switch上にオブジェクトを置くとき
    else if (prev.block === Block.switch) {
      if (
        cell.block !== Block.movable &&
        cell.block !== Block.switchWithObject
      ) {
        console.warn(
          "No block other than movable cannot be placed on the switch",
        );
        console.log("cell.block", cell.block);
        return;
      }
      const movableSprite = createSprite(
        blockSize,
        Block.switchWithObject,
        x,
        y,
        marginY,
      );
      stage.addChild(movableSprite);
      assert(cell.objectId !== undefined, "movable block must have objectId");
      assert(
        prevCell.block === Block.switch ||
          prevCell.block === Block.switchWithObject,
        "block is not switch",
      );
      cells[y][x] = {
        block: Block.switchWithObject,
        switchId: prevCell.switchId,
        objectId: cell.objectId,
      };
      prev.sprite = movableSprite;
      prev.block = Block.switchWithObject;
      get(cx.state).switches.filter((s) => {
        if (s.x === x && s.y === y) {
          s.pressedByBlock = true;
        }
        return s;
      });
    }
    // switch上に置いてあるオブジェクトを消すとき
    else if (prev.block === Block.switchWithObject) {
      if (
        cell.block !== Block.switch &&
        cell.block !== Block.switchWithObject
      ) {
        console.warn(
          "No block other than switch cannot replace the switch with object",
        );
        console.log("cell.block", cell.block);
        console.log("prev.block", prev.block);
        return;
      }
      assert(
        prevCell.block === Block.switchWithObject ||
          prevCell.block === Block.switch,
        "block is not switchWithObject",
      );
      const switchId = prevCell.switchId;
      if (!switchId) throw new Error("switchId is undefined");
      const blockSprite = createSprite(
        blockSize,
        Block.switch,
        x,
        y,
        marginY,
        switchColor(switchId),
      );
      stage.addChild(blockSprite);
      cells[y][x] = {
        block: Block.switch,
        switchId,
        objectId: undefined,
      };
      prev.sprite = blockSprite;
      prev.block = Block.switch;
      get(cx.state).switches.filter((s) => {
        if (s.x === x && s.y === y) {
          s.pressedByBlock = false;
        }
        return s;
      });
    }
    // switchingBlockOFFがONに切り替わるとき
    else if (prev.block === Block.switchingBlockOFF) {
      if (cell.block !== Block.switchingBlockON) {
        console.warn(
          "No block other than switchingBlockON cannot replace the switchingBlockOFF",
        );
        return;
      }
      assert(
        prevCell.block === Block.switchingBlockOFF ||
          prevCell.block === Block.switchingBlockON,
        "block is not switchingBlock",
      );
      const switchId = prevCell.switchId;
      if (!switchId) throw new Error("switchId is undefined");
      const blockSprite = createSprite(
        blockSize,
        Block.switchingBlockON,
        x,
        y,
        marginY,
        switchColor(switchId),
      );
      stage.addChild(blockSprite);
      cells[y][x] = {
        block: Block.switchingBlockON,
        switchId,
        objectId: undefined,
      };
      prev.sprite = blockSprite;
      prev.block = Block.switchingBlockON;
    }
    // switchingBlockONがOFFに切り替わるとき
    else if (prev.block === Block.switchingBlockON) {
      if (cell.block !== Block.switchingBlockOFF) {
        console.warn(
          "No block other than switchingBlockOFF cannot replace the switchingBlockON",
        );
        return;
      }
      assert(
        prevCell.block === Block.switchingBlockOFF ||
          prevCell.block === Block.switchingBlockON,
        "block is not switchingBlock",
      );
      const switchId = prevCell.switchId;
      if (!switchId) throw new Error("switchId is undefined");
      const blockSprite = createSprite(
        blockSize,
        Block.switchingBlockOFF,
        x,
        y,
        marginY,
        switchColor(switchId),
      );
      stage.addChild(blockSprite);
      cells[y][x] = {
        block: Block.switchingBlockOFF,
        switchId,
        objectId: undefined,
      };
      prev.sprite = blockSprite;
      prev.block = Block.switchingBlockOFF;
    } else {
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
          const blockSprite = createSprite(
            blockSize,
            cell.block,
            x,
            y,
            marginY,
          );
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
          assert(
            cell.objectId !== undefined,
            "movable block must have objectId",
          );
          cells[y][x] = {
            block: cell.block,
            objectId: cell.objectId,
          };
          prev.sprite = movableSprite;
          prev.block = cell.block;
          break;
        }
        default:
        // cell satisfies never;
      }
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
        case Block.switch: {
          const group = stageDefinition.switchGroups.find(
            (b) => b.x === x && b.y === y,
          );
          if (!group) {
            throw new Error("switch must have switchGroup");
          }
          const switchId = group.switchId;
          const cell: GridCell = {
            block,
            switchId: switchId,
          };
          row.push(cell);
          break;
        }
        case Block.switchBase: {
          const cell: GridCell = {
            block,
          };
          row.push(cell);
          break;
        }
        case Block.switchingBlockOFF: {
          const group = stageDefinition.switchGroups.find(
            (b) => b.x === x && b.y === y,
          );
          if (!group) {
            throw new Error("switchingBlock must have switchGroup");
          }
          const switchId = group.switchId;
          const cell: GridCell = {
            block,
            switchId: switchId,
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
    case "s":
      return Block.switch;
    case "S":
      return Block.switchBase;
    case "w":
      return Block.switchingBlockOFF;
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
  switchColor?: number, // 例: #ffa500
) {
  switch (block) {
    case Block.block: {
      const sprite = new Sprite(rockTexture);
      sprite.tint = 0xffffff;
      updateSprite(sprite, blockSize, x, y, marginY);
      return sprite;
    }
    case Block.movable: {
      const movableSprite = new Sprite(rockTexture);
      movableSprite.tint = 0xff0000;
      updateSprite(movableSprite, blockSize, x, y, marginY);
      return movableSprite;
    }
    case Block.switch: {
      const switchSprite = new Sprite(switchTexture);
      if (switchColor) switchSprite.tint = switchColor;
      updateSprite(switchSprite, blockSize, x, y, marginY);
      return switchSprite;
    }
    case Block.switchBase: {
      const switchBaseSprite = new Sprite(switchBaseTexture);
      updateSprite(switchBaseSprite, blockSize, x, y, marginY);
      return switchBaseSprite;
    }
    case Block.switchWithObject: {
      const movableSprite = new Sprite(rockTexture);
      movableSprite.tint = 0xff0000;
      updateSprite(movableSprite, blockSize, x, y, marginY);
      return movableSprite;
    }
    case Block.switchingBlockOFF: {
      const sprite = new Sprite(rockTexture);
      if (switchColor) sprite.tint = switchColor;
      else sprite.tint = 0xffa500;
      updateSprite(sprite, blockSize, x, y, marginY);
      return sprite;
    }
    case Block.switchingBlockON: {
      const sprite = new Sprite(rockTexture);
      if (switchColor) sprite.tint = switchColor;
      else sprite.tint = 0xffa500;
      sprite.alpha = 0.3;
      updateSprite(sprite, blockSize, x, y, marginY);
      return sprite;
    }
    case Block.switchPressed: {
      const sprite = new Sprite(switchPressedTexture);
      if (switchColor) sprite.tint = switchColor;
      else sprite.tint = 0xffa500;
      updateSprite(sprite, blockSize, x, y, marginY);
      return sprite;
    }
    default:
      throw new Error("no proper block");
  }
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
               case Block.switch:
                 return "s";
               case Block.switchBase:
                 return "S";
               case Block.switchWithObject:
                 return "M";
               case Block.switchingBlockOFF:
                 return "w";
               case Block.switchingBlockON:
                 return "w";
               case Block.switchPressed:
                 return "s";
               default:
                 cell satisfies never;
             }
           })
           .join(""),
       )
       .join("\n")}`,
  );
}

function switchColor(switchId: string): number | undefined {
  // TODO: 暫定的
  if (switchId === "1") return 0xffa500;
  if (switchId === "2") return 0x00ff00;
  return undefined;
}
