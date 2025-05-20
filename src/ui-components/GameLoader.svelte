<script lang="ts">
// can run on server side
import { browser } from "$app/environment";
import type { StageDefinition } from "@/stages/type.ts";
import type { Snippet } from "svelte";

type Props = {
  children: Snippet<[string]>;
  stageNum: string;
  stage: StageDefinition | undefined;
  stageNames: string[];
};
const { children, stageNum, stage, stageNames }: Props = $props();
</script>

{#if browser}
  {#await import("@/ui-components/Game.svelte")}
    {@render children("Downloading")}
  {:then { default: Game }}
    {#if stage}
      <Game {stageNum} {stage} {stageNames} />
    {:else}
      Stage not found! <a href="/">Go Back</a>
    {/if}
  {/await}
{:else}
  {@render children("Hydrating")}
{/if}
