<script lang="ts">
type Props = { key: string; enabled: boolean; withCtrl?: boolean };
const { key, enabled, withCtrl }: Props = $props();
let isMacOS: boolean = $state(false);
$effect(() => {
  isMacOS = navigator.userAgent.includes("Mac OS X");
});
</script>

<span
  class="key"
  style="border-color: {enabled ? 'black' : 'gray'}; background: {enabled
    ? 'white'
    : 'lightgray'};"
>
  {(withCtrl ? (isMacOS ? "⌘+" : "Ctrl+") : "") + key}
</span>

<style>
  .key {
    display: inline-block;
    font-family: system-ui;
    font-size: 1.2rem;
    padding: 0.2rem 0.3rem;
    border-style: solid;
    border-width: 0.2rem;
    border-radius: 0.3rem;
  }
</style>
