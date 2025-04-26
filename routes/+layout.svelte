<script lang="ts">
const { children } = $props();
</script>

{#if typeof window !== "undefined"}
  {@render children()}
{:else}
  loaind.....g
{/if}
