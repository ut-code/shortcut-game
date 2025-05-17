<script lang="ts">
import Key from "./Key.svelte";
type Props = { name: string; key: string; count: number };
const { name, count, key }: Props = $props();
let isMacOS: boolean = $state(false);
$effect(() => {
  isMacOS = navigator.userAgent.includes("Mac OS X");
});
</script>
<span style="margin-right: 1rem; display: flex; align-items: end; color: {count > 0 ? "black" : "gray"};">
  <Key key={isMacOS ? "⌘+" + key : "Ctrl+" + key} enabled={count > 0} />
  <span style="margin-left:0.5rem; margin-right: 0.5rem;">{name}</span>
  {#if isFinite(count)}
    <span style="margin-right: 0.5rem; ">x</span>
    <span style="">{count}</span>
  {/if}
</span>
