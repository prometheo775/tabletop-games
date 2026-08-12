# Blueprint di stampa

Metti qui i blueprint della tipografia (SVG o PNG alla stessa dimensione del canvas
della carta: 822×1122 px in verticale, 1122×822 in orizzontale, 300 DPI con
abbondanza 3 mm inclusa). Compariranno nell'editor nella sezione
"Blueprint di stampa": si sovrappongono alla carta con opacità regolabile,
solo come guida — non finiscono mai nei PNG esportati.

I due file "carta-*.svg" sono guide d'esempio generate (taglio ciano, area sicura
magenta): sostituiscili o affiancali con quelli ufficiali della tua tipografia.

Nota tecnica: gli SVG devono avere gli attributi `width` e `height` (non solo il
viewBox), altrimenti la modalità "Dimensioni originali" non può conoscere la
dimensione nativa del file.
