<script lang="ts">
import { onDestroy } from "svelte";
import "./menu.css";
import { invalidate } from "$app/navigation";

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

const nextStageUrl = $derived(`/game?stage=${nextStage}`);
onDestroy(() => {
  invalidate(nextStageUrl);
  el.close();
});
</script>

<dialog bind:this={el} class="modal">
  <div class="modal-box flex flex-col gap-1">
    <h1 class="text-center my-6">Goal!</h1>
    <a class="btn modal-btn" href={nextStageUrl}> Next Stage </a>
    <button
      class="btn modal-btn"
      onclick={() => {
        el.close();
        reset();
      }}
    >
      Restart
    </button>
    <a class="btn modal-btn" href="/stage-select">Back to Stage Select</a>
  </div>
</dialog>
