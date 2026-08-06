import type {
  CharacterCard, Project, Rect, StitchLine, CardFormat, Era,
} from './types';

export const DPI = 300;
export const BLEED = 36; // 3 mm a 300 DPI
export const PLATE_W = 600;
export const PLATE_H = 158;
export const TBOX_W = 724;
export const TBOX_H = 478;
export const PAD = 24;
export const SNAP = 10;
export const HANDLE = 34;
export const BOX_MIN = { w: 200, h: 120 };
export const PLATE_MIN = { w: 160, h: 60 };

export const cmToPx = (cm: number) => Math.round((cm * 10 * DPI) / 25.4);

/** Dimensioni canvas (bleed incluso) per un formato, in ritratto. */
export function portraitPx(f: CardFormat) {
  return { w: cmToPx(f.wCm) + 2 * BLEED, h: cmToPx(f.hCm) + 2 * BLEED };
}

export const ERA_STYLE: Record<Era, { top: string; bottom: string; ray: string; label: string }> = {
  1: { top: '#F7E9C6', bottom: '#EDC378', ray: '#EFC468', label: 'ERA 1 · UNITÀ (1861–1914)' },
  2: { top: '#CBD6D8', bottom: '#93A7B2', ray: '#E9EEE6', label: 'ERA 2 · RESISTENZA (1915–1945)' },
  3: { top: '#F2DCA6', bottom: '#E2A55C', ray: '#E7B364', label: 'ERA 3 · REPUBBLICA (1946–1948)' },
};

export const ARC_ERA_COL: Record<number, string> = {
  1: '#B07A28', 2: '#55636F', 3: '#A85E2C',
};

export const IMP_ACCENT = { malus: '#8A2F24', bonus: '#3E6B4F' } as const;

export function defPlate(W: number): Rect {
  const w = Math.min(PLATE_W, W - 140);
  return { x: (W - w) / 2, y: 50, w, h: Math.round((PLATE_H * w) / PLATE_W) };
}
export function defBox(W: number, H: number): Rect {
  const w = Math.min(TBOX_W, W - 96);
  const h = Math.min(Math.round((TBOX_H * w) / TBOX_W), H - 320);
  return { x: (W - w) / 2, y: H - BLEED - 50 - h + 8, w, h };
}
export function defQuizBox(W: number, H: number): Rect {
  const w = Math.min(TBOX_W, W - 96);
  const h = Math.min(806, H - 316);
  return { x: (W - w) / 2, y: Math.round((246 * H) / 1122), w, h };
}
export function defLandPlate(W: number): Rect {
  const w = Math.min(520, W - 280);
  return { x: (W - w) / 2, y: 34, w, h: Math.round((PLATE_H * w) / PLATE_W) };
}
export function defLandWidePlate(W: number): Rect {
  const w = Math.min(640, W - 220);
  return { x: (W - w) / 2, y: 34, w, h: Math.round((PLATE_H * w) / PLATE_W) };
}
export function defLandBox(W: number, H: number): Rect {
  return { x: 64, y: 64, w: W - 128, h: H - 128 };
}

export const DEFAULT_STITCHES: [StitchLine, StitchLine] = [
  { on: true, color: '#ecdbb2', width: 3, dash: 10, gap: 8, inset: 14 },
  { on: false, color: '#3a2414', width: 2, dash: 6, gap: 6, inset: 34 },
];

const CHAR_DEFAULTS: Array<Omit<CharacterCard, 'layout' | 'nameSize' | 'bodySize' | 'showPlate' | 'showBox'>> = [
  {
    id: 'il_patriota', artKey: 'il_patriota', name: 'IL PATRIOTA',
    era: 'ERA 1 · UNITÀ (1861–1914)',
    storia: '“Hai sognato un\'Italia unita per tutta la vita e non vedi l\'ora di vederla nascere.”',
    potereNome: 'ARDOR RISORGIMENTALE',
    potere: 'Sei il portavoce del gruppo nell\'Era 1. Una volta per partita puoi far eliminare un\'opzione errata da una domanda a scelta multipla.',
  },
  {
    id: 'la_staffetta', artKey: 'la_staffetta', name: 'LA STAFFETTA',
    era: 'ERA 2 · RESISTENZA (1915–1945)',
    storia: '“Hai portato messaggi segreti attraverso le linee nemiche, rischiando la vita per la libertà.”',
    potereNome: 'VIAGGIO SICURO',
    potere: 'Una volta per partita puoi annullare l\'effetto negativo di una carta Imprevisto pescata dal tuo gruppo.',
  },
  {
    id: 'l_operaio', artKey: 'l_operaio', name: "L'OPERAIO/A",
    era: 'ERA 3 · COSTITUZIONE (1946–1948)',
    storia: '“Speri in un\'Italia fondata sul lavoro, sulla dignità e sui diritti di chi produce.”',
    potereNome: 'SOLIDARIETÀ',
    potere: 'Guidi la scelta dei Gettoni Valore: quando il gruppo risponde correttamente nell\'Era 3, scegli quale gettone incassare tra due opzioni.',
  },
  {
    id: 'la_prima_elettrice', artKey: 'la_prima_elettrice', name: 'LA PRIMA ELETTRICE',
    era: 'FASE FINALE · IL VOTO (1946)',
    storia: '“È il 2 giugno 1946: non hai mai votato prima d\'ora e oggi la tua voce conta davvero.”',
    potereNome: 'PARI OPPORTUNITÀ',
    potere: 'Ricevi per prima la scheda elettorale. Se il gruppo sbaglia una risposta, ottieni un secondo tentativo argomentando la risposta al docente.',
  },
  {
    id: 'il_segretario', artKey: 'il_segretario', name: 'IL SEGRETARIO',
    era: 'RUOLO TRASVERSALE',
    storia: '“Sei preciso e attento a ogni dettaglio: la legge si costruisce parola per parola.”',
    potereNome: 'COSTITUENTE',
    potere: 'Custodisci i Gettoni Valore e aggiorni il Passaporto del Cittadino: solo tu puoi spenderli per attivare gli aiuti del gruppo.',
  },
];

export function createProject(name: string): Project {
  const format: CardFormat = { wCm: 6.35, hCm: 8.89 };
  const { w: W, h: H } = portraitPx(format);
  const L = { w: H, h: W }; // spazio orizzontale
  const now = Date.now();
  return {
    id: `p_${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    createdAt: now,
    updatedAt: now,
    format,
    stitches: [
      { ...DEFAULT_STITCHES[0] },
      { ...DEFAULT_STITCHES[1] },
    ],
    characters: CHAR_DEFAULTS.map((c) => ({
      ...c,
      layout: { plate: defPlate(W), box: defBox(W, H) },
      nameSize: 46,
      bodySize: 27,
      showPlate: true,
      showBox: true,
    })),
    quiz: [
      { era: 1, domanda: "In quale anno è stata proclamata ufficialmente l'Unità d'Italia con Vittorio Emanuele II Re d'Italia?", opzioni: ['1848', '1861', '1870'], risposta: 'B', gettone: 'LIBERTÀ' },
      { era: 2, domanda: "Che cos'era la CLN durante il periodo della Resistenza italiana?", opzioni: ['Comitato di Liberazione Nazionale', 'Confederazione Lavoratori del Nord', 'Comando Legione Nuova'], risposta: 'A', gettone: 'PACE' },
      { era: 3, domanda: 'In quale data entrò in vigore la Costituzione della Repubblica Italiana?', opzioni: [], risposta: 'Il 1° gennaio 1948', gettone: 'UGUAGLIANZA' },
    ],
    events: [
      { titolo: 'Censura!', testo: 'La libertà di stampa viene fortemente limitata dalle autorità. Le comunicazioni del vostro gruppo sono bloccate.', effetto: 'Perdi un turno', tipo: 'malus' },
      { titolo: 'Moti Popolari', testo: 'La popolazione scende in piazza per chiedere riforme giuste e rappresentanza democratica.', effetto: 'Avanza di 2 caselle', tipo: 'bonus' },
    ],
    archive: [
      { titolo: 'Un regno senza capitale fissa', anno: '1865', testo: "Prima di Roma, la capitale d'Italia cambiò due volte: da Torino a Firenze, tra proteste, polemiche e traslochi di interi ministeri.", era: 1 },
      { titolo: 'Le madri costituenti', anno: '1946', testo: "Tra i 556 membri dell'Assemblea Costituente sedevano 21 donne: contribuirono a scrivere articoli fondamentali della nostra Carta.", era: 3 },
    ],
    quizLayout: { plate: defPlate(W), box: defQuizBox(W, H) },
    eventLayout: { plate: defLandPlate(L.w), box: defLandBox(L.w, L.h) },
    archiveLayout: { plate: defLandWidePlate(L.w), box: defLandBox(L.w, L.h) },
  };
}
