<script lang="ts">
import { onMount } from "svelte";
interface Block {
  label: string;
  link: string;
}

const blocks: Block[] = [
  { label: "1", link: "/page1" },
  { label: "2", link: "/page2" },
  { label: "3", link: "/page3" },
  { label: "4", link: "/page4" },
];

let selected = 0;

function handleKey(e: KeyboardEvent): void {
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

<div class="p-10 text-8xl">W2</div>
<div class="flex justify-center items-center h-64">
<div
  bind:this={container}
  role="button"
  tabindex="0"
  on:keydown={handleKey}
  class="flex gap-4 outline-none"
>
  {#each blocks as block, i}
    <button
      type="button"
      class={`border-6 pt-8 pb-6 pl-8 pr-6  m-10 transition-colors duration-200 text-7xl ${
        selected === i ? 'border-primary ring ring-primary' : 'border-base'
      }`}
      on:click={() => handleClick(i)}
    >
      {block.label}
    </button>
  {/each}
</div></div>
<div class="flex justify-center items-center">
  <img src="/assets/thumbnaildev.png" alt="" />
  <p>Enter</p>
</div>