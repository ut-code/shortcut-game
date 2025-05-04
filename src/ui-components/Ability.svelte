<script lang="ts">
import Key from "./Key.svelte";
type Props = { name: string; key: string; num: number };
const { name, num, key }: Props = $props();
</script>
<span style="color: {num > 0 ? "black" : "gray"}">
  <Key {key} enabled={num > 0} />
  <span style="font-size: 1.5rem;">{name}</span>
  <span style="font-size: 1.5rem;">✕</span>
  <span style="font-size: 2rem; margin-right: 1rem;">{isFinite(num) ? num : "∞"}</span>
</span>
