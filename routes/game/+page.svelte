<script lang="ts">
import { page } from "$app/state";
import GameLoader from "@/components/GameLoader.svelte";
import { stages } from "@/stages";

const stageDefinition = $derived(
  stages.get(page.url.searchParams.get("stage") ?? ""),
);
</script>

<GameLoader stage={stageDefinition}>
  {#snippet children(loadingState)}
    {loadingState}...
  {/snippet}
</GameLoader>
