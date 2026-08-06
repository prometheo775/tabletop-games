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
      { titolo: "La scuola diventa per tutti", anno: "1877", testo: "Nel 1877 la Legge Coppino rende obbligatoria la scuola elementare per tutti i bambini. Imparare a leggere e scrivere diventa fondamentale per costruire una nazione unita.", era: 1 },
      { titolo: "Un Paese senza lingua comune", anno: "1861", testo: "Nel 1861 meno del 3% degli italiani utilizzava abitualmente la lingua italiana. La scuola, il servizio militare e i giornali contribuirono lentamente a creare una lingua comune.", era: 1 },
      { titolo: "Sogni d'oltremare a Ellis Island", anno: "1892", testo: "Dal 1892 milioni di emigranti arrivano a Ellis Island a New York. Tantissimi italiani sbarcano qui dopo settimane in nave, e alcuni cambiano cognome per iniziare una nuova vita.", era: 1 },
      { titolo: "Nasce il soccorso senza confini", anno: "1864", testo: "Nel 1864 nasce la Croce Rossa Italiana. Da oltre un secolo presta soccorso e assistenza durante guerre, terremoti e grandi emergenze nazionali.", era: 1 },
      { titolo: "Un tesoro in uno scatto", anno: "1890", testo: "Alla fine dell'Ottocento farsi fotografare era un evento raro e molto costoso. Molte famiglie possedevano una sola fotografia, conservata con grande cura per tutta la vita.", era: 1 },
      { titolo: "Il tricolore che si mangia", anno: "1889", testo: "Nel 1889 il pizzaiolo Raffaele Esposito dedica una pizza alla regina Margherita di Savoia condita con pomodoro, mozzarella e basilico per richiamare i colori della bandiera.", era: 1 },
      { titolo: "Nasce la grande fabbrica italiana", anno: "1899", testo: "Nel 1899 nasce a Torino la Fabbrica Italiana Automobili Torino (FIAT), destinata a diventare una delle aziende più importanti della storia industriale del Paese.", era: 1 },
      { titolo: "Un'unica ora per tutti", anno: "1893", testo: "Prima del XIX secolo ogni città seguiva il proprio orario solare. Con lo sviluppo della rete ferroviaria divenne necessario adottare la stessa ora in tutta Italia.", era: 1 },
      { titolo: "La voce che unisce l'Italia", anno: "1924", testo: "Negli anni Venti la radio entra nelle case degli italiani. Le famiglie si riuniscono per ascoltare notizie e musica, ma durante il fascismo diventa un potente mezzo di propaganda.", era: 2 },
      { titolo: "Parole dal fronte di guerra", anno: "1915-1918", testo: "Durante la Prima guerra mondiale milioni di lettere vengono scambiate tra soldati e famiglie. Per moltissimi erano l'unico legame con i propri cari al fronte.", era: 2 },
      { titolo: "Quando lo sport si ferma", anno: "1916-1944", testo: "A causa dei due devastanti conflitti mondiali, i Giochi Olimpici del 1916, del 1940 e del 1944 vengono completamente sospesi in tutto il mondo.", era: 2 },
      { titolo: "Topolino conquista il mondo", anno: "1928", testo: "Nel 1928 fa la sua prima apparizione il personaggio di Topolino. Mentre l'Europa attraversa profonde tensioni politiche, nasce un'icona dell'animazione.", era: 2 },
      { titolo: "La legge fondamentale dello Stato", anno: "1° gennaio 1948", testo: "Dopo un lungo lavoro di ricostruzione democratica, il 1° gennaio 1948 entra ufficialmente in vigore la Costituzione della Repubblica Italiana.", era: 3 },
      { titolo: "Le Madri della Repubblica", anno: "1946", testo: "Tra i 556 membri dell'Assemblea Costituente eletti nel 1946 figurano anche 21 donne. Sono ricordate storicamente come le Madri Costituenti.", era: 3 },
      { titolo: "La voce di ciascun cittadino", anno: "1946", testo: "Nel dopoguerra votare diventa un diritto per tutti i cittadini maggiorenni. Con la tessera elettorale ognuno può partecipare direttamente alle decisioni del Paese.", era: 3 },
      { titolo: "L'eccellenza che conquista il mondo", anno: "1946", testo: "Nel dopoguerra l'ingegno e lo stile delle aziende italiane iniziano a distinguersi a livello internazionale, ponendo le basi per il celebre fenomeno del Made in Italy.", era: 3 },
      { titolo: "Una nuova speranza di pace", anno: "1945", testo: "Al termine della Seconda guerra mondiale nasce l'Organizzazione delle Nazioni Unite (ONU), creata con l'obiettivo fondamentale di preservare la pace tra gli Stati.", era: 3 },
      { titolo: "I principi fondamentali della democrazia", anno: "1948", testo: "Dal 1948 la Costituzione rappresenta la bussola della democrazia italiana. Nonostante le riforme negli anni, i suoi valori fondanti restano intatti.", era: 3 },
      { titolo: "L'articolo che non si cambia", anno: "1947", testo: "L'Articolo 139 chiude la Costituzione con un lucchetto supremo: stabilisce che la forma repubblicana non potrà mai essere modificata, nemmeno con una legge di riforma.", era: 3 },
      { titolo: "La lezione del fascismo", anno: "1948", testo: "Per evitare un altro regime, l'Articolo 21 vietò del tutto la censura sui giornali. Durante la dittatura fascista, la stampa era controllata e punita dal governo.", era: 3 },
      { titolo: "Pace scritta sui fogli", anno: "1947", testo: "Usciti dalla devastazione della Seconda Guerra Mondiale, i Costituenti vollero fortemente l'Articolo 11: l'Italia fu tra le prime nazioni a ripudiare la guerra per legge.", era: 3 },
      { titolo: "Ventun donne alla Storia", anno: "1946", testo: "Tra i 556 membri dell'Assemblea Costituente c'erano 21 donne, chiamate 'Madri Costituenti'. Si batterono per inserire l'uguaglianza di genere nell'Articolo 3.", era: 3 },
      { titolo: "Il lavoro al primo posto", anno: "1947", testo: "I Costituenti discussero a lungo su come aprire l'Articolo 1. Vinse la formula 'fondata sul lavoro' per mettere al centro i cittadini e i loro sforzi, non il censo.", era: 3 },
      { titolo: "Tutela dell'arte in anticipo", anno: "1948", testo: "Con l'Articolo 9, l'Italia fu uno dei primi Paesi al mondo a proteggere in Costituzione il patrimonio artistico e il paesaggio, oggi esteso anche all'ambiente.", era: 3 },
      { titolo: "La firma di un non re", anno: "27 dicembre 1947", testo: "Enrico De Nicola, primo Capo provvisorio dello Stato, firmò la Costituzione con una penna stilografica economica, rifiutando cerimonie sfarzose in segno di sobrietà.", era: 3 },
      { titolo: "Istruzione aperta a tutti", anno: "1948", testo: "L'Articolo 34 garantisce la scuola gratuita e obbligatoria per tutti e prevede borse di studio affinché i giovani meritevoli privi di mezzi raggiungano i gradi più alti.", era: 3 },
      { titolo: "Salute come diritto supremo", anno: "1948", testo: "L'Articolo 32 definisce la salute come diritto fondamentale dell'individuo e dovere della collettività, garantendo cure mediche gratuite a chi non ha possibilità economiche.", era: 3 },
      { titolo: "Religioni libere davanti alla legge", anno: "1948", testo: "L'Articolo 8 fu un punto di svolta: garantì che tutte le confessioni religiose fossero egualmente libere di praticare il proprio culto davanti alla legge dello Stato.", era: 3 },
      { titolo: "Diritti inviolabili di nascita", anno: "1948", testo: "L'Articolo 2 riconosce che i diritti umani non sono concessi dallo Stato, ma esistono prima di esso. In cambio richiede solidarietà sociale ed economica tra i cittadini.", era: 3 },
      { titolo: "Uguaglianza non solo sulla carta", anno: "1947", testo: "L'Articolo 3 non dice solo che siamo uguali, ma impegna lo Stato a rimuovere gli ostacoli economici e sociali che impediscono il pieno sviluppo di ogni persona.", era: 3 },
      { titolo: "Niente arresti senza giudice", anno: "1948", testo: "Per proteggere la libertà personale, l'Articolo 13 vietò le perquisizioni e i fermi arbitrari della polizia senza un atto motivato firmato da un magistrato.", era: 3 },
      { titolo: "La scelta del Tricolore", anno: "1947", testo: "L'Articolo 12 definì la bandiera italiana: il Tricolore verde, bianco e rosso, eliminando lo stemma della casa reale dei Savoia al centro dopo la vittoria della Repubblica.", era: 3 },
      { titolo: "Diritto e dovere di votare", anno: "1948", testo: "L'Articolo 48 sancì che il voto è personale, eguale, libero e segreto. Definì l'atto di votare non solo un diritto, ma un dovere civico per costruire la democrazia.", era: 3 },
      { titolo: "Le tasse secondo le possibilità", anno: "1948", testo: "L'Articolo 53 stabilì il principio di progressività fiscale: chi guadagna di più deve contribuire alle spese dello Stato in proporzione maggiore rispetto ai meno abbienti.", era: 3 },
      { titolo: "Protezione per chi scappa", anno: "1948", testo: "L'Articolo 10 aprì le porte al diritto d'asilo, garantendo accoglienza a tutti gli stranieri a cui nel proprio Paese viene impedito l'esercizio delle libertà democratiche.", era: 3 },
      { titolo: "Autonomie contro il potere unico", anno: "1948", testo: "L'Articolo 5 riconosce la Repubblica una e indivisibile, ma promuove il decentramento dando valore ai Comuni e alle Regioni per evitare l'accentramento dei regimi.", era: 3 }
    ],
    quizLayout: { plate: defPlate(W), box: defQuizBox(W, H) },
    eventLayout: { plate: defLandPlate(L.w), box: defLandBox(L.w, L.h) },
    archiveLayout: { plate: defLandWidePlate(L.w), box: defLandBox(L.w, L.h) },
  };
}
