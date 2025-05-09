import { get } from "svelte/store";
import { Block, Facing } from "./constants.ts";
import { printCells } from "./grid.ts";
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
    const ss = createSnapshot(cx);
    const cfg = get(cx.config);
    ss.playerX = cfg.initialPlayerX;
    ss.playerY = cfg.initialPlayerY;
    console.log(ss);
    this.pushHistory(cx, ss);
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
    if (!this.inventory) return;

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

    printCells(createSnapshot(cx).game.cells, "paste");
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
    const movableObject = cx.grid.getMovableObject(x, y);
    if (!movableObject) return;

    this.pushHistory(cx, createSnapshot(cx));
    this.setInventory(cx, movableObject);

    cx.grid.update(cx, (prev) =>
      prev.objectId === movableObject.objectId ? { block: Block.air } : prev,
    );
    cx.uiContext.update((prev) => ({
      ...prev,
      cut: --this.usage.cut,
    }));

    printCells(createSnapshot(cx).game.cells, "cut");
    this.pushHistory(cx, createSnapshot(cx));
  }

  // History については、 `docs/history-stack.png` を参照のこと
  pushHistory(cx: Context, h: StateSnapshot) {
    printCells(h.game.cells, "pushHistory");
    cx.history.update((prev) => {
      if (prev.tree.length > prev.index + 1) {
        // redo した後に undo した場合、履歴を切り詰める
        prev.tree.length = prev.index + 1;
      }
      prev.tree.push(h);
      prev.index = prev.tree.length - 1;
      return prev;
    });
  }
  undo(cx: Context): { x: number; y: number } | undefined {
    const history = get(cx.history);
    if (history.index <= 0) return undefined;
    const grid = cx.grid;
    history.index--;
    const snapshot = history.tree[history.index];
    printCells(snapshot.game.cells);

    // オブジェクトを配置
    this.setInventory(cx, snapshot.game.inventory);
    grid.diffAndUpdateTo(cx, snapshot.game.cells);
    printCells(snapshot.game.cells, "undo");
    this.usage = snapshot.game.usage;
    cx.uiContext.update((ui) => ({
      ...ui,
      ...this.usage,
      undo: history.index,
      redo: history.tree.length - history.index,
    }));

    cx.history.set(history);

    console.log(`history: ${history.index} / ${history.tree.length - 1}`);
    return {
      x: history.tree[history.index].playerX,
      y: history.tree[history.index].playerY,
    };
  }
  redo(cx: Context): { x: number; y: number } | undefined {
    // TODO: プレイヤーの座標の履歴を「いい感じ」にするため、 history を二重管理する
    const history = get(cx.history);
    if (history.index >= history.tree.length - 1) return undefined;
    const snapshot = history.tree[history.index];
    printCells(snapshot.game.cells, "redo");
    history.index++; // redo は、巻き戻し前の index
    const grid = cx.grid;

    // 状態を巻き戻す
    grid.diffAndUpdateTo(cx, snapshot.game.cells);
    this.setInventory(cx, snapshot.game.inventory);

    this.usage = snapshot.game.usage;
    cx.uiContext.update((ui) => ({
      ...ui,
      ...this.usage,
      undo: history.index,
      redo: history.tree.length - history.index,
    }));

    console.log(`history: ${history.index} / ${history.tree.length - 1}`);
    cx.history.set(history);
    return {
      x: history.tree[history.index].playerX,
      y: history.tree[history.index].playerY,
    };
  }
  handleKeyDown(
    cx: Context,
    e: KeyboardEvent,
    onGround: boolean,
    facing: Facing,
    playerAt: Coords,
  ): { x: number; y: number } | undefined {
    if (!(e.ctrlKey || e.metaKey)) return undefined;

    e.preventDefault();
    if (this.usage.paste > 0 && onGround && e.key === "v") {
      this.paste(cx, facing);
    }
    if (this.usage.copy > 0 && onGround && e.key === "c") {
      this.copy(cx);
    }
    if (this.usage.cut > 0 && onGround && e.key === "x") {
      this.cut(cx);
      return undefined;
    }
    if (e.key === "z") {
      return this.undo(cx);
    }
    if (e.key === "y") {
      e.preventDefault();
      return this.redo(cx);
    }
  }
}

function placeMovableObject(
  cx: Context,
  x: number,
  y: number,
  object: MovableObject,
) {
  const grid = cx.grid;

  for (const i of object.relativePositions) {
    const positionX = x + i.x;
    const positionY = y + i.y;
    const target = grid.getBlock(positionX, positionY);
    if (target !== Block.air) {
      // すでに何かある場合は、ペーストできない
      return;
    }
  }
  for (const rel of object.relativePositions) {
    const positionX = x + rel.x;
    const positionY = y + rel.y;
    grid.setBlock(cx, positionX, positionY, {
      block: object.block,
      objectId: object.objectId,
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
