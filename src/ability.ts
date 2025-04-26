import { type Block, Facing } from "./constants.ts";

export type Coords = {
  x: number;
  y: number;
};
export type AbilityEnableOptions = {
  copy: boolean;
  paste: boolean;
  cut: boolean;
};
export class AbilityControl {
  controlPressed = false;
  holdingBlock: Block | null = null;
  constructor(
    public enabled: AbilityEnableOptions = {
      copy: true,
      paste: true,
      cut: true,
    },
  ) {}
  highlightCoord(coords: Coords, facing: Facing) {
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
    return {
      ...coords,
      x: coords.x + dx,
    };
  }
  copy() {}
  paste() {}
  handleKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey) {
      this.controlPressed = true;
      return;
    }
    if (!this.controlPressed) return;
    if (this.enabled.paste && e.code === "V") {
      this.paste;
    }
    if (this.enabled.copy && e.code === "C") {
      // copy
    }
    if (this.enabled.cut && e.code === "X") {
      // cut
    }
  }
  handleKeyUp(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey) {
      this.controlPressed = false;
    }
  }
}
