<script lang="ts">
import { onMount } from "svelte";
// biome-ignore lint: tsc will error
import { createApp } from "../../src/main";

const stages = new Map([
  ["stage-1", 1],
  ["stage-2", 2],
  ["stage-3", 3],
]);
const { data } = $props();
const stage = stages.get(data.params.stage);
console.log("stage:", stage);
const container: HTMLDivElement = $state();

$inspect(container);
onMount(() => {
  if (!stage) throw new Error("STAGE NOT FOUND!");
  createApp(container, stage);
});
</script>

DIUNTAIPUTD DPANITUN
<div id="app">
  <div bind:this={container}></div>
</div>

<style>
  /*
  :global(body) {
    margin: 0;
    padding: 0;
    color: rgba(255, 255, 255, 0.87);
    background-color: #000000;
  }

  #app {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  */
</style>
