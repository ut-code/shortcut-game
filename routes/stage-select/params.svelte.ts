import { browser } from "$app/environment";
import { replaceState } from "$app/navigation";
import { onMount } from "svelte";

export const MAX_WORLD = 4;
const WORLD_STAGES_MAP = new Map([
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 2],
]);

export class SearchParamState {
  #world: number | null = $state(null); // starts from 1
  #selected: number | null = $state(null); // starts from 1
  maxStage: number = $derived(WORLD_STAGES_MAP.get(this.#world ?? 0) ?? 0);
  constructor() {
    this.#world = null;
    this.#selected = null;

    onMount(() => {
      const params = new URLSearchParams(window.location.search);
      this.world = Number(params.get("world") || "1");
      this.selected = Number(params.get("selected") || "1");
    });
  }

  get world(): number | null {
    return this.#world;
  }
  set world(val: number | null) {
    console.log("world", val);
    if (!browser) return;

    if (val === null) return;
    if (val > MAX_WORLD) return;
    if (val < 1) return;
    this.#world = val;

    const nextMaxStage = WORLD_STAGES_MAP.get(val) ?? 0;
    if (this.#selected !== null && this.#selected > nextMaxStage) {
      this.#selected = nextMaxStage;
    }

    this.updateURL();
  }

  get selected(): number | null {
    return this.#selected;
  }

  set selected(val: number | null) {
    if (!browser) return;
    if (val === null) return;

    if (val > (WORLD_STAGES_MAP.get(this.#world ?? 0) ?? 0)) {
      if (this.#world === MAX_WORLD) {
        // keep old value
      } else {
        this.#selected = 1;
        this.nextWorld();
      }
    } else if (val < 1) {
      if (this.#world === 1) {
        // keep old value
      } else {
        this.prevWorld();
        this.#selected = WORLD_STAGES_MAP.get(this.#world ?? 0) ?? 0;
      }
    } else {
      this.#selected = val;
    }

    this.updateURL();
  }

  nextWorld() {
    this.world = Math.min(MAX_WORLD, (this.world ?? 0) + 1);
    this.selected = 1;
    this.updateURL();
  }
  prevWorld() {
    this.world = Math.max(1, (this.world ?? 0) - 1);
    this.selected = WORLD_STAGES_MAP.get(this.world ?? 0) ?? 0;
    this.updateURL();
  }

  updateURL() {
    const url = new URL(window.location.href);
    url.searchParams.set("world", String(this.#world));
    url.searchParams.set("selected", String(this.#selected));
    setTimeout(() => {
      try {
        replaceState(url.toString(), {});
      } catch (e) {
        // what do you mean "Cannot call replaceState(...) before router is initialized"
        console.warn("Failed to update URL:", e);
      }
    }, 0);
  }
}
