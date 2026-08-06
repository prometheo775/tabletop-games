# Pipeline · Gestisci carte

Scopo: creare o aggiornare i mazzi mantenendo allineate le due facce di ogni mazzo:
il `.md` leggibile e il `.json` che lo studio carte importa.

## Prima di tutto

Leggi `references/schemi-json.md` (nella skill): contiene gli schemi esatti dei tre
tipi di mazzo generabili (sapere/quiz, imprevisti, archivio) e i limiti di caratteri.
I parser dello studio sono tolleranti sul contorno ma rigidi sui nomi dei campi.

## Creare o ampliare un mazzo

1. Chiarisci col materiale a disposizione: l'utente ha contenuti (appunti, libro,
   elenco domande) o devi generare tu da zero? Se generi tu contenuti storici,
   verifica i fatti — sono giochi didattici, un errore storico stampato su 30 carte
   è un danno concreto.
2. Scrivi il `.md` del mazzo: intestazione con a cosa serve il mazzo e quando si pesca,
   poi una tabella o schede per carta. Ogni carta deve rispettare i limiti di caratteri
   dello schema (sono vincoli di impaginazione delle carte fisiche).
3. Genera il `.json` gemello, stesso nome (`sapere.md` ↔ `sapere.json`), validalo
   mentalmente contro lo schema: campi giusti, valori ammessi (era 1-3, tipo
   bonus/malus, gettone tra i sei valori canonici…).
4. Aggiorna il conteggio carte in `game.md` se la scheda lo riporta.

## Equilibrio del mazzo

- **Sapere**: distribuisci le domande equamente tra le ere; mescola scelta multipla e
  aperte; difficoltà crescente con l'era è una buona regola; varia i gettoni premio.
- **Imprevisti**: alterna bonus e malus (circa 50/50); gli effetti devono essere
  azioni di gioco concrete ed eseguibili in 10 secondi.
- **Archivio/curiosità**: varia i temi (vita quotidiana, personaggi, primati, aneddoti);
  ogni carta deve funzionare letta ad alta voce in classe.
- **Personaggi**: ogni potere deve essere attivo (qualcosa che il giocatore FA, non
  solo un bonus passivo) e utile in una fase precisa del gioco.

## Carte personaggio

Il mazzo personaggi non ha JSON importabile: vive nei default del `card-engine`
(`libs/card-engine/src/lib/defaults.ts`). Se l'utente vuole cambiare i personaggi,
aggiorna sia `cards/personaggi.md` sia — segnalandolo esplicitamente — il codice dei
default, tenendoli identici parola per parola.

## Workflow con lo studio

Ricorda all'utente il flusso: nello studio (tab del mazzo) → "copia il prompt IA" →
incollarlo in un'IA col proprio materiale → importare il JSON risultante. I JSON in
`cards/` sono la versione ufficiale versionata: dopo un import nello studio, riportare
qui il JSON definitivo.
