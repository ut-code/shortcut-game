<script lang="ts">
import Key from "./Key.svelte";
type Props = { name: string; key: string; enabled: boolean };
const { name, enabled, key }: Props = $props();
</script>
<span style="margin-right: 1rem; display: flex; align-items: end; color: {enabled ? "black" : "gray"};">
  <Key withCtrl key={key} enabled={enabled} />
  <span style="margin-left:0.5rem; margin-right: 0.5rem;">{name}</span>
</span>
