<script lang="ts">
// client-only.
import { setup } from "@/main.ts";
import type { StageDefinition } from "@/stages.ts";

type Props = { stage: StageDefinition };
const { stage }: Props = $props();
let container: HTMLElement | null = $state(null);

$effect(() => {
  if (container) {
    setup(container, stage);
  }
});
</script>

<div id="app" bind:this={container} style="width: 100dvw; height: 100dvh; overflow: hidden;">
</div>
