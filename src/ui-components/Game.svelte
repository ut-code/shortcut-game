<script lang="ts">
import { setup } from "@/main.ts";
import type { UIInfo } from "@/public-types.ts";
import type { StageDefinition } from "@/stages.ts";
import Ability from "@/ui-components/Ability.svelte";
import Key from "@/ui-components/Key.svelte";
import { onDestroy } from "svelte";
// client-only.
import PauseMenu from "./PauseMenu.svelte";

type Props = { stageNum: string; stage: StageDefinition };
const { stageNum, stage }: Props = $props();
let container: HTMLElement | null = $state(null);

const bindings = $state({
  onpause: () => {},
  onresume: () => {},
  ondestroy: () => {},
  uiInfo: <UIInfo>{
    inventory: null,
    inventoryIsInfinite: false,
    copy: 0,
    cut: 0,
    paste: 0,
    undo: 0,
    redo: 0,
    paused: false,
  },
});
const uiContext = $derived(bindings.uiInfo);

$effect(() => {
  if (container) {
    setup(container, stage, bindings);
  }
});

onDestroy(() => bindings.ondestroy());
</script>

<div bind:this={container} id="container">
  <PauseMenu
    paused={uiContext.paused}
    onpause={() => bindings.onpause()}
    onresume={() => bindings.onresume()}
  />
  <div
    class="uiBackground"
    style="position: fixed; left: 0; top: 0; right: 0; display: flex; align-items: baseline;"
  >
    <span style="font-size: 2rem; margin-right:0.5rem;">Stage:</span>
    <span style="font-size: 2.5rem; margin-right: 1.5rem;">{stageNum}</span>
    <Key key="Esc" enabled />
    <span style="font-size: 1.5rem; margin-left: 0.5rem;">to pause</span>
    <span style="flex-grow: 1"></span>
    <span style="font-size: 1.5rem;">Clipboard:</span>
    <div class="inventory">
      {#if uiContext.inventory !== null}
        <!-- todo: tint 0xff0000 をする必要があるが、そもそもこの画像は仮なのか本当に赤色にするのか -->
        <img
          src="/assets/block.png"
          alt="inventory"
          width="100%"
          height="100%"
        />
      {/if}
    </div>
    <span style="font-size: 1.5rem;">✕</span>
    <span style="font-size: 2rem;"
      >{uiContext.inventoryIsInfinite ? "∞" : "1"}</span
    >
  </div>
  <div
    class="uiBackground"
    style="position: fixed; left: 0; bottom: 0; right: 0; display: flex; align-items: baseline;"
  >
    <span style="font-size: 1.5rem; margin-right: 1rem;">Abilities:</span>
    <Ability key="C" name="Copy" count={uiContext.copy} />
    <Ability key="X" name="Cut" count={uiContext.cut} />
    <Ability key="V" name="Paste" count={uiContext.paste} />
    <Ability key="Z" name="Undo" count={uiContext.undo} />
    <Ability key="Y" name="Redo" count={uiContext.redo} />
  </div>
</div>

<style>
  #container {
    width: 100dvw;
    height: 100dvh;
    overflow: hidden;
  }
  .uiBackground {
    background: oklch(82.8% 0.189 84.429 / 40%);
    backdrop-filter: blur(2px);
    padding: 0.75rem 1rem;
  }
  .inventory {
    width: 3rem;
    height: 3rem;
    margin: 0 0.5rem;
    align-self: center;
    border-style: solid;
    border-width: 0.3rem;
    border-radius: 0.5rem;
    border-color: oklch(87.9% 0.169 91.605);
  }
</style>
