<script lang="ts">
import { page } from "$app/state";
import GameLoader from "@/components/GameLoader.svelte";
import { stages } from "@/stages";

const stageNum = page.url.searchParams.get("stage") ?? "";
const stageDefinition = $derived(stages.get(stageNum));
</script>

<GameLoader stage={stageDefinition} {stageNum}>
  {#snippet children(loadingState)}
    {loadingState}...
  {/snippet}
</GameLoader>
