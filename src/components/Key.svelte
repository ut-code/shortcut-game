<script lang="ts">
type Props = { key: string; enabled: boolean };
const { key, enabled }: Props = $props();
let isMacOS: boolean = $state(false);
$effect(() => {
  isMacOS = navigator.userAgent.includes("Mac OS X");
});
</script>
<span class="key" style="border-color: {enabled ? "black" : "gray"}; background: {enabled ? "white" : "lightgray"};">
  {isMacOS ? "⌘+" + key : "Ctrl+" + key}
</span>
<style>
  .key{
    display: inline-block;
    font-size: 1rem;
    padding: 0.5rem;
    border-style: solid;
    border-width: 0.2rem;
    border-radius: 0.3rem;
  }
</style>
