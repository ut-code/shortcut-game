import { get } from "svelte/store";
import type { Context, StateSnapshot } from "./public-types.ts";

// History については、 `docs/history-stack.png` を参照のこと
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

export function undo(cx: Context): { x: number; y: number } | undefined {
  const history = get(cx.history);
  const grid = cx.grid;

  // {*記録* -> Action -> *記録*} -> 移動 -> {*記録* -> Action -> *記録*}
  //                                           ^ Snapshot はここのを使いたい
  //                       ^ index は整合性のためここに置きたい    ^ 最新の index はここ
  const snapshot = history.tree[history.index - 1];
  if (!snapshot) return undefined; // ゲームが開始する前
  history.index -= 2;

  // 状態を巻き戻す
  cx.state.set(snapshot.game);
  grid.diffAndUpdateTo(cx, snapshot.game.cells);
  cx.dynamic.player.x = snapshot.playerX;
  cx.dynamic.player.y = snapshot.playerY;

  cx.history.set(history);
  console.log(`history: ${history.index} / ${history.tree.length - 1}`);
  return {
    x: history.tree[history.index].playerX,
    y: history.tree[history.index].playerY,
  };
}

export function redo(cx: Context): { x: number; y: number } | undefined {
  const history = get(cx.history);

  // {*記録* -> Action -> *記録*} -> 移動 -> {*記録* -> Action -> *記録*}
  //                                                               ^ Snapshot はここのを使いたい
  //                       ^ 現在の index はここ                   ^ 最新の index はここ
  // ちなみにこの実装だと ctrl + Z でスタート地点に戻れない
  const snapshot = history.tree[history.index + 2];
  if (!snapshot) return undefined; // 最新の先;
  history.index += 2;

  const grid = cx.grid;

  // 状態を巻き戻す
  cx.state.set(snapshot.game);
  grid.diffAndUpdateTo(cx, snapshot.game.cells);
  cx.dynamic.player.x = snapshot.playerX;
  cx.dynamic.player.y = snapshot.playerY;

  console.log(`history: ${history.index} / ${history.tree.length - 1}`);
  cx.history.set(history);
  return {
    x: history.tree[history.index].playerX,
    y: history.tree[history.index].playerY,
  };
}

export function createSnapshot(cx: Context): StateSnapshot {
  const game = get(cx.state);
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
