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
  at: { x: number; y: number };
  from: MovableObject | Block;
  to: MovableObject | Block;
  inventory: {
    before: MovableObject | null;
    after: MovableObject | null;
  };
};

function isMovableObject(obj: MovableObject | Block): obj is MovableObject {
  return (obj as MovableObject).objectId !== undefined;
}

export class AbilityControl {
  history: History[] = [];
  historyIndex = 0;
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
  }
  paste(cx: Context) {
    if (!this.focused) return;
    if (!this.inventory /*|| this.inventory === Block.air*/) return;
    const x = this.focused.x;
    const y = this.focused.y;
    const target = cx.grid.getBlock(this.focused.x, this.focused.y);
    if (!target || target !== Block.air) return;
    const prevInventory = this.inventory;

    cx.grid.setMovableObject(cx, x, y, this.inventory);

    if (!this.inventoryIsInfinite) {
      this.inventory = null;
    }

    this.pushHistory({
      at: { ...this.focused },
      from: Block.air,
      to: prevInventory,
      inventory: {
        before: prevInventory,
        after: this.inventory,
      },
    });
  }
  cut(cx: Context) {
    if (!this.focused) return;
    const x = this.focused.x;
    const y = this.focused.y;
    const target = cx.grid.getBlock(x, y);
    // removable 以外はカットできない
    if (!target || target !== Block.movable) return;
    const movableObject = cx.grid.getMovableObject(x, y);
    if (!movableObject) return;
    const prevInventory = this.inventory;
    this.inventory = movableObject;

    for (const i of movableObject.relativePositions) {
      const positionX = movableObject.x + i.x;
      const positionY = movableObject.y + i.y;
      cx.grid.setBlock(cx, positionX, positionY, Block.air);
    }

    // cx.grid.setBlock(cx, this.focused.x, this.focused.y, Block.air);

    this.pushHistory({
      at: { ...this.focused },
      from: target,
      to: Block.air,
      inventory: {
        before: prevInventory,
        after: movableObject,
      },
    });
  }

  // History については、 `docs/history-stack.png` を参照のこと
  pushHistory(h: History) {
    this.history = this.history.slice(0, this.historyIndex);
    this.history.push(h);
    this.historyIndex = this.history.length;
    console.log(`history: ${this.historyIndex} / ${this.history.length}`);
  }
  undo(cx: Context) {
    if (this.historyIndex <= 0) return;
    this.historyIndex--; // undo は、巻き戻し後の index で計算する
    const op = this.history[this.historyIndex];
    if (!isMovableObject(op.from)) {
      cx.grid.setBlock(cx, op.at.x, op.at.y, op.from);
    } else {
      cx.grid.setMovableObject(cx, op.at.x, op.at.y, op.from);
    }
    this.inventory = op.inventory.before;
    console.log(`history: ${this.historyIndex} / ${this.history.length}`);
  }
  redo(cx: Context) {
    if (this.historyIndex >= this.history.length) return;
    const op = this.history[this.historyIndex];
    this.historyIndex++; // redo は、巻き戻し前の index
    this.inventory = op.inventory.after;
    if (!isMovableObject(op.to)) {
      cx.grid.setBlock(cx, op.at.x, op.at.y, op.to);
    } else {
      cx.grid.setMovableObject(cx, op.at.x, op.at.y, op.to);
    }
    console.log(`history: ${this.historyIndex} / ${this.history.length}`);
  }
  handleKeyDown(cx: Context, e: KeyboardEvent, onGround: boolean) {
    if (!(e.ctrlKey || e.metaKey)) return;

    if (this.enabled.paste && onGround && e.key === "v") {
      this.paste(cx);
    }
    if (this.enabled.copy && onGround && e.key === "c") {
      this.copy(cx);
    }
    if (this.enabled.cut && onGround && e.key === "x") {
      this.cut(cx);
    }
    if (e.key === "z") {
      this.undo(cx);
      e.preventDefault();
    }
    if (e.key === "y") {
      this.redo(cx);
      e.preventDefault();
    }
  }
}
