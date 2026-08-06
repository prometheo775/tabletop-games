import type { ArchiveCard, EventCard, QuizCard } from './types';

/** Estrae il JSON anche se avvolto in ```json … ``` o in frasi di contorno. */
export function sanitizeJson(text: string): string {
  const t = String(text).replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '');
  const starts = [t.indexOf('{'), t.indexOf('[')].filter((i) => i >= 0);
  const ends = [t.lastIndexOf('}'), t.lastIndexOf(']')].filter((i) => i >= 0);
  if (!starts.length || !ends.length) return t.trim();
  return t.slice(Math.min(...starts), Math.max(...ends) + 1).trim();
}

type ParseResult<T> = { cards: T[] } | { err: string };

function parseRoot(text: string, key: string): { arr: unknown[] } | { err: string } {
  let obj: unknown;
  try {
    obj = JSON.parse(sanitizeJson(text));
  } catch (e) {
    return { err: `JSON non valido: ${(e as Error).message}` };
  }
  const arr = Array.isArray(obj) ? obj : (obj as Record<string, unknown>)?.[key];
  if (!Array.isArray(arr) || !arr.length) {
    return { err: `Nessuna carta trovata: atteso {"${key}":[…]} o un array.` };
  }
  return { arr };
}

export function parseQuizJson(text: string): ParseResult<QuizCard> {
  const root = parseRoot(text, 'carte');
  if ('err' in root) return root;
  const cards: QuizCard[] = [];
  for (const r of root.arr as Array<Record<string, unknown>>) {
    if (!r || typeof r.domanda !== 'string' || !r.domanda.trim()) continue;
    cards.push({
      era: ([1, 2, 3].includes(Number(r.era)) ? Number(r.era) : 1) as 1 | 2 | 3,
      domanda: r.domanda.trim(),
      opzioni: Array.isArray(r.opzioni) ? r.opzioni.map(String).slice(0, 4) : [],
      risposta: r.risposta != null ? String(r.risposta) : '',
      gettone: r.gettone ? String(r.gettone).toUpperCase() : 'VALORE',
    });
  }
  if (!cards.length) return { err: 'Nessuna carta valida: ogni voce deve avere almeno "domanda".' };
  return { cards };
}

export function parseEventJson(text: string): ParseResult<EventCard> {
  const root = parseRoot(text, 'imprevisti');
  if ('err' in root) return root;
  const cards: EventCard[] = [];
  for (const r of root.arr as Array<Record<string, unknown>>) {
    if (!r) continue;
    const titolo = r.titolo != null ? String(r.titolo).trim() : '';
    const effetto = r.effetto != null ? String(r.effetto).trim() : '';
    if (!titolo && !effetto) continue;
    cards.push({
      titolo: titolo || 'Imprevisto',
      testo: r.testo != null ? String(r.testo).trim() : '',
      effetto,
      tipo: /^b/i.test(String(r.tipo || '')) ? 'bonus' : 'malus',
    });
  }
  if (!cards.length) return { err: 'Nessuna carta valida: serve almeno "titolo" o "effetto".' };
  return { cards };
}

export function parseArchiveJson(text: string): ParseResult<ArchiveCard> {
  const root = parseRoot(text, 'archivio');
  if ('err' in root) return root;
  const cards: ArchiveCard[] = [];
  for (const r of root.arr as Array<Record<string, unknown>>) {
    if (!r || typeof r.testo !== 'string' || !r.testo.trim()) continue;
    cards.push({
      titolo: r.titolo != null && String(r.titolo).trim() ? String(r.titolo).trim() : 'Curiosità storica',
      anno: r.anno != null ? String(r.anno).trim() : '',
      testo: r.testo.trim(),
      era: ([1, 2, 3].includes(Number(r.era)) ? Number(r.era) : 0) as 0 | 1 | 2 | 3,
    });
  }
  if (!cards.length) return { err: 'Nessuna carta valida: ogni voce deve avere almeno "testo".' };
  return { cards };
}

export const AI_PROMPTS = {
  quiz: `Sei un autore di quiz didattici per la scuola secondaria. Devi generare le carte "Sapere" del gioco da tavolo "Caccia alla Repubblica" (storia italiana: dall'Unità d'Italia alla Costituzione).

Ti allego un file con l'elenco delle domande o degli argomenti da trasformare in domande: convertilo in un unico oggetto JSON con ESATTAMENTE questa struttura, senza alcun testo prima o dopo:

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

Regole:
- "era": 1 = Unità (1861-1914), 2 = Transizione/Resistenza (1915-1945), 3 = Repubblica/Costituzione (1946-1948)
- "opzioni": da 2 a 4 voci brevi; usa un array vuoto [] per le domande a risposta aperta
- "risposta": la lettera dell'opzione corretta (A, B, C o D); per le domande aperte scrivi la risposta per esteso
- "gettone": una parola tra LIBERTÀ, UGUAGLIANZA, DIGNITÀ, ISTRUZIONE, PACE, LAVORO
- Linguaggio adatto agli studenti; domande di massimo 140 caratteri
- Se non trovi un file allegato, genera tu 8 domande per ciascuna era

Rispondi SOLO con il JSON valido.`,

  events: `Sei un autore di giochi da tavolo didattici. Devi generare le carte "Imprevisto" del gioco "Caccia alla Repubblica": eventi della storia italiana (1861-1948) che danno un bonus o un malus di movimento alle squadre, nello stile degli Imprevisti del Monopoli.

Ti allego un file con l'elenco degli eventi o degli effetti desiderati: convertilo in un unico oggetto JSON con ESATTAMENTE questa struttura, senza alcun testo prima o dopo:

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

Regole:
- "tipo": "bonus" (aiuta la squadra) oppure "malus" (la ostacola)
- "effetto": azione di gioco breve e chiara, massimo 40 caratteri (es. "Avanza di 2 caselle", "Fermo un turno", "Tira di nuovo")
- "testo": 1-2 frasi evocative ispirate a fatti storici reali del periodo 1861-1948, massimo 160 caratteri
- "titolo": massimo 3 parole, tono da titolo di giornale d'epoca
- Alterna bonus e malus in modo equilibrato
- Se non trovi un file allegato, genera tu 6 carte bonus e 6 carte malus

Rispondi SOLO con il JSON valido.`,

  archive: `Sei un divulgatore storico per la scuola secondaria. Devi generare le carte "Archivio Storico" del gioco "Caccia alla Repubblica": brevi curiosità sorprendenti ma documentate sulla storia italiana dal 1861 al 1948, da leggere ad alta voce durante la partita.

Ti allego un file con gli argomenti o le curiosità da usare: convertilo in un unico oggetto JSON con ESATTAMENTE questa struttura, senza alcun testo prima o dopo:

{
  "archivio": [
    {
      "titolo": "Un regno senza capitale fissa",
      "anno": "1865",
      "testo": "Prima di Roma, la capitale d'Italia cambiò due volte: da Torino a Firenze, tra proteste e traslochi di interi ministeri.",
      "era": 1
    }
  ]
}

Regole:
- "titolo": massimo 6 parole, incuriosisce senza svelare tutto
- "anno": l'anno o la data dell'episodio (es. "1893" oppure "2 giugno 1946")
- "testo": la curiosità in 1-3 frasi, massimo 220 caratteri, storicamente accurata e adatta agli studenti
- "era": 1 = Unità (1861-1914), 2 = Transizione/Resistenza (1915-1945), 3 = Repubblica (1946-1948)
- Varia i temi: vita quotidiana, invenzioni, personaggi, primati, aneddoti curiosi ma verificati
- Se non trovi un file allegato, genera tu 4 curiosità per ciascuna era

Rispondi SOLO con il JSON valido.`,
} as const;
