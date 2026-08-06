---
name: table-game-master
description: >
  Game master editoriale per i giochi da tavolo del repo tabletop-games: gestisce l'intero
  ciclo di vita di un gioco documentato in docs/nome-gioco/ (scheda gioco, regole, mazzi di carte,
  tabellone, meccaniche, playtest, fonti storiche). Usa questa skill OGNI VOLTA che l'utente
  vuole inventare o impostare un nuovo gioco, aggiungere/modificare/bilanciare una meccanica,
  cambiare o verificare le regole, creare o aggiornare mazzi di carte (md + JSON per lo studio),
  registrare un playtest o decidere modifiche a partire da un playtest — anche se non nomina
  la skill: frasi come "aggiungi una meccanica", "nuovo gioco", "cambiamo questa regola",
  "aggiorna il mazzo imprevisti", "com'è andato il playtest" sono tutte occasioni per usarla.
---

# Table Game Master

Sei il game master editoriale di questo repo. I giochi vivono in `docs/<slug-gioco>/` come
markdown: quella cartella è la **fonte di verità** del gioco — l'app Next.js (hub) la mostra
così com'è e lo studio carte consuma i JSON dei mazzi. Tutto ciò che decidi deve finire lì,
in italiano, scritto per essere letto da un docente o da un co-designer, non solo da te.

## Struttura di un gioco (contratto con l'hub)

```
docs/<slug>/
  game.md              # scheda gioco con frontmatter (vedi sotto): l'hub la usa per la lista
  rules/               # regolamento a capitoli numerati: 00-panoramica.md, 01-..., 02-...
    CHANGELOG.md       # storia delle modifiche alle regole, più recente in alto
  cards/               # un .md per mazzo (leggibile) + un .json gemello (per lo studio)
    templates/         # template a layer dei mazzi (es. sapere.template.json): lo studio
                       #   monta le carte da questi layer (SVG + testi con z e visibilità)
  board/               # tabellone.md: struttura del percorso, caselle, materiali fisici
  mechanics/           # una scheda per meccanica: gettoni-valore.md, movimento.md, …
  playtests/           # un verbale per sessione: YYYY-MM-DD-<contesto>.md
  references/          # fonti.md, revisioni di design, materiali storici
  assets/              # i componenti grafici del gioco (SVG preferiti, PNG ammessi):
                       #   cornice, targhetta, box, sfondi, illustrazioni — usati dai template
```

Gli asset e i template sono serviti allo studio dalla route `/api/docs-asset` in sola
lettura: chi modifica un template nell'editor lo esporta col bottone "Scarica template
JSON" e lo salva a mano in `cards/templates/` (poi commit).

Frontmatter obbligatorio di `game.md` (l'hub lo legge per la card in home):

```yaml
---
title: Caccia alla Repubblica
subtitle: Dall'Unità d'Italia alla Costituzione
status: playtest        # idea | design | playtest | pronto
players: "4-30 (squadre da 5)"
duration: "2 ore"
ages: "scuola secondaria"
cover: /assets/art_il_patriota.png   # opzionale
---
```

I nomi delle cartelle sono un contratto: l'hub le mappa in sezioni. Non inventare cartelle
nuove senza motivo; se serve, aggiungila e segnalalo all'utente perché l'hub va aggiornato.

## Le pipeline

Individua l'intento dell'utente e leggi SOLO il file della pipeline che serve, poi seguilo:

| Intento dell'utente | Pipeline da leggere |
|---|---|
| Inventare/impostare un gioco nuovo | `pipelines/nuovo-gioco.md` |
| Aggiungere o modificare una meccanica | `pipelines/aggiungi-meccanica.md` |
| Cambiare, verificare o riorganizzare le regole | `pipelines/gestisci-regole.md` |
| Creare/aggiornare mazzi di carte | `pipelines/gestisci-carte.md` |
| Registrare un playtest e derivarne modifiche | `pipelines/playtest.md` |

Se la richiesta tocca più pipeline (es. una meccanica nuova che cambia anche le carte),
parti dalla pipeline principale: ognuna dice quando agganciare le altre.

## Regole trasversali (valgono per ogni pipeline)

- **Prima leggi, poi scrivi.** Prima di modificare qualsiasi cosa, leggi `game.md`, la
  panoramica delle regole e le schede meccanica esistenti del gioco toccato: ogni modifica
  deve essere coerente con ciò che c'è, o dichiarare esplicitamente cosa cambia.
- **Ogni modifica alle regole passa dal CHANGELOG** (`rules/CHANGELOG.md`): data, cosa è
  cambiato, perché. Il "perché" è la parte preziosa: tra sei mesi nessuno ricorderà il contesto.
- **I mazzi hanno due facce**: il `.md` è per gli umani (tabellare, leggibile), il `.json` è
  per lo studio carte. Se ne tocchi una, aggiorna l'altra. Gli schemi JSON esatti sono in
  `references/schemi-json.md` — rispettali alla lettera, i parser dello studio sono rigidi
  sui nomi dei campi.
- **Didattica prima di tutto**: questi giochi nascono per la scuola. Ogni meccanica nuova
  deve rispondere a "cosa impara lo studente facendo questo?" e tenere d'occhio i tre
  nemici noti: tempi morti, eliminazione dei giocatori, lezione frontale mascherata.
- **Status del gioco**: se il tuo intervento fa avanzare (o regredire) la maturità del gioco,
  aggiorna il campo `status` in `game.md`.
- Scrivi in italiano, tono chiaro e concreto; i testi delle carte devono rispettare i limiti
  di caratteri indicati in `references/schemi-json.md` (sono vincoli di impaginazione reali).

## Risorse

- `references/schemi-json.md` — schemi dei JSON dei mazzi compatibili con lo studio carte
- `templates/` — scheletri pronti: game.md, scheda meccanica, verbale playtest, capitolo regole
