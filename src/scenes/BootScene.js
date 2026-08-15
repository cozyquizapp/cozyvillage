/**
 * Legt alle Texturen an und startet die Lichtung.
 *
 * Wer ein fertiges Tileset einsetzt, lädt es hier in preload() und
 * überschreibt anschließend dieselben Texturschlüssel. Siehe assets/README.md.
 */

import Phaser from "phaser";
import { makeTextures } from "../art/textures.js";
import { laden } from "../game/state.js";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    // Platz für echte Bilddateien:
    // this.load.image("station-1", "assets/tilesets/<pack>/station.png");
  }

  create() {
    makeTextures(this);
    laden();
    this.scene.start("Glade");
  }
}
