import { get } from "svelte/store";
import { Block, Facing, playerHeight, playerWidth } from "./constants.ts";
import { printCells } from "./grid.ts";
import { createSnapshot } from "./history.ts";
import * as History from "./history.ts";
import { assert } from "./lib.ts";
import { type Player, getCoords } from "./player.ts";
import type { AbilityInit, Context, Coords, MovableObject } from "./public-types.ts";

export function init(cx: Context): () => void {
  console.log("ability init");
  assert(cx.dynamic.player !== null, "player is not initialized");
  function onCopy(e: ClipboardEvent) {
    assert(cx.dynamic.player !== null, "player is not initialized");
    const { onGround } = cx.dynamic.player;
    e.preventDefault();
    if (get(cx.state).usage.copy > 0 && onGround) copy(cx);
  }
  function onCut(e: ClipboardEvent) {
    assert(cx.dynamic.player !== null, "player is not initialized");
    const { onGround } = cx.dynamic.player;
    e.preventDefault();
    if (get(cx.state).usage.cut > 0 && onGround) cut(cx);
  }
  function onPaste(e: ClipboardEvent) {
    assert(cx.dynamic.player !== null, "player is not initialized");
    const { onGround } = cx.dynamic.player;
    e.preventDefault();
    if (get(cx.state).usage.paste > 0 && onGround) paste(cx);
  }
  document.addEventListener("copy", onCopy);
  document.addEventListener("cut", onCut);
  document.addEventListener("paste", onPaste);
  return () => {
    document.removeEventListener("copy", onCopy);
    document.removeEventListener("cut", onCut);
    document.removeEventListener("paste", onPaste);
  };
}

/** @returns focus座標
 * @returns null if player is not on ground
 */
export function focusCoord(cx: Context, player: Player) {
  const { blockSize, marginY } = get(cx.config);
  const middleX = Math.floor(player.x / blockSize);

  // 自分が空中にいる状態でブロックを置けないように
  const middleBlock = cx.grid.getBlock(cx, middleX, getCoords(cx).y + 1);
  const playerIsTryingToPlaceInAir = middleBlock === null;
  if (playerIsTryingToPlaceInAir) {
    return null;
  }

  let dx = 0;
  switch (player.facing) {
    case Facing.left:
      dx = -1;
      break;
    case Facing.right:
      dx = 1;
      break;
    default:
      player.facing satisfies never;
  }
  return {
    x: middleX + dx,
    y: getCoords(cx).y,
  };
}
export function copy(cx: Context) {
  const state = get(cx.state);
  if (state.gameover || state.paused || state.goaled) return;
  if (state.usage.copy <= 0) return;
  const { focus } = cx.dynamic;
  if (!focus) return;
  if (!cx.dynamic.player) return;
  const x = focus.x;
  const y = focus.y;
  const target = cx.grid.getBlock(cx, x, y);
  if (!target || (target !== Block.movable && target !== Block.fallable)) return;
  const movableObject = cx.grid.getMovableObject(cx, x, y);
  if (!movableObject) return;

  movableObject.objectId = Math.random().toString();

  History.record(cx);

  cx.state.update((prev) => {
    prev.inventory = movableObject;
    return prev;
  });

  History.record(cx);

  cx.dynamic.player.activated = true;
}
export function paste(cx: Context) {
  const state = get(cx.state);
  if (state.gameover || state.paused || state.goaled) return;
  const { focus, player } = cx.dynamic;
  const { inventory } = state;
  if (!focus) return;
  if (!inventory) return;
  if (!cx.dynamic.player) return;
  if (state.usage.paste <= 0) return;
  assert(player !== null, "player is not initialized");

  const { x, y } = findSafeObjectPlace(player.facing, focus.x, focus.y, inventory);
  if (!canPlaceMovableObject(cx, x, y, inventory)) {
    return;
  }
  History.record(cx);
  placeMovableObject(cx, x, y, inventory);
  if (!state.inventoryIsInfinite) {
    cx.state.update((prev) => {
      prev.inventory = null;
      return prev;
    });
  }

  printCells(createSnapshot(cx).game.cells, "paste");
  History.record(cx);

  cx.dynamic.player.activated = true;
}
export function cut(cx: Context) {
  const { focus } = cx.dynamic;
  const state = get(cx.state);
  if (state.gameover || state.paused || state.goaled) return;
  if (!focus) return;
  if (!cx.dynamic.player) return;

  const x = focus.x;
  const y = focus.y;
  const target = cx.grid.getBlock(cx, x, y);
  // removable 以外はカットできない
  if (!target || (target !== Block.movable && target !== Block.fallable)) return;
  const movableObject = cx.grid.getMovableObject(cx, x, y);
  if (!movableObject) return;

  History.record(cx);

  cx.state.update((prev) => {
    prev.inventory = movableObject;
    return prev;
  });
  cx.grid.update(cx, (prev) => {
    if (prev.objectId !== movableObject.objectId) return prev;
    if ((prev.block === Block.movable || prev.block === Block.fallable) && prev.switchId !== undefined)
      return { block: Block.switch, switchId: prev.switchId };
    return { block: null };
  });

  printCells(createSnapshot(cx).game.cells, "cut");
  History.record(cx);

  cx.dynamic.player.activated = true;
}

export function findSafeObjectPlace(facing: Facing, x: number, y: number, obj: MovableObject) {
  // 左向きのときにブロックを配置する位置を変更するのに使用
  const width =
    obj.relativePositions.reduce((acc, i) => Math.max(acc, i.x), 0) -
    obj.relativePositions.reduce((acc, i) => Math.min(acc, i.x), 1000) +
    1;

  return {
    x: x - (facing === Facing.left ? width - 1 : 0),
    y: y,
  };
}
export function canPlaceMovableObject(cx: Context, x: number, y: number, object: MovableObject) {
  const grid = cx.grid;
  for (const i of object.relativePositions) {
    const positionX = x + i.x;
    const positionY = y + i.y;
    const target = grid.getBlock(cx, positionX, positionY);
    if (target && target !== Block.switch) {
      // すでに何かある場合は、ペーストできない
      return false;
    }
  }
  return true;
}
export function placeMovableObject(cx: Context, x: number, y: number, object: MovableObject) {
  const grid = cx.grid;

  if (!canPlaceMovableObject(cx, x, y, object)) {
    console.error("[placeMovableObject] cannot place object");
    return;
  }
  const newObjectId = Math.random().toString();
  for (const rel of object.relativePositions) {
    const positionX = x + rel.x;
    const positionY = y + rel.y;
    grid.setBlock(cx, positionX, positionY, {
      block: object.block,
      objectId: newObjectId,
      switchId: undefined,
    });
  }
}
