import { get } from "svelte/store";
import { printCells } from "./grid.ts";
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
  if (history.index <= 0) return undefined;
  const grid = cx.grid;
  history.index--;
  const snapshot = history.tree[history.index];

  printCells(snapshot.game.cells, "undo");
  if (history.index === 0) {
    console.log("undo to last", snapshot);
  }

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
  // TODO: プレイヤーの座標の履歴を「いい感じ」にするため、 history を二重管理する
  const history = get(cx.history);
  if (history.index >= history.tree.length - 1) return undefined;
  history.index++; // redo は、巻き戻し前の index
  const snapshot = history.tree[history.index];
  printCells(snapshot.game.cells, "redo");
  const grid = cx.grid;

  // 状態を巻き戻す
  cx.state.set(snapshot.game);
  grid.diffAndUpdateTo(cx, snapshot.game.cells);

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
