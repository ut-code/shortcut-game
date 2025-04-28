<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { setup } from "@/main.ts";
import { stages } from "@/stages";
let container: HTMLElement | null = $state(null);

$effect(() => {
  const stageDefinition = stages.get(page.url.searchParams.get("stage") ?? "");
  if (!stageDefinition) {
    goto("/");
    return;
  }
  if (container) {
    setup(container, stageDefinition);
  }
});
</script>

<div id="app">
  <div bind:this={container}></div>
</div>
