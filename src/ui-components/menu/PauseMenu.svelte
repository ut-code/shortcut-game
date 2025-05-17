<script lang="ts">
import "./menu.css";
type Props = {
  paused: boolean;
  alreadyStopped: boolean;
  onresume: () => void;
  onpause: () => void;
  onreset: () => void;
};
let { paused, alreadyStopped, onresume, onpause, onreset }: Props = $props();
let el: HTMLDialogElement;
$effect(() => {
  if (paused && !alreadyStopped) {
    el.showModal();
  } else {
    el.close();
  }
});

document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape")
    if (!paused && !alreadyStopped) {
      onpause();
      ev.preventDefault();
    }
});
</script>

<dialog bind:this={el} onclose={onresume} class="modal">
  <div class="modal-box flex flex-col gap-1">
    <h1 class="text-4xl text-center my-6">Paused</h1>
    <form method="dialog" class="w-full">
      <button class="btn modal-btn" type="submit">Resume</button>
    </form>
    <button class="btn modal-btn" onclick={() => onreset()}>Restart</button>
    <a class="btn modal-btn" href="/"> Back to Stage Select </a>
  </div>
</dialog>
