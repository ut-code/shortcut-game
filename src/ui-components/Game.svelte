<script lang="ts">
// client-only.

import { Block } from "@/constants";
import { setup } from "@/main.ts";
import type { UIInfo } from "@/public-types.ts";
import type { StageDefinition } from "@/stages/type.ts";
import Ability from "@/ui-components/Ability.svelte";
import Key from "@/ui-components/Key.svelte";
import { onDestroy } from "svelte";
import GameOverMenu from "./menu/GameOverMenu.svelte";
import GoalMenu from "./menu/GoalMenu.svelte";
import PauseMenu from "./menu/PauseMenu.svelte";

type Props = {
  stageNum: string;
  stage: StageDefinition;
  stageNames: string[];
};
const { stageNum, stage, stageNames }: Props = $props();
let container: HTMLElement | null = $state(null);

const bindings = $state({
  pause: () => {},
  resume: () => {},
  destroy: () => {},
  reset: () => {},
  uiInfo: <UIInfo>{
    inventory: null,
    inventoryIsInfinite: false,
    copy: 0,
    cut: 0,
    paste: 0,
    undo: 0,
    redo: 0,
    paused: false,
    goaled: false,
  },
});
const uiContext = $derived(bindings.uiInfo);

const nextStage = $derived(
  stageNames[stageNames.indexOf(stageNum) + 1 >= stageNames.length ? 0 : stageNames.indexOf(stageNum) + 1],
);

$effect(() => {
  if (container) {
    setup(container, stage, bindings);
    return () => bindings.destroy();
  }
});

onDestroy(() => bindings.destroy());
</script>

<div bind:this={container} id="container">
  <PauseMenu
    paused={uiContext.paused}
    alreadyStopped={uiContext.goaled || uiContext.gameover}
    onpause={() => bindings.pause()}
    onresume={() => bindings.resume()}
    onreset={() => {
      // if this isn't working well, we can use window.location.reload(); instead
      bindings.reset();
    }}
    stageNum={stageNum}
  />
  <GoalMenu
    goaled={uiContext.goaled}
    {nextStage}
    reset={() => bindings.reset()}
    stageNum={stageNum}
  />
  <GameOverMenu gameover={uiContext.gameover} reset={() => bindings.reset()} stageNum={stageNum} />
  <div
    class="uiBackground"
    style="position: fixed; left: 0; top: 0; right: 0; display: flex; align-items: end; "
  >
    <!-- align-items: baseline does not work for Fleftex font -->
    <span style="margin-right:0.5rem;">Stage:</span>
    <span style="margin-right: 1.5rem;">{stageNum}</span>
    <Key key="Esc" enabled />
    <span style="margin-left: 0.5rem;">to pause</span>
    <span style="flex-grow: 1"></span>
    <span style="">Clipboard:</span>
    <div class="inventory">
      {#if uiContext.inventory?.block === Block.movable}
        <!-- todo: tint 0xff0000 をする必要があるが、そもそもこの画像は仮なのか本当に赤色にするのか -->
        <img
          src="/assets/block-red.png"
          alt="inventory"
          width="100%"
          height="100%"
        />
      {:else if uiContext.inventory?.block === Block.fallable}
        <img
          src="/assets/woodenbox.png"
          alt="inventory"
          width="100%"
          height="100%"
        />
      {/if}
    </div>
    {#if !uiContext.inventoryIsInfinite}
      <span style="">x</span>
      <span style="">1</span>
    {/if}
  </div>
  <div
    class="uiBackground"
    style="position: fixed; left: 0; bottom: 0; right: 0; display: flex; align-items: end;"
  >
    <span style="margin-right: 1rem;">Abilities:</span>
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
