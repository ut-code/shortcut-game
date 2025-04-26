import { Block, Facing } from "./constants.ts";
import { getBlock, grid, setBlock } from "./grid.ts";

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
  constructor(options?: AbilityInit) {
    this.enabled = options?.enabled ?? {
      copy: true,
      paste: true,
      cut: true,
    };
    this.pushHistory(); // todo: ここ以外でもフィールドをリセットすることがあるならhistoryを初期化する必要がある
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
  copy() {
    if (!this.focused) return;
    const target = getBlock(this.focused.x, this.focused.y);
    if (!target || target !== Block.movable) return;
    this.inventory = target;
  }
  paste() {
    if (!this.focused) return;
    if (!this.inventory || this.inventory === Block.air) return;
    const target = getBlock(this.focused.x, this.focused.y);
    if (!target || target !== Block.air) return;
    setBlock(this.focused.x, this.focused.y, this.inventory);
    if (!this.inventoryIsInfinite) {
      this.inventory = null;
    }
    this.pushHistory();
  }
  cut() {
    if (!this.focused) return;
    const target = getBlock(this.focused.x, this.focused.y);
    // removable 以外はカットできない
    if (!target || target !== Block.movable) return;
    this.inventory = target;
    setBlock(this.focused.x, this.focused.y, Block.air);
    this.pushHistory();
  }
  pushHistory() {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push({
      grid: grid.map((row) => row.slice()),
      inventory: this.inventory,
    });
    this.historyIndex = this.history.length - 1;
    console.log(`history: ${this.historyIndex} / ${this.history.length}`);
  }
  undo() {
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
  redo() {
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
  handleKeyDown(e: KeyboardEvent, onGround: boolean) {
    if (!(e.ctrlKey || e.metaKey)) return;

    if (this.enabled.paste && onGround && e.key === "v") {
      this.paste();
    }
    if (this.enabled.copy && onGround && e.key === "c") {
      this.copy();
    }
    if (this.enabled.cut && onGround && e.key === "x") {
      this.cut();
    }
    if (e.key === "z") {
      this.undo();
      e.preventDefault();
    }
    if (e.key === "y") {
      this.redo();
      e.preventDefault();
    }
  }
}
