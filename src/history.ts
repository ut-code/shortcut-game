import { get } from "svelte/store";
import type { Context, StateSnapshot } from "./public-types.ts";

export function createSnapshot(cx: Context): StateSnapshot {
  const game = get(cx.state);
  const playerX = cx.dynamic.playerX;
  const playerY = cx.dynamic.playerY;
  const playerFacing = cx.dynamic.playerFacing;
  return {
    game,
    playerX,
    playerY,
    playerFacing,
  };
}
