<script lang="ts">
import { page } from "$app/stores";
import Key from "@/ui-components/Key.svelte";
import { onMount } from "svelte";
import { get } from "svelte/store";

// クエリからwを取得、なければ"1"
$: w = get(page).url.searchParams.get("w") ?? "1";

// wに応じてblocksを生成
$: blocks = [
  { label: "1", link: `/game?stage=${w}-1` },
  { label: "2", link: `/game?stage=${w}-2` },
  { label: "3", link: `/game?stage=${w}-3` },
  { label: "4", link: `/game?stage=${w}-4` },
];

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

// Todo?: ワールド選択の矢印をクリックすると、矢印キーを押してもステージが移動できない(＝ブロックをクリックする必要あり)
// TODO?: Enterキーを押すと、カーソルがある場所のブロックの色が変わる(正しいステージには飛ぶから実害はない)
// Todo: 画像をステージごとに変える
// TODO: ゲームメニューからstage-selectに飛ばす
</script>

<div class="p-10 text-8xl text-center flex items-center justify-center gap-8">
  <!-- 左矢印ボタン -->
  <button
    class="px-4 select-none cursor-pointer"
    aria-label="前のワールド"
    on:click={() => {
      // wを数値として1減らす（1未満にはしない）
      const next = Math.max(1, Number(w) - 1);
      const url = new URL(window.location.href);
      url.searchParams.set("w", String(next));
      window.location.href = url.toString();
    }}
    disabled={Number(w) <= 1}
  >
    &lt;
  </button>
  <span>W{w}</span>
  <!-- 右矢印ボタン -->
  <button
    class="px-4 select-none cursor-pointer"
    aria-label="次のワールド"
    on:click={() => {
      // wを数値として1増やす（4より大きくしない）
      const next = Math.min(4, Number(w) + 1);
      const url = new URL(window.location.href);
      url.searchParams.set("w", String(next));
      window.location.href = url.toString();
    }}
    disabled={Number(w) >= 4}
  >
    &gt;
  </button>
</div>

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