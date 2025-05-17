<script lang="ts">
type Props = {
  paused: boolean;
  onresume: () => void;
  onpause: () => void;
  onreset: () => void;
};
let { paused, onresume, onpause, onreset }: Props = $props();
let el: HTMLDialogElement;
$effect(() => {
  if (paused) {
    el.showModal();
  } else {
    el.close();
  }
});

document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape")
    if (!paused) {
      onpause();
      ev.preventDefault();
    }
});
</script>

<dialog bind:this={el} onclose={onresume} class="modal">
  <div class="uiBackground modal-box flex flex-col gap-1">
    <h1 class="text-4xl text-center">Paused</h1>
    <!-- todo: ボタンのスタイル -->
    <form method="dialog" class="w-full">
      <button style="font-size: 1.5rem;" class="btn btn-block" type="submit">
        Resume
      </button>
    </form>
    <!-- TODO; これもうちょいパフォーマンスいいやつにしたい -->
    <button
      style="font-size: 1.5rem;"
      class="btn btn-block"
      onclick={() => {
        onreset();
      }}
    >
      Restart
    </button>
    <a style="font-size: 1.5rem;" class="btn btn-block" href="/">
      Back to Stage Select
    </a>
  </div>
</dialog>

<style>
  .uiBackground {
    background: oklch(82.8% 0.189 84.429 / 40%);
    backdrop-filter: blur(2px);
    padding: 0.75rem 1rem;
  }
</style>
