import { get } from "svelte/store";
import { Block, Facing } from "./constants.ts";
import { printCells } from "./grid.ts";
import { createSnapshot } from "./history.ts";
import type {
  AbilityInit,
  Context,
  Coords,
  MovableObject,
} from "./public-types.ts";
import type { StateSnapshot } from "./public-types.ts";

export function init(cx: Context, options?: AbilityInit) {
  cx.state.update((prev) => ({
    ...prev,
    usage: options?.enabled ?? {
      copy: Number.POSITIVE_INFINITY,
      paste: Number.POSITIVE_INFINITY,
      cut: Number.POSITIVE_INFINITY,
    },
    inventoryIsInfinite: options?.inventoryIsInfinite ?? false,
  }));

  console.log("ability init");
  document.addEventListener("copy", (e) => {
    const { onGround } = cx.dynamic.player;
    e.preventDefault();
    if (get(cx.state).usage.copy > 0 && onGround) copy(cx);
  });
  document.addEventListener("cut", (e) => {
    const { onGround } = cx.dynamic.player;
    e.preventDefault();
    if (get(cx.state).usage.cut > 0 && onGround) cut(cx);
  });
  document.addEventListener("paste", (e) => {
    const { onGround } = cx.dynamic.player;
    e.preventDefault();
    if (get(cx.state).usage.paste > 0 && onGround) paste(cx);
  });
  // TODO: use proper event names, because it won't work
  document.addEventListener("undo", (e) => {
    e.preventDefault();
    undo(cx);
  });
  document.addEventListener("redo", (e) => {
    e.preventDefault();
    redo(cx);
  });
  const ss = createSnapshot(cx);
  const cfg = get(cx.config);
  ss.playerX = cfg.initialPlayerX;
  ss.playerY = cfg.initialPlayerY;
  console.log(ss);
  pushHistory(cx, ss);
}

export function setInventory(cx: Context, inventory: MovableObject | null) {
  cx.state.update((prev) => ({
    ...prev,
    inventory: structuredClone(inventory),
  }));
}
export function focusCoord(playerAt: Coords, facing: Facing) {
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
    ...playerAt,
    x: playerAt.x + dx,
  };
}
export function copy(cx: Context) {
  const state = get(cx.state);
  if (state.usage.copy <= 0) return;
  const { focus } = cx.dynamic;
  if (!focus) return;
  const x = focus.x;
  const y = focus.y;
  const target = cx.grid.getBlock(x, y);
  if (!target || target !== Block.movable) return;
  const movableObject = cx.grid.getMovableObject(x, y);
  if (!movableObject) return;

  pushHistory(cx, createSnapshot(cx));

  // コピー元とは別のオブジェクトとして管理する (これ必要？)
  movableObject.objectId = self.crypto.randomUUID();

  setInventory(cx, movableObject);

  pushHistory(cx, createSnapshot(cx));
}
export function paste(cx: Context) {
  const state = get(cx.state);
  const { focus } = cx.dynamic;
  const { inventory } = state;
  if (!focus) return;
  if (!inventory) return;
  if (state.usage.paste <= 0) return;

  // 左向きのときにブロックを配置する位置を変更するのに使用
  const width =
    inventory.relativePositions.reduce((acc, i) => Math.max(acc, i.x), 0) -
    inventory.relativePositions.reduce((acc, i) => Math.min(acc, i.x), 1000) +
    1;

  const facing = cx.dynamic.player.facing;
  const x = focus.x - (facing === Facing.left ? width - 1 : 0);
  const y = focus.y;

  for (const i of inventory.relativePositions) {
    const positionX = x + i.x;
    const positionY = y + i.y;
    const target = cx.grid.getBlock(positionX, positionY);
    if (target !== Block.air) {
      // すでに何かある場合は、ペーストできない
      return;
    }
  }

  pushHistory(cx, createSnapshot(cx));
  placeMovableObject(cx, x, y, inventory);
  if (!get(cx.state).inventoryIsInfinite) {
    setInventory(cx, null);
  }

  printCells(createSnapshot(cx).game.cells, "paste");
  pushHistory(cx, createSnapshot(cx));
}
export function cut(cx: Context) {
  const { focus } = cx.dynamic;
  if (!focus) return;

  const x = focus.x;
  const y = focus.y;
  const target = cx.grid.getBlock(x, y);
  // removable 以外はカットできない
  if (!target || target !== Block.movable) return;
  const movableObject = cx.grid.getMovableObject(x, y);
  if (!movableObject) return;

  pushHistory(cx, createSnapshot(cx));
  setInventory(cx, movableObject);

  cx.grid.update(cx, (prev) =>
    prev.objectId === movableObject.objectId ? { block: Block.air } : prev,
  );

  printCells(createSnapshot(cx).game.cells, "cut");
  pushHistory(cx, createSnapshot(cx));
}

// History については、 `docs/history-stack.png` を参照のこと
export function pushHistory(cx: Context, h: StateSnapshot) {
  printCells(h.game.cells, "pushHistory");
  cx.history.update((prev) => {
    if (prev.tree.length > prev.index + 1) {
      // undo した後に pushHistory をする場合、履歴を切り詰める
      prev.tree.length = prev.index + 1;
    }
    prev.tree.push(h);
    prev.index = prev.tree.length - 1;
    return prev;
  });
}
function undo(cx: Context): { x: number; y: number } | undefined {
  const history = get(cx.history);
  if (history.index <= 0) return undefined;
  const grid = cx.grid;
  history.index--;
  const snapshot = history.tree[history.index];
  printCells(snapshot.game.cells);

  // オブジェクトを配置
  setInventory(cx, snapshot.game.inventory);
  grid.diffAndUpdateTo(cx, snapshot.game.cells);
  printCells(snapshot.game.cells, "undo");
  cx.state.update((prev) => {
    return {
      ...prev,
      usage: snapshot.game.usage,
      inventory: snapshot.game.inventory,
      inventoryIsInfinite: snapshot.game.inventoryIsInfinite,
    };
  });
  cx.dynamic.player.x = snapshot.playerX;
  cx.dynamic.player.y = snapshot.playerY;

  cx.history.set(history);

  console.log(`history: ${history.index} / ${history.tree.length - 1}`);
  return {
    x: history.tree[history.index].playerX,
    y: history.tree[history.index].playerY,
  };
}

function redo(cx: Context): { x: number; y: number } | undefined {
  // TODO: プレイヤーの座標の履歴を「いい感じ」にするため、 history を二重管理する
  const history = get(cx.history);
  if (history.index >= history.tree.length - 1) return undefined;
  const snapshot = history.tree[history.index];
  printCells(snapshot.game.cells, "redo");
  history.index++; // redo は、巻き戻し前の index
  const grid = cx.grid;

  // 状態を巻き戻す
  grid.diffAndUpdateTo(cx, snapshot.game.cells);
  setInventory(cx, snapshot.game.inventory);

  cx.state.update((prev) => ({
    ...prev,
    usage: snapshot.game.usage,
  }));

  console.log(`history: ${history.index} / ${history.tree.length - 1}`);
  cx.history.set(history);
  return {
    x: history.tree[history.index].playerX,
    y: history.tree[history.index].playerY,
  };
}

export function placeMovableObject(
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

export function removeMovableObject(
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
    grid.setBlock(cx, positionX, positionY, { block: Block.air });
  }
  return obj;
}
