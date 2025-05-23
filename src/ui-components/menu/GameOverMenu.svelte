<script lang="ts">
import Key from "../Key.svelte";
import "./menu.css";
import { onMount } from "svelte";

type Props = {
  gameover: boolean;
  reset: () => void;
  stageNum: string;
};
const { gameover, reset, stageNum }: Props = $props();
let el: HTMLDialogElement;
let btn1: HTMLElement;
let btn2: HTMLElement;
$effect(() => {
  if (gameover) {
    el.showModal();
    setTimeout(() => {
      btn1.focus();
    }, 100);
  } else {
    if (el.open) el.close();
  }
});
function handleKeyDown(e: KeyboardEvent) {
  const buttons = [btn1, btn2];
  const currentIndex = buttons.indexOf(document.activeElement as HTMLElement);
  if (gameover) {
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
    } else if (e.key === " ") {
      (document.activeElement as HTMLElement)?.click?.();
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
      bind:this={btn1}
      tabindex="1"
    >
      Restart
    </button>
    <a class="btn modal-btn" href="/stage-select?w={stageNum.split("-")[0]}&s={stageNum.split("-")[1]}" bind:this={btn2} tabindex="2"> Back to Stage Select </a>
  </div>
</dialog>
