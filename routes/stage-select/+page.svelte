<script lang="ts">
import Key from "@/ui-components/Key.svelte";
import { onMount } from "svelte";
interface Block {
  label: string;
  link: string;
}

const blocks: Block[] = [
  { label: "1", link: "/game?stage=1" },
  { label: "2", link: "/game?stage=2" },
  { label: "3", link: "/game?stage=3" },
  { label: "4", link: "/game?stage=4" },
];
// ToDo: リンクを実際の仕様にする
// ToDo: ステージのサムネイルを選択しているBlockに応じて変更する

let selected = 0;
let lastKeyTime = 0;
const KEY_REPEAT_DELAY = 180; // ms

function handleKey(e: KeyboardEvent): void {
  const now = Date.now();
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    if (now - lastKeyTime < KEY_REPEAT_DELAY) {
      return;
    }
    lastKeyTime = now;
  }

  if (e.key === "ArrowRight") {
    selected = (selected + 1) % blocks.length;
  } else if (e.key === "ArrowLeft") {
    selected = (selected - 1 + blocks.length) % blocks.length;
  } else if (e.key === "Enter" || e.key === " ") {
    window.location.href = blocks[selected].link;
  }
}

function handleClick(index: number): void {
  selected = index;
}

let container: HTMLDivElement | null = null;

onMount(() => {
  container?.focus();
});
</script>

<div class="p-10 text-8xl text-center">＜ W2 ＞</div>
<div class="flex justify-center items-center h-64">
  <div
    bind:this={container}
    role="button"
    tabindex="0"
    on:keydown={handleKey}
    class="flex outline-none items-center"
  >
    {#each blocks as block, i}
      <button
        type="button"
        class={`border-6 pt-8 pb-6 pl-8 pr-6 transition-colors duration-200 text-7xl cursor-pointer ${
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
<div class="relative flex justify-center items-center h-96 mb-10">
  <!-- 画像を中央に配置 -->
  <img src="/assets/thumbnaildev.png" alt="" class="h-80 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
  <!-- テキストを画像の右側に配置 -->
  <div class="absolute left-1/2 top-1/2 -translate-y-1/2 ml-80 flex flex-col items-start">
    Press <Key key="Enter" enabled /> or <Key key="Space" enabled /> to start
  </div>
</div>