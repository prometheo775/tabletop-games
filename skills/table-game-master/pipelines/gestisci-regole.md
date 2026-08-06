# Pipeline · Gestisci regole

Scopo: modificare, verificare o riorganizzare il regolamento mantenendolo coerente,
tracciato e giocabile. Il regolamento è la cosa che un docente stampa e porta in classe:
ambiguità e contraddizioni si pagano in tempo-lezione perso.

## Modificare una regola

1. Leggi il capitolo da modificare E `rules/00-panoramica.md` (la modifica deve reggere
   nel quadro d'insieme).
2. Cerca la regola in TUTTO il gioco, non solo nel capitolo: la stessa regola è spesso
   citata in altre sezioni, nelle schede meccanica, nei testi delle carte, nel tabellone.
   `grep` sul contenuto di `docs/<slug>/` è tuo amico (es. cerca "5 Gettoni" ovunque
   prima di cambiare la soglia).
3. Applica la modifica in ogni punto trovato. Una regola cambiata a metà è peggio di
   una regola sbagliata ma coerente.
4. Registra in `rules/CHANGELOG.md` (voce in alto): data, cosa cambia, **perché**, e
   quali file sono stati toccati.
5. Se la modifica nasce da un playtest, linka il verbale nel changelog.

## Verificare la coerenza (audit)

Quando l'utente chiede "controlla le regole" o dopi modifiche estese:

- **Contraddizioni numeriche**: soglie, conteggi, durate citate in più punti devono
  coincidere (n° caselle, gettoni richiesti, tempi delle fasi, numero giocatori).
- **Riferimenti orfani**: ogni meccanica citata nelle regole ha la sua scheda in
  `mechanics/`? Ogni mazzo citato esiste in `cards/`? Ogni potere dei personaggi è
  coerente tra carta e regolamento?
- **Percorso del giocatore**: leggi le regole nell'ordine in cui si gioca (preparazione →
  turni → fase finale) e verifica che uno che non conosce il gioco possa arrivarci senza
  domande senza risposta.
- **I tre nemici**: segnala punti in cui si creano tempi morti, giocatori di fatto
  eliminati o esclusi, momenti di pura lezione frontale.

Riporta l'esito come lista di problemi ordinata per gravità, ciascuno con la proposta di
fix; applica i fix solo dopo l'ok dell'utente (o subito, se banali e non ambigui —
dichiarandolo).

## Riorganizzare i capitoli

Mantieni la numerazione `NN-nome.md` ordinata per flusso di gioco. Se aggiungi o
rinomini capitoli aggiorna gli eventuali link incrociati e registra la riorganizzazione
nel CHANGELOG. Non spezzare in troppi file: un capitolo sotto le 15 righe probabilmente
va accorpato.
