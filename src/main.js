import Phaser from "phaser";
import BootScene from "./scenes/BootScene.js";
import GladeScene from "./scenes/GladeScene.js";
import { VIEW } from "./game/config.js";
import { starteOberflaeche } from "./ui/hud.js";

const spiel = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "spiel",
  width: VIEW.width,
  height: VIEW.height,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: "#0d1811",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, GladeScene]
});

starteOberflaeche();

export default spiel;
