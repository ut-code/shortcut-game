import { Block, Facing } from "./constants.ts";
import type { Context } from "./context.ts";
import { type Grid, getBlock, setBlock } from "./grid.ts";

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
  grid: Block[][];
  inventory: Block | null;
};
export class AbilityControl {
  history: History[] = [];
  historyIndex = 0;
  inventory: Block | null = null;
  inventoryIsInfinite = false;
  enabled: AbilityEnableOptions;
  focused: Coords | undefined;
  constructor(cx: Context, options?: AbilityInit) {
    this.enabled = options?.enabled ?? {
      copy: true,
      paste: true,
      cut: true,
    };
    this.pushHistory(cx.grid); // todo: ここ以外でもフィールドをリセットすることがあるならhistoryを初期化する必要がある
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
  copy(grid: Grid) {
    if (!this.focused) return;
    const target = getBlock(grid, this.focused.x, this.focused.y);
    if (!target || target !== Block.movable) return;
    this.inventory = target;
  }
  paste(grid: Grid) {
    if (!this.focused) return;
    if (!this.inventory || this.inventory === Block.air) return;
    const target = getBlock(grid, this.focused.x, this.focused.y);
    if (!target || target !== Block.air) return;
    setBlock(grid, this.focused.x, this.focused.y, this.inventory);
    if (!this.inventoryIsInfinite) {
      this.inventory = null;
    }
    this.pushHistory(grid);
  }
  cut(grid: Grid) {
    if (!this.focused) return;
    const target = getBlock(grid, this.focused.x, this.focused.y);
    // removable 以外はカットできない
    if (!target || target !== Block.movable) return;
    this.inventory = target;
    setBlock(grid, this.focused.x, this.focused.y, Block.air);
    this.pushHistory(grid);
  }
  pushHistory(grid: Grid) {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push({
      grid: grid.map((row) => row.slice()),
      inventory: this.inventory,
    });
    this.historyIndex = this.history.length - 1;
    console.log(`history: ${this.historyIndex} / ${this.history.length}`);
  }
  undo(grid: Grid) {
    if (this.historyIndex <= 0) return;
    this.historyIndex--;
    grid.splice(
      0,
      grid.length,
      ...this.history[this.historyIndex].grid.map((row) => row.slice()),
    );
    this.inventory = this.history[this.historyIndex].inventory;
    console.log(`history: ${this.historyIndex} / ${this.history.length}`);
  }
  redo(grid: Grid) {
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex++;
    grid.splice(
      0,
      grid.length,
      ...this.history[this.historyIndex].grid.map((row) => row.slice()),
    );
    this.inventory = this.history[this.historyIndex].inventory;
    console.log(`history: ${this.historyIndex} / ${this.history.length}`);
  }
  handleKeyDown(cx: Context, e: KeyboardEvent, onGround: boolean) {
    if (!(e.ctrlKey || e.metaKey)) return;

    if (this.enabled.paste && onGround && e.key === "v") {
      this.paste(cx.grid);
    }
    if (this.enabled.copy && onGround && e.key === "c") {
      this.copy(cx.grid);
    }
    if (this.enabled.cut && onGround && e.key === "x") {
      this.cut(cx.grid);
    }
    if (e.key === "z") {
      this.undo(cx.grid);
      e.preventDefault();
    }
    if (e.key === "y") {
      this.redo(cx.grid);
      e.preventDefault();
    }
  }
}
