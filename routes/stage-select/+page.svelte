<script lang="ts">
import Key from "@/ui-components/Key.svelte";
import { onMount } from "svelte";
import "@/ui-components/menu/menu.css";

let w = "1";

onMount(() => {
  const params = new URLSearchParams(window.location.search);
  w = params.get("w") ?? "1";
});

$: blocks = [
  { label: "1", link: `/game?stage=${w}-1` },
  { label: "2", link: `/game?stage=${w}-2` },
  { label: "3", link: `/game?stage=${w}-3` },
  { label: "4", link: `/game?stage=${w}-4` },
];

let selected = 0;
let lastKeyTime = 0;
let lastKey: string | null = null;
const KEY_REPEAT_DELAY = 180; // ms

function prevWorld() {
  // wを数値として1減らす（1未満にはしない）
  w = String(Math.max(1, Number(w) - 1));
  const url = new URL(window.location.href);
  url.searchParams.set("w", w);
  window.history.replaceState(null, "", url.toString());
}
function nextWorld() {
  // wを数値として1増やす（4より大きくしない）
  w = String(Math.min(4, Number(w) + 1));
  const url = new URL(window.location.href);
  url.searchParams.set("w", w);
  window.history.replaceState(null, "", url.toString());
}
function handleKey(e: KeyboardEvent): void {
  const now = Date.now();
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    if (lastKey === e.key && now - lastKeyTime < KEY_REPEAT_DELAY) {
      return;
    }
    lastKeyTime = now;
    lastKey = e.key;
  }

  if (e.key === "ArrowRight") {
    if (selected === blocks.length - 1) {
      if (w !== "4") {
        nextWorld();
        selected = 0;
      }
    } else {
      selected += 1;
    }
  } else if (e.key === "ArrowLeft") {
    if (selected === 0) {
      if (w !== "1") {
        prevWorld();
        selected = blocks.length - 1;
      }
    } else {
      selected -= 1;
    }
  } else if (e.key === "Enter" || e.key === " ") {
    window.location.href = blocks[selected].link;
  }
}
function handleKeyUp() {
  lastKeyTime = 0;
  lastKey = null;
}

function handleClick(index: number): void {
  selected = index;
}

let container: HTMLDivElement | null = null;

onMount(() => {
  document.addEventListener("keydown", handleKey);
  document.addEventListener("keyup", handleKeyUp);
  return () => {
    document.removeEventListener("keydown", handleKey);
    document.removeEventListener("keyup", handleKeyUp);
  };
});
</script>

<div id="container" class="fixed inset-0">
  <div class="w-full h-full py-8 backdrop-blur-xs flex flex-col ">

    <div class="">
    <button class="btn modal-btn text-xl ml-8 mb-6 w-max! px-4! ">
      <a href="/">&lt; Back to Main Menu</a>
    </button>
  </div>
    <div class="text-7xl text-center flex items-center justify-center gap-8">
      <!-- 左矢印ボタン -->
      <button
        class="px-4 select-none cursor-pointer {Number(w) <= 1 ? "invisible" : ""} hover:-translate-y-1 hover:text-gray-700 "
        aria-label="前のワールド"
        on:click={prevWorld}
        disabled={Number(w) <= 1}
      >
        &lt;
      </button>
      <span>World {w}</span>
      <!-- 右矢印ボタン -->
      <button
        class="px-4 select-none cursor-pointer {Number(w) >= 4 ? "invisible" : ""} hover:-translate-y-1 hover:text-gray-700 "
        aria-label="次のワールド"
        on:click={nextWorld}
        disabled={Number(w) >= 4}
      >
        &gt;
      </button>
    </div>

    <div class="flex justify-center items-center grow-1 ">
      <div
        role="button"
        tabindex="0"
        class="flex outline-none items-center"
      >
        {#each blocks as block, i}
          <button
            type="button"
            class={`appearance-none focus:outline-none bg-white border-6 pt-8 pb-6 pl-8 pr-6 transition-colors duration-200 text-7xl cursor-pointer ${
              selected === i ? 'border-red-500 ring ring-red-500' : 'border-base'
            }`}
            on:click={() => handleClick(i)}
          >
            {block.label}
          </button>
          {#if i < blocks.length - 1}
            <!-- 線（矢印や線） -->
            <div class="w-20 h-3 bg-black"></div>
          {/if}
        {/each}
      </div>
    </div>
    <div class="flex justify-center items-center basis-2/5 min-h-0 shrink grow-2">
      <!-- 画像を中央に配置 -->
      <div class="h-full ">
        <img src="/assets/thumbnail{w}-{selected+1}.png" alt="" class="h-full " />
      </div>
      <!-- テキストを画像の右側に配置 -->
      <div class="flex-none w-max max-h-full flex flex-col items-start bg-white/90 p-4 m-4 rounded-lg border-2">
        Press <Key key="Enter" enabled /> or <Key key="Space" enabled /> to start
      </div>
    </div>
  </div>
</div>

<style>
  #container {
    background-color: black;
    background-image: url('/assets/home.png'), url('/assets/home-block.png');
    background-size: 100%, 100%;
    background-repeat: no-repeat, repeat-y;
    background-position: left top, left, top;
    backdrop-filter: blur(10px);
  }
</style>