<script lang="ts">
import { browser } from "$app/environment";
import { page } from "$app/state";
import { stages } from "@/stages";
import GameLoader from "@/ui-components/GameLoader.svelte";

const stageNum = $derived(
  browser ? (page.url.searchParams.get("stage") ?? "") : "",
);
const stageDefinition = $derived(stages.get(stageNum));
const stageNames = $derived(Array.from(stages.keys()));
</script>

<GameLoader stage={stageDefinition} {stageNum} {stageNames}>
  {#snippet children(loadingState)}
    {loadingState}...
  {/snippet}
</GameLoader>
