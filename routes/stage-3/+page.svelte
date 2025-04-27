<script lang="ts">
import { setup } from "@/main.ts";
import { grid3 } from "@/stages.ts";
let container: HTMLElement | null = $state(null);

$effect(() => {
  if (container) {
    setup(container, grid3);
  }
});
</script>

<div id="app">
  <div bind:this={container}></div>
</div>
