<script lang="ts">
import Key from "@/ui-components/Key.svelte";
import { onMount } from "svelte";
import "@/ui-components/menu/menu.css";
import { replaceState } from "$app/navigation";

let world: string | null = null;
let selected: number | null = null;

onMount(() => {
  const params = new URLSearchParams(window.location.search);
  world = params.get("w") ?? "1";
  selected = Number(params.get("s") ?? "1") - 1;
});

$: blocks = [
  { label: "1", link: `/game?stage=${world}-1` },
  { label: "2", link: `/game?stage=${world}-2` },
  { label: "3", link: `/game?stage=${world}-3` },
  { label: "4", link: `/game?stage=${world}-4` },
];

let lastKeyTime = 0;
let lastKey: string | null = null;
const KEY_REPEAT_DELAY = 180; // ms

function prevWorld() {
  // wを数値として1減らす（1未満にはしない）
  world = String(Math.max(1, Number(world) - 1));
  const url = new URL(window.location.href);
  url.searchParams.set("w", world);
  replaceState(url.toString(), {});
}
function nextWorld() {
  // wを数値として1増やす（4より大きくしない）
  world = String(Math.min(4, Number(world) + 1));
  const url = new URL(window.location.href);
  url.searchParams.set("w", world);
  replaceState(url.toString(), {});
}
function select(index: number): void {
  selected = index;
  const url = new URL(window.location.href);
  url.searchParams.set("s", String(index + 1));
  replaceState(url.toString(), {});
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

  if (selected === null) {
    return;
  }

  if (e.key === "ArrowRight") {
    if (selected === blocks.length - 1) {
      if (world !== "4") {
        nextWorld();
        select(0);
      }
    } else {
      select(selected + 1);
    }
  } else if (e.key === "ArrowLeft") {
    if (selected === 0) {
      if (world !== "1") {
        prevWorld();
        select(blocks.length - 1);
      }
    } else {
      select(selected - 1);
    }
  } else if (e.key === "Enter" || e.key === " ") {
    window.location.href = blocks[selected].link;
  }
}
function handleKeyUp() {
  lastKeyTime = 0;
  lastKey = null;
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
  <div class="w-full h-full py-8 backdrop-blur-xs flex flex-col">
    <div class="">
      <button class="btn modal-btn text-xl ml-8 mb-6 w-max! px-4!">
        <a href="/">&lt; Back to Main Menu</a>
      </button>
    </div>
    <div class="text-7xl text-center flex items-center justify-center gap-8">
      <!-- 左矢印ボタン -->
      <button
        class="px-4 select-none cursor-pointer {Number(world) <= 1
          ? 'invisible'
          : ''} hover:-translate-y-1 hover:text-gray-700 active:translate-y-0 active:text-black"
        aria-label="前のワールド"
        on:click={prevWorld}
        disabled={Number(world) <= 1}
      >
        &lt;
      </button>
      <span>World {world}</span>
      <!-- 右矢印ボタン -->
      <button
        class="px-4 select-none cursor-pointer {Number(world) >= 4
          ? 'invisible'
          : ''} hover:-translate-y-1 hover:text-gray-700 active:translate-y-0 active:text-black"
        aria-label="次のワールド"
        on:click={nextWorld}
        disabled={Number(world) >= 4}
      >
        &gt;
      </button>
    </div>

    <div class="flex justify-center items-center grow-1">
      <div role="button" tabindex="0" class="flex outline-none items-center">
        {#each blocks as block, i}
          <button
            type="button"
            class={`appearance-none focus:outline-none bg-white border-6 pt-8 pb-6 pl-8 pr-6 transition-colors duration-200 text-7xl cursor-pointer ${
              selected === i
                ? "border-red-500 ring ring-red-500 bg-amber-100!"
                : "border-base"
            }`}
            on:click={() => select(i)}
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
    <div
      class="flex justify-center items-center basis-2/5 min-h-0 shrink grow-2"
    >
      <!-- 画像を中央に配置 -->
      <div class="h-full">
        {#if selected !== null}
          {#key world}
            {#each { length: 4 } as _, idx}
              <img
                src="/assets/thumbnail{world}-{idx + 1}.png"
                alt=""
                class={["h-full skeleton", idx !== selected && "hidden"]}
              />
            {/each}
          {/key}
        {/if}
      </div>
      <!-- テキストを画像の右側に配置 -->
      <div
        class="flex-none w-max max-h-full flex flex-col items-start bg-white/90 p-4 m-4 rounded-lg border-2"
      >
        Press <Key key="Enter" enabled /> or <Key key="Space" enabled /> to start
      </div>
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
    backdrop-filter: blur(10px);
  }
</style>
