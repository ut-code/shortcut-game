<script lang="ts">
import { setup } from "@/main.ts";
import { grid1 } from "@/stages";
let container: HTMLElement | null = $state(null);

$effect(() => {
  if (container) {
    setup(container, grid1);
  }
});
</script>

<div id="app">
  <div bind:this={container}></div>
</div>
