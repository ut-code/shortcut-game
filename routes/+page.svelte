<script lang="ts">
import { onDestroy, onMount } from "svelte";
import "@/ui-components/menu/menu.css";

onMount(() => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (
    userAgent.includes("android") ||
    userAgent.match(/iphone|ipad|ipod/) ||
    (userAgent.includes("macintosh") && navigator.maxTouchPoints >= 1) /* recent iPad */
  ) {
    window.alert("このゲームはPC用です。キーボードが接続されていない端末ではプレイできません。");
  }
});
onDestroy(() => {
  // document.body.style.backgroundColor = "black";
});

let btn1: HTMLElement;
let btn2: HTMLElement;
function handleKeyDown(e: KeyboardEvent) {
  const buttons = [btn1, btn2];
  const currentIndex = buttons.indexOf(document.activeElement as HTMLElement);
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
$effect(() => {
  document.addEventListener("keydown", handleKeyDown);
  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
});
</script>

<div id="container" class="fixed inset-0">
  <div class="fixed inset-0 backdrop-blur-xs flex flex-col justify-center">
    <div class="flex flex-col gap-5 mb-20 m-10 p-5 bg-yellow-400/85 rounded-lg">
      <h1 class="text-center mt-6 mb-2">Shortcut Game</h1>
      <!--TODO: 題名-->
      <a class="btn modal-btn text-2xl" href="/game?stage=1-1" bind:this={btn1} tabindex="1"> Start from 1-1 </a>
      <a class="btn modal-btn text-2xl" href="/stage-select" bind:this={btn2} tabindex="2"> Stage Select </a>
      <p class="bg-white/90 p-2 rounded-lg">
        Move: &#x21E6; &#x21E8; or A D<br />
        Jump: &#x21E7; or W or Space<br />
        Ability: Ctrl + ?
      </p>
    </div>
  </div>
</div>

<style>
  #container {
    background-color: black;
    background-image: url("/assets/home.png"), url("/assets/home-block.png");
    background-size: 100%, 100%;
    background-repeat: no-repeat, repeat-y;
    background-position:
      left top,
      left,
      top;
  }
</style>
