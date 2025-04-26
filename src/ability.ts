import { Block, Facing } from "./constants.ts";
import { getBlock, setBlock } from "./grid.ts";

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
export class AbilityControl {
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
      this.inventory = Block.air;
    }
  }
  cut() {
    if (!this.focused) return;
    const target = getBlock(this.focused.x, this.focused.y);
    // removable 以外はカットできない
    if (!target || target !== Block.movable) return;
    this.inventory = target;
    setBlock(this.focused.x, this.focused.y, Block.air);
  }
  handleKeyDown(e: KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey)) return;

    if (this.enabled.paste && e.key === "v") {
      this.paste();
    }
    if (this.enabled.copy && e.key === "c") {
      this.copy();
    }
    if (this.enabled.cut && e.key === "x") {
      this.cut();
    }
  }
}
