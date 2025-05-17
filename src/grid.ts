import { type Container, Sprite, type Ticker } from "pixi.js";
import { type Writable, get } from "svelte/store";
import { Block } from "./constants.ts";
import * as consts from "./constants.ts";
import { assert, warnIf } from "./lib.ts";
import type { Context, GameConfig, GameState, MovableObject } from "./public-types.ts";
import {
  fallableTexture,
  goalTexture,
  rockTexture,
  switchBaseTexture,
  switchPressedTexture,
  switchTexture,
  tutorialImg1,
  tutorialImg2,
  tutorialImg3,
} from "./resources.ts";
import type { StageDefinition } from "./stages.ts";

// structuredClone cannot clone Sprite so we need to store it separately
type VirtualSpriteCell = {
  sprite: Sprite;
  block: Block;
  dy: number; // fallableで用いる 本来のマスからの表示位置のずれ in pixels, dy < 0
  vy: number;
};
type VirtualSOM = (VirtualSpriteCell | null)[][];
export type GridCell =
  | {
      block: Block.block;
      objectId?: unknown;
    }
  | {
      block: Block.movable;
      objectId: string;
      switchId: string | undefined;
    }
  | {
      block: Block.fallable;
      objectId: string;
      switchId: string | undefined; // switchの上に置かれている場合
    }
  | {
      block: null;
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
    }
  | {
      block: Block.goal;
      objectId?: unknown;
    };

export class Grid {
  __vsom: VirtualSOM;
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
    const vsprites: VirtualSOM = [];

    for (let y = 0; y < stageDefinition.stage.length; y++) {
      const rowDefinition = stageDefinition.stage[y].split("");
      const vspriteRow: (VirtualSpriteCell | null)[] = [];
      for (let x = 0; x < rowDefinition.length; x++) {
        const cellDef = rowDefinition[x];
        const dblock = blockFromDefinition(cellDef);
        switch (dblock) {
          case null: // air
            vspriteRow.push(null);
            break;
          case Block.movable: {
            const sprite = createSprite(cellSize, dblock, x, y, this.marginY);
            stage.addChild(sprite);
            vspriteRow.push({ sprite, block: dblock, dy: 0, vy: 0 });
            break;
          }
          case Block.fallable: {
            const sprite = createSprite(cellSize, dblock, x, y, this.marginY);
            stage.addChild(sprite);
            vspriteRow.push({ sprite, block: dblock, dy: 0, vy: 0 });
            break;
          }
          case Block.block: {
            const sprite = createSprite(cellSize, dblock, x, y, this.marginY);
            stage.addChild(sprite);
            vspriteRow.push({ sprite, block: dblock, dy: 0, vy: 0 });
            break;
          }
          case Block.switch: {
            const switchId = (
              get(cx.state).cells[y][x] as {
                block: Block.switch;
                switchId: string;
              }
            ).switchId;
            const sprite = createSprite(cellSize, dblock, x, y, this.marginY, switchColor(switchId));
            stage.addChild(sprite);
            vspriteRow.push({ sprite, block: dblock, dy: 0, vy: 0 });
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
            const sprite = createSprite(cellSize, dblock, x, y, this.marginY);
            stage.addChild(sprite);
            vspriteRow.push({ sprite, block: dblock, dy: 0, vy: 0 });
            break;
          }
          case Block.switchingBlockOFF: {
            const switchId = (
              get(cx.state).cells[y][x] as {
                block: Block.switch;
                switchId: string;
              }
            ).switchId;
            const sprite = createSprite(cellSize, dblock, x, y, this.marginY, switchColor(switchId));
            stage.addChild(sprite);
            vspriteRow.push({ sprite, block: dblock, dy: 0, vy: 0 });
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
          case Block.goal: {
            const sprite = createSprite(cellSize, dblock, x, y, this.marginY);
            stage.addChild(sprite);
            vspriteRow.push({ sprite, block: dblock, dy: 0, vy: 0 });
            break;
          }
          case Block.switchingBlockON:
          case Block.switchPressed:
            throw new Error(`createCellsFromStageDefinition: block is not supported: ${dblock}`);
          default:
            dblock satisfies never;
        }
      }
      vsprites.push(vspriteRow);
    }
    this.__vsom = vsprites;

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
    for (let y = 0; y < this.__vsom.length; y++) {
      for (let x = 0; x < this.__vsom[y].length; x++) {
        const vsom = this.__vsom[y][x];
        const newCell = newGrid[y][x];
        if (vsom?.block !== newCell.block) {
          this.setBlock(cx, x, y, newCell);
        }
      }
    }
  }
  /**
    it uses object equality internally, therefore
    - object should be equal if they are the same.
    - object should be recreated `{ ...obj }` if they are not the same.
  */
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
  initOOBSprites(cx: { _stage_container: Container; state: Writable<GameState> }, cellSize: number) {
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
    for (let y = cells.length; y < cells.length + Math.ceil(this.marginY / cellSize); y++) {
      for (let x = 0; x < cells[cells.length - 1].length; x++) {
        const cell = cells[cells.length - 1][x];
        if (cell.block === Block.block || cell.block === Block.switchBase) {
          const sprite = createSprite(cellSize, Block.block, x, y, this.marginY);
          stage.addChild(sprite);
          this.oobSprites.push(sprite);
        }
      }
    }
  }
  rerender(cx: { _stage_container: Container; state: Writable<GameState> }, height: number, cellSize: number) {
    const cells = get(cx.state).cells;
    const stage = cx._stage_container;
    this.marginY = (height - cellSize * cells.length) / 2;
    // oobSpritesをすべて削除
    for (const sprite of this.oobSprites) {
      stage.removeChild(sprite);
    }
    for (let y = 0; y < cells.length; y++) {
      const row = this.__vsom[y];
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        if (cell?.sprite) {
          updateSprite(cell.sprite, cellSize, x, y, this.marginY, cell.dy);
        }
      }
    }
    this.initOOBSprites(cx, cellSize);
  }
  getBlock(cx: Context, x: number, y: number): Block | null {
    return get(cx.state).cells[y]?.[x]?.block ?? null;
  }
  // satisfies: every(MovableObject.relativePositions, (pos) => pos.x >= 0)
  // satisfies: every(MovableObject.relativePositions, (pos) => pos.y <= 0)
  getMovableObject(cx: Context, x: number, y: number): MovableObject | undefined {
    const cells = get(cx.state).cells;
    const cell = cells[y]?.[x];
    if (!cell) return undefined;
    if (cell.block !== Block.movable && cell.block !== Block.fallable) return undefined;
    const objectId = cell.objectId;
    const retrievedBlocks: { x: number; y: number }[] = [];
    for (let y = 0; y < cells.length; y++) {
      for (let x = 0; x < cells[y].length; x++) {
        if (cells[y][x].objectId === cell.objectId) {
          retrievedBlocks.push({ x, y });
        }
      }
    }
    const minX = retrievedBlocks.map((v) => v.x).reduce((a, b) => Math.min(a, b), Number.POSITIVE_INFINITY);
    const maxY = retrievedBlocks.map((v) => v.y).reduce((a, b) => Math.max(a, b), 0);

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

  /** WARNING: don't update cells without using this */
  setBlock(
    cx: {
      _stage_container: Container;
      config: Writable<GameConfig>;
      state: Writable<GameState>;
    },
    x: number,
    y: number,
    cNewCell: GridCell,
  ) {
    const stage = cx._stage_container;
    const cells = get(cx.state).cells;
    const cprev = cells[y][x];
    const vprev = this.__vsom[y][x];
    const { blockSize, marginY } = get(cx.config);
    if (vprev?.block === cNewCell.block) {
      console.warn("block is already the same");
      console.log("prev.block", vprev.block);
      return;
    }
    if (vprev?.sprite) {
      cx._stage_container.removeChild(vprev.sprite);
    }
    if (cNewCell.block !== Block.movable && cNewCell.block !== Block.fallable) {
      assert(cNewCell.objectId == null, "Cell is not movable but has an objectId");
    }

    if (vprev?.block === Block.switch && cNewCell.block === Block.switchPressed) {
      // switchがプレイヤーに押されるとき
      assert(
        cprev.block === Block.switch || cprev.block === Block.switchPressed,
        "block is not switch or switchPressed",
      );
      const switchId = cprev.switchId;
      if (!switchId) throw new Error("switchId is undefined");
      const blockSprite = createSprite(blockSize, Block.switchPressed, x, y, marginY, switchColor(switchId));
      stage.addChild(blockSprite);
      cells[y][x] = {
        block: Block.switchPressed,
        switchId,
        objectId: undefined,
      };
      vprev.sprite = blockSprite;
      vprev.block = Block.switchPressed;
      vprev.dy = 0;
      vprev.vy = 0;
    } else if (vprev?.block === Block.switchPressed) {
      // switchがプレイヤーに押されているのが戻るとき
      assert(
        cprev.block === Block.switchPressed || cprev.block === Block.switch,
        "block is not switch or switchPressed",
      );
      const switchId = cprev.switchId;
      if (!switchId) throw new Error("switchId is undefined");
      const blockSprite = createSprite(blockSize, Block.switch, x, y, marginY, switchColor(switchId));
      stage.addChild(blockSprite);
      cells[y][x] = {
        block: Block.switch,
        switchId,
        objectId: undefined,
      };
      vprev.sprite = blockSprite;
      vprev.block = Block.switch;
      vprev.dy = 0;
      vprev.vy = 0;
    }
    // switch上にオブジェクトを置くとき
    else if (vprev?.block === Block.switch) {
      if (cNewCell.block !== Block.movable && cNewCell.block !== Block.fallable) {
        console.warn("No block other than movable cannot be placed on the switch");
        console.log("cell.block", cNewCell.block);
        return;
      }
      const movableSprite = createSprite(blockSize, cNewCell.block, x, y, marginY);
      stage.addChild(movableSprite);
      assert(cNewCell.objectId !== undefined, "movable block must have objectId");
      assert(
        (cprev.block === Block.switch || cprev.block === Block.movable || cprev.block === Block.fallable) &&
          cprev.switchId !== undefined,
        "block is not switch",
      );
      cells[y][x] = {
        block: cNewCell.block,
        switchId: cprev.switchId,
        objectId: cNewCell.objectId,
      };
      vprev.sprite = movableSprite;
      vprev.block = cNewCell.block;
      vprev.dy = 0;
      vprev.vy = 0;
      get(cx.state).switches.filter((s) => {
        if (s.x === x && s.y === y) {
          s.pressedByBlock = true;
        }
        return s;
      });
    }
    // switch上に置いてあるオブジェクトを消すとき
    else if (
      (vprev?.block === Block.movable || vprev?.block === Block.fallable) &&
      (cprev.block === Block.switch || cprev.block === Block.movable || cprev.block === Block.fallable) &&
      cprev.switchId !== undefined
    ) {
      if (cNewCell.block !== Block.switch) {
        console.warn("No block other than switch can replace the switch with object");
        console.log("cell.block", cNewCell.block);
        console.log("prev.block", vprev.block);
        return;
      }
      const switchId = cprev.switchId;
      if (!switchId) throw new Error("switchId is undefined");
      const blockSprite = createSprite(blockSize, Block.switch, x, y, marginY, switchColor(switchId));
      stage.addChild(blockSprite);
      cells[y][x] = {
        block: Block.switch,
        switchId,
        objectId: undefined,
      };
      vprev.sprite = blockSprite;
      vprev.block = Block.switch;
      vprev.dy = 0;
      vprev.vy = 0;
      get(cx.state).switches.filter((s) => {
        if (s.x === x && s.y === y) {
          s.pressedByBlock = false;
        }
        return s;
      });
    }
    // switchingBlockOFFがONに切り替わるとき
    else if (vprev?.block === Block.switchingBlockOFF) {
      if (cNewCell.block !== Block.switchingBlockON) {
        console.warn("No block other than switchingBlockON cannot replace the switchingBlockOFF");
        return;
      }
      assert(
        cprev.block === Block.switchingBlockOFF || cprev.block === Block.switchingBlockON,
        "block is not switchingBlock",
      );
      const switchId = cprev.switchId;
      if (!switchId) throw new Error("switchId is undefined");
      const blockSprite = createSprite(blockSize, Block.switchingBlockON, x, y, marginY, switchColor(switchId));
      stage.addChild(blockSprite);
      cells[y][x] = {
        block: Block.switchingBlockON,
        switchId,
        objectId: undefined,
      };
      vprev.sprite = blockSprite;
      vprev.block = Block.switchingBlockON;
      vprev.dy = 0;
      vprev.vy = 0;
    }
    // switchingBlockONがOFFに切り替わるとき
    else if (vprev?.block === Block.switchingBlockON) {
      if (cNewCell.block !== Block.switchingBlockOFF) {
        console.warn("No block other than switchingBlockOFF cannot replace the switchingBlockON");
        return;
      }
      assert(
        cprev.block === Block.switchingBlockOFF || cprev.block === Block.switchingBlockON,
        "block is not switchingBlock",
      );
      const switchId = cprev.switchId;
      if (!switchId) throw new Error("switchId is undefined");
      const blockSprite = createSprite(blockSize, Block.switchingBlockOFF, x, y, marginY, switchColor(switchId));
      stage.addChild(blockSprite);
      cells[y][x] = {
        block: Block.switchingBlockOFF,
        switchId,
        objectId: undefined,
      };
      vprev.sprite = blockSprite;
      vprev.block = Block.switchingBlockOFF;
      vprev.dy = 0;
      vprev.vy = 0;
    } else {
      switch (cNewCell.block) {
        case null:
          cells[y][x] = {
            block: cNewCell.block,
            objectId: undefined,
          };
          this.__vsom[y][x] = null;
          break;
        case Block.block: {
          const blockSprite = createSprite(blockSize, cNewCell.block, x, y, marginY);
          stage.addChild(blockSprite);
          cells[y][x] = {
            block: cNewCell.block,
            objectId: undefined,
          };
          this.__vsom[y][x] = {
            sprite: blockSprite,
            block: cNewCell.block,
            dy: 0,
            vy: 0,
          };
          break;
        }
        case Block.movable: {
          const movableSprite = createSprite(blockSize, cNewCell.block, x, y, marginY);
          stage.addChild(movableSprite);
          assert(cNewCell.objectId !== undefined, "movable block must have objectId");
          cells[y][x] = {
            block: cNewCell.block,
            objectId: cNewCell.objectId,
            switchId: undefined,
          };
          this.__vsom[y][x] = {
            sprite: movableSprite,
            block: cNewCell.block,
            dy: 0,
            vy: 0,
          };
          break;
        }
        case Block.fallable: {
          const movableSprite = createSprite(blockSize, cNewCell.block, x, y, marginY);
          stage.addChild(movableSprite);
          assert(cNewCell.objectId !== undefined, "movable block must have objectId");
          cells[y][x] = {
            block: cNewCell.block,
            objectId: cNewCell.objectId,
            switchId: undefined,
          };
          this.__vsom[y][x] = {
            sprite: movableSprite,
            block: cNewCell.block,
            dy: 0,
            vy: 0,
          };
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
  tick(cx: Context, ticker: Ticker) {
    const { blockSize, gridX, gridY, marginY } = get(cx.config);
    const cells = get(cx.state).cells;
    for (let y = gridY - 1; y >= 0; y--) {
      for (let x = 0; x < gridX; x++) {
        const vcell = this.__vsom[y][x];
        const ccell = cells[y][x];
        if (ccell.block !== Block.fallable) continue;
        assert(vcell !== null && vcell.block === ccell.block, "[Grid.tick] vcell is out of sync with ccell");

        vcell.dy = (vcell.dy ?? 0) + (vcell.vy ?? 0) * ticker.deltaTime;
        vcell.vy = (vcell.vy ?? 0) + consts.gravity * blockSize * ticker.deltaTime;
        const maxSpeed = consts.maxObjectFallSpeed * blockSize * ticker.deltaTime;
        if (vcell.vy >= maxSpeed) {
          vcell.vy = maxSpeed;
        }

        let swapTargetY = y;
        // 下にブロックがあるなどの要因で止まる
        if (!isAvail(cells, x, swapTargetY + 1)) {
          if (vcell.dy >= 0) {
            // 着地 (dy はたいてい 0 未満なので、別で判定が必要)
            vcell.dy = 0;
            vcell.vy = 0;
          }
        } else {
          // 落下する
          while ((swapTargetY - y) * blockSize <= vcell.dy) {
            vcell.dy -= blockSize;
            swapTargetY++;
          }
        }
        if (y !== swapTargetY) {
          this.setBlock(cx, x, y, { block: null });
          this.setBlock(cx, x, swapTargetY, ccell);
          const vSwapCell = this.__vsom[swapTargetY][x];
          assert(vSwapCell !== null, "it should not happen");
          vSwapCell.dy = vcell.dy;
          vSwapCell.vy = vcell.vy;
          vcell.dy = 0;
          vcell.vy = 0;
          // また抽象化失敗してる...
          vSwapCell.sprite.y = y * blockSize + marginY + vSwapCell.dy;
        }
        vcell.sprite.y = y * blockSize + marginY + vcell.dy;
      }
    }
  }
}
// 落下ブロック / 人用
function isAvail(cells: GridCell[][], x: number, y: number) {
  const cell = cells[y]?.[x];
  switch (true) {
    case y >= cells.length:
      // 床が抜けている
      // どうする?
      return false;
    case cell.block === null || cell.block === Block.switch:
      // 下にブロックがない
      return true;
    default:
      // console.log("ブロックあり");
      // 下にブロックがある
      return false;
  }
}

export function createCellsFromStageDefinition(stageDefinition: StageDefinition): GridCell[][] {
  const cells: GridCell[][] = [];
  for (let y = 0; y < stageDefinition.stage.length; y++) {
    const rowDefinition = stageDefinition.stage[y].split("");
    const row: GridCell[] = [];
    for (let x = 0; x < rowDefinition.length; x++) {
      const cellDef = rowDefinition[x];
      const block = blockFromDefinition(cellDef);
      switch (block) {
        case Block.movable: {
          const group = stageDefinition.blockGroups.find((b) => b.x === x && b.y === y);
          const objectId = group ? group.objectId : Math.random().toString();
          const cell: GridCell = {
            block,
            objectId,
            switchId: undefined,
          };
          row.push(cell);

          break;
        }
        case Block.fallable: {
          const group = stageDefinition.blockGroups.find((b) => b.x === x && b.y === y);
          const objectId = group ? group.objectId : Math.random().toString();
          const cell: GridCell = {
            block,
            objectId,
            switchId: undefined,
          };
          row.push(cell);
          break;
        }
        case Block.block:
        case null: {
          const cell: GridCell = {
            block,
          };
          row.push(cell);
          break;
        }
        case Block.switch: {
          const group = stageDefinition.switchGroups.find((b) => b.x === x && b.y === y);
          if (!group) {
            throw new Error("switch must have switchGroup");
          }
          const switchId = group.switchId;
          const cell: GridCell = {
            block,
            switchId,
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
          const group = stageDefinition.switchGroups.find((b) => b.x === x && b.y === y);
          if (!group) {
            throw new Error("switchingBlock must have switchGroup");
          }
          const switchId = group.switchId;
          const cell: GridCell = {
            block,
            switchId,
          };
          row.push(cell);
          break;
        }
        case Block.goal: {
          const cell: GridCell = {
            block,
          };
          row.push(cell);
          break;
        }
        case Block.switchingBlockON:
        case Block.switchPressed: {
          throw new Error(`createCellsFromStageDefinition: block is not supported: ${block}`);
        }
        default:
          block satisfies never;
      }
    }
    cells.push(row);
  }
  return cells;
}

export function blockFromDefinition(d: string): Block | null {
  switch (d) {
    case ".":
      return null;
    case "b":
      return Block.block;
    case "m":
      return Block.movable;
    case "f":
      return Block.fallable;
    case "s":
      return Block.switch;
    case "S":
      return Block.switchBase;
    case "w":
      return Block.switchingBlockOFF;
    case "g":
      return Block.goal;
    default:
      throw new Error(`[blockFromDefinition] no proper block: ${d}`);
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
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    case Block.movable: {
      const movableSprite = new Sprite(rockTexture);
      movableSprite.tint = 0xff0000;
      updateSprite(movableSprite, blockSize, x, y, marginY, 0);
      return movableSprite;
    }
    case Block.fallable: {
      const movableSprite = new Sprite(fallableTexture);
      // movableSprite.tint = 0xff0000;
      updateSprite(movableSprite, blockSize, x, y, marginY, 0);
      return movableSprite;
    }
    case Block.switch: {
      const switchSprite = new Sprite(switchTexture);
      if (switchColor) switchSprite.tint = switchColor;
      updateSprite(switchSprite, blockSize, x, y, marginY, 0);
      return switchSprite;
    }
    case Block.switchBase: {
      const switchBaseSprite = new Sprite(switchBaseTexture);
      updateSprite(switchBaseSprite, blockSize, x, y, marginY, 0);
      return switchBaseSprite;
    }
    case Block.switchingBlockOFF: {
      const sprite = new Sprite(rockTexture);
      if (switchColor) sprite.tint = switchColor;
      else sprite.tint = 0xffa500;
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    case Block.switchingBlockON: {
      const sprite = new Sprite(rockTexture);
      if (switchColor) sprite.tint = switchColor;
      else sprite.tint = 0xffa500;
      sprite.alpha = 0.3;
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    case Block.switchPressed: {
      const sprite = new Sprite(switchPressedTexture);
      if (switchColor) sprite.tint = switchColor;
      else sprite.tint = 0xffa500;
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    case Block.goal: {
      const sprite = new Sprite(goalTexture);
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    default:
      block satisfies never;
      throw new Error("unreachable");
  }
}
function updateSprite(sprite: Sprite, blockSize: number, x: number, y: number, marginY: number, dy: number) {
  sprite.width = blockSize;
  sprite.height = blockSize;
  sprite.x = x * blockSize;
  sprite.y = y * blockSize + marginY + dy;
}

export function createTutorialSprite(cx: { _stage_container: Container }, order: number) {
  let sprite = new Sprite(tutorialImg1);
  switch (order) {
    case 2:
      sprite = new Sprite(tutorialImg2);
      break;
    case 3:
      sprite = new Sprite(tutorialImg3);
      break;
  }
  sprite.width = 200;
  sprite.height = 200;
  sprite.x = 500;
  sprite.y = 100;
  cx._stage_container.addChild(sprite);
}
//ToDo: 現在の仕様では、Escメニュー表示状態でも動き続ける。

export function printCells(cells: GridCell[][], context?: string) {
  console.log(
    `${context ? context : "Grid"}:
     ${cells
       .map((row) =>
         row
           .map((cell) => {
             switch (cell.block) {
               case null:
                 return ".";
               case Block.block:
                 return "b";
               case Block.movable:
                 return cell.switchId !== undefined ? "M" : "m";
               case Block.fallable:
                 return cell.switchId !== undefined ? "F" : "f";
               case Block.switch:
                 return "s";
               case Block.switchBase:
                 return "S";
               case Block.switchingBlockOFF:
                 return "w";
               case Block.switchingBlockON:
                 return "w";
               case Block.switchPressed:
                 return "s";
               case Block.goal:
                 return "g";
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
