<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { setup } from "@/main.ts";
import * as grids from "@/stages";
let container: HTMLElement | null = $state(null);

const gridMap = new Map([
  ["1", grids.grid1],
  ["2", grids.grid2],
  ["3", grids.grid3],
]);

$effect(() => {
  const grid = gridMap.get(page.url.searchParams.get("stage") ?? "");
  if (!grid) {
    goto("/");
    return;
  }
  if (container) {
    setup(container, grid);
  }
});
</script>

<div id="app">
  <div bind:this={container}></div>
</div>
