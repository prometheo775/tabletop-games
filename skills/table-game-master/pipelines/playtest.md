# Pipeline · Playtest

Scopo: trasformare una sessione di prova in un verbale utile e in decisioni di design
tracciate. Un playtest senza verbale è una partita persa due volte.

## 1. Raccogliere

Chiedi all'utente (o estrai dai suoi appunti): data e contesto (classe, età, quanti
gruppi), durata reale vs prevista, cosa ha funzionato, dove il gioco si è inceppato,
reazioni degli studenti, domande emerse che le regole non coprivano. Se ci sono le
domande "Da verificare al prossimo playtest" nelle schede meccanica, chiedile una
per una: erano lì apposta.

## 2. Verbale

Scrivi `playtests/YYYY-MM-DD-<contesto>.md` dal template `templates/verbale-playtest.md`.
Sii fedele a quello che è successo, non a quello che il design sperava: "il potere della
Prima Elettrice non è mai stato usato" è un dato prezioso, non un fallimento da
ammorbidire.

## 3. Decidere

Dal verbale estrai una lista di proposte, ciascuna classificata:

- **Fix immediato** — errori oggettivi (contraddizione, refuso, tempo sballato):
  applicali subito via `gestisci-regole.md`, citando il verbale nel CHANGELOG.
- **Modifica di design** — cambi di meccanica o bilanciamento: proponili all'utente
  e, per quelli approvati, passa per `aggiungi-meccanica.md`.
- **Da osservare ancora** — segnali deboli: aggiungili alla sezione "Da verificare al
  prossimo playtest" della scheda meccanica pertinente.

## 4. Stato del gioco

Aggiorna `status` in `game.md` se serve: un playtest andato bene può promuovere a
`pronto`, uno andato male può retrocedere a `design`. Nel dubbio, chiedilo all'utente.
