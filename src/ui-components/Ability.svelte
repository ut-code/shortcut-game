<script lang="ts">
import Key from "./Key.svelte";
type Props = { name: string; key: string; num: number };
const { name, num, key }: Props = $props();
let isMacOS: boolean = $state(false);
$effect(() => {
  isMacOS = navigator.userAgent.includes("Mac OS X");
});
</script>
<span style="color: {num > 0 ? "black" : "gray"};">
  <Key key={isMacOS ? "⌘+" + key : "Ctrl+" + key} enabled={num > 0} />
  <span style="font-size: 1.5rem;">{name}</span>
  <span style="font-size: 1.5rem;">✕</span>
  <span style="font-size: 2rem; margin-right: 1rem;">{isFinite(num) ? num : "∞"}</span>
</span>
