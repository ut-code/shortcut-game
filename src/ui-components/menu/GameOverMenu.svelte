<script lang="ts">
import Key from "../Key.svelte";
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
    <h1 class="text-center mt-6 mb-2">Game Over</h1>
    <p class="text-center text-gray-500 mb-2 flex flex-row justify-center items-end ">   
      <span class="mr-2 ">Back with</span>
      <Key key="Z" withCtrl enabled />
    </p>
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
