# Pipeline · Aggiungi (o modifica) una meccanica

Scopo: progettare una meccanica nuova — o rivedere una esistente — senza rompere
l'equilibrio del gioco, e propagare la modifica a regole, carte e materiali.

## 1. Contesto

Leggi `game.md`, `rules/00-panoramica.md` e TUTTE le schede in `mechanics/` del gioco.
Una meccanica non vive da sola: devi sapere con cosa interagisce prima di progettarla.

## 2. Progettazione

Compila mentalmente (poi su file) i campi della scheda `templates/scheda-meccanica.md`:

- **Problema che risolve / esperienza che crea** — se non sai rispondere, fermati e
  chiedilo all'utente. Una meccanica senza scopo è zavorra.
- **Funzionamento** — descrizione operativa passo-passo, come la spiegheresti a voce
  a un docente che non ha mai visto il gioco.
- **Obiettivo didattico** — cosa impara o esercita lo studente usando questa meccanica.
- **Interazioni** — con quali meccaniche/ruoli/mazzi esistenti si intreccia, e come.
- **Bilanciamento** — costi, limiti d'uso, contromosse. Chiediti: può creare un "re di
  partita"? può eliminare di fatto un giocatore? allunga i tempi morti? Se sì, correggi.
- **Materiali** — cosa serve stampare o costruire (carte, token, segnalini, modifiche
  al tabellone).

Proponi la scheda in chat PRIMA di scrivere i file, e itera con l'utente.

## 3. Propagazione

Quando la scheda è approvata:

1. Scrivi/aggiorna `mechanics/<slug-meccanica>.md`
2. Aggiorna i capitoli delle regole toccati (la scheda "Interazioni" ti dice quali) —
   segui `gestisci-regole.md` per la parte di coerenza e CHANGELOG
3. Se la meccanica richiede carte nuove o modifica carte esistenti, aggancia
   `gestisci-carte.md`
4. Se tocca il tabellone o i materiali fisici, aggiorna `board/tabellone.md`
5. Se la meccanica è sostanziale, valuta con l'utente se `status` in `game.md` deve
   tornare a `playtest` (una meccanica nuova non testata retrocede un gioco "pronto")

## 4. Chiusura

Nella scheda meccanica lascia sempre una sezione **"Da verificare al prossimo playtest"**
con 2-3 domande concrete (es. "il potere della Staffetta viene usato almeno una volta a
partita?"). È l'aggancio con la pipeline `playtest`.
