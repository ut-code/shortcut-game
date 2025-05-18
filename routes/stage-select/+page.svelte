<style>
  .container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #e03333;
  }

  .top {
    height: 50%;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    background-color: #d00777;
  }

  .gallery {
    display: flex;
    height: 100%;
    padding: 1rem;
    gap: 1rem;
  }

  .gallery img {
    height: 100%;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .bottom {
    height: 50%;
    overflow: hidden;
    background-color: #e0f7fa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }
  .block-container {
  display: flex;
  align-items: center;
  gap: 40px; /* ブロック間のスペース */
  position: relative;
  padding: 20px;
}

.block {
  position: relative;
  background: #f0f0f0;
  border: 2px solid #888;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1.2rem;
  font-weight: bold;
}

/* 線の描画 */
.block:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 50%;
  right: -20px;
  width: 40px;
  height: 2px;
  background-color: #555;
  transform: translateY(-50%);
}

</style>

<div class="container">
  <div class="top">
<div><div class="block-container">
  <div class="block">1</div>
  <div class="block">2</div>
  <div class="block">3</div>
  <div class="block">4</div>
</div>
</div>
  </div>

  <div class="bottom">
    <p>下半分の固定</p>
  </div>
</div>


