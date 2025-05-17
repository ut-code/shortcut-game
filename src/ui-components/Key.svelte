<script lang="ts">
type Props = { key: string; enabled: boolean };
const { key, enabled }: Props = $props();
</script>
<span class="key" style="border-color: {enabled ? "black" : "gray"}; background: {enabled ? "white" : "lightgray"};">
  {key}
</span>
<style>
  .key{
    display: inline-block;
    font-family: system-ui;
    font-size: 1rem;
    padding: 0.3rem;
    border-style: solid;
    border-width: 0.2rem;
    border-radius: 0.3rem;
  }
</style>
