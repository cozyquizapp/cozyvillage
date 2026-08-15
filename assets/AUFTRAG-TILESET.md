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

Gebraucht wird ein Asset-Paket für die Umgebung, die Gebäude, die Bewohner
und die Hauptfigur. Die Hauptfigur ist ein **pinker Wolf in petrolfarbener
Latzhose**; für sie liegt eine Vorlage bei, nach der sie neu gezeichnet wird
(siehe 4.7).

### Reihenfolge der Lieferung

Bitte **nicht alles auf einmal** liefern. Zuerst eine kleine **Stilprobe**,
damit ein Missverständnis über Perspektive, Palette oder Kantenschärfe
zwanzig Teile kostet und nicht zweihundert:

**Stilprobe (Batch 1):** Graskacheln mit Übergangsset · zwei Laubbäume
(einer hell, einer dunkel) · Beerenbusch in drei Leuchtstufen · Kiste 8 × 8 ·
Verladestation Stufe 1 · Wurzelwagen · Schienenstück · Biber, nur Zeile 1
und Zeile 5 · Wasser-Mitte mit vier Bildern.

Erst nach Freigabe der Stilprobe folgt der Rest.

---

## 0.5 · Stilrichtung

Der Ton ist **freundlich, warm, nächtlich**. Gesucht wird kein realistischer
Wald, sondern ein Ort, an dem man gerne wäre.

Drei Dinge sind ausdrücklich erwünscht:

1. **Die Besetzung wirkt wie eine Familie.** Alle Tiere teilen Kopfgröße,
   Umrissstärke und Freundlichkeit. Was sie unterscheidet, ist Silhouette
   und Grundfarbe.
2. **Jedes Tier hält sein Werkzeug in der Hand.** Der Biber ein Holzscheit,
   der Maulwurf Schaufel und Grubenhelm, die Biene eine Blüte, die Eule ihr
   Buch. Die Aufgabe muss ohne ein Wort Text erkennbar sein.
3. **Warmes Licht in dunkler Umgebung.** Laternen glühen, Fenster leuchten,
   Beeren schimmern. Das Licht zeigt, wo etwas passiert.

### Zwei Fehler, die aussehen wie richtig

Beide sind auf den ersten Blick nicht zu erkennen und machen ein Paket
trotzdem unbrauchbar.

**Fehler 1 — gemischte Perspektive.** Es passiert leicht, dass Figuren
frontal, Bodenkacheln flach von oben und Fahrzeuge oder Gebäude
*isometrisch* gezeichnet werden. Ein isometrischer Wagen lässt sich in einer
3/4-Draufsicht nicht platzieren.

> **Prüfregel:** Hat ein Objekt eine sichtbare Ecke, an der zwei Wände im
> gleichen Winkel wegkippen, ist es isometrisch und damit falsch. In der
> 3/4-Draufsicht sieht man die Vorderseite und etwas vom Dach — nie eine
> Seitenwand im 45-Grad-Winkel. Ein Kreis am Boden ist eine flache Ellipse,
> keine Raute.

**Fehler 2 — hochaufgelöste Zeichnung mit Pixel-Optik.** Bilder mit vielen
Zwischentönen und weichen Rändern sehen aus wie Pixel-Art, sind aber keine.
Auf 32 Pixel Figurenhöhe wird daraus Matsch.

> **Prüfregel:** Beim Hineinzoomen auf einen Rand darf **kein** weicher
> Übergang zwischen zwei Farben sichtbar sein — nur eine harte Kante.
> Bitte direkt in der Zielauflösung zeichnen, nicht herunterrechnen.

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
  bewegt.png                 Wasser, Licht, Pflanzen als Bildfolgen
  bewohner_<name>.png        je Tier ein Spritesheet
  bewohner_eule.png          die Eule, abweichender Aufbau
  cozywolf.png               die Hauptfigur nach beigelegter Vorlage
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

### 4.4b Bewegte Teile — Wasser, Licht, Pflanzen

Die Karte darf nie wie ein gemalter Hintergrund wirken. Diese Teile werden
deshalb **als Bildfolgen** geliefert, nicht als Einzelbild. Jede Folge ist
eine **nahtlose Schleife**: Das letzte Bild geht ohne Sprung ins erste über.

| Teil | Größe | Bilder | Bewegung |
|---|---|---|---|
| Wasseroberfläche, Mitte | 16 × 16 | 4 | ruhiges Glitzern, ein bis zwei Pixel wandern seitlich |
| Wasser-Ufer, ganzes Übergangsset | 16 × 16 | 4 je Kachel | die Schaumkante am Ufer bewegt sich mit |
| Wasserfall / Zulaufrinne | 16 × 32 | 4 | senkrecht fallend, Schleife |
| Wasserspritzer am Auftreffpunkt | 16 × 16 | 4 | |
| Seerosenblatt | 16 × 16 | 2 | leichtes Wiegen |
| Schilf am Ufer | 16 × 16 | 3 | Wiegen im Wind |
| Laterne | 16 × 32 | 3 | Flackern: hell, mittel, schwach |
| Beerenbusch | 16 × 16 | 3 | Leuchten der Beeren an- und abschwellend |
| Blüte am Nest | 16 × 16 | 4 | sanftes Funkeln |
| Grasbüschel im Wind | 16 × 16 | 3 | zwei bis drei Pixel Neigung, mehr nicht |
| Rauch aus einem Schornstein | 16 × 16 | 4 | aufsteigend |

**Wichtig:** Die Bewegung bleibt klein. Ein bis drei Pixel Versatz reichen.
Fellgrund ist ein ruhiger Ort — es soll atmen, nicht zappeln.

Die Bilder einer Folge liegen **waagerecht nebeneinander** in derselben
Datei, in Abspielreihenfolge von links nach rechts.

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

### 4.6 `bewohner_eule.png` — die Eule, abweichender Aufbau

Die Eule ist **keine Arbeiterin**. Sie hütet das Dorfbuch und bringt neue
Bewohner in den Ort. Sie sitzt erhöht auf einem Ast oder Pfosten und läuft
nie am Boden. Deshalb bekommt sie **nicht** das Schema aus 4.5, sondern:

| Zeile | Inhalt | Bilder |
|---|---|---|
| 1 | Sitzen, nach vorn, ruhiges Blinzeln | 4 |
| 2 | Kopf nach rechts drehen und zurück | 4 |
| 3 | Flügel heben, Auffliegen | 4 |
| 4 | Fliegen, seitlich | 4 |
| 5 | Landen | 3 |

Rasterweite ebenfalls **32 × 32**. Im Sitzen sind die Füße auf der unteren
Rasterkante, im Flug ist die Figur mittig.

Zusätzlich als Einzelbild: **Sitzstange** 16 × 16 (ein kurzer Ast mit
Halterung), auf der die Eule stehen kann.

**Figurenregel für alle Tiere** (damit die Besetzung wie eine Familie wirkt):

- fast schwarzer Umriss `#181016` rundherum
- höchstens **fünf Farben** pro Figur
- **zwei Pixel Wangenröte** in `#F0885E`
- **großer Kopf, kleiner Körper** — der Kopf ist etwa 45 % der Figurenhöhe
- Augen als einfache dunkle Punkte oder geschlossene Bögen, kein Weiß
- Was ein Tier unterscheidet, sind **Silhouette und Grundfarbe** — niemals
  ein höherer Detailgrad

### 4.7 `cozywolf.png` — die Hauptfigur

Cozywolf wird **nach einer beigelegten Vorlage neu gezeichnet**, nicht frei
erfunden und nicht aus der Vorlage verkleinert. Die Vorlage ist eine
hochaufgelöste Zeichnung mit weichen Kanten; gebraucht wird eine
handgezeichnete Fassung auf Spritegröße, die dieselbe Figur zeigt.

**Diese Merkmale sind nicht verhandelbar** — an ihnen wird die Figur erkannt:

- **pinkes Fell** in genau drei Werten: `#FF95C0` `#F2609E` `#C43C74`
- **petrolfarbene Latzhose** `#2E8792` mit dunkler Kante `#1D5E68`
- **zwei goldene Knöpfe** `#F0A93C` an den Trägern
- **dunkelblaue Nase** `#161E38`, klein und rundlich
- **geschlossene Augen als Bögen** und ein Lächeln aus wenigen Pixeln
- **spitze Ohren** mit dunklerem Innenohr `#C43C74`
- **buschiger Schwanz** als eigene Form neben dem Körper, heller als das Fell
- Wangenröte `#F0885E` wie bei allen anderen Tieren

Rasterweite **32 × 32**, Figurenhöhe etwa 32 Pixel.

| Zeile | Inhalt | Bilder |
|---|---|---|
| 1 | **Schlafen, eingerollt**, von schräg oben — nur ruhiges Atmen | 2 |
| 2 | **Ohr heben und wieder ablegen** (die Reaktion auf eine Lieferung) | 4 |
| 3 | Aufsetzen, gähnen, wieder einrollen | 5 |
| 4 | Sitzen nach vorn, blinzeln | 3 |
| 5 | Gehen nach vorn | 4 |
| 6 | Gehen nach rechts | 4 |
| 7 | Gehen nach hinten | 4 |
| 8 | Freude (kurzes Hüpfen, Ohren nach oben) | 4 |

**Wichtig zur Schlafhaltung:** Die eingerollte Figur muss in eine Nestmulde
von **40 × 24** passen, und der *vordere Rand* der Mulde (siehe 4.3) wird im
Spiel **über** die Figur gelegt. Die unteren drei bis vier Pixelzeilen der
schlafenden Figur dürfen also verdeckt werden — dort bitte nichts
Wesentliches platzieren.

---

## 5 · Was ausdrücklich **nicht** geliefert werden soll

- Keine Menschen, keine Waffen, keine Kampf- oder Gefahrenmotive
- Keine Benutzeroberfläche, keine Knöpfe, keine Schrift, keine Zahlen
- Keine geschlossenen Wohnhäuser mit Tür und Fenster als Produktionsgebäude
  (siehe 4.3 — Produktion muss einsehbar sein)
- Keine isometrischen Kacheln
- Keine weichgezeichneten oder „HD"-Fassungen
- Keine Rahmen, Schlagschatten-Effekte oder Wasserzeichen im Bild
- Keine frei erfundene Hauptfigur — Cozywolf wird ausschließlich nach der
  beigelegten Vorlage gezeichnet (siehe 4.7)

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
8. Läuft jede Bildfolge **nahtlos** — geht das letzte Bild ohne Sprung ins
   erste über?
9. Bleibt die Bewegung überall bei ein bis drei Pixeln?
10. Trägt Cozywolf alle nicht verhandelbaren Merkmale aus 4.7, und bleibt
    seine Schlafhaltung in den unteren vier Pixelzeilen frei von Wichtigem?
11. Liegt `LIZENZ.txt` bei?

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
