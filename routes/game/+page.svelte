<script lang="ts">
import { browser } from "$app/environment";
import { page } from "$app/state";
import GameLoader from "@/components/GameLoader.svelte";
import { stages } from "@/stages";

const stageDefinition = $derived(
  browser ? stages.get(page.url.searchParams.get("stage") ?? "") : undefined,
);
</script>

<GameLoader stage={stageDefinition}>
  {#snippet children(loadingState)}
    {loadingState}...
  {/snippet}
</GameLoader>
