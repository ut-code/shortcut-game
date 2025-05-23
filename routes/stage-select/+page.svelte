<script lang="ts">
import Key from "@/ui-components/Key.svelte";
import { onMount } from "svelte";
import "@/ui-components/menu/menu.css";
import { goto } from "$app/navigation";
import { MAX_WORLD, SearchParamState } from "./params.svelte.ts";

const search = $state(new SearchParamState());
onMount(() => {
  const params = new URLSearchParams(window.location.search);
  search.world = Number(params.get("world") || "1");
  search.selected = Number(params.get("selected") || "1");
});

const blocks = $derived(
  new Array(search.maxStage).fill(null).map((_, idx) => ({
    label: `${search.world}-${idx + 1}`,
    link: `/game?stage=${search.world}-${idx + 1}`,
    thumbnail: `/assets/thumbnail${search.world}-${idx + 1}.png`,
  })),
);

let lastKeyTime = 0;
let lastKey: string | null = null;
const KEY_REPEAT_DELAY = 180; // ms

function handleKey(e: KeyboardEvent): void {
  const now = Date.now();
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    if (lastKey === e.key && now - lastKeyTime < KEY_REPEAT_DELAY) {
      return;
    }
    lastKeyTime = now;
    lastKey = e.key;
  }

  if (search.selected === null) {
    return;
  }

  if (e.key === "ArrowRight") {
    search.selected += 1;
  } else if (e.key === "ArrowLeft") {
    search.selected -= 1;
  } else if (e.key === "Enter" || e.key === " ") {
    goto(`/game?stage=${search.world}-${search.selected}`);
  } else if (e.key === "Escape") {
    goto("/");
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
        class={[
          "appearance-none focus:outline-none px-4 select-none cursor-pointer",
          (search.world === null || search.world <= 1) && "invisible",
          "hover:-translate-y-1 hover:text-gray-700 active:translate-y-0 active:text-black",
        ]}
        onclick={() => search.world !== null && search.world--}
        disabled={search.world === null || search.world <= 1}
      >
        &lt;
      </button>
      <span>World {search.world}</span>
      <!-- 右矢印ボタン -->
      <button
        aria-label="次のワールド"
        onclick={() => search.world !== null && search.world++}
        disabled={search.world === null || search.world >= MAX_WORLD}
        class={[
          "appearance-none focus:outline-none px-4 select-none cursor-pointer",
          (search.world === null || search.world >= MAX_WORLD) && "invisible",
          "hover:-translate-y-1 hover:text-gray-700 active:translate-y-0 active:text-black",
        ]}
      >
        &gt;
      </button>
    </div>

    <div class="flex justify-center items-center grow-1">
      <div role="button" tabindex="0" class="flex outline-none items-center">
        {#each blocks as block, idx}
          {@const stage = idx + 1}
          <button
            type="button"
            class={`appearance-none focus:outline-none bg-white border-6 pt-8 pb-6 pl-8 pr-6 transition-colors duration-200 text-7xl cursor-pointer ${
              search.selected === stage
                ? "border-red-500 ring ring-red-500 bg-amber-100!"
                : "border-base"
            }`}
            onmouseenter={() => (search.selected = stage)}
            onclick={() => goto(block.link)}
          >
            {block.label}
          </button>
          {#if stage < search.maxStage}
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
        {#if search.selected !== null}
          {#key search.world}
            {#each blocks as block, idx}
              {@const stage = idx + 1}
              <img
                src={block.thumbnail}
                alt=""
                class={[
                  "h-full skeleton",
                  stage !== search.selected && "hidden",
                ]}
              />
            {/each}
          {/key}
        {/if}
      </div>
      <!-- テキストを画像の右側に配置 -->
      <div
        class="flex-none w-70 max-h-full bg-white/90 p-4 m-4 rounded-lg border-2"
      >
        <div>Click,</div>
        <div>
          Press <Key key="Enter" enabled />
        </div>
        <div>or Press <Key key="Space" enabled /></div>
        <div>To Start</div>
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
