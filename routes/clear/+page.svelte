<script>
import { goto } from "$app/navigation";
import { onMount } from "svelte";

let confetti = $state(false);

onMount(() => {
  // Simulate confetti animation
  setTimeout(() => {
    confetti = true;
  }, 100);
});
</script>

<main class="clear-screen">
  <div class="content">
    <h1 class="title">Congratulations!</h1>
    <h2 class="subtitle">You've completed the game!</h2>
    <div class="confetti">
      <div class="confetti-piece" style="--delay: 0s"></div>
      <div class="confetti-piece" style="--delay: 0.1s"></div>
      <div class="confetti-piece" style="--delay: 0.2s"></div>
      <div class="confetti-piece" style="--delay: 0.3s"></div>
      <div class="confetti-piece" style="--delay: 0.4s"></div>
    </div>
    <a class="restart-btn" href="/">
      Play Again
    </a>
  </div>
</main>

<style>
  .clear-screen {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
    color: white;
    overflow: hidden;
    position: relative;
  }

  .content {
    text-align: center;
    padding: 2rem;
  }

  .title {
    font-size: 3rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  }

  .subtitle {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }

  .confetti {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .confetti-piece {
    position: absolute;
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;
    animation: fall 3s ease-in-out forwards;
  }

  .confetti-piece:nth-child(1) { left: 10%; }
  .confetti-piece:nth-child(2) { left: 30%; }
  .confetti-piece:nth-child(3) { left: 50%; }
  .confetti-piece:nth-child(4) { left: 70%; }
  .confetti-piece:nth-child(5) { left: 90%; }

  @keyframes fall {
    from {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 0;
    }
    to {
      transform: translateY(100vh) rotate(360deg);
      opacity: 1;
    }
  }

  .restart-btn {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: white;
    color: #3498db;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .restart-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0,0,0,0.2);
  }
</style>