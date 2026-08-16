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

**Stilprobe (Batch 1):** Graskachel mit 9er-Übergangsset · Erdweg mit
9er-Übergangsset · ein heller und ein dunkler Laubbaum · Beerenbusch in drei
Leuchtstufen · Kiste 16 × 16 · Verladestation Stufe 1 · Wurzelwagen ·
Schienenstück · Biber mit den Zeilen „Gehen nach vorn" und „Tragen" ·
Wasser-Mitte mit vier Bildern · Cozywolf mit den Zeilen „Schlafen" und
„Gehen nach vorn".

### Batch 2 — der komplette erste Bildschirm

**Grundsatz:** Alles, was das Spiel heute anzeigt, kommt aus einer Hand.
Nichts, wofür es im Spiel noch keinen Ort gibt. Erst wenn ein Bildschirm
vollständig aus einem Guss ist, lässt sich der Look ehrlich beurteilen —
Grafik ohne Verwendung ist Lager, kein Fortschritt.

**A · Batch 1 neu im doppelten Maßstab** (Reihenfolge: zuerst dieses)

Alle fünfzehn Teile aus der Stilprobe, mit den Korrekturen: unterschiedliche
Baumsilhouetten, Beinbewegung im Laufzyklus, abgesetzte Kiste beim Tragen,
Cozywolfs Nase, eingerollte Schlafhaltung, Verladestation mit **zwei**
Kistenplätzen, Wagen in 3/4-Draufsicht ohne Deichsel.

Ohne diesen Teil passt nichts zusammen — die Größen aus Batch 1 sind halb
so groß wie der Rest.

> **Korrektur zum Wasser (nach Batch 2).** Der gelieferte 9er-Ufersatz kann
> nur **rechteckige** Becken erzeugen — seine Uferkante ist nur zwei Pixel
> breit, und neun Kacheln ergeben immer ein Rechteck. Fellgrunds Teich ist
> aber organisch geformt.
>
> Bitte für Wasser **dieselbe Technik wie beim Weg**: **Uferflecken** mit
> unregelmäßiger, ausgefranster Kante, die sich beim Überlappen zu einem
> Becken beliebiger Form verbinden. Vier runde à 64 × 64, drei längliche à
> 96 × 64, dazu drei Schilf- und zwei Seerosenflecken. Das Wasser selbst
> bleibt die vorhandene Kachelfolge mit vier Bildern.

**B · Der Rahmen**

| Teil | Datei / Größe | Anzahl |
|---|---|---|
| Waldrahmen, hintere Ebene | `waldrahmen_1_hinten.png`, 640 × 360 | 1 |
| Waldrahmen, vordere Ebene | `waldrahmen_1_vorn.png`, 640 × 360 | 1 |
| Wegflecken rund / länglich / Trittstein | 32 × 32 · 64 × 32 · 16 × 16 | 4 · 3 · 3 |
| Wasser-Ufer, ganzes Übergangsset | 32 × 32, je 4 Bilder | 9 Kacheln |

**C · Die fehlenden Objekte auf dem Bildschirm**

| Teil | Größe | Anmerkung |
|---|---|---|
| Vorratsstand Stufe 1 | 128 × 96 | offener Unterstand, drei **leere** Regalbretter |
| Nest der Hauptfigur | 80 × 48 | plus **vorderer Rand** als eigene Datei |
| Laterne auf Pfosten | 32 × 64 | 3 Flackerstufen |
| Herzknospe am Nest | 32 × 32 | 4 Bilder, sanftes Funkeln |
| Parzellenmarkierung | 80 × 48 | Moosfläche mit Markiersteinen und erstem Trieb |
| Busch, Findling, Baumstumpf | 32 × 32 | je 2 Varianten |

**D · Der Ausbau**

Verladestation **Stufe 2** mit Vordach und vier Kistenplätzen, 96 × 80.
Sie ist im Spiel bereits kaufbar — zurzeit wechselt sie beim Kauf auf einen
Platzhalter, das Bild wird durch den Ausbau also schlechter statt besser.

**E · Bramble vervollständigen**

Die Zeilen **Gehen nach rechts**, **Gehen nach hinten** und **Arbeiten**.
Bramble läuft im Spiel schräg über die Lichtung und erntet sichtbar am Beet;
zurzeit zeigt er dabei immer nach vorn.

### Batch 3 — die zweite Kette

Batch 2 hat den ersten Bildschirm vollständig gemacht. Batch 3 macht ihn
**tiefer**: eine zweite Produktionskette, ein zweiter Bewohner, und die Eule,
die ihn bringt. Danach ist die rechte Bildhälfte kein leerer Rasen mehr.

Derselbe Grundsatz wie zuvor: nur, wofür es im Spiel einen Ort gibt.

**A · Die Holzkette**

| Teil | Größe | Stufen | Beschreibung |
|---|---|---|---|
| Werkstatt | 96 × 80 | 3 | Werkbank unter offenem Dach, Werkzeug an der Rückwand. Bramble arbeitet sichtbar davor |
| Nutzbaum | 64 × 96 | 3 | derselbe Baum voll, halb abgeerntet, als Stumpf. Er steht in der Lichtung und wird sichtbar kleiner |
| Holzscheit | 32 × 32 | 1 | wird getragen wie die Kiste |
| Holzstapel | 64 × 32 | 3 | füllt sich sichtbar: leer, halb, voll |
| Bretterstapel | 64 × 32 | 1 | das verarbeitete Ergebnis |

**B · Der zweite Bewohner**

Das **Eichhörnchen** als vollständiges Blatt nach Abschnitt 4.5 — Gehen vorn,
rechts, hinten, Arbeiten, Tragen, Ruhen. Es kümmert sich um Samen, Nüsse und
Lagerlogistik; sein Werkzeug ist ein Sammelkorb.

**C · Die Eule**

Sie hütet das Dorfbuch und bringt neue Bewohner — der sichtbare Lohn dafür,
dass der Ort etwas Neues gebaut hat. Aufbau nach Abschnitt 4.6: Sitzen,
Kopfdrehen, Auffliegen, Fliegen, Landen. Dazu die **Sitzstange** 32 × 32.

**D · Cozywolf vervollständigen**

Die noch fehlenden Zeilen aus 4.7: **Aufsetzen und gähnen** (5 Bilder),
**Sitzen und blinzeln** (3), **Freude** (4). Die Freude-Zeile spielt, wenn ein
neuer Bewohner einzieht.

**E · Nachbesserungen**

- **Uferflecken** statt des 9er-Satzes, siehe Korrektur oben: vier runde à
  64 × 64, drei längliche à 96 × 64, drei Schilf- und zwei Seerosenflecken.
- **Vorratsstand Stufe 2** — mehr Regalbretter, damit der Ausbau sichtbar wird.

**Ausdrücklich nicht in Batch 3:** Küche, Kristallquelle, Axolotl, Biene,
Maulwurf, Ausbaustufe 3 der Verladestation. Sie kommen mit der dritten Kette.

### Batch 4 — was die Reibung sichtbar macht

Das Spiel hat seit Commit `a104905` echte Engstellen: Das Beet ist endlich,
die Station läuft voll, das Regal läuft über. Batch 4 liefert genau die
Bilder, die diese drei Zustände lesbar machen. Alles darin ist bereits im
Code verdrahtet oder wartet auf genau eine Datei.

**A · Der Glühbeerenbusch — das wichtigste Teil dieses Batches**

Bisher leihen wir uns dafür drei Zellen aus `natur_64x96.png`. Das sind
blühende Ziersträucher; im Spiel liegt ein grauer Farbfilter darüber, wenn
ein Busch abgeerntet ist. Das ist ein Notbehelf und der Grund, warum die
wichtigste Engstelle des Spiels im Bild fast nicht zu sehen ist.

| Teil | Größe | Zellen | Beschreibung |
|---|---|---|---|
| `gluehbeerenbusch_32.png` | 32 × 32 | 4 | abgeerntet → knospend → halbreif → reif |

Entscheidend ist der **Abstand zwischen Zelle 1 und Zelle 4**. Zelle 4 trägt
dicke, deutlich leuchtende Glühbeeren; Zelle 1 hat gar keine, nur Blattwerk
mit leeren Stielansätzen. Man muss aus fünf Metern Abstand erkennen, ob ein
Beet abgeerntet ist — ohne hinzusehen, ohne Zahl, ohne Farbfilter.

**B · Die beiden fehlenden Ausbaustufen**

Beide sind im Code als Ausbau gekauft, aber es fehlt das Bild:

| Teil | Größe | Zellen | Beschreibung |
|---|---|---|---|
| `verladestation_3_96x80.png` | 96 × 80 | 1 | Stufe 3 „Verladehof": sechs leere Kistenplätze statt vier |
| `vorratsstand_3_128x96.png` | 128 × 96 | 1 | Stufe 3 „Lagerschuppen": überdacht, Bretter nach hinten verlängert |

Wichtig bei beiden: **Kistenplätze bleiben leer.** Das Spiel setzt die Kisten
selbst. Und die Regalbretter des Vorratsstands müssen auf denselben Höhen
liegen wie in Stufe 1 und 2 — das Spiel hat sie ausgemessen und stellt seine
Kisten auf feste Höhen.

**C · Die Bewässerungsrinne**

Der Ausbau „Bewässerungsrinne" führt Wasser vom Becken zum Beet. Im Spiel ist
sie zurzeit mit drei gezeichneten Linien angedeutet.

| Teil | Größe | Zellen | Beschreibung |
|---|---|---|---|
| `rinne_32.png` | 32 × 32 | 4 | gerades Stück, Diagonalstück, Einlauf am Becken, Auslauf über dem Beet |

Holzrinne auf niedrigen Böcken, im Inneren eine schmale Wasserlinie in den
Beckenfarben. Die Stücke werden aneinandergesetzt wie die Schiene.

**D · Nachbesserungen aus Batch 3**

- `holzkette_64x32.png`, Zelle 2: der leere Holzstapel ist mit Cozywolfs
  Fellrosa gefüllt. Als Holz neu zeichnen.
- `nutzbaum_64x96.png`, Zelle 2 und 3: dasselbe Rosa in kleineren Mengen.

Neue Regel, ab sofort im Prüfwerkzeug: **die drei Cozywolf-Rosatöne
`#FF95C0`, `#F2609E` und `#C43C74` dürfen nur in Dateien vorkommen, deren
Name `cozywolf` enthält.** In Fellgrund gibt es genau eine pinke Figur; wo
dieses Rosa sonst auftaucht, ordnet das Auge es sofort dem Wolf zu.

**Ausdrücklich nicht in Batch 4:** Küche, Kristallquelle, Axolotl, Biene,
Maulwurf, Tag- und Nachtfassungen. Die Küche kommt, sobald die Holzkette im
Spiel läuft.

### Batch 5 — mehr Lichtung, ein Schienennetz

Aus dem ersten vollständigen Spieltest. Zwei Rückmeldungen wiegen schwerer als
alles bisher Gelieferte, und beide lassen sich nur mit neuen Bildern lösen.

**A · Ein größerer Waldrahmen — der wichtigste Teil dieses Batches**

> „Die Lichtung wirkt auf den ersten Blick sehr klein, wirkt nicht wie ein
> Cozyvillage, eher wie eine cozy Mini-Lichtung. … Sie kann der äußere Rahmen
> sein, aber darf nicht ein Drittel des Bildes einnehmen."

Nachgemessen: Der jetzige Rahmen belegt **64,8 %** des Bildes, die freie
Lichtung nur 35,2 %. Voll ausgebaut sind davon 57 % bebaut — es passen
rechnerisch dreieinhalb weitere Bauplätze hinein, und das ist zu wenig für ein
Dorf. Gleichzeitig ist der Wald selbst gut und soll bleiben, was er ist.

| Teil | Größe | Beschreibung |
|---|---|---|
| `waldrahmen_2_hinten.png` | 1600 × 900 | derselbe Wald, aber als Rahmen um eine große Lichtung |
| `waldrahmen_2_vorn.png` | 1600 × 900 | unterste Waldreihe als Vordergrund, wie bisher |

Die Größe ist entschieden: **1600 × 900**. Das ist das Zweieinhalbfache der
heutigen Kantenlänge und die Fläche, in die der Entwurf aus dem Konzeptbild
passt — Mittelplatz rund 400 × 300, jedes der acht Gebiete rund 200 × 160.

Drei Bedingungen, alle nachmessbar:

1. **Die Pixelgröße bleibt gleich.** Das Bild wird größer, nicht die Pixel.
   Ein Baumstamm behält dieselbe Strichstärke wie bisher; er wird nicht
   hochskaliert. Die Figuren bleiben 64 px — sie dürfen im größeren Bild
   kleiner *wirken*, aber nicht kleiner *sein*.
2. **Die freie Lichtung nimmt mindestens 60 % der Bildfläche ein** (heute
   35,2 %). Der Wald wird also nicht nur absolut, sondern auch relativ
   schmaler — ein Rahmen, kein Ring.
3. **Die Öffnung bleibt organisch**, keine Ellipse und kein Rechteck: ein
   Rand, der ein- und ausbuchtet, mit einzelnen vorstehenden Bäumen.

Die Lichtung soll außerdem **unten breiter** werden. Heute schließt sie sich ab
y = 300 sehr rasch (bei y = 330 sind nur noch 70 px offen), weshalb Cozywolfs
Dorfplatz in eine Ecke gedrängt ist statt in der Mitte zu liegen.

**B · Schienennetz — erledigt, bitte nicht produzieren**

`schienen_32.png` (acht Netzteile) und `prellbock_32.png` (zwei Streckenenden)
sind inzwischen da, erzeugt von `tools/zeichne-schienen.mjs`. Beide bestehen
dieselbe Prüfung wie jede Lieferung.

Der Grund, das als Code zu bauen statt zu bestellen: Gleisteile müssen exakt
aneinanderpassen. Das Querschnittsprofil ist am gelieferten Schienenstück
abgemessen und liegt an genau einer Stelle; gerade wie Kurve entstehen daraus,
und ein Viertelkreis verlässt die Zelle genau dort, wo eine Gerade ankommt.
Von Hand gezeichnet wäre die Chance groß, dass eine Kurve zwei Pixel daneben
endet — derselbe Fehler wie bei den Regalfächern, nur schwerer zu sehen.

Was hier **weiter fehlt** und von Hand besser wird:

| Teil | Größe | Zellen | Beschreibung |
|---|---|---|---|
| `verladepunkt_64x32.png` | 64 × 32 | 3 | Rampe, an der der Wagen anhält: leer, Kiste halb aufgeladen, Kiste im Wagen |
| `signal_32.png` | 32 × 32 | 3 | Streckensignal wie im Konzeptbild: frei, belegt, gesperrt |

Der Verladepunkt löst eine Rückmeldung mit: Zurzeit erscheinen die Kisten im
Wagen, ohne dass man sieht, wie sie hineinkommen. Mit einer sichtbaren Rampe
zwischen Station und Gleis wird das Umladen ein eigener kleiner Schritt statt
eines Sprungs. Das Signal braucht das Netz, sobald mehr als ein Wagen fährt —
eine belegte Kante muss man sehen können.

**C · Der Vorratsstand, drei Stufen neu**

Alle drei bisherigen Stufen haben denselben Fehler: Ihre Regalfächer sind 7 bis
15 px hoch, die Kiste des Spiels ist 16 × 16 px. In kein einziges Fach lässt
sich etwas hineinstellen — die Kisten liegen zwangsläufig darüber statt darin.
`tools/pruefe-assets.mjs` misst das jetzt und verlangt **mindestens 18 px**.

Dazu kommt: Stufe 1 ist 92 px hoch, Stufe 2 und 3 sind beide 66 px. Der Ausbau
macht das Gebäude also kleiner statt größer, und die letzten beiden Stufen sind
gleich groß.

| Teil | Größe | Bedingung |
|---|---|---|
| `vorratsstand_1_128x96.png` | 128 × 96 | 3 Fächer, jedes ≥ 18 px hoch, jedes ≥ 5 Kisten breit |
| `vorratsstand_2_128x96.png` | 128 × 96 | wie Stufe 1 plus ein Fach, **höher** als Stufe 1 |
| `vorratsstand_3_128x96.png` | 128 × 96 | überdachter Schuppen, **höher** als Stufe 2 |

Dieselbe Regel gilt für die Verladestation: Ihre Ladefläche liegt in Stufe 1
zwei Pixel und in Stufe 2 fünfzehn Pixel über dem Fuß. Das ist in Ordnung, muss
aber so bleiben — das Spiel setzt seine Kisten auf diese Höhen.

**D · Cozywolfs Dorfplatz**

> „Der Wolf ist nicht wirklich das Herz des Villages. Er soll einen eigenen
> tollen Platz in der Mitte der Stadt haben."

Zurzeit stempele ich einen Rund aus Wegflecken um sein Nest. Das wirkt wie ein
festgetretener Fleck, nicht wie ein Platz.

| Teil | Größe | Zellen | Beschreibung |
|---|---|---|---|
| `dorfplatz_192x96.png` | 192 × 96 | 1 | gepflasterter Rund mit Randsteinen, Moos in den Fugen, Platz in der Mitte für das Nest |
| `platzlaterne_32x64.png` | 32 × 64 | 3 | höhere Laterne für den Platzrand, drei Flackerstufen |

**Ausdrücklich nicht in Batch 5:** Küche, Kristallquelle, Axolotl, Biene,
Maulwurf, Tag- und Nachtfassungen.

**Ausdrücklich nicht in Batch 2:** Werkstatt, Küche, Kristallquelle,
Ausbaustufe 3, Fass, Sack, Korb, Zaun, Torbogen, Wegweiser, die übrigen
Bewohner. Für all das gibt es im Spiel noch keinen Ort. Sie kommen, sobald
die zugehörige Kette gebaut ist.



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
Auf 64 Pixel Figurenhöhe wird daraus Matsch.

> **Prüfregel:** Beim Hineinzoomen auf einen Rand darf **kein** weicher
> Übergang zwischen zwei Farben sichtbar sein — nur eine harte Kante.
> Bitte direkt in der Zielauflösung zeichnen, nicht herunterrechnen.

---

## 1 · Technische Vorgaben — bitte exakt einhalten

> **Maßstab geändert (Stand nach Batch 1).** Fellgrund lief zuerst auf
> 320 × 180 mit 32er-Figuren. Bei dieser Größe reichen die Pixel nicht für
> Fell, Rinde oder Kistenlatten — die Grafik wird zwangsläufig schlicht.
> Das Spiel läuft jetzt auf **640 × 360**. Alle Maße im Auftrag sind
> gegenüber Batch 1 **verdoppelt**.
>
> Die Komposition bleibt dabei exakt gleich: Eine Figur nimmt weiterhin
> 17,8 % der Bildhöhe ein. Es stehen nur **viermal so viele Pixel** zum
> Zeichnen zur Verfügung. Genau dort beginnt der Detailgrad, der gewünscht
> ist — Fellstruktur, Rindenmaserung, sichtbare Latten an der Kiste.


| Punkt | Vorgabe |
|---|---|
| Kachelgröße | **32 × 32 Pixel** |
| Perspektive | **3/4-Draufsicht** (wie Stardew Valley), *nicht* isometrisch, *nicht* reine Seitenansicht |
| Format | **PNG mit Alphakanal**, unkomprimiert, ohne Interlacing |
| Kantenbehandlung | **Harte Kanten, kein Anti-Aliasing, keine Verläufe, keine Halbtransparenz.** Jedes Pixel ist entweder voll deckend oder voll durchsichtig |
| Pixelraster | Ein Bildpixel = ein Gestaltungspixel. Keine skalierte Vorlage, keine 2×- oder 4×-Ausgabe |
| Farbtiefe | Feste, begrenzte Palette (siehe Abschnitt 3) |
| Hintergrund | Vollständig transparent, kein Schachbrett, keine Rahmen, keine Wasserzeichen, keine Beschriftungen im Bild |
| Zielauflösung des Spiels | 640 × 360 Pixel Spielfläche |

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
  boden.png                  Bodenkacheln, 32×32 im Raster
  wege.png                   Wegflecken, unregelmäßig, ohne Rahmen
  waldrahmen_1_hinten.png    Wald hinter allem, 640×360
  waldrahmen_1_vorn.png      unterste Baumreihe, über den Figuren
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
Dateinamen, wenn sie von 32 abweicht, z. B. `gebaeude_64.png`.
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

### 4.1 `boden.png` — Bodenkacheln, 32 × 32

Jede Bodenart als **vollständiges Übergangsset** (9 Kacheln: vier Ecken,
vier Kanten, eine Mitte), plus zwei Variationskacheln für die Mitte, damit
große Flächen nicht gleichmäßig aussehen.

1. **Gras** — die Grundfläche der Lichtung
2. **Trampelpfad** aus heller Erde, für die Wege der Tiere
3. **Erde / Beet**, dunkel und umgegraben
4. **Wasser** für einen Teich, mit Uferkanten zum Gras
5. **Steinplatten** für spätere befestigte Plätze

> **Nahtlosigkeit ist Pflicht.** Die Mittelkachel jeder Bodenart muss an sich
> selbst anschließen, ohne dass eine Fuge sichtbar wird. Beim Kacheln stößt
> die rechte Spalte an die linke der nächsten Kachel — ist der Farbsprung dort
> größer als zwischen zwei benachbarten Spalten im Inneren, entsteht ein
> Gitternetz über der ganzen Wiese.
>
> **Prüfregel:** Die Kachel neunmal in einem 3 × 3-Raster nebeneinanderlegen.
> Wenn man erkennen kann, wo eine Kachel aufhört, ist sie nicht nahtlos.
> Insbesondere darf **keine Kachel einen dunkleren Rahmen** haben.
> Der Prüfer im Projekt misst das automatisch.

### Wege: keine Kacheln, sondern Flecken

Wege in Fellgrund laufen **diagonal und geschwungen**, nicht am Raster
entlang. Ein 9er-Übergangsset kann das nicht abbilden, und ein vollständiger
Satz dafür bräuchte 47 Kacheln.

Stattdessen bitte **Wegflecken**: unregelmäßige, abgetretene Erdflächen mit
weicher, ausgefranster Kante, die sich beim Überlappen zu einem
durchgehenden Pfad verbinden.

| Teil | Größe | Anzahl |
|---|---|---|
| Wegfleck, rund | 32 × 32 | 4 Varianten |
| Wegfleck, länglich | 64 × 32 | 3 Varianten |
| Trittstein im Weg | 16 × 16 | 3 Varianten |

Wichtig: **kein Rahmen, keine geraden Kanten.** Die Flecken werden im Spiel
entlang der tatsächlichen Route gestempelt und überlappen sich. Dieselbe
Technik gilt später für Beete und befestigte Plätze.

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
| Laubbaum, hell (steht in der Lichtung) | 64 × 96 | 4 |
| Laubbaum, dunkel (bildet den Waldrand) | 64 × 96 | 4 |
| Nadelbaum, dunkel | 64 × 96 | 3 |
| Busch | 32 × 32 | 4 |
| Beerenbusch mit leuchtenden Beeren | 32 × 32 | 3 Leuchtstufen derselben Pflanze |
| Baumstumpf | 32 × 32 | 2 |
| Findling / Stein | 32 × 32 und 64 × 32 | je 2 |
| Farn, Pilzgruppe | 32 × 32 | je 2 |
| Seerosenblatt fürs Wasser | 32 × 32 | 2 |

### 4.2b `waldrahmen_*.png` — der Wald ringsum

Der Wald schließt die Lichtung ab und ändert sich im ganzen Spiel **genau
dreimal**, an den Ausbaustufen. Deshalb lohnt sich hier ein gemaltes Bild
statt einzelner Bäume — es darf üppig sein.

Bitte **zwei Ebenen je Ausbaustufe**:

| Datei | Inhalt | Größe |
|---|---|---|
| `waldrahmen_1_hinten.png` | Wald oben, links und rechts; liegt hinter allem | 640 × 360 |
| `waldrahmen_1_vorn.png` | nur die unterste Baum- und Buschreihe; liegt über den Figuren | 640 × 360 |

Der Grund für die Teilung: Ein Tier muss hinter einem Baum am unteren Rand
verschwinden können. Bei einem einzigen Bild ginge das nicht.

Beide Ebenen sind **außen deckend und innen durchsichtig** — die Lichtung in
der Mitte bleibt frei, damit der gekachelte Boden durchscheint. Die Kante zur
Lichtung ist organisch und unregelmäßig, keine saubere Ellipse.

Der Wald ist **dunkler als die Lichtung**, damit der Ort selbst der hellste
Punkt im Bild bleibt.

Zunächst nur Ausbaustufe 1. Die Stufen 2 und 3 folgen, wenn die Lichtung
wächst.

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
| Verladestation | 96 × 80 | 3 | Holzplattform mit Kistenplätzen. Stufe 2 bekommt ein Vordach, Stufe 3 einen Kran oder eine Rampe |
| Vorratsstand | 128 × 96 | 3 | Offener Unterstand auf Pfosten, darunter **drei Regalbretter**, auf denen Kisten stehen. Die Regalbretter müssen leer zeichenbar sein — Kisten werden im Spiel einzeln daraufgesetzt |
| Werkstatt | 96 × 80 | 3 | Werkbank unter einem Dach, Werkzeug an der Rückwand |
| Küche | 96 × 80 | 3 | Offene Feuerstelle mit Topf und Ablage |
| Wasserbecken / Quelle | 96 × 64 | 3 | Gefasstes Becken mit Zulaufrinne |
| Nest der Hauptfigur | 80 × 48 | 3 | Flache Mulde aus Moos und Zweigen, von oben gesehen. **Zusätzlich als eigene Datei ein „vorderer Rand"** (nur der untere Bogen der Mulde), damit die Figur sichtbar darin liegen kann |
| Schlafplatz für Bewohner | 64 × 48 | 2 | kleinere Mulde oder Korb |
| Laterne auf Pfosten | 32 × 64 | 3 | zwei Zustände: hell und etwas gedimmt, für flackerndes Licht |

### 4.4 `gueter.png` — Güter und Wege

- **Kiste**, 16 × 16 — das wichtigste Einzelteil des ganzen Spiels. Sie wird
  getragen, gestapelt, geladen und ins Regal gestellt. Sie muss auf hellem
  Gras **und** auf dunklem Holz lesbar sein
- Kiste in **drei Füllzuständen** (leer, halb, voll leuchtend)
- Fass 24 × 24, Sack 20 × 20, Korb 24 × 20
- **Schienenstück**, 32 × 32, waagerecht: Schotterbett, Schwellen, zwei
  Schienenstränge mit Lichtkante oben
- Schienen-Endstück mit Prellbock
- **Wurzelwagen**, 48 × 32, 3/4-Draufsicht, offene Ladefläche, zwei Räder.
  Zusätzlich zwei Radstellungen für eine einfache Fahranimation
- Wegweiser, Zaunstück, Torbogen — je 32 × 32

### 4.4b Bewegte Teile — Wasser, Licht, Pflanzen

Die Karte darf nie wie ein gemalter Hintergrund wirken. Diese Teile werden
deshalb **als Bildfolgen** geliefert, nicht als Einzelbild. Jede Folge ist
eine **nahtlose Schleife**: Das letzte Bild geht ohne Sprung ins erste über.

| Teil | Größe | Bilder | Bewegung |
|---|---|---|---|
| Wasseroberfläche, Mitte | 32 × 32 | 4 | ruhiges Glitzern, ein bis zwei Pixel wandern seitlich |
| Wasser-Ufer, ganzes Übergangsset | 32 × 32 | 4 je Kachel | die Schaumkante am Ufer bewegt sich mit |
| Wasserfall / Zulaufrinne | 32 × 64 | 4 | senkrecht fallend, Schleife |
| Wasserspritzer am Auftreffpunkt | 32 × 32 | 4 | |
| Seerosenblatt | 32 × 32 | 2 | leichtes Wiegen |
| Schilf am Ufer | 32 × 32 | 3 | Wiegen im Wind |
| Laterne | 32 × 64 | 3 | Flackern: hell, mittel, schwach |
| Beerenbusch | 32 × 32 | 3 | Leuchten der Beeren an- und abschwellend |
| Blüte am Nest | 32 × 32 | 4 | sanftes Funkeln |
| Grasbüschel im Wind | 32 × 32 | 3 | zwei bis drei Pixel Neigung, mehr nicht |
| Rauch aus einem Schornstein | 32 × 32 | 4 | aufsteigend |

**Wichtig:** Die Bewegung bleibt klein. Ein bis drei Pixel Versatz reichen.
Fellgrund ist ein ruhiger Ort — es soll atmen, nicht zappeln.

Die Bilder einer Folge liegen **waagerecht nebeneinander** in derselben
Datei, in Abspielreihenfolge von links nach rechts.

### 4.5 `bewohner_<name>.png` — die Tiere

Ein Spritesheet je Tier. **Rasterweite 64 × 64**, Figur mittig, Füße auf der
unteren Rasterkante.

Benötigte Tiere: **Biber, Eichhörnchen, Axolotl, Biene, Maulwurf.**

Je Tier folgende Zeilen im Spritesheet, jede Zeile eine Blickrichtung:

| Zeile | Inhalt | Bilder |
|---|---|---|
| 1 | Stehen und Gehen, **nach vorn** | 4 |
| 2 | Stehen und Gehen, **nach rechts** | 4 |
| 3 | Stehen und Gehen, **nach hinten** | 4 |
| 4 | **Arbeiten** (bücken, hacken, greifen), nach vorn | 4 |
| 5 | **Tragen** — dieselbe Gehanimation, aber mit erhobenen Armen, sodass eine 16 × 16-Kiste davor passt | 4 |
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

Rasterweite ebenfalls **64 × 64**. Im Sitzen sind die Füße auf der unteren
Rasterkante, im Flug ist die Figur mittig.

Zusätzlich als Einzelbild: **Sitzstange** 32 × 32 (ein kurzer Ast mit
Halterung), auf der die Eule stehen kann.

**Figurenregel für alle Tiere** (damit die Besetzung wie eine Familie wirkt):

- fast schwarzer Umriss `#181016` rundherum
- höchstens **zehn Farben** pro Figur
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

Rasterweite **64 × 64**, Figurenhöhe etwa 60 Pixel.

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
von **80 × 48** passen, und der *vordere Rand* der Mulde (siehe 4.3) wird im
Spiel **über** die Figur gelegt. Die unteren sechs bis acht Pixelzeilen der
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
7. Ist die 16 × 16-Kiste sowohl auf `#487646` (Gras) als auch auf `#96693C`
   (Holz) klar erkennbar?
8. Kachelt jede Bodenkachel **nahtlos** — ist im 3 × 3-Raster keine Fuge
   erkennbar, und hat keine Kachel einen dunkleren Rahmen?
9. Läuft jede Bildfolge **nahtlos** — geht das letzte Bild ohne Sprung ins
   erste über?
10. Bleibt die Bewegung überall bei ein bis drei Pixeln?
11. Trägt Cozywolf alle nicht verhandelbaren Merkmale aus 4.7, und bleibt
    seine Schlafhaltung in den unteren vier Pixelzeilen frei von Wichtigem?
12. Liegt `LIZENZ.txt` bei?

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
