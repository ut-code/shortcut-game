<script lang="ts">
import { onDestroy } from "svelte";
import "./menu.css";
import { invalidate } from "$app/navigation";
import { onMount } from "svelte";

type Props = {
  goaled: boolean;
  nextStage: string;
  reset: () => void;
  stageNum: string;
};
const { goaled, nextStage, reset, stageNum }: Props = $props();
let el: HTMLDialogElement;
let btn1: HTMLElement;
let btn2: HTMLElement;
let btn3: HTMLElement;
$effect(() => {
  if (goaled) {
    el.showModal();
    setTimeout(() => {
      btn1.focus();
    }, 100);
  } else {
    if (el.open) el.close();
  }
});

function handleKeyDown(e: KeyboardEvent) {
  const buttons = [btn1, btn2, btn3];
  const currentIndex = buttons.indexOf(document.activeElement as HTMLElement);
  if (goaled) {
    if (e.key === "ArrowUp") {
      if (currentIndex > 0) {
        buttons[currentIndex - 1].focus();
      } else {
        buttons[buttons.length - 1].focus();
      }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (currentIndex < buttons.length - 1) {
        buttons[currentIndex + 1].focus();
      } else {
        buttons[0].focus();
      }
      e.preventDefault();
    }
  }
  if (e.key === "Escape") {
    e.preventDefault();
  }
}
$effect(() => {
  document.addEventListener("keydown", handleKeyDown);
  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
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
    <a class="btn modal-btn" href={nextStageUrl} bind:this={btn1} tabindex="1"> Next Stage </a>
    <button
      class="btn modal-btn"
      onclick={() => {
        el.close();
        reset();
      }}
      bind:this={btn2} 
      tabindex="2"
    >
      Restart
    </button>
    <a class="btn modal-btn" href="/stage-select?w={stageNum.split("-")[0]}&s={stageNum.split("-")[1]}" bind:this={btn3} tabindex="3" > Back to Stage Select </a>
  </div>
</dialog>
