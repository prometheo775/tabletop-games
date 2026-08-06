# 02 · Fase 1 — Il cammino sul tabellone

> Il cuore del laboratorio: i turni sulle 24 caselle.

Le Commissioni muovono la pedina a turno lungo la linea del tempo. Ogni casella
raggiunta propone una sfida, secondo il suo tipo (la composizione esatta del percorso
è in `../board/tabellone.md`):

## Casella Sapere (quiz)

Il Segretario legge la domanda della carta Sapere dell'Era corrente. Il gruppo discute,
il portavoce risponde al docente.

- **Risposta corretta** → la Commissione avanza e guadagna un **Gettone Valore**
  (es. Libertà, Lavoro, Dignità), registrato dal Segretario sul Passaporto.
- **Risposta errata** → nessun gettone. La **Prima Elettrice** può concedere un secondo
  tentativo se argomenta la risposta al docente (una volta per domanda).

Nell'**Era 1** il portavoce è il Patriota, che una volta per partita può far eliminare
un'opzione errata da una domanda a scelta multipla. Nell'**Era 3** l'Operaio/a sceglie
quale gettone incassare tra due opzioni.

## Casella Imprevisto (carta evento)

Si pesca dal mazzo Eventi e Imprevisti: fatti storici che danno **bonus o malus di
movimento** (es. "Censura!": fermi un turno; "Moti Popolari": avanza di 2). Danno ritmo
al gioco e possono velocizzare o rallentare il turno. La **Staffetta** può annullare
l'effetto negativo di una carta pescata dal suo gruppo, una volta per partita.

## Casella Pietra Miliare (sosta)

Sosta obbligatoria: il docente si ferma e spiega brevemente (5-7 minuti) il contesto
storico di quel periodo. Consigliata la prima casella e una verso la fine di ogni Era.

> Nota di design: la revisione in `../references/revisione-design.md` propone di
> sostituire la spiegazione frontale con carte-dilemma lette dai giocatori, per ridurre
> i tempi morti. Non ancora recepito nelle regole.

## Carte Archivio Storico

Tra un turno e l'altro (o durante le soste) si possono leggere ad alta voce le carte
dell'Archivio Storico: curiosità documentate che tengono viva l'attenzione di chi non
sta giocando il turno.
