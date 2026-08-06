# Schemi JSON dei mazzi (contratto con lo studio carte)

I parser sono in `libs/card-engine/src/lib/io.ts`. Tollerano JSON avvolto in ``` o in
frasi di contorno, ma i nomi dei campi e i valori ammessi sono questi — esatti.

## Mazzo Sapere (quiz) — `cards/sapere.json`

```json
{
  "carte": [
    {
      "era": 1,
      "domanda": "In quale anno è stata proclamata l'Unità d'Italia?",
      "opzioni": ["1848", "1861", "1870"],
      "risposta": "B",
      "gettone": "LIBERTÀ"
    }
  ]
}
```

- `era`: 1 (Unità 1861-1914), 2 (Transizione/Resistenza 1915-1945), 3 (Repubblica 1946-1948)
- `opzioni`: da 2 a 4 voci brevi; array vuoto `[]` per le domande a risposta aperta
- `risposta`: lettera dell'opzione corretta (A-D); per le aperte la risposta per esteso
- `gettone`: una tra `LIBERTÀ, UGUAGLIANZA, DIGNITÀ, ISTRUZIONE, PACE, LAVORO`
- `domanda`: max ~140 caratteri (vincolo di impaginazione)

## Mazzo Imprevisti — `cards/imprevisti.json`

```json
{
  "imprevisti": [
    {
      "titolo": "Censura!",
      "testo": "La libertà di stampa viene fortemente limitata dalle autorità.",
      "effetto": "Perdi un turno",
      "tipo": "malus"
    }
  ]
}
```

- `tipo`: `"bonus"` o `"malus"`
- `titolo`: max 3 parole, tono da titolo di giornale d'epoca
- `testo`: 1-2 frasi, max ~160 caratteri
- `effetto`: azione di gioco breve, max ~40 caratteri (es. "Avanza di 2 caselle")

## Mazzo Archivio Storico — `cards/archivio.json`

```json
{
  "archivio": [
    {
      "titolo": "Un regno senza capitale fissa",
      "anno": "1865",
      "testo": "Prima di Roma, la capitale cambiò due volte: da Torino a Firenze.",
      "era": 1
    }
  ]
}
```

- `titolo`: max 6 parole; `anno`: anno o data (es. "2 giugno 1946")
- `testo`: 1-3 frasi, max ~220 caratteri, storicamente accurato
- `era`: 1-3 (0 = trasversale è accettato dal parser ma evitalo nelle carte nuove)

## Personaggi — nessun JSON

I personaggi vivono in `libs/card-engine/src/lib/defaults.ts` (campo per campo:
`name`, `era`, `storia`, `potereNome`, `potere`, `artKey`). Il file
`cards/personaggi.md` deve restare identico ai default, parola per parola.

## Prompt IA pronti

Lo studio espone tre prompt già pronti per generare i mazzi con un'IA
(`AI_PROMPTS` in `libs/card-engine/src/lib/io.ts`): se devi generare molte carte,
riusa quei prompt come base invece di reinventare le istruzioni.
