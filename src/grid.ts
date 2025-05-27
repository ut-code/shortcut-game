import { AnimatedSprite, type Container, Sprite, type Ticker } from "pixi.js";
import { type Writable, get } from "svelte/store";
import { Block, BlockDefinitionMap } from "./constants.ts";
import * as consts from "./constants.ts";
import { assert } from "./lib.ts";
import type {
  Context,
  GameConfig,
  GameState,
  MovableObject,
  SwitchState,
  SwitchingBlockState,
} from "./public-types.ts";
import {
  fallableTexture,
  goalTextures,
  laserBeamTexture,
  laserTextureDown,
  laserTextureLeft,
  laserTextureRight,
  laserTextureUp,
  rockTexture,
  spikeTexture,
  switchBaseTexture,
  switchPressedTexture,
  switchTexture,
  tutorialImg1,
  tutorialImg2,
  tutorialImg3,
} from "./resources.ts";
import type { StageDefinition } from "./stages/type.ts";

// structuredClone cannot clone Sprite so we need to store it separately
type VirtualSpriteCell = {
  sprite: Sprite;
  block: Block;
  dy: number; // fallableで用いる 本来のマスからの表示位置のずれ in pixels, dy < 0
  vy: number;
  beamSprite?: Sprite | null; // laser beam
};
type VirtualSOM = (VirtualSpriteCell | null)[][];
export type GridCell =
  | {
      // blocks that don't have switchId
      block:
        | null
        | Block.block
        | Block.switchBase
        | Block.goal
        | Block.spike
        | Block.laserUp
        | Block.laserDown
        | Block.laserLeft
        | Block.laserRight;
      objectId?: unknown;
    }
  | {
      // movable blocks (can be placed on top of switch)
      block: Block.movable | Block.fallable;
      objectId: string;
      switchId: string | undefined; // switchの上に置かれている場合
    }
  | {
      // switches / triggerable blocks
      block:
        | Block.switch
        | Block.switchingBlockOFF
        | Block.switchingBlockON
        | Block.inverseSwitchingBlockOFF
        | Block.inverseSwitchingBlockON
        | Block.switchPressed;
      switchId?: string; // optional でいいの?
      objectId?: unknown;
    };

export class Grid {
  __vsom: VirtualSOM;
  marginY: number; // windowの上端とy=0上端の距離(px)
  oobSprites: Sprite[]; // グリッド定義の外を埋めるやつ
  oobFallableSprites: { sprite: Sprite | null; vy: number }[]; // グリッド定義外に落ちたfallable
  laserBeamHorizontalExists: boolean[][]; // laser beamが存在する場所をtrueにする
  laserBeamVerticalExists: boolean[][];
  initialSwitches: SwitchState[];
  initialSwitchingBlocks: SwitchingBlockState[];
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
    this.oobFallableSprites = [];
    this.laserBeamHorizontalExists = [];
    this.laserBeamVerticalExists = [];
    this.initialSwitches = [];
    this.initialSwitchingBlocks = [];
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
          case Block.block:
          case Block.movable:
          case Block.spike:
          case Block.fallable:
          case Block.goal:
          case Block.switchBase: {
            const objectId = stageDefinition.blockGroups.find((g) => g.x === x && g.y === y)?.objectId || undefined;
            let movableBlockColor: number | undefined = undefined;
            if (
              dblock === Block.movable &&
              stageDefinition.blockGroups.filter((b) => b.objectId === objectId).length >= 2
            ) {
              movableBlockColor = consts.LARGE_BLOCK_COLOR;
            }
            const sprite = createSprite(cellSize, dblock, x, y, this.marginY, movableBlockColor);
            stage.addChild(sprite);
            vspriteRow.push({ sprite, block: dblock, dy: 0, vy: 0 });
            break;
          }
          case Block.laserUp:
          case Block.laserDown:
          case Block.laserLeft:
          case Block.laserRight: {
            // blockFromDefinitionにdirectionの情報は含まれず、cellsのほうが正しい
            const blockWithDirection = get(cx.state).cells[y][x]?.block;
            if (!blockWithDirection) {
              throw new Error("blockWithDirection is null");
            }
            const sprite = createSprite(cellSize, blockWithDirection, x, y, this.marginY);
            stage.addChild(sprite);
            vspriteRow.push({ sprite, block: blockWithDirection, dy: 0, vy: 0 });
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
            this.initialSwitches.push({
              id: switchId,
              x,
              y,
              pressedByPlayer: false,
              pressedByBlock: false,
            });
            break;
          }
          case Block.inverseSwitchingBlockOFF:
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
            this.initialSwitchingBlocks.push({
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
          case Block.inverseSwitchingBlockON:
          case Block.switchingBlockON:
          case Block.switchPressed:
            throw new Error(`[Grid.constructor]: block is not supported: ${dblock}`);
          default:
            dblock satisfies never;
        }
      }
      vsprites.push(vspriteRow);
    }
    this.__vsom = vsprites;
    cx.state.update((prev) => ({
      ...prev,
      switches: structuredClone(this.initialSwitches),
      switchingBlocks: structuredClone(this.initialSwitchingBlocks),
    }));

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
          // TODO:this uses a lot of memory
          const isBlockLarge =
            newGrid.flatMap((row) => row.filter((cell) => cell.objectId === newCell.objectId)).length >= 2;
          this.setBlock(cx, x, y, newCell, isBlockLarge);
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
    // y > gridY にはBlock.blockを設置
    for (let y = cells.length; y < cells.length + Math.ceil(this.marginY / cellSize); y++) {
      for (let x = 0; x < cells[cells.length - 1].length; x++) {
        const cell = cells[cells.length - 1][x];
        if (cell.block === Block.block || cell.block === Block.switchBase || cell.block === Block.spike) {
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
    this.clearFallableSprites(cx);
  }
  // 画面外のfallableはステージ内のfallableのコピーでありhistoryの対象ではないので、
  // undoなどでステージ全体に変更を加えるときに使う
  clearFallableSprites(cx: { _stage_container: Container }) {
    for (const sprite of this.oobFallableSprites) {
      if (sprite.sprite) cx._stage_container.removeChild(sprite.sprite);
    }
    this.oobFallableSprites = [];
  }
  getBlock(cx: Context, x: number, y: number): Block | null | undefined {
    const cells = get(cx.state).cells;
    if (y < 0 || y >= cells.length) return undefined;
    if (x < 0 || x >= cells[y].length) return undefined;
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
      originPosition: {
        x: minX,
        y: maxY,
      },
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
    isLargeBlock?: boolean, // todo: please fix shitty code this someone please
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

    const movableBlockColor = isLargeBlock ? consts.LARGE_BLOCK_COLOR : undefined;

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
    } else if (vprev?.block === Block.switchPressed && cNewCell.block === Block.switch) {
      // switchがプレイヤーに押されているのが戻るとき
      assert(
        cprev.block === Block.switchPressed || cprev.block === Block.switch || cprev.block === Block.movable,
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
    else if (vprev?.block === Block.switch || vprev?.block === Block.switchPressed) {
      if (cNewCell.block !== Block.movable && cNewCell.block !== Block.fallable) {
        console.warn("No block other than movable cannot be placed on the switch");
        console.log("cell.block", cNewCell.block);
        return;
      }
      const movableSprite = createSprite(blockSize, cNewCell.block, x, y, marginY, movableBlockColor);
      stage.addChild(movableSprite);
      assert(cNewCell.objectId !== undefined, "movable block must have objectId");
      assert(
        (cprev.block === Block.switch ||
          cprev.block === Block.switchPressed ||
          cprev.block === Block.movable ||
          cprev.block === Block.fallable) &&
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
          s.pressedByPlayer = false;
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
    else if (vprev?.block === Block.switchingBlockOFF || vprev?.block === Block.inverseSwitchingBlockOFF) {
      if (cNewCell.block !== Block.switchingBlockON && cNewCell.block !== Block.inverseSwitchingBlockON) {
        console.warn("No block other than switchingBlockON cannot replace the switchingBlockOFF");
        return;
      }
      assert(
        cprev.block === Block.switchingBlockOFF ||
          cprev.block === Block.switchingBlockON ||
          cprev.block === Block.inverseSwitchingBlockOFF ||
          cprev.block === Block.inverseSwitchingBlockON,
        "block is not switchingBlock",
      );
      const inversed = vprev.block === Block.inverseSwitchingBlockOFF;
      const switchONBlock = inversed ? Block.inverseSwitchingBlockON : Block.switchingBlockON;
      const switchId = cprev.switchId;
      if (!switchId) throw new Error("switchId is undefined");
      const blockSprite = createSprite(blockSize, switchONBlock, x, y, marginY, switchColor(switchId));
      stage.addChild(blockSprite);
      cells[y][x] = {
        block: switchONBlock,
        switchId,
        objectId: undefined,
      };
      vprev.sprite = blockSprite;
      vprev.block = switchONBlock;
      vprev.dy = 0;
      vprev.vy = 0;
    }
    // switchingBlockONがOFFに切り替わるとき
    else if (vprev?.block === Block.switchingBlockON || vprev?.block === Block.inverseSwitchingBlockON) {
      if (cNewCell.block !== Block.switchingBlockOFF && cNewCell.block !== Block.inverseSwitchingBlockOFF) {
        console.warn("No block other than switchingBlockOFF cannot replace the switchingBlockON");
        return;
      }
      assert(
        cprev.block === Block.switchingBlockOFF ||
          cprev.block === Block.switchingBlockON ||
          cprev.block === Block.inverseSwitchingBlockOFF ||
          cprev.block === Block.inverseSwitchingBlockON,
        "block is not switchingBlock",
      );
      const inversed = vprev.block === Block.inverseSwitchingBlockON;
      const switchOFFBlock = inversed ? Block.inverseSwitchingBlockOFF : Block.switchingBlockOFF;
      const switchId = cprev.switchId;
      if (!switchId) throw new Error("switchId is undefined");
      const blockSprite = createSprite(blockSize, switchOFFBlock, x, y, marginY, switchColor(switchId));
      stage.addChild(blockSprite);
      cells[y][x] = {
        block: switchOFFBlock,
        switchId,
        objectId: undefined,
      };
      vprev.sprite = blockSprite;
      vprev.block = switchOFFBlock;
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
          const movableSprite = createSprite(blockSize, cNewCell.block, x, y, marginY, movableBlockColor);
          console.log(movableBlockColor);
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
  fallableTick(cx: Context, ticker: Ticker) {
    const { blockSize, gridX, gridY, marginY } = get(cx.config);
    const cells = get(cx.state).cells;

    for (const s of this.oobFallableSprites) {
      if (s.sprite) {
        s.sprite.y += s.vy * ticker.deltaTime;
        s.vy += consts.gravity * blockSize * ticker.deltaTime;
        if (s.sprite.y > gridY * blockSize + marginY * 2) {
          // 画面外に出たら消す
          s.sprite.parent?.removeChild(s.sprite);
          s.sprite = null;
        }
      }
    }

    for (let y = gridY - 1; y >= 0; y--) {
      for (let x = 0; x < gridX; x++) {
        const vcell = this.__vsom[y][x];
        const ccell = cells[y][x];
        if (ccell.block !== Block.fallable) continue;
        assert(vcell?.block === ccell.block, "[Grid.tick] vcell is out of sync with ccell");

        vcell.dy = (vcell.dy ?? 0) + (vcell.vy ?? 0) * ticker.deltaTime;
        vcell.vy = (vcell.vy ?? 0) + consts.gravity * blockSize * ticker.deltaTime;
        const maxSpeed = consts.maxObjectFallSpeed * blockSize * ticker.deltaTime;
        if (vcell.vy >= maxSpeed) {
          vcell.vy = maxSpeed;
        }

        let swapDiff = 0;
        let goOOB = false;
        while (swapDiff * blockSize <= vcell.dy) {
          // 下にブロックがあるなどの要因で止まる
          if (!isAvail(cells, x, y + swapDiff + 1)) break;
          vcell.dy -= blockSize;
          swapDiff++;
          if (y + swapDiff >= cells.length) {
            goOOB = true;
            break;
          }
        }

        // これ以上下に行けない
        if (!goOOB && !isAvail(cells, x, y + swapDiff)) {
          // 着地 (dy はたいてい 0 未満なので、別で判定が必要)
          if (vcell.dy >= 0) {
            vcell.dy = 0;
            vcell.vy = 0;
          }
        }

        vcell.sprite.y = y * blockSize + marginY + vcell.dy;

        if (goOOB) {
          // vcell.sprite はsetBlockで消えてしまうので、あたらしく作る
          const oobSprite = createSprite(blockSize, Block.fallable, x, y, marginY);
          oobSprite.y = (y + swapDiff) * blockSize + marginY + vcell.dy;
          cx._stage_container.addChild(oobSprite);
          this.oobFallableSprites.push({
            sprite: oobSprite,
            vy: vcell.vy,
          });
          this.setBlock(cx, x, y, { block: null });
        } else if (swapDiff > 0) {
          this.setBlock(cx, x, y, { block: null });
          this.setBlock(cx, x, y + swapDiff, ccell);
          const vSwapCell = this.__vsom[y + swapDiff][x];
          assert(vSwapCell != null, "it should not happen");
          vSwapCell.dy = vcell.dy;
          vSwapCell.vy = vcell.vy;
          vcell.dy = 0;
          vcell.vy = 0;
          vSwapCell.sprite.y = (y + swapDiff) * blockSize + marginY + vSwapCell.dy;
          console.log("dy", vSwapCell.dy, "vy", vSwapCell.vy);
        }
      }
    }
  }
  getLaserBeam(cx: Context, bottomY: number, topY: number, leftX: number, rightX: number): boolean {
    const { gridX, gridY } = get(cx.config);
    for (let y = 0; y < gridY; y++) {
      for (let x = 0; x < gridX; x++) {
        if (this.laserBeamHorizontalExists[y]?.[x]) {
          // レーザーの範囲: y + (1 - consts.laserWidth) / 2 〜 y + 1 - (1 - consts.laserWidth) / 2
          if (
            !(
              leftX > x + 1 ||
              rightX < x ||
              topY > y + 1 - (1 - consts.laserWidth) / 2 ||
              bottomY < y + (1 - consts.laserWidth) / 2
            )
          ) {
            return true;
          }
        }
        if (this.laserBeamVerticalExists[y]?.[x]) {
          // レーザーの範囲: yと同様
          if (
            !(
              leftX > x + 1 - (1 - consts.laserWidth) / 2 ||
              rightX < x + (1 - consts.laserWidth) / 2 ||
              topY > y + 1 ||
              bottomY < y
            )
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }
  clearLaser(cx: Context) {
    const { gridX, gridY } = get(cx.config);
    this.laserBeamHorizontalExists = [];
    this.laserBeamVerticalExists = [];
    for (let y = 0; y < gridY; y++) {
      for (let x = 0; x < gridX; x++) {
        const vsom = this.__vsom[y][x];
        if (vsom?.beamSprite) {
          cx._stage_container.removeChild(vsom.beamSprite);
          vsom.beamSprite = null;
        }
      }
    }
  }
  laserTick(cx: Context) {
    const { blockSize, gridX, gridY, marginY } = get(cx.config);
    const cells = get(cx.state).cells;
    this.laserBeamHorizontalExists = Array.from({ length: gridY }, () => Array.from({ length: gridX }, () => false));
    this.laserBeamVerticalExists = Array.from({ length: gridY }, () => Array.from({ length: gridX }, () => false));
    for (let y = 0; y < gridY; y++) {
      for (let x = 0; x < gridX; x++) {
        const cell = cells[y][x];
        if (
          cell.block === Block.laserUp ||
          cell.block === Block.laserDown ||
          cell.block === Block.laserLeft ||
          cell.block === Block.laserRight
        ) {
          const directionX = cell.block === Block.laserLeft ? -1 : cell.block === Block.laserRight ? 1 : 0;
          const directionY = cell.block === Block.laserUp ? -1 : cell.block === Block.laserDown ? 1 : 0;
          const beginX = x + directionX;
          const beginY = y + directionY;
          let endX = beginX;
          let endY = beginY;
          while (
            endX + directionX >= 0 &&
            endX + directionX < gridX &&
            endY + directionY >= 0 &&
            endY + directionY < gridY &&
            isAvail(cells, endX + directionX, endY + directionY)
          ) {
            endX += directionX;
            endY += directionY;
          }
          const vsom = this.__vsom[y][x];
          assert(vsom != null, "laser vsom is null");
          if (vsom.beamSprite) {
            cx._stage_container.removeChild(vsom.beamSprite);
            vsom.beamSprite = null;
          }
          if (isAvail(cells, beginX, beginY)) {
            vsom.beamSprite = new Sprite(laserBeamTexture);
            updateSprite(vsom.beamSprite, blockSize, Math.min(beginX, endX), Math.min(beginY, endY), marginY, 0);
            if (cell.block === Block.laserLeft || cell.block === Block.laserRight) {
              vsom.beamSprite.rotation = -Math.PI / 2;
              vsom.beamSprite.y += blockSize; // 回転中心が中心でないので補正
              vsom.beamSprite.height = blockSize * (Math.abs(endX - beginX) + 1); // これは回転前のheight=回転後のwidth
              vsom.beamSprite.width = blockSize /* * consts.laserWidth*/;
              // vsom.beamSprite.y -= (blockSize * (1 - consts.laserWidth)) / 2;
              for (let bx = Math.min(beginX, endX); bx <= Math.max(beginX, endX); bx++) {
                this.laserBeamHorizontalExists[beginY][bx] = true;
              }
            } else {
              vsom.beamSprite.height = blockSize * (Math.abs(endY - beginY) + 1);
              vsom.beamSprite.width = blockSize /* * consts.laserWidth*/;
              // vsom.beamSprite.x += (blockSize * (1 - consts.laserWidth)) / 2;
              for (let by = Math.min(beginY, endY); by <= Math.max(beginY, endY); by++) {
                this.laserBeamVerticalExists[by][beginX] = true;
              }
            }
            cx._stage_container.addChild(vsom.beamSprite);
          }
        }
      }
    }
  }
}
// 落下ブロック / 人用
function isAvail(cells: GridCell[][], x: number, y: number) {
  const cell = cells[y]?.[x];
  switch (true) {
    case y < 0 || y >= cells.length || x < 0 || x >= cells[y].length:
      // 床が抜けている
      return true;
    case cell.block === null || cell.block === Block.switch:
      // 下にブロックがない
      return true;
    default:
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
        // blocks that don't need additional initialization
        case Block.block:
        case null:
        case Block.switchBase:
        case Block.spike:
        case Block.goal: {
          const cell: GridCell = {
            block,
          };
          row.push(cell);
          break;
        }
        // movable blocks
        case Block.movable:
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
        // switches
        case Block.switch:
        case Block.inverseSwitchingBlockON:
        case Block.inverseSwitchingBlockOFF:
        case Block.switchingBlockON:
        case Block.switchingBlockOFF: {
          const group = stageDefinition.switchGroups.find((b) => b.x === x && b.y === y);
          if (!group) {
            throw new Error("switch must have matching switchGroup");
          }
          const switchId = group.switchId;
          const cell: GridCell = {
            block,
            switchId,
          };
          row.push(cell);
          break;
        }
        case Block.switchPressed: {
          throw new Error(`createCellsFromStageDefinition: block is not supported: ${block}`);
        }
        case Block.laserUp:
        case Block.laserDown:
        case Block.laserLeft:
        case Block.laserRight: {
          const direction = stageDefinition.laserDirections?.find((b) => b.x === x && b.y === y);
          if (!direction) {
            throw new Error("laser must have matching laserDirection");
          }
          let blockWithDirection: Block;
          switch (direction.direction) {
            case "up":
              blockWithDirection = Block.laserUp;
              break;
            case "down":
              blockWithDirection = Block.laserDown;
              break;
            case "left":
              blockWithDirection = Block.laserLeft;
              break;
            case "right":
              blockWithDirection = Block.laserRight;
              break;
          }
          const cell: GridCell = {
            block: blockWithDirection,
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

export function blockFromDefinition(d: string): Block | null {
  const block = BlockDefinitionMap.get(d);
  if (block === undefined) {
    throw new Error(`[blockFromDefinition] no proper block: ${d}`);
  }
  return block;
}

function createSprite(
  blockSize: number,
  block: Block,
  x: number,
  y: number,
  marginY: number,
  // 使われたり使われなかったりするので注意
  color?: number, // 例: #ffa500
) {
  switch (block) {
    case Block.block: {
      const sprite = new Sprite(rockTexture);
      sprite.tint = 0xffffff;
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    case Block.movable: {
      const sprite = new Sprite(rockTexture);
      if (color) {
        sprite.tint = color;
      } else {
        sprite.tint = 0xff0000;
      }
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    case Block.fallable: {
      const movableSprite = new Sprite(fallableTexture);
      // movableSprite.tint = 0xff0000;
      updateSprite(movableSprite, blockSize, x, y, marginY, 0);
      return movableSprite;
    }
    case Block.switch: {
      const switchSprite = new Sprite(switchTexture);
      if (color) switchSprite.tint = color;
      updateSprite(switchSprite, blockSize, x, y, marginY, 0);
      return switchSprite;
    }
    case Block.switchBase: {
      const switchBaseSprite = new Sprite(switchBaseTexture);
      updateSprite(switchBaseSprite, blockSize, x, y, marginY, 0);
      return switchBaseSprite;
    }
    case Block.inverseSwitchingBlockON:
    case Block.switchingBlockOFF: {
      const sprite = new Sprite(rockTexture);
      if (color) sprite.tint = color;
      else sprite.tint = 0xffa500;
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    case Block.inverseSwitchingBlockOFF:
    case Block.switchingBlockON: {
      const sprite = new Sprite(rockTexture);
      if (color) sprite.tint = color;
      else sprite.tint = 0xffa500;
      sprite.alpha = 0.3;
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    case Block.switchPressed: {
      const sprite = new Sprite(switchPressedTexture);
      if (color) sprite.tint = color;
      else sprite.tint = 0xffa500;
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    case Block.goal: {
      const sprite = new AnimatedSprite(Object.values(goalTextures));
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      sprite.animationSpeed = 1 / consts.elapsedTimePerFrame;
      sprite.play();
      return sprite;
    }
    case Block.spike: {
      const sprite = new Sprite(spikeTexture);
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    case Block.laserUp: {
      const sprite = new Sprite(laserTextureUp);
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    case Block.laserDown: {
      const sprite = new Sprite(laserTextureDown);
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    case Block.laserLeft: {
      const sprite = new Sprite(laserTextureLeft);
      updateSprite(sprite, blockSize, x, y, marginY, 0);
      return sprite;
    }
    case Block.laserRight: {
      const sprite = new Sprite(laserTextureRight);
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

//ToDo: 現在の仕様では、Escメニュー表示状態でも動き続ける。
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

export function printCells(cells: GridCell[][], context?: string) {
  console.log(
    `${context ? context : "Grid"}:
     ${cells.map((row) => row.map((cell) => consts.ReverseBlockMap.get(cell.block)).join("")).join("\n")}`,
  );
}

function switchColor(switchId: string): number {
  // TODO: 暫定的
  if (switchId === "1") return 0xffa500;
  if (switchId === "2") return 0x00ff00;
  throw new Error(`switchId ${switchId} is not implemented`);
}
