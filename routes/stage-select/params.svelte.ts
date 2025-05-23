import { browser } from "$app/environment";
import { replaceState } from "$app/navigation";

export const MAX_WORLD = 4;
const WORLD_STAGES_MAP = new Map([
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 2],
]);

export class SearchParamState {
  #world: number = $state(1); // starts from 1
  #selected: number | null = $state(null); // starts from 1
  maxStage: number = $derived(WORLD_STAGES_MAP.get(this.#world) ?? 0);
  constructor(private defaultWorld: number) {
    if (!browser) {
      this.#world = this.defaultWorld;
      this.#selected = null;
      return;
    }
    const params = new URLSearchParams(window.location.href);
    this.#world = Number(params.get("world") || defaultWorld);
    this.#selected = Number(params.get("selected") || null);
  }

  get world(): number {
    return this.#world;
  }
  set world(val: number) {
    this.#world = val;
    if (!browser) return;

    if (val > MAX_WORLD) return;
    if (val < 1) return;

    const nextMaxStage = WORLD_STAGES_MAP.get(val) ?? 0;
    if (this.#selected !== null && this.#selected > nextMaxStage) {
      this.#selected = nextMaxStage;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("world", String(val));
    replaceState(url.toString(), {});
  }

  get selected(): number | null {
    return this.#selected;
  }

  set selected(val: number | null) {
    if (!browser) return;
    if (val === null) return;

    if (val > (WORLD_STAGES_MAP.get(this.#world) ?? 0)) {
      if (this.#world === MAX_WORLD) {
        // do not change
      } else {
        this.#selected = 1;
        this.nextWorld();
      }
    } else if (val < 1) {
      if (this.#world === 1) {
        // do not change
      } else {
        this.prevWorld();
        this.#selected = WORLD_STAGES_MAP.get(this.#world) ?? 0;
      }
    } else {
      this.#selected = val;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("selected", String(this.#selected));
    replaceState(url.toString(), {});
  }

  nextWorld() {
    this.world = Math.min(MAX_WORLD, this.world + 1);
    this.selected = 1;
  }
  prevWorld() {
    this.world = Math.max(1, this.world - 1);
    this.selected = WORLD_STAGES_MAP.get(this.world) ?? 0;
  }
}
