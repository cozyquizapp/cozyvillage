/**
 * Legt alle Texturen an und startet die Lichtung.
 *
 * Wer ein fertiges Tileset einsetzt, lädt es hier in preload() und
 * überschreibt anschließend dieselben Texturschlüssel. Siehe assets/README.md.
 */

import Phaser from "phaser";
import { makeTextures } from "../art/textures.js";
import { ladeTileset, setzeTileset } from "../art/tileset.js";
import { laden } from "../game/state.js";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    ladeTileset(this);
  }

  create() {
    // Zuerst die Platzhalter, damit nie eine Textur fehlt …
    makeTextures(this);
    // … dann überschreibt das gelieferte Tileset, was es abdeckt.
    const ersetzt = setzeTileset(this);
    if (ersetzt.length) {
      console.info(`Tileset aktiv: ${ersetzt.length} Texturen ersetzt.`);
    }
    laden();
    this.scene.start("Glade");
  }
}
