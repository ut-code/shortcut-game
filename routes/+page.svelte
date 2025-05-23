<!-- <h1>Welcome!</h1>

<section>
  <h2>World 1</h2>
  <a href="/game?stage=1">Stage 1</a>
  <a href="/game?stage=2">Stage 2</a>
  <a href="/game?stage=3">Stage 3</a>
  <a href="/game?stage=4">Stage 4</a>
  <a href="/game?stage=5">Stage 5</a>
  <a href="/game?stage=6">Stage 6</a>
  <a href="/game?stage=7">Stage 7</a>
  <a href="/game?stage=8">Stage 8</a>
</section>

<section>
  <h2>World 3</h2>
  <a href="/game?stage=3-1">Stage 1</a>
  <a href="/game?stage=3-2">Stage 2</a>
  <a href="/game?stage=3-3">Stage 3</a>
  <a href="/game?stage=3-4">Stage 4</a>
</section>

<section>
  <h2>World 4</h2>
  <a href="/game?stage=4-1">Stage 1</a>
  <a href="/game?stage=4-2">Stage 2</a>
</section>

<p>
  <a href="/stage-select">Stage-Select</a>
</p> -->

<script lang="ts">
import { onDestroy } from "svelte";

onDestroy(() => {
  // document.body.style.backgroundColor = "black";
});
</script>

<div id="container" class="fixed inset-0">
  <div class="fixed inset-0 backdrop-blur-xs">
    <div class="flex flex-col gap-5 mt-30 m-10 p-5 bg-yellow-400/85 rounded-lg">
      <h1 class="text-center mt-6 mb-2">Shortcut Game</h1> <!--TODO: 題名-->
      <a class="btn modal-btn text-2xl" href="/game?stage=1"> Start </a>
      <a class="btn modal-btn text-2xl" href="/stage-select"> Stage Select </a>
      <p class="bg-white/90 p-2 rounded-lg">
        Move: &#x21E6; &#x21E8;	or A D<br />
        Jump: &#x21E7; or W or Space<br />
        Ability: Ctrl + ?
      </p>
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
