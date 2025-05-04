import { Block, Facing } from "./constants.ts";
import type { Context } from "./context.ts";

export type Coords = {
  x: number;
  y: number;
};
export type AbilityInit = {
  enabled?: AbilityEnableOptions;
  inventoryIsInfinite?: boolean;
};
export type AbilityEnableOptions = {
  // 回数 or Number.POSITIVE_INFINITY
  copy: number;
  paste: number;
  cut: number;
};
type History = {
  at: { x: number; y: number };
  from: Block;
  to: Block;
  inventory: {
    before: Block | null;
    after: Block | null;
  };
  enabled: {
    before: AbilityEnableOptions;
    after: AbilityEnableOptions;
  };
};
export class AbilityControl {
  history: History[] = [];
  historyIndex = 0;
  inventory: Block | null = null;
  inventoryIsInfinite: boolean;
  enabled: AbilityEnableOptions;
  focused: Coords | undefined;
  constructor(cx: Context, options?: AbilityInit) {
    this.enabled = options?.enabled ?? {
      copy: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
      cut: Number.POSITIVE_INFINITY,
    };
    this.inventoryIsInfinite = options?.inventoryIsInfinite ?? false;
    cx.uiContext.update((prev) => ({
      ...prev,
      inventory: this.inventory,
      inventoryIsInfinite: this.inventoryIsInfinite,
      ...this.enabled,
      undo: 0,
      redo: 0,
    }));
    document.addEventListener("copy", (e) => {
      e.preventDefault();
      if (this.enabled.copy > 0) this.copy(cx);
    });
    document.addEventListener("cut", (e) => {
      e.preventDefault();
      if (this.enabled.cut > 0) this.cut(cx);
    });
    document.addEventListener("paste", (e) => {
      e.preventDefault();
      if (this.enabled.paste > 0) this.paste(cx);
    });
  }
  setInventory(cx: Context, inventory: Block | null) {
    this.inventory = inventory;
    cx.uiContext.update((prev) => ({
      ...prev,
      inventory,
    }));
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
    const target = cx.grid.getBlock(this.focused.x, this.focused.y);
    if (!target || target !== Block.movable) return;
    this.setInventory(cx, target);
    cx.uiContext.update((prev) => ({
      ...prev,
      copy: --this.enabled.copy,
    }));
  }
  paste(cx: Context) {
    if (!this.focused) return;
    if (!this.inventory || this.inventory === Block.air) return;
    const target = cx.grid.getBlock(this.focused.x, this.focused.y);
    if (!target || target !== Block.air) return;
    const prevInventory = this.inventory;
    cx.grid.setBlock(cx, this.focused.x, this.focused.y, this.inventory);
    if (!this.inventoryIsInfinite) {
      this.setInventory(cx, null);
    }
    const prevEnabled = { ...this.enabled };
    cx.uiContext.update((prev) => ({
      ...prev,
      paste: --this.enabled.paste,
    }));
    this.pushHistory(cx, {
      at: { ...this.focused },
      from: Block.air,
      to: prevInventory,
      inventory: {
        before: prevInventory,
        after: this.inventory,
      },
      enabled: {
        before: prevEnabled,
        after: this.enabled,
      },
    });
  }
  cut(cx: Context) {
    if (!this.focused) return;
    const target = cx.grid.getBlock(this.focused.x, this.focused.y);
    // removable 以外はカットできない
    if (!target || target !== Block.movable) return;
    const prevInventory = this.inventory;
    this.setInventory(cx, target);
    cx.grid.setBlock(cx, this.focused.x, this.focused.y, Block.air);
    const prevEnabled = { ...this.enabled };
    cx.uiContext.update((prev) => ({
      ...prev,
      cut: --this.enabled.cut,
    }));
    this.pushHistory(cx, {
      at: { ...this.focused },
      from: target,
      to: Block.air,
      inventory: {
        before: prevInventory,
        after: target,
      },
      enabled: {
        before: prevEnabled,
        after: this.enabled,
      },
    });
  }

  // History については、 `docs/history-stack.png` を参照のこと
  pushHistory(cx: Context, h: History) {
    this.history = this.history.slice(0, this.historyIndex);
    this.history.push(h);
    this.historyIndex = this.history.length;
    console.log(`history: ${this.historyIndex} / ${this.history.length}`);
    cx.uiContext.update((prev) => ({
      ...prev,
      undo: this.historyIndex,
      redo: 0,
    }));
  }
  undo(cx: Context) {
    if (this.historyIndex <= 0) return;
    this.historyIndex--; // undo は、巻き戻し後の index で計算する
    const op = this.history[this.historyIndex];
    cx.grid.setBlock(cx, op.at.x, op.at.y, op.from);
    this.setInventory(cx, op.inventory.before);
    this.enabled = op.enabled.before;
    cx.uiContext.update((prev) => ({
      ...prev,
      ...this.enabled,
      undo: this.historyIndex,
      redo: this.history.length - this.historyIndex,
    }));
    console.log(`history: ${this.historyIndex} / ${this.history.length}`);
  }
  redo(cx: Context) {
    if (this.historyIndex >= this.history.length) return;
    const op = this.history[this.historyIndex];
    this.historyIndex++; // redo は、巻き戻し前の index
    this.setInventory(cx, op.inventory.after);
    cx.grid.setBlock(cx, op.at.x, op.at.y, op.to);
    this.enabled = op.enabled.after;
    cx.uiContext.update((prev) => ({
      ...prev,
      ...this.enabled,
      undo: this.historyIndex,
      redo: this.history.length - this.historyIndex,
    }));
    console.log(`history: ${this.historyIndex} / ${this.history.length}`);
  }
  handleKeyDown(cx: Context, e: KeyboardEvent /*, onGround: boolean*/) {
    if (!(e.ctrlKey || e.metaKey)) return;

    // if (this.enabled.paste > 0 && onGround && e.key === "v") {
    //   this.paste(cx);
    // }
    // if (this.enabled.copy > 0 && onGround && e.key === "c") {
    //   this.copy(cx);
    // }
    // if (this.enabled.cut > 0 && onGround && e.key === "x") {
    //   this.cut(cx);
    // }
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
