<script lang="ts">
import "./menu.css";

type Props = {
  gameover: boolean;
  reset: () => void;
};
const { gameover, reset }: Props = $props();
let el: HTMLDialogElement;
$effect(() => {
  if (gameover) {
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
  <div class="modal-box flex flex-col gap-1">
    <h1 class="text-4xl text-center mt-6 mb-2">Game Over</h1>
    <p class="text-xl text-center text-gray-500 mb-4">ctrl+Z で戻る</p>
    <button
      class="btn modal-btn"
      onclick={() => {
        el.close();
        reset();
      }}
    >
      Restart
    </button>
    <a class="btn modal-btn" href="/">Back to Stage Select</a>
  </div>
</dialog>
