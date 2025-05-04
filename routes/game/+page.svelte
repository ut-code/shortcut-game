<script lang="ts">
import { browser } from "$app/environment";
import { page } from "$app/state";
import { stages } from "@/stages";
import GameLoader from "@/ui-components/GameLoader.svelte";

const stageNum = $derived(
  browser ? (page.url.searchParams.get("stage") ?? "") : "",
);
const stageDefinition = $derived(stages.get(stageNum));
</script>

<GameLoader stage={stageDefinition} {stageNum}>
  {#snippet children(loadingState)}
    {loadingState}...
  {/snippet}
</GameLoader>
