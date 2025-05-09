<script lang="ts">
type Props = {
  paused: boolean;
  onresume: () => void;
  onpause: () => void;
};
const { paused, onresume, onpause }: Props = $props();
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

<dialog bind:this={el} onclose={onresume}>
  <div class="uiBackground menu">
    <span style="font-size: 2rem;">Paused</span>
    <!-- todo: ボタンのスタイル -->
    <form method="dialog">
      <button style="font-size: 1.5rem;" type="submit"> Resume </button>
    </form>
    <!-- TODO; これもうちょいパフォーマンスいいやつにしたい -->
    <button style="font-size: 1.5rem;" onclick={() => window.location.reload()}>
      Restart
    </button>
    <a style="font-size: 1.5rem;" href="/"> Back to Stage Select </a>
  </div>
</dialog>

<style>
  .uiBackground {
    background: oklch(82.8% 0.189 84.429 / 40%);
    backdrop-filter: blur(2px);
    padding: 0.75rem 1rem;
  }
  .menu {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    margin: auto;
    align-items: center;
    width: max-content;
    height: max-content;
    gap: 0.5rem;
    border-radius: 1rem;
  }
</style>
