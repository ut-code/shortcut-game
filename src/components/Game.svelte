<script lang="ts">
import { Block } from "@/constants.ts";
import type { UIContext } from "@/context.ts";
// client-only.
import { setup } from "@/main.ts";
import type { StageDefinition } from "@/stages.ts";
import { type Writable, writable } from "svelte/store";

type Props = { stageNum: string; stage: StageDefinition };
const { stageNum, stage }: Props = $props();
let container: HTMLElement | null = $state(null);
const uiContext = writable<UIContext>({ inventory: null, inventoryIsInfinite: false, });

$effect(() => {
  if (container) {
    setup(container, stage, uiContext);
  }
});
</script>

<div bind:this={container} style="width: 100dvw; height: 100dvh; overflow: hidden;">
  <div style="position: fixed; left: 0; top: 0; right: 0; background: oklch(82.8% 0.189 84.429 / 40%); display: flex; align-items: baseline; padding: 8px 8px; backdrop-filter: blur(2px);">
    <span style="font-size: 32px; margin-right: 6px;">Stage:</span>
    <span style="font-size: 40px">{stageNum}</span>
    <span style="flex-grow: 1"></span>
    <span style="font-size: 24px;">Clipboard:</span>
    <div style="width: 48px; height: 48px; margin: 0 6px; align-self: center; border-style: solid; border-width: 4px; border-radius: 6px; border-color: oklch(87.9% 0.169 91.605);">
      {#if $uiContext.inventory === Block.movable}
        <!-- todo: tint 0xff0000 をする必要があるが、そもそもこの画像は仮なのか本当に赤色にするのか -->
        <img src="/assets/block.png" width="100%" height="100%"/>
      {/if}
    </div>
    <span style="font-size: 24px; margin-right: 4px;">✕</span>
    <span style="font-size: 24px;">{$uiContext.inventoryIsInfinite ? "∞" : "1"}</span>
  </div>
</div>
