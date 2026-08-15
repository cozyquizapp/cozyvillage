# Grafik einsetzen

Die gesamte Grafik entsteht zurzeit in `src/art/textures.js` als Platzhalter.
Der Rest des Spiels kennt ausschließlich **Texturschlüssel** – ein fertiges
Tileset lässt sich einsetzen, ohne die Spiellogik anzufassen.

## Ein Paket hinzufügen

1. Paket nach `assets/tilesets/<paketname>/` legen, **einschließlich der
   Lizenzdatei**.
2. In `src/scenes/BootScene.js` in `preload()` laden.
3. Die Aufrufe in `makeTextures()` für die ersetzten Teile entfernen.

Beispiel:

```js
preload() {
  this.load.spritesheet("boden", "assets/tilesets/mein-pack/boden.png",
    { frameWidth: 16, frameHeight: 16 });
  this.load.image("store", "assets/tilesets/mein-pack/vorratsstand.png");
}
```

## Belegte Texturschlüssel

| Schlüssel | Inhalt | Ursprung im Bild |
|---|---|---|
| `bg` | fertige Hintergrundfläche 320 × 180 | Wald, Lichtung, Teich, Weg, Schienen |
| `bush-0..2` | Beerenbusch, drei Leuchtstufen | Glühbeerenbeet |
| `station-1`, `station-2` | Verladestation vor und nach dem Ausbau | Fußpunkt unten mittig |
| `store` | Vorratsstand, Regalbretter leer | Kisten werden einzeln gesetzt |
| `crate` | Kiste 8 × 8 | wird getragen, gestapelt, geladen |
| `cart` | Wurzelwagen | Seitenansicht |
| `beaver-0`, `beaver-1` | Bramble, zwei Laufbilder | |
| `wolf-sleep`, `wolf-stand` | Cozywolf | bleibt eigene Figur |
| `nest`, `nest-rim` | Nestmulde und vorderer Rand | Rand liegt über der Figur |
| `tree-0..2`, `tree-0..2-d` | Bäume hell und dunkel | dunkel bildet den Waldrand |
| `shrub`, `shrub-d`, `rock` | Streuobjekte | |
| `lamp`, `blossom`, `parcel`, `spark` | Laterne, Herzknospe, freie Parzelle, Funke | |

Alle Texturen haben ihren **Fußpunkt unten mittig** (`setOrigin(0.5, 1)`),
weil die Tiefensortierung über die y-Koordinate des Fußpunkts läuft.

## Auftrag für neue Grafik

`AUFTRAG-TILESET.md` enthält einen vollständigen Auftrag, der unverändert an
einen Pixel-Artist oder eine andere KI übergeben werden kann: Perspektive,
Kachelgröße, Palette, Inhaltsliste, Figurenregeln, Prüfliste und die
Lizenzfragen, die beantwortet sein müssen.

## Lieferung prüfen

Bevor ein Paket eingebaut wird, misst der Prüfer die technischen Vorgaben
objektiv statt nach Augenmaß:

```bash
npm run pruefe assets/tilesets/<paket>
```

Er meldet je Datei die tatsächlichen Pixelmaße, die Anzahl der Farben, die
Zahl halbtransparenter Randpixel und alle Farben außerhalb der Palette.
Damit lassen sich die beiden Fehler aus Abschnitt 0.5 des Auftrags in
Sekunden erkennen — Anti-Aliasing am Rand und hochaufgelöste Zeichnung mit
Pixel-Optik.

Rückgabewert 0 heißt bestanden, 1 heißt: mindestens eine Datei hat Fehler.

## Lizenzhinweis

Nur Pakete verwenden, deren Lizenz kommerzielle Nutzung erlaubt.
**CC0** (etwa Kenney.nl) ist unbedenklich und verlangt keine Namensnennung.
Bei Paketen von itch.io ist die Lizenz je Paket verschieden – die
Lizenzdatei gehört immer mit ins Repository.
