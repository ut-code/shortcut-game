import { get } from "svelte/store";
import { Block, Facing } from "./constants.ts";
import { printCells } from "./grid.ts";
import { createSnapshot } from "./history.ts";
import * as History from "./history.ts";
import type {
  AbilityInit,
  Context,
  Coords,
  MovableObject,
} from "./public-types.ts";

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
  History.init(cx);
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
  const target = cx.grid.getBlock(cx, x, y);
  if (!target || target !== Block.movable) return;
  const movableObject = cx.grid.getMovableObject(cx, x, y);
  if (!movableObject) return;

  movableObject.objectId = Math.random().toString();

  History.record(cx);

  cx.state.update((prev) => {
    prev.inventory = movableObject;
    return prev;
  });

  History.record(cx);
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
    const target = cx.grid.getBlock(cx, positionX, positionY);
    if (target !== Block.air && target !== Block.switch) {
      // すでに何かある場合は、ペーストできない
      return;
    }
  }

  History.record(cx);
  placeMovableObject(cx, x, y, inventory);
  if (!get(cx.state).inventoryIsInfinite) {
    cx.state.update((prev) => {
      prev.inventory = null;
      return prev;
    });
  }

  printCells(createSnapshot(cx).game.cells, "paste");
  History.record(cx);
}
export function cut(cx: Context) {
  const { focus } = cx.dynamic;
  if (!focus) return;

  const x = focus.x;
  const y = focus.y;
  const target = cx.grid.getBlock(cx, x, y);
  // removable 以外はカットできない
  if (
    !target ||
    (target !== Block.movable && target !== Block.switchWithObject)
  )
    return;
  const movableObject = cx.grid.getMovableObject(cx, x, y);
  if (!movableObject) return;

  History.record(cx);

  cx.state.update((prev) => {
    prev.inventory = movableObject;
    return prev;
  });
  if (target === Block.movable) {
    cx.grid.update(cx, (prev) =>
      prev.objectId === movableObject.objectId ? { block: Block.air } : prev,
    );
  }
  if (target === Block.switchWithObject) {
    cx.grid.update(cx, (prev) => {
      if (prev.objectId !== movableObject.objectId) return prev;
      if (prev.block === Block.switchWithObject)
        return { block: Block.switch, switchId: prev.switchId };
      return { block: Block.air };
    });
  }

  printCells(createSnapshot(cx).game.cells, "cut");
  History.record(cx);
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
    const target = grid.getBlock(cx, positionX, positionY);
    if (target !== Block.air && target !== Block.switch) {
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
  const obj = grid.getMovableObject(cx, x, y);
  if (!obj) return undefined;

  for (const i of obj.relativePositions) {
    const positionX = x + i.x;
    const positionY = y + i.y;
    grid.setBlock(cx, positionX, positionY, { block: Block.air });
  }
  return obj;
}
