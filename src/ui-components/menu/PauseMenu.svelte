<script lang="ts">
import "./menu.css";
import { onMount } from "svelte";
type Props = {
  paused: boolean;
  alreadyStopped: boolean;
  onresume: () => void;
  onpause: () => void;
  onreset: () => void;
  stageNum: string;
};
let { paused, alreadyStopped, onresume, onpause, onreset, stageNum }: Props = $props();
let el: HTMLDialogElement;
let btn1: HTMLElement;
let btn2: HTMLElement;
let btn3: HTMLElement;

$effect(() => {
  if (paused && !alreadyStopped) {
    el.showModal();
    setTimeout(() => {
      btn1.focus();
    }, 100);
  } else {
    el.close();
  }
});

function handleKeyDown(e: KeyboardEvent) {
  const buttons = [btn1, btn2, btn3];
  const currentIndex = buttons.indexOf(document.activeElement as HTMLElement);
  if (paused) {
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
    if (!paused && !alreadyStopped) {
      onpause();
      e.preventDefault();
    }
  }
}
$effect(() => {
  document.addEventListener("keydown", handleKeyDown);
  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
});
</script>

<dialog bind:this={el} onclose={onresume} class="modal">
  <div class="modal-box flex flex-col gap-1">
    <h1 class="text-center my-6">Paused</h1>
    <form method="dialog" class="w-full">
      <button class="btn modal-btn" type="submit" bind:this={btn1} tabindex="1">Resume</button>
    </form>
    <button class="btn modal-btn" onclick={() => onreset()} bind:this={btn2} tabindex="2">Restart</button>
    <a class="btn modal-btn" href="/stage-select?w={stageNum.split("-")[0]}&s={stageNum.split("-")[1]}" bind:this={btn3} tabindex="3"> Back to Stage Select </a>
  </div>
</dialog>
