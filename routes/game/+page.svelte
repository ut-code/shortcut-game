<script lang="ts">
import { browser } from "$app/environment";
import { page } from "$app/state";
import GameLoader from "@/components/GameLoader.svelte";
import { stages } from "@/stages";

const stageNum = $derived(
  browser ? (page.url.searchParams.get("stage") ?? "") : "",
);
const stageDefinition = stages.get(stageNum);
</script>

<GameLoader stage={stageDefinition} {stageNum}>
  {#snippet children(loadingState)}
    {loadingState}...
  {/snippet}
</GameLoader>
