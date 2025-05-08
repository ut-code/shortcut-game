import { Block, Facing } from "./constants.ts";
import type {
  AbilityInit,
  AbilityUsage,
  Context,
  Coords,
  MovableObject,
} from "./public-types.ts";
import type { StateSnapshot } from "./public-types.ts";

export class AbilityControl {
  inventory: MovableObject | null = null;
  inventoryIsInfinite = false;
  usage: AbilityUsage;
  focused: Coords | undefined;
  constructor(cx: Context, options?: AbilityInit) {
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
    this.inventory = JSON.parse(JSON.stringify(inventory));
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
  copy(
    cx: Context,
    newHistory: StateSnapshot,
    history: { list: StateSnapshot[]; index: number },
  ) {
    if (!this.focused) return;
    const x = this.focused.x;
    const y = this.focused.y;
    const target = cx.grid.getBlock(x, y);
    if (!target || target !== Block.movable) return;
    const movableObject = cx.grid.getMovableObject(x, y);
    if (!movableObject) return;

    this.pushHistory(cx, newHistory, history);

    // コピー元とは別のオブジェクトとして管理する
    movableObject.objectId = self.crypto.randomUUID();

    this.setInventory(cx, movableObject);
    cx.uiContext.update((prev) => ({
      ...prev,
      copy: --this.usage.copy,
    }));

    this.pushHistory(
      cx,
      {
        ...newHistory,
        inventory: this.inventory,
        abilities: this.usage,
      },
      history,
    );
  }
  paste(
    cx: Context,
    facing: Facing,
    newHistory: StateSnapshot,
    history: { list: StateSnapshot[]; index: number },
  ) {
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

    this.pushHistory(cx, newHistory, history);

    cx.grid.setMovableObject(cx, x, y, this.inventory);

    if (!this.inventoryIsInfinite) {
      this.setInventory(cx, null);
    }

    // const prevEnabled = { ...this.enabledAbilities };
    cx.uiContext.update((prev) => ({
      ...prev,
      paste: --this.usage.paste,
    }));

    this.pushHistory(
      cx,
      {
        ...newHistory,
        inventory: this.inventory,
        movableBlocks: cx.grid.movableBlocks,
        abilities: this.usage,
      },
      history,
    );
  }
  cut(
    cx: Context,
    newHistory: StateSnapshot,
    history: { list: StateSnapshot[]; index: number },
  ) {
    if (!this.focused) return;

    const x = this.focused.x;
    const y = this.focused.y;
    const target = cx.grid.getBlock(x, y);
    // removable 以外はカットできない
    if (!target || target !== Block.movable) return;
    const prevInventory = this.inventory;
    const movableObject = cx.grid.getMovableObject(x, y);
    if (!movableObject) return;

    this.pushHistory(cx, newHistory, history);

    this.setInventory(cx, movableObject);

    // cx.movableBlocks を更新
    cx.grid.movableBlocks = cx.grid.movableBlocks.filter(
      (block) => block.objectId !== movableObject.objectId,
    );
    for (const i of movableObject.relativePositions) {
      const positionX = movableObject.x + i.x;
      const positionY = movableObject.y + i.y;
      cx.grid.setBlock(positionX, positionY, Block.air);
    }
    const prevEnabled = { ...this.usage };
    cx.uiContext.update((prev) => ({
      ...prev,
      cut: --this.usage.cut,
    }));

    this.pushHistory(
      cx,
      {
        ...newHistory,
        inventory: this.inventory,
        movableBlocks: cx.grid.movableBlocks,
        abilities: this.usage,
      },
      history,
    );
  }

  // History については、 `docs/history-stack.png` を参照のこと
  pushHistory(
    cx: Context,
    h: StateSnapshot,
    history: {
      list: StateSnapshot[];
      index: number;
    },
  ) {
    // history.listの先頭（初期状態）は残す
    history.list = history.list.slice(0, Math.max(history.index, 1));
    // Infinityはnullにならないように置換してDeepCopy
    const newHistory = JSON.parse(
      JSON.stringify(h, (k, v) =>
        v === Number.POSITIVE_INFINITY ? "Infinity" : v,
      ),
      (k, v) => (v === "Infinity" ? Number.POSITIVE_INFINITY : v),
    );

    console.log(history);
    console.log(newHistory);

    // オブジェクトの状態について直前と一致するなら記録しない
    if (
      (history.index < history.list.length &&
        JSON.stringify(history.list[history.index]) ===
          JSON.stringify(newHistory)) ||
      JSON.stringify(history.list[history.list.length - 1]) ===
        JSON.stringify(newHistory)
    ) {
      return;
    }

    history.list.push(newHistory);

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
      list: StateSnapshot[];
      index: number;
    },
  ) {
    if (history.index <= 0) return;
    history.index--; // undo は、巻き戻し後の index で計算する
    const op = history.list[history.index];

    // すべてのオブジェクトを削除
    cx.grid.clearAllMovableBlocks();

    // オブジェクトを配置
    this.setInventory(cx, op.inventory);
    cx.grid.setAllMovableBlocks(cx, op.movableBlocks);

    this.usage = op.abilities;
    cx.uiContext.update((prev) => ({
      ...prev,
      ...this.usage,
      undo: history.index,
      redo: history.list.length - history.index,
    }));

    console.log(`history: ${history.index} / ${history.list.length}`);
  }
  redo(
    cx: Context,
    history: {
      list: StateSnapshot[];
      index: number;
    },
  ) {
    if (history.index >= history.list.length) return;
    const op = history.list[history.index];
    history.index++; // redo は、巻き戻し前の index

    // すべてのオブジェクトを削除
    cx.grid.clearAllMovableBlocks();

    // オブジェクトを配置
    this.setInventory(cx, op.inventory);
    cx.grid.setAllMovableBlocks(cx, op.movableBlocks);

    this.usage = op.abilities;
    cx.uiContext.update((prev) => ({
      ...prev,
      ...this.usage,
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
      list: StateSnapshot[];
      index: number;
    },
    playerAt: Coords,
  ) {
    if (!(e.ctrlKey || e.metaKey)) return undefined;

    if (this.usage.paste > 0 && onGround && e.key === "v") {
      const newHistory = {
        playerX: playerAt.x,
        playerY: playerAt.y,
        inventory: this.inventory ? this.inventory : null,
        playerFacing: facing,
        movableBlocks: cx.grid.movableBlocks,
        enabledAbilities: this.usage,
      };
      this.paste(cx, facing, newHistory, history);
    }
    if (this.usage.copy > 0 && onGround && e.key === "c") {
      const newHistory = {
        playerX: playerAt.x,
        playerY: playerAt.y,
        inventory: this.inventory ? this.inventory : null,
        playerFacing: facing,
        movableBlocks: cx.grid.movableBlocks,
        enabledAbilities: this.usage,
      };
      this.copy(cx, newHistory, history);
    }
    if (this.usage.cut > 0 && onGround && e.key === "x") {
      const newHistory = {
        playerX: playerAt.x,
        playerY: playerAt.y,
        inventory: this.inventory ? this.inventory : null,
        playerFacing: facing,
        movableBlocks: cx.grid.movableBlocks,
        enabledAbilities: this.usage,
      };
      this.cut(cx, newHistory, history);
    }
    if (e.key === "z") {
      console.log(history);
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
