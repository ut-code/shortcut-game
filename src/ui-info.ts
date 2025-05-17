import type { GameHistory, GameState, UIInfo } from "./public-types.ts";

export function useUI(state: GameState, history: GameHistory): UIInfo {
  return {
    inventory: state.inventory,
    inventoryIsInfinite: state.inventoryIsInfinite,
    copy: state.usage.copy,
    paste: state.usage.paste,
    cut: state.usage.cut,
    undo: history.index / 2,
    redo: (history.tree.length - 1 - history.index) / 2,
    paused: state.paused,
    goaled: state.goaled,
    gameover: state.gameover,
  };
}
