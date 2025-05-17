<script lang="ts">
type Props = {
  goaled: boolean;
  nextStage: string;
  reset: () => void;
};
const { goaled, nextStage, reset }: Props = $props();
let el: HTMLDialogElement;
$effect(() => {
  if (goaled) {
    el.showModal();
  } else {
    if (el.open) el.close();
  }
});
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") ev.preventDefault();
});
</script>

<dialog bind:this={el} class="modal">
  <div class="uiBackground modal-box flex flex-col gap-1">
    <h1 class="text-4xl text-center">Goal!</h1>
    <!-- todo: ボタンのスタイル -->
    <a data-sveltekit-reload style="font-size: 1.5rem;" class="btn btn-block" href={`/game?stage=${nextStage}`}>
      Next Stage
    </a>
    <button
      style="font-size: 1.5rem;"
      class="btn btn-block"
      onclick={() => {
        el.close();
        reset();
      }}
    >
      Restart
    </button>
    <a style="font-size: 1.5rem;" class="btn btn-block" href="/">
      Back to Stage Select
    </a>
  </div>
</dialog>

<style>
  .uiBackground {
    background: oklch(82.8% 0.189 84.429 / 40%);
    backdrop-filter: blur(2px);
    padding: 0.75rem 1rem;
  }
</style>
