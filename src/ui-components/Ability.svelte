<script lang="ts">
import Key from "./Key.svelte";
type Props = { name: string; key: string; count: number };
const { name, count, key }: Props = $props();
let isMacOS: boolean = $state(false);
$effect(() => {
  isMacOS = navigator.userAgent.includes("Mac OS X");
});
</script>
<span style="color: {count > 0 ? "black" : "gray"};">
  <Key key={isMacOS ? "⌘+" + key : "Ctrl+" + key} enabled={count > 0} />
  <span style="">{name}</span>
  <span style="">x</span>
  <span style="margin-right: 1rem;">{isFinite(count) ? count : "∞"}</span>
</span>
