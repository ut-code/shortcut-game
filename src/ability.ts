import { Block, Facing, type MovableBlock } from "./constants.ts";
import type { Context } from "./context.ts";
import type { MovableBlocks, MovableObject } from "./grid.ts";

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
  enabled: {
    before: AbilityEnableOptions;
    after: AbilityEnableOptions;
  };
};

export class AbilityControl {
  inventory: MovableObject | null = null;
  inventoryIsInfinite = false;
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
    // document.addEventListener("copy", (e) => {
    //   e.preventDefault();
    //   if (this.enabled.copy > 0) this.copy(cx);
    // });
    // document.addEventListener("cut", (e) => {
    //   e.preventDefault();
    //   if (this.enabled.cut > 0) this.cut(cx);
    // });
    // document.addEventListener("paste", (e) => {
    //   e.preventDefault();
    //   if (this.enabled.paste > 0) this.paste(cx, facing);
    // });
  }
  setInventory(cx: Context, inventory: MovableObject | null) {
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
    const x = this.focused.x;
    const y = this.focused.y;
    const target = cx.grid.getBlock(x, y);
    if (!target || target !== Block.movable) return;
    const movableObject = cx.grid.getMovableObject(x, y);
    if (!movableObject) return;
    // this.inventory = movableObject;
    this.setInventory(cx, movableObject);
    cx.uiContext.update((prev) => ({
      ...prev,
      copy: --this.enabled.copy,
    }));
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
      this.setInventory(cx, null);
    }
    const prevEnabled = { ...this.enabled };
    cx.uiContext.update((prev) => ({
      ...prev,
      paste: --this.enabled.paste,
    }));
    // this.pushHistory(cx, {
    //   at: { ...this.focused },
    //   from: Block.air,
    //   to: prevInventory,
    //   inventory: {
    //     before: prevInventory,
    //     after: this.inventory,
    //   },
    //   enabled: {
    //     before: prevEnabled,
    //     after: this.enabled,
    //   },
    // });
  }
  cut(cx: Context) {
    if (!this.focused) return;

    const x = this.focused.x;
    const y = this.focused.y;
    const target = cx.grid.getBlock(x, y);
    // removable 以外はカットできない
    if (!target || target !== Block.movable) return;
    const prevInventory = this.inventory;
    const movableObject = cx.grid.getMovableObject(x, y);
    if (!movableObject) return;
    // this.inventory = movableObject;
    this.setInventory(cx, movableObject);
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
    const prevEnabled = { ...this.enabled };
    cx.uiContext.update((prev) => ({
      ...prev,
      cut: --this.enabled.cut,
    }));

    // this.pushHistory({
    //   at: { ...this.focused },
    //   from: target,
    //   to: Block.air,
    //   inventory: {
    //     before: prevInventory,
    //     after: target,
    //   },
    // });
  }

  // History については、 `docs/history-stack.png` を参照のこと
  pushHistory(
    cx: Context,
    h: History,
    history: {
      list: History[];
      index: number;
    },
  ) {
    // history.listの先頭（初期状態）は残す
    history.list = history.list.slice(0, Math.max(history.index, 1));
    history.list.push(JSON.parse(JSON.stringify(h)));
    history.index = history.list.length;
    console.log(`history: ${history.index} / ${history.list.length}`);
    cx.uiContext.update((prev) => ({
      ...prev,
      undo: history.index,
      redo: 0,
    }));
  }
  undo(
    cx: Context,
    history: {
      list: History[];
      index: number;
    },
  ) {
    if (history.index <= 0) return;
    history.index--; // undo は、巻き戻し後の index で計算する
    const op = history.list[history.index];

    // すべてのオブジェクトを削除
    cx.grid.clearAllMovableBlocks();

    // オブジェクトを配置
    // this.inventory = op.inventory
    //   ? JSON.parse(JSON.stringify(op.inventory))
    //   : null;
    this.setInventory(cx, op.inventory);
    cx.grid.movableBlocks = JSON.parse(JSON.stringify(op.movableBlocks));
    cx.grid.setAllMovableBlocks(cx);

    this.enabled = op.enabled.before;
    cx.uiContext.update((prev) => ({
      ...prev,
      ...this.enabled,
      undo: history.index,
      redo: history.list.length - history.index,
    }));

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
    // this.inventory = op.inventory
    //   ? JSON.parse(JSON.stringify(op.inventory))
    //   : null;
    this.setInventory(cx, op.inventory);

    cx.grid.movableBlocks = JSON.parse(JSON.stringify(op.movableBlocks));
    cx.grid.setAllMovableBlocks(cx);

    this.enabled = op.enabled.after;
    cx.uiContext.update((prev) => ({
      ...prev,
      ...this.enabled,
      undo: history.index,
      redo: history.list.length - history.index,
    }));

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
    if (!(e.ctrlKey || e.metaKey)) return undefined;

    if (this.enabled.paste && onGround && e.key === "v") {
      this.pushHistory(
        cx,
        {
          playerX: playerAt.x,
          playerY: playerAt.y,
          inventory: this.inventory ? this.inventory : null,
          playerFacing: facing,
          movableBlocks: cx.grid.movableBlocks,
          enabled: {
            before: this.enabled,
            after: { ...this.enabled, paste: this.enabled.paste - 1 },
          },
        },
        history,
      );
      this.paste(cx, facing);
      this.pushHistory(
        cx,
        {
          playerX: playerAt.x,
          playerY: playerAt.y,
          inventory: this.inventory ? this.inventory : null,
          playerFacing: facing,
          movableBlocks: cx.grid.movableBlocks,
          enabled: {
            before: this.enabled,
            after: { ...this.enabled, paste: this.enabled.paste - 1 },
          },
        },
        history,
      );
    }
    if (this.enabled.copy && onGround && e.key === "c") {
      this.pushHistory(
        cx,
        {
          playerX: playerAt.x,
          playerY: playerAt.y,
          inventory: this.inventory ? this.inventory : null,
          playerFacing: facing,
          movableBlocks: cx.grid.movableBlocks,
          enabled: {
            before: this.enabled,
            after: { ...this.enabled, copy: this.enabled.copy - 1 },
          },
        },
        history,
      );
      this.copy(cx);
      this.pushHistory(
        cx,
        {
          playerX: playerAt.x,
          playerY: playerAt.y,
          inventory: this.inventory ? this.inventory : null,
          playerFacing: facing,
          movableBlocks: cx.grid.movableBlocks,
          enabled: {
            before: this.enabled,
            after: { ...this.enabled, copy: this.enabled.copy - 1 },
          },
        },
        history,
      );
    }
    if (this.enabled.cut && onGround && e.key === "x") {
      this.pushHistory(
        cx,
        {
          playerX: playerAt.x,
          playerY: playerAt.y,
          inventory: this.inventory ? this.inventory : null,
          playerFacing: facing,
          movableBlocks: cx.grid.movableBlocks,
          enabled: {
            before: this.enabled,
            after: { ...this.enabled, cut: this.enabled.cut - 1 },
          },
        },
        history,
      );
      this.cut(cx);
      this.pushHistory(
        cx,
        {
          playerX: playerAt.x,
          playerY: playerAt.y,
          inventory: this.inventory ? this.inventory : null,
          playerFacing: facing,
          movableBlocks: cx.grid.movableBlocks,
          enabled: {
            before: this.enabled,
            after: { ...this.enabled, cut: this.enabled.cut - 1 },
          },
        },
        history,
      );
    }
    if (e.key === "z") {
      this.undo(cx, history);
      e.preventDefault();
      return {
        x: history.list[history.index].playerX,
        y: history.list[history.index].playerY,
      };
    }
    if (e.key === "y") {
      this.redo(cx, history);
      e.preventDefault();
      if (history.index >= history.list.length) return;
      return {
        x: history.list[history.index].playerX,
        y: history.list[history.index].playerY,
      };
    }
  }
}
