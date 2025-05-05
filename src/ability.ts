import { Block, Facing, type MovableBlock } from "./constants.ts";
import type { Context } from "./context.ts";
import type { MovableBlocks, MovableObject } from "./grid.ts";

export type Coords = {
  x: number;
  y: number;
};
export type AbilityInit = {
  enabled?: AbilityEnableOptions;
};
export type AbilityEnableOptions = {
  copy: boolean;
  paste: boolean;
  cut: boolean;
};
type History = {
  playerX: number;
  playerY: number;
  playerFacing: Facing;
  inventory: MovableObject | null;
  movableBlocks: {
    x: number;
    y: number;
    objectId: string;
    // 基準ブロックからの相対位置
    relativeX: number;
    relativeY: number;
  }[];
};

function isMovableObject(obj: MovableObject | Block): obj is MovableObject {
  return (obj as MovableObject).objectId !== undefined;
}

export class AbilityControl {
  // history: History[] = [];
  // historyIndex = 0;
  inventory: MovableObject | null = null;
  inventoryIsInfinite = false;
  enabled: AbilityEnableOptions;
  focused: Coords | undefined;
  constructor(_cx: Context, options?: AbilityInit) {
    this.enabled = options?.enabled ?? {
      copy: true,
      paste: true,
      cut: true,
    };
  }
  highlightCoord(playerAt: Coords, facing: Facing) {
    let dx: number;
    switch (facing) {
      case Facing.left:
        dx = -1;
        break;
      case Facing.right:
        dx = 1;
        break;
      default:
        dx = facing satisfies never;
    }
    this.focused = {
      ...playerAt,
      x: playerAt.x + dx,
    };
    return this.focused;
  }
  copy(cx: Context) {
    if (!this.focused) return;
    const x = this.focused.x;
    const y = this.focused.y;
    const target = cx.grid.getBlock(x, y);
    if (!target || target !== Block.movable) return;
    const movableObject = cx.grid.getMovableObject(x, y);
    if (!movableObject) return;
    this.inventory = movableObject;
    // cx.gridとinventryは重複しないように
    // cx.grid.movableBlocks = cx.grid.movableBlocks.filter(
    //   (block) => block.objectId !== movableObject.objectId,
    // );
  }
  paste(cx: Context, facing: Facing) {
    if (!this.focused) return;
    if (!this.inventory /*|| this.inventory === Block.air*/) return;
    const objectId = this.inventory.objectId;

    // 左向きのときにブロックを配置する位置を変更するのに使用
    const width =
      this.inventory.relativePositions.reduce(
        (acc, i) => Math.max(acc, i.x),
        0,
      ) -
      this.inventory.relativePositions.reduce(
        (acc, i) => Math.min(acc, i.x),
        1000,
      ) +
      1;

    const x = this.focused.x - (facing === Facing.left ? width - 1 : 0);
    const y = this.focused.y;

    for (const i of this.inventory.relativePositions) {
      const positionX = x + i.x;
      const positionY = y + i.y;
      const target = cx.grid.getBlock(positionX, positionY);
      if (target !== Block.air) {
        // すでに何かある場合は、ペーストできない
        return;
      }
    }

    cx.grid.setMovableObject(cx, x, y, this.inventory);

    if (!this.inventoryIsInfinite) {
      this.inventory = null;
    }
  }
  cut(cx: Context) {
    if (!this.focused) return;

    const x = this.focused.x;
    const y = this.focused.y;
    const target = cx.grid.getBlock(x, y);
    // removable 以外はカットできない
    if (!target || target !== Block.movable) return;
    const movableObject = cx.grid.getMovableObject(x, y);
    if (!movableObject) {
      console.log("aaaaaa");
      return;
    }
    this.inventory = movableObject;
    // cx.gridとinventryは重複しないように
    // 取得したオブジェクトは削除する
    cx.grid.movableBlocks = cx.grid.movableBlocks.filter(
      (block) => block.objectId !== movableObject.objectId,
    );
    for (const i of movableObject.relativePositions) {
      const positionX = movableObject.x + i.x;
      const positionY = movableObject.y + i.y;
      cx.grid.setBlock(positionX, positionY, Block.air);
    }
  }

  // History については、 `docs/history-stack.png` を参照のこと
  pushHistory(
    h: History,
    history: {
      list: History[];
      index: number;
    },
  ) {
    history.list = history.list.slice(0, history.index);
    history.list.push(JSON.parse(JSON.stringify(h)));
    history.index = history.list.length;
    console.log(`history: ${history.index} / ${history.list.length}`);
    console.log(history);
  }
  undo(
    cx: Context,
    history: {
      list: History[];
      index: number;
    },
  ) {
    console.log(history.index);
    if (history.index <= 0) return;
    history.index--; // undo は、巻き戻し後の index で計算する
    const op = history.list[history.index];

    console.log("bbb");

    // すべてのオブジェクトを削除
    cx.grid.clearAllMovableBlocks();

    // オブジェクトを配置
    this.inventory = op.inventory
      ? JSON.parse(JSON.stringify(op.inventory))
      : null;
    cx.grid.movableBlocks = JSON.parse(JSON.stringify(op.movableBlocks));
    cx.grid.setAllMovableBlocks(cx);

    console.log(`history: ${history.index} / ${history.list.length}`);
  }
  redo(
    cx: Context,
    history: {
      list: History[];
      index: number;
    },
  ) {
    if (history.index >= history.list.length) return;
    const op = history.list[history.index];
    history.index++; // redo は、巻き戻し前の index

    // すべてのオブジェクトを削除
    cx.grid.clearAllMovableBlocks();

    // オブジェクトを配置
    this.inventory = op.inventory
      ? JSON.parse(JSON.stringify(op.inventory))
      : null;
    cx.grid.movableBlocks = JSON.parse(JSON.stringify(op.movableBlocks));
    cx.grid.setAllMovableBlocks(cx);

    console.log(`history: ${history.index} / ${history.list.length}`);
  }
  handleKeyDown(
    cx: Context,
    e: KeyboardEvent,
    onGround: boolean,
    facing: Facing,
    history: {
      list: History[];
      index: number;
    },
    playerAt: Coords,
  ) {
    if (!(e.ctrlKey || e.metaKey)) return;

    if (this.enabled.paste && onGround && e.key === "v") {
      this.pushHistory(
        {
          playerX: playerAt.x,
          playerY: playerAt.y,
          inventory: this.inventory ? this.inventory : null,
          playerFacing: facing,
          movableBlocks: cx.grid.movableBlocks,
        },
        history,
      );
      this.paste(cx, facing);
      this.pushHistory(
        {
          playerX: playerAt.x,
          playerY: playerAt.y,
          inventory: this.inventory ? this.inventory : null,
          playerFacing: facing,
          movableBlocks: cx.grid.movableBlocks,
        },
        history,
      );
    }
    if (this.enabled.copy && onGround && e.key === "c") {
      this.pushHistory(
        {
          playerX: playerAt.x,
          playerY: playerAt.y,
          inventory: this.inventory ? this.inventory : null,
          playerFacing: facing,
          movableBlocks: cx.grid.movableBlocks,
        },
        history,
      );
      this.copy(cx);
      this.pushHistory(
        {
          playerX: playerAt.x,
          playerY: playerAt.y,
          inventory: this.inventory ? this.inventory : null,
          playerFacing: facing,
          movableBlocks: cx.grid.movableBlocks,
        },
        history,
      );
    }
    if (this.enabled.cut && onGround && e.key === "x") {
      this.pushHistory(
        {
          playerX: playerAt.x,
          playerY: playerAt.y,
          inventory: this.inventory ? this.inventory : null,
          playerFacing: facing,
          movableBlocks: cx.grid.movableBlocks,
        },
        history,
      );
      this.cut(cx);
      this.pushHistory(
        {
          playerX: playerAt.x,
          playerY: playerAt.y,
          inventory: this.inventory ? this.inventory : null,
          playerFacing: facing,
          movableBlocks: cx.grid.movableBlocks,
        },
        history,
      );
      console.log("x", history);
    }
    if (e.key === "z") {
      this.undo(cx, history);
      e.preventDefault();
    }
    if (e.key === "y") {
      this.redo(cx, history);
      e.preventDefault();
    }
  }
}
