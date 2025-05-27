import type { GameDynamic, GameHistory, GameState, UIInfo } from "./public-types.ts";

export function useUI(state: GameState, history: GameHistory, dynamic: GameDynamic): UIInfo {
  return {
    inventory: state.inventory,
    inventoryIsLarge: dynamic.isInventoryBlockLarge,
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
