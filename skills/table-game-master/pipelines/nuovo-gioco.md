# Pipeline · Nuovo gioco

Scopo: trasformare un'idea ("un gioco su X per studenti di Y") in una cartella
`docs/<slug>/` completa e coerente, pronta per essere raffinata con le altre pipeline.

## 1. Intervista breve

Se l'utente non li ha già dati, chiedi (in un colpo solo, non a puntate) i quattro
fondamentali: **tema e periodo/argomento**, **pubblico** (età, contesto scolastico o no),
**durata target** della partita, **cosa deve imparare chi gioca** (2-3 obiettivi didattici).
Tutto il resto puoi proporlo tu.

## 2. Concept

Prima di scrivere file, proponi in chat un concept in 5-8 righe: premessa narrativa,
struttura di massima (fasi, squadre o individuale, condizione di vittoria), 2-3 meccaniche
portanti. Itera finché l'utente non approva. Un buon concept per la scuola evita i tre
nemici noti (tempi morti, eliminazione, lezione frontale mascherata) fin dal disegno:
preferisci fasi simultanee tra squadre, vittorie cooperative o a punteggio, ruoli attivi.

## 3. Scaffolding

Crea la struttura completa usando i template in `templates/`:

- `game.md` dal template, frontmatter compilato, `status: idea` (o `design` se il concept
  è già solido)
- `rules/00-panoramica.md` con il concept approvato, più un capitolo per ogni fase di
  gioco individuata (anche solo abbozzato, con `> DA SVILUPPARE` dove serve)
- `rules/CHANGELOG.md` con la prima voce: data e "Impostazione iniziale del gioco"
- `mechanics/` con una scheda per ciascuna meccanica portante del concept
- `cards/` con i mazzi previsti: per ognuno il `.md` con 2-3 carte di esempio e il `.json`
  gemello (schemi in `../references/schemi-json.md`)
- `board/tabellone.md` se il gioco ha un tabellone/percorso; altrimenti non creare la cartella
- `references/fonti.md` con le fonti già note o da cercare
- `playtests/` vuota con un `.gitkeep`

Lo slug: minuscolo, parole separate da trattini, senza articoli (es. "La corsa delle
repubbliche marinare" → `repubbliche-marinare`).

## 4. Chiusura

Riassumi all'utente cosa hai creato e proponi i due passi successivi più utili
(tipicamente: sviluppare una meccanica con `aggiungi-meccanica`, riempire un mazzo con
`gestisci-carte`). Ricorda che il gioco comparirà nell'hub automaticamente grazie a
`game.md`.
