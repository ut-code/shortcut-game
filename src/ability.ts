import { get } from "svelte/store";
import { Block, Facing } from "./constants.ts";
import { createSnapshot } from "./history.ts";
import type { Player } from "./player.ts";
import type {
  AbilityInit,
  AbilityUsage,
  Context,
  Coords,
  GameHistory,
  MovableObject,
} from "./public-types.ts";
import type { StateSnapshot } from "./public-types.ts";

export class AbilityControl {
  inventory: MovableObject | null = null;
  inventoryIsInfinite = false;
  usage: AbilityUsage;
  focused: Coords | undefined;
  constructor(cx: Context, parent: Player, options?: AbilityInit) {
    this.usage = options?.enabled ?? {
      copy: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
      cut: Number.POSITIVE_INFINITY,
    };
    this.inventoryIsInfinite = options?.inventoryIsInfinite ?? false;
    cx.uiContext.update((prev) => ({
      ...prev,
      inventory: this.inventory,
      inventoryIsInfinite: this.inventoryIsInfinite,
      ...this.usage,
      undo: 0,
      redo: 0,
    }));
    document.addEventListener("copy", (e) => {
      e.preventDefault();
      if (this.usage.copy > 0) this.copy(cx);
    });
    document.addEventListener("cut", (e) => {
      e.preventDefault();
      if (this.usage.cut > 0) this.cut(cx);
    });
    document.addEventListener("paste", (e) => {
      e.preventDefault();
      if (this.usage.paste > 0) this.paste(cx, parent.facing);
    });
  }
  setInventory(cx: Context, inventory: MovableObject | null) {
    this.inventory = structuredClone(inventory);
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
    const state = get(cx.state);
    if (!this.focused) return;
    const x = this.focused.x;
    const y = this.focused.y;
    const target = cx.grid.getBlock(x, y);
    if (!target || target !== Block.movable) return;
    const movableObject = cx.grid.getMovableObject(x, y);
    if (!movableObject) return;

    this.pushHistory(cx, createSnapshot(cx));

    // コピー元とは別のオブジェクトとして管理する
    movableObject.objectId = self.crypto.randomUUID();

    this.setInventory(cx, movableObject);
    cx.uiContext.update((prev) => ({
      ...prev,
      copy: --this.usage.copy,
    }));

    this.pushHistory(cx, createSnapshot(cx));
  }
  paste(cx: Context, facing: Facing) {
    const state = get(cx.state);
    if (!this.focused) return;
    if (!this.inventory /*|| this.inventory === Block.air*/) return;

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

    this.pushHistory(cx, createSnapshot(cx));
    placeMovableObject(cx, x, y, this.inventory);
    if (!this.inventoryIsInfinite) {
      this.setInventory(cx, null);
    }

    cx.uiContext.update((prev) => ({
      ...prev,
      paste: --this.usage.paste,
    }));

    this.pushHistory(cx, createSnapshot(cx));
  }
  cut(cx: Context) {
    const state = get(cx.state);
    if (!this.focused) return;

    const x = this.focused.x;
    const y = this.focused.y;
    const target = cx.grid.getBlock(x, y);
    // removable 以外はカットできない
    if (!target || target !== Block.movable) return;
    const prevInventory = this.inventory;
    const movableObject = cx.grid.getMovableObject(x, y);
    if (!movableObject) return;

    this.pushHistory(cx, createSnapshot(cx)); // TODO: snapshot current state

    this.setInventory(cx, movableObject);

    cx.grid.update(cx, (prev) =>
      prev.objectId === movableObject.objectId ? { block: Block.air } : prev,
    );
    const prevEnabled = { ...this.usage };
    cx.uiContext.update((prev) => ({
      ...prev,
      cut: --this.usage.cut,
    }));

    this.pushHistory(cx, createSnapshot(cx));
  }

  // History については、 `docs/history-stack.png` を参照のこと
  pushHistory(cx: Context, h: StateSnapshot) {
    cx.history.update((prev) => {
      prev.tree = prev.tree.slice(0, prev.index + 1);
      prev.tree.push(h);
      prev.index++;
      return prev;
    });
  }
  undo(cx: Context) {
    cx.history.update((prev) => {
      const history = prev;
      const grid = cx.grid;
      if (history.index <= 0) return history;
      history.index--;
      const snapshot = history.tree[history.index];

      // オブジェクトを配置
      this.setInventory(cx, snapshot.game.inventory);
      grid.diffAndUpdateTo(snapshot.game.cells);

      this.usage = snapshot.game.usage;
      cx.uiContext.update((prev) => ({
        ...prev,
        ...this.usage,
        undo: history.index,
        redo: history.tree.length - history.index,
      }));

      console.log(`history: ${history.index} / ${history.tree.length}`);
      return prev;
    });
  }
  redo(cx: Context, history: GameHistory) {
    if (history.index >= history.tree.length) return;
    const snapshot = history.tree[history.index];
    history.index++; // redo は、巻き戻し前の index
    const grid = cx.grid;

    // オブジェクトを配置
    grid.diffAndUpdateTo(snapshot.game.cells);

    this.setInventory(cx, snapshot.game.inventory);

    this.usage = snapshot.game.usage;
    cx.uiContext.update((prev) => ({
      ...prev,
      ...this.usage,
      undo: history.index,
      redo: history.tree.length - history.index,
    }));

    console.log(`history: ${history.index} / ${history.tree.length}`);
  }
  handleKeyDown(
    cx: Context,
    e: KeyboardEvent,
    onGround: boolean,
    facing: Facing,
    history: GameHistory,
    playerAt: Coords,
  ) {
    if (!(e.ctrlKey || e.metaKey)) return undefined;

    if (this.usage.paste > 0 && onGround && e.key === "v") {
      this.paste(cx, facing);
    }
    if (this.usage.copy > 0 && onGround && e.key === "c") {
      this.copy(cx);
    }
    if (this.usage.cut > 0 && onGround && e.key === "x") {
      this.cut(cx);
    }
    if (e.key === "z") {
      console.log(history);
      this.undo(cx);
      e.preventDefault();
      return {
        x: history.tree[history.index].playerX,
        y: history.tree[history.index].playerY,
      };
    }
    if (e.key === "y") {
      this.redo(cx, history);
      e.preventDefault();
      if (history.index >= history.tree.length) return;
      return {
        x: history.tree[history.index].playerX,
        y: history.tree[history.index].playerY,
      };
    }
  }
}

function placeMovableObject(
  cx: Context,
  x: number,
  y: number,
  movableObject: MovableObject,
) {
  const grid = cx.grid;

  for (const i of movableObject.relativePositions) {
    const positionX = x + i.x;
    const positionY = y + i.y;
    const target = grid.getBlock(positionX, positionY);
    if (target !== Block.air) {
      // すでに何かある場合は、ペーストできない
      return;
    }
  }
  for (const i of movableObject.relativePositions) {
    const positionX = x + i.x;
    const positionY = y + i.y;
    grid.setBlock(cx, x, y, {
      block: movableObject.block,
      objectId: movableObject.objectId,
    });
  }
}
function removeMovableObject(
  cx: Context,
  x: number,
  y: number,
): MovableObject | undefined {
  const grid = cx.grid;
  const obj = grid.getMovableObject(x, y);
  if (!obj) return undefined;

  for (const i of obj.relativePositions) {
    const positionX = x + i.x;
    const positionY = y + i.y;
    grid.setBlock(cx, x, y, { block: Block.air });
  }
  return obj;
}
