import { get } from "svelte/store";
import { printCells } from "./grid.ts";
import { assert } from "./lib.ts";
import type { Context, StateSnapshot } from "./public-types.ts";

export function init(cx: Context): () => void {
  // there is no such thing as undo / redo event
  function onKeyDown(e: KeyboardEvent) {
    if (!e.ctrlKey && !e.metaKey) return;
    switch (e.key) {
      case "z":
        e.preventDefault();
        undo(cx);
        break;
      case "y":
        e.preventDefault();
        redo(cx);
        break;
    }
  }
  document.addEventListener("keydown", onKeyDown);
  record(cx);
  return () => {
    document.removeEventListener("keydown", onKeyDown);
  };
}

// History については、 Discord の中川さんの画像を参照のこと
export function record(cx: Context) {
  const h = createSnapshot(cx);
  cx.history.update((prev) => {
    if (prev.tree.length > prev.index + 1) {
      // undo した後に record をする場合、履歴を切り詰める
      prev.tree.length = prev.index + 1;
    }
    prev.tree.push(h);
    prev.index = prev.tree.length - 1;
    return prev;
  });
}

export function undo(cx: Context) {
  const history = get(cx.history);

  // 最新に戻るため、記録しておく
  if (history.index === history.tree.length - 1 && !get(cx.state).gameover) {
    console.log("stashing...");
    stash(cx);
  }

  // 0. 一般
  // ... *記録*}-> 移動 -> {*記録* -> Action -> *記録*}
  //                         ^ Snapshot はここのを使いたい
  //      ^ index は整合性のためここに置く       ^ 1 個前のindex はここ
  //
  // 1. 開始位置まで戻る
  // {*記録*} -> 移動 -> {*記録* -> Action -> *記録*}
  //  ^このsnapshotを使う  ^1 個前の Snapshot はここ
  //  ^ 1 個前の index はここ
  assert(history.index % 2 === 0, "history index looks very wrong");
  const snapshotIndex = Math.max(0, history.index - 1);
  const nextIndex = Math.max(0, history.index - 2);
  const snapshot = history.tree[snapshotIndex];
  history.index = nextIndex;

  // 状態を巻き戻す
  restore(cx, snapshot);

  cx.history.set(history);
  return {
    x: snapshot.playerX,
    y: snapshot.playerY,
  };
}

export function redo(cx: Context) {
  const history = get(cx.history);

  // 0. 一般
  // {*記録* -> Action -> *記録*} -> 移動 -> {*記録* -> Action -> *記録*} -> 移動 (optional)
  //                                                              ^ Snapshot はここのを使いたい
  //                      ^ 現在の index はここ                   ^ 次の index はここ
  //
  // 1. 最新に戻る -> stash に残っている snapshot に戻る
  // 2. すでに最新に戻ったことがある -> 操作なし
  const snapshot = history.tree[history.index + 2];
  if (!snapshot) {
    const stash = popStash(cx);
    if (!stash) {
      // case 2. すでに最新に戻ったことがある
      return;
    }
    // case 1. 最新に戻る
    restore(cx, stash);
    return;
  }
  history.index += 2;

  restore(cx, snapshot);
  cx.history.set(history);

  return;
}

// 状態を巻き戻す
function restore(cx: Context, ss: StateSnapshot) {
  cx.state.set(structuredClone(ss.game));
  assert(cx.dynamic.player !== null, "player is not initialized");
  cx.dynamic.player.x = ss.playerX;
  cx.dynamic.player.y = ss.playerY;
  cx.dynamic.player.facing = ss.playerFacing;
  cx.grid.diffAndUpdateTo(cx, ss.game.cells);
  cx.grid.clearFallableSprites(cx);
  cx.grid.clearLaser(cx);
  printCells(ss.game.cells, "restore");
}
function stash(cx: Context) {
  cx.history.update((prev) => {
    prev.stash = createSnapshot(cx);
    return prev;
  });
}
function popStash(cx: Context): StateSnapshot | undefined {
  const history = get(cx.history);
  if (history.stash) {
    const stash = history.stash;
    cx.history.update((prev) => {
      prev.stash = undefined;
      return prev;
    });
    return stash;
  }
  return undefined;
}

export function createSnapshot(cx: Context): StateSnapshot {
  const game = get(cx.state);
  assert(cx.dynamic.player !== null, "player is not initialized");
  const playerX = cx.dynamic.player.x;
  const playerY = cx.dynamic.player.y;
  const playerFacing = cx.dynamic.player.facing;
  return {
    game: structuredClone(game),
    playerX,
    playerY,
    playerFacing,
  };
}
