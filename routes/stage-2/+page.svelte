<script lang="ts">
import { setup } from "@/main.ts";
import { grid2 } from "@/stages";
let container: HTMLElement | null = $state(null);

$effect(() => {
  if (container) {
    setup(container, grid2);
  }
});
</script>

<div id="app">
  <div bind:this={container}></div>
</div>
