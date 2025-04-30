<script lang="ts">
// can run on server side
import { browser } from "$app/environment";
import type { StageDefinition } from "@/stages";
import type { Snippet } from "svelte";

type Props = {
  children: Snippet<[string]>;
  stage: StageDefinition | undefined;
};
const { children, stage }: Props = $props();
</script>

{#if browser}
  {#await import("@/components/Game.svelte")}
    {@render children("Downloading")}
  {:then { default: Game }}
    {#if stage}
      <Game {stage} />
    {:else}
      Stage not found! <a href="/">Go Back</a>
    {/if}
  {/await}
{:else}
  {@render children("Hydrating")}
{/if}
