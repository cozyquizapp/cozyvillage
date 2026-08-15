# Auftrag: 2D-Pixel-Asset-Paket für „Fellgrund"

Dieser Text ist so geschrieben, dass er einer anderen KI oder einem
Pixel-Artist unverändert übergeben werden kann.

---

## 0 · Worum es geht

Fellgrund ist ein gemütliches 2D-Pixel-Automationsspiel. Man baut als
erwachsener Wolf einen eigenen kleinen Ort auf, in dem Tiere sichtbar
arbeiten: sammeln, verarbeiten, auf Wagen laden, transportieren. Man steuert
keine Figur, man schaut zu, entscheidet und baut aus.

Der Ort ist eine **Waldlichtung**, die rundum von Wald geschlossen ist. Sie
ist immer vollständig auf einem Bildschirm zu sehen und wird nie verlassen.

Gebraucht wird ein Asset-Paket für die Umgebung, die Gebäude und die
Bewohner. **Die Hauptfigur (ein pinker Wolf in petrolfarbener Latzhose)
existiert bereits und wird nicht neu gezeichnet.**

---

## 1 · Technische Vorgaben — bitte exakt einhalten

| Punkt | Vorgabe |
|---|---|
| Kachelgröße | **16 × 16 Pixel** |
| Perspektive | **3/4-Draufsicht** (wie Stardew Valley), *nicht* isometrisch, *nicht* reine Seitenansicht |
| Format | **PNG mit Alphakanal**, unkomprimiert, ohne Interlacing |
| Kantenbehandlung | **Harte Kanten, kein Anti-Aliasing, keine Verläufe, keine Halbtransparenz.** Jedes Pixel ist entweder voll deckend oder voll durchsichtig |
| Pixelraster | Ein Bildpixel = ein Gestaltungspixel. Keine skalierte Vorlage, keine 2×- oder 4×-Ausgabe |
| Farbtiefe | Feste, begrenzte Palette (siehe Abschnitt 3) |
| Hintergrund | Vollständig transparent, kein Schachbrett, keine Rahmen, keine Wasserzeichen, keine Beschriftungen im Bild |
| Zielauflösung des Spiels | 320 × 180 Pixel Spielfläche |

### Lichtrichtung

**Licht kommt immer von oben links.** Highlight oben und links,
Schattenkante unten und rechts. Das gilt ausnahmslos für jedes Objekt.

### Umriss

**Jedes freistehende Objekt bekommt einen dunklen, fast schwarzen Umriss**
(`#181016`). Bodenkacheln bekommen keinen Umriss.

### Schlagschatten

Jedes stehende Objekt (Baum, Gebäude, Figur, Stein) bekommt am Fuß eine
**flache dunkle Ellipse**, leicht nach rechts unten versetzt, als eigene
Ebene bzw. direkt eingezeichnet. Ohne Schatten wirken die Objekte wie
Aufkleber.

---

## 2 · Dateistruktur der Lieferung

```
fellgrund-tileset/
  LIZENZ.txt                 ← zwingend, siehe Abschnitt 7
  boden.png                  Bodenkacheln, 16×16 im Raster
  natur.png                  Bäume, Büsche, Steine, Blumen
  gebaeude.png               Gebäude und Stationen
  gueter.png                 Kisten, Fässer, Güter, Schienen
  bewohner_<name>.png        je Tier ein Spritesheet
  vorschau.png               eine Übersichtsgrafik aller Teile
```

Jede Datei ist ein **gleichmäßiges Raster**. Die Rasterweite steht im
Dateinamen, wenn sie von 16 abweicht, z. B. `gebaeude_32.png`.
Keine unregelmäßigen Atlanten, kein Packing, keine JSON-Beschreibung nötig.

---

## 3 · Farbpalette

Bitte **genau diese Palette** verwenden. Sie ist eine warme Nachtpalette:
gesättigtes Grün, warmes Holz, goldenes Laternenlicht.

**Umriss und Tiefe**
`#181016` `#1F4028` `#284833`

**Gras** (hell → dunkel)
`#79AC63` `#5D9153` `#487646` `#37603C`

**Wald / Laub**
`#77BE6D` `#4E9455` `#357045` `#1F4028`
dunkle Waldrandvariante: `#31663D` `#265232` `#1B3C25` `#0F2417`

**Erde und Weg**
`#B5A177` `#9A8862` `#6E6046` `#8A6942` `#6B4F33` `#453017`

**Holz**
`#D2A468` `#BC8F55` `#96693C` `#5E4227`

**Dach / Ziegel**
`#C9765A` `#A85440` `#7A3A2B`

**Stein**
`#B7BCA7` `#98A08B` `#66705A` `#333B2E`

**Wasser**
`#93CFE0` `#4E93A8` `#31708C` `#204C60`

**Licht und Akzente**
`#FFDC96` (Laterne) `#FFD05C` (Beere) `#FFF2C0` (Glanz)

**Wangenröte aller Tiere**
`#F0885E`

Wenn eine Farbe fehlt, bitte eine **neue Farbe aus derselben Familie**
ergänzen und in `LIZENZ.txt` dokumentieren — nicht einfach heller oder
dunkler rechnen.

---

## 4 · Inhaltsliste

### 4.1 `boden.png` — Bodenkacheln, 16 × 16

Jede Bodenart als **vollständiges Übergangsset** (9 Kacheln: vier Ecken,
vier Kanten, eine Mitte), plus zwei Variationskacheln für die Mitte, damit
große Flächen nicht gleichmäßig aussehen.

1. **Gras** — die Grundfläche der Lichtung
2. **Trampelpfad** aus heller Erde, für die Wege der Tiere
3. **Erde / Beet**, dunkel und umgegraben
4. **Wasser** für einen Teich, mit Uferkanten zum Gras
5. **Steinplatten** für spätere befestigte Plätze

Dazu als lose Einzelkacheln (kein Übergangsset nötig):
- 6 Grasbüschel-Varianten (unterschiedliche Höhe und Helligkeit)
- 6 Blumen-Varianten in Rosa, Hellgelb und Flieder
- 4 Kiesel-Varianten
- 3 Erdflecken

### 4.2 `natur.png` — Bewuchs

Bitte je Objekt **eine deutlich eigene Silhouette** — nicht dieselbe Form in
drei Größen. Unregelmäßigkeit ist ausdrücklich erwünscht: eine Krone, die
links weiter ausbeult als rechts, ein leicht schiefer Stamm.

| Objekt | Größe | Anzahl Varianten |
|---|---|---|
| Laubbaum, hell (steht in der Lichtung) | 32 × 48 | 4 |
| Laubbaum, dunkel (bildet den Waldrand) | 32 × 48 | 4 |
| Nadelbaum, dunkel | 32 × 48 | 3 |
| Busch | 16 × 16 | 4 |
| Beerenbusch mit leuchtenden Beeren | 16 × 16 | 3 Leuchtstufen derselben Pflanze |
| Baumstumpf | 16 × 16 | 2 |
| Findling / Stein | 16 × 16 und 32 × 16 | je 2 |
| Farn, Pilzgruppe | 16 × 16 | je 2 |
| Seerosenblatt fürs Wasser | 16 × 16 | 2 |

### 4.3 `gebaeude.png` — Gebäude und Stationen

**Wichtigste Regel dieses Abschnitts:** Die Produktion muss sichtbar sein.
Deshalb sind das **keine geschlossenen Häuser**, sondern **offene
Arbeitsplätze unter Vordächern** — eine Werkbank mit Dach auf vier Pfosten,
ein Regal unter einer Plane, ein Marktstand. Man muss das arbeitende Tier
und die Güter sehen können.

Jedes Gebäude in **drei Ausbaustufen**, die sichtbar aufeinander aufbauen —
Stufe 2 ist erkennbar dieselbe Stelle wie Stufe 1, nur weiter gediehen.

| Gebäude | Größe | Stufen | Beschreibung |
|---|---|---|---|
| Verladestation | 32 × 32 → 48 × 40 | 3 | Holzplattform mit Kistenplätzen. Stufe 2 bekommt ein Vordach, Stufe 3 einen Kran oder eine Rampe |
| Vorratsstand | 64 × 48 | 3 | Offener Unterstand auf Pfosten, darunter **drei Regalbretter**, auf denen Kisten stehen. Die Regalbretter müssen leer zeichenbar sein — Kisten werden im Spiel einzeln daraufgesetzt |
| Werkstatt | 48 × 40 | 3 | Werkbank unter einem Dach, Werkzeug an der Rückwand |
| Küche | 48 × 40 | 3 | Offene Feuerstelle mit Topf und Ablage |
| Wasserbecken / Quelle | 48 × 32 | 3 | Gefasstes Becken mit Zulaufrinne |
| Nest der Hauptfigur | 40 × 24 | 3 | Flache Mulde aus Moos und Zweigen, von oben gesehen. **Zusätzlich als eigene Datei ein „vorderer Rand"** (nur der untere Bogen der Mulde), damit die Figur sichtbar darin liegen kann |
| Schlafplatz für Bewohner | 32 × 24 | 2 | kleinere Mulde oder Korb |
| Laterne auf Pfosten | 16 × 32 | 2 | zwei Zustände: hell und etwas gedimmt, für flackerndes Licht |

### 4.4 `gueter.png` — Güter und Wege

- **Kiste**, 8 × 8 — das wichtigste Einzelteil des ganzen Spiels. Sie wird
  getragen, gestapelt, geladen und ins Regal gestellt. Sie muss auf hellem
  Gras **und** auf dunklem Holz lesbar sein
- Kiste in **drei Füllzuständen** (leer, halb, voll leuchtend)
- Fass 12 × 12, Sack 10 × 10, Korb 12 × 10
- **Schienenstück**, 16 × 16, waagerecht: Schotterbett, Schwellen, zwei
  Schienenstränge mit Lichtkante oben
- Schienen-Endstück mit Prellbock
- **Wurzelwagen**, 24 × 16, Seitenansicht, offene Ladefläche, zwei Räder.
  Zusätzlich zwei Radstellungen für eine einfache Fahranimation
- Wegweiser, Zaunstück, Torbogen — je 16 × 16

### 4.5 `bewohner_<name>.png` — die Tiere

Ein Spritesheet je Tier. **Rasterweite 32 × 32**, Figur mittig, Füße auf der
unteren Rasterkante.

Benötigte Tiere: **Biber, Eichhörnchen, Axolotl, Biene, Maulwurf.**

Je Tier folgende Zeilen im Spritesheet, jede Zeile eine Blickrichtung:

| Zeile | Inhalt | Bilder |
|---|---|---|
| 1 | Stehen und Gehen, **nach vorn** | 4 |
| 2 | Stehen und Gehen, **nach rechts** | 4 |
| 3 | Stehen und Gehen, **nach hinten** | 4 |
| 4 | **Arbeiten** (bücken, hacken, greifen), nach vorn | 4 |
| 5 | **Tragen** — dieselbe Gehanimation, aber mit erhobenen Armen, sodass eine 8 × 8-Kiste davor passt | 4 |
| 6 | Schlafen / Ruhen | 2 |

Nach links wird im Spiel gespiegelt — bitte **keine** eigene Linkszeile.

**Figurenregel für alle Tiere** (damit die Besetzung wie eine Familie wirkt):

- fast schwarzer Umriss `#181016` rundherum
- höchstens **fünf Farben** pro Figur
- **zwei Pixel Wangenröte** in `#F0885E`
- **großer Kopf, kleiner Körper** — der Kopf ist etwa 45 % der Figurenhöhe
- Augen als einfache dunkle Punkte oder geschlossene Bögen, kein Weiß
- Was ein Tier unterscheidet, sind **Silhouette und Grundfarbe** — niemals
  ein höherer Detailgrad

---

## 5 · Was ausdrücklich **nicht** geliefert werden soll

- Keine Menschen, keine Waffen, keine Kampf- oder Gefahrenmotive
- Keine Benutzeroberfläche, keine Knöpfe, keine Schrift, keine Zahlen
- Keine geschlossenen Wohnhäuser mit Tür und Fenster als Produktionsgebäude
  (siehe 4.3 — Produktion muss einsehbar sein)
- Keine isometrischen Kacheln
- Keine weichgezeichneten oder „HD"-Fassungen
- Keine Rahmen, Schlagschatten-Effekte oder Wasserzeichen im Bild
- Keine Hauptfigur (der pinke Wolf existiert bereits)

---

## 6 · Prüfliste vor der Abgabe

1. Enthält jede PNG-Datei **nur** volle oder gar keine Deckung — keine
   halbtransparenten Randpixel?
2. Sitzt jedes Objekt sauber im Raster, mit den Füßen auf der unteren Kante?
3. Kommt das Licht bei **jedem** Objekt von oben links?
4. Hat jedes stehende Objekt einen Schlagschatten?
5. Stammen alle Farben aus der Palette in Abschnitt 3?
6. Sind die Baumkronen **unterschiedlich geformt** — nicht dieselbe Form in
   mehreren Größen?
7. Ist die 8 × 8-Kiste sowohl auf `#487646` (Gras) als auch auf `#96693C`
   (Holz) klar erkennbar?
8. Liegt `LIZENZ.txt` bei?

---

## 7 · Lizenz — bitte unbedingt beantworten

`LIZENZ.txt` muss enthalten:

- unter welcher Lizenz das Paket steht (bevorzugt **CC0** oder
  **CC-BY 4.0**)
- ob **kommerzielle Nutzung** erlaubt ist
- ob **Namensnennung** verlangt wird, und falls ja, in welchem Wortlaut
- ob Teile aus fremden Quellen stammen, und falls ja, aus welchen

Ohne diese Angaben ist das Paket für das Projekt nicht verwendbar.

---

## 8 · Einbau ins Spiel

Das fertige Paket kommt nach `assets/tilesets/<paketname>/`. Wie es
verdrahtet wird, steht in `assets/README.md`. Die Spiellogik muss dafür
nicht angefasst werden.
