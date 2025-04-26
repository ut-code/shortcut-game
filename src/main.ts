import { Application, Assets, Container, Sprite } from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "white", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const stageContainer = new Container();
  app.stage.addChild(stageContainer);
  const rockTexture = await Assets.load("/assets/block.png");

  for (let i = 0; i < 10; i++) {
    const rock = new Sprite(rockTexture);

    rock.width = 30;
    rock.height = 30;
    rock.x = (i % 5) * 40;
    rock.y = Math.floor(i / 5) * 40;
    stageContainer.addChild(rock);
  }

  stageContainer.x = app.screen.width / 2;
  stageContainer.y = app.screen.height / 2;
  // Load the bunny texture
  const texture = await Assets.load("/assets/bunny.png");

  // Create a bunny Sprite
  const bunny = new Sprite(texture);

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Move the sprite to the center of the screen
  bunny.position.set(app.screen.width / 2 + 30, app.screen.height / 2 - 20);

  // Add the bunny to the stage
  app.stage.addChild(bunny);

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      bunny.x -= 10;
    }
    if (event.key === "ArrowRight") {
      bunny.x += 10;
    }
    console.log(event.key);
    if (bunny.x >= app.screen.width / 2 + 200) {
      app.stage.removeChild(bunny);
    }
    return;
  });
  // Listen for animate update
})();
