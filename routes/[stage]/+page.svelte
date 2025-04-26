<script lang="ts">
import { initializeApp } from "../../src/main.ts";
import type { PageProps } from "./$types.ts";

const { data }: PageProps = $props();
const stage = data.props.stage;
console.log("stage:", stage);
let container: HTMLDivElement | undefined = $state();

$effect(() => {
  if (!stage) console.error("STAGE NOT FOUND!");
  initializeApp(container, stage).then(() => {
    console.log("initialization done");
  });
});
</script>

<div id="app">
  <div bind:this={container}></div>
</div>

<style>
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
</style>
