import { AnimatedSprite, Assets, Texture } from "pixi.js";

// assets

// entities
export const characterNormalTexture = await Assets.load("/assets/character-normal.png");
export const characterCtrlTexture = await Assets.load("/assets/character-ctrl.png");
export const characterActivatedTexture = await Assets.load("/assets/character-activated.png");

// blocks
export const rockTexture = await Assets.load("/assets/block.png");
export const fallableTexture = await Assets.load("/assets/woodenbox.png");
export const switchTexture = await Assets.load("/assets/switch.png");
export const switchBaseTexture = await Assets.load("/assets/switch-base.png");
export const switchPressedTexture = await Assets.load("/assets/switch-pressed.png");
export const goalTextures = await Assets.load(["/assets/goal-1.png", "/assets/goal-2.png"]);
export const spikeTexture = await Assets.load("/assets/spike.png");
export const laserTextureUp = await Assets.load("/assets/laserUp.png");
export const laserTextureDown = await Assets.load("/assets/laserDown.png");
export const laserTextureLeft = await Assets.load("/assets/laserLeft.png");
export const laserTextureRight = await Assets.load("/assets/laserRight.png");
export const laserBeamTexture = await Assets.load("/assets/laserBeam.png");

// UI
export const highlightTexture = await Assets.load("/assets/highlight.png");
export const highlightHoldTexture = await Assets.load("/assets/highlight-hold.png");
export const highlightErrorTexture = await Assets.load("/assets/highlight-error.png");
export const tutorialImg1 = await Assets.load("/assets/tutorial1.png");
export const tutorialImg2 = await Assets.load("/assets/tutorial2.png");
export const tutorialImg3 = await Assets.load("/assets/tutorial3.png");
