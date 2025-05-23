<script lang="ts">
import Key from "@/ui-components/Key.svelte";
import { onMount } from "svelte";
import "@/ui-components/menu/menu.css";
import { replaceState } from "$app/navigation";

// starts from 1
let world = $state<number | null>(null);
let stage = $state<number | null>(null);
const maxWorld = 4;
const maxStage = 4;

onMount(() => {
  const params = new URLSearchParams(window.location.search);
  world = Number(params.get("w") ?? "1");
  stage = Number(params.get("s") ?? "1");
});

let lastKeyTime = 0;
let lastKey: string | null = null;
const KEY_REPEAT_DELAY = 180; // ms

function changeStage(worldNum: number, stageNum: number): void {
  if (worldNum < 1 || worldNum > maxWorld) {
    throw new Error(`World number must be between 1 and ${maxWorld}, but got ${worldNum}`);
  }
  if (stageNum < 1 || stageNum > maxStage) {
    throw new Error(`Stage number must be between 1 and ${maxStage}, but got ${stageNum}`);
  }
  world = worldNum;
  stage = stageNum;
  const url = new URL(window.location.href);
  url.searchParams.set("w", String(world));
  url.searchParams.set("s", String(stageNum));
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

  if (stage === null || world === null) {
    return;
  }

  if (e.key === "ArrowRight") {
    if (stage === maxStage) {
      if (world < maxWorld) {
        changeStage(world + 1, 1);
      }
    } else {
      changeStage(world, stage + 1);
    }
  } else if (e.key === "ArrowLeft") {
    if (stage === 1) {
      if (world > 1) {
        changeStage(world - 1, maxStage);
      }
    } else {
      changeStage(world, stage - 1);
    }
  } else if (e.key === "Enter" || e.key === " ") {
    window.location.href = `/game?stage=${world}-${stage}`;
  } else if (e.key === "Escape") {
    window.location.href = "/";
    e.preventDefault();
  }
}
function handleKeyUp() {
  lastKeyTime = 0;
  lastKey = null;
}

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
        <a href="/">
          &lt;
          <Key key="Esc" enabled />
          Back to Main Menu
        </a>
      </button>
    </div>
    <div class="text-7xl text-center flex items-center justify-center gap-8">
      <!-- 左矢印ボタン -->
      <button
        class="appearance-none focus:outline-none px-4 select-none cursor-pointer {Number(world) <= 1
          ? 'invisible'
          : ''} hover:-translate-y-1 hover:text-gray-700 active:translate-y-0 active:text-black"
        aria-label="前のワールド"
        onclick={() => world !== null && world > 1 && changeStage(world - 1, 1)}
        disabled={Number(world) <= 1}
      >
        &lt;
      </button>
      <span>World {world}</span>
      <!-- 右矢印ボタン -->
      <button
        class="appearance-none focus:outline-none px-4 select-none cursor-pointer {Number(world) >= maxWorld
          ? 'invisible'
          : ''} hover:-translate-y-1 hover:text-gray-700 active:translate-y-0 active:text-black"
        aria-label="次のワールド"
        onclick={() => world !== null && world < maxWorld && changeStage(world + 1, 1)}
        disabled={Number(world) >= maxWorld}
      >
        &gt;
      </button>
    </div>

    <div class="flex justify-center items-center grow-1">
      <div role="button" tabindex="0" class="flex outline-none items-center">
        {#each { length: maxStage } as _, idx}
          <button
            type="button"
            class={`appearance-none focus:outline-none bg-white border-6 pt-8 pb-6 pl-8 pr-6 transition-colors duration-200 text-7xl cursor-pointer ${
              stage === idx + 1
                ? "border-red-500 ring ring-red-500 bg-amber-100!"
                : "border-base"
            }`}
            onclick={() => world !== null && changeStage(world, idx + 1)}
          >
            {idx + 1}
          </button>
          {#if idx + 1 < maxStage}
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
        {#if stage !== null}
          {#key world}
            {#each { length: 4 } as _, idx}
              <img
                src="/assets/thumbnail{world}-{idx + 1}.png"
                alt=""
                class={["h-full skeleton", idx + 1 !== stage && "hidden"]}
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
