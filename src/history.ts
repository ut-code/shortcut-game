import { get } from "svelte/store";
import type { Context, StateSnapshot } from "./public-types.ts";

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
