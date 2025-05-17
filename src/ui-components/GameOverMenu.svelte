<script lang="ts">
type Props = {
  gameover: boolean;
};
const { gameover }: Props = $props();
let edl: HTMLDialogElement;
let ebl: HTMLButtonElement;
$effect(() => {
  if (gameover) {
    edl.showModal();
  } else {
    if (edl.open) edl.close();
  }
});
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") ev.preventDefault();
});
</script>

<dialog bind:this={edl} class="modal">
  <div class="uiBackground modal-box flex flex-col gap-1">
    <h1 class="text-4xl text-center">Game Over</h1>
    <!-- todo: ボタンのスタイル -->
    <p class="text-xl text-center">ctrl+Z で戻る</p>
    <!-- TODO; これもうちょいパフォーマンスいいやつにしたい -->
    <button
      style="font-size: 1.5rem;"
      class="btn btn-block"
      onclick={() => window.location.reload()}
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
