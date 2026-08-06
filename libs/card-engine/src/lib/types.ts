/** Rettangolo posizionabile/ridimensionabile sul canvas (px a 300 DPI). */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Era = 1 | 2 | 3;

export interface CharacterCard {
  id: string;
  name: string;
  era: string; // etichetta libera, es. "ERA 1 · UNITÀ (1861–1914)"
  storia: string;
  potereNome: string;
  potere: string;
  /** chiave dell'illustrazione negli asset (es. "il_patriota") */
  artKey: string;
  layout: { plate: Rect; box: Rect };
  nameSize: number;
  bodySize: number;
  showPlate: boolean;
  showBox: boolean;
}

export interface QuizCard {
  era: Era;
  domanda: string;
  opzioni: string[];
  risposta: string;
  gettone: string;
}

export interface EventCard {
  titolo: string;
  testo: string;
  effetto: string;
  tipo: 'bonus' | 'malus';
}

export interface ArchiveCard {
  titolo: string;
  anno: string;
  testo: string;
  era: Era | 0;
}

export type DeckKind = 'characters' | 'quiz' | 'events' | 'archive';

export interface StitchLine {
  on: boolean;
  color: string;
  width: number;
  dash: number;
  gap: number;
  /** distanza dal filo di taglio, in px */
  inset: number;
}

export interface CardFormat {
  /** misure della carta finita al taglio, in cm */
  wCm: number;
  hCm: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  format: CardFormat;
  stitches: [StitchLine, StitchLine];
  characters: CharacterCard[];
  quiz: QuizCard[];
  events: EventCard[];
  archive: ArchiveCard[];
  /** layout condivisi per i mazzi generati */
  quizLayout: { plate: Rect; box: Rect };
  eventLayout: { plate: Rect; box: Rect };
  archiveLayout: { plate: Rect; box: Rect };
  /** cartella del gioco in docs/ da cui caricare template e asset */
  docsSlug?: string;
  /** template a layer dei mazzi (sistema a componenti SVG) */
  quizTemplate?: CardTemplate;
  charTemplate?: CardTemplate;
  eventTemplate?: CardTemplate;
  archiveTemplate?: CardTemplate;
}

/* ---------- sistema a layer (carte componibili da SVG) ---------- */

export interface LayerStyle {
  size: number;
  color: string;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle';
  /** riduci il font finché il testo entra nel rettangolo */
  shrink?: boolean;
}

interface LayerBase {
  id: string;
  name: string;
  rect: Rect;
  z: number;
  visible: boolean;
  /** un layer bloccato non si sposta/ridimensiona dal canvas (es. sfondi a tutta carta) */
  locked?: boolean;
}

export interface ImageLayer extends LayerBase {
  type: 'image';
  /** percorso relativo alla cartella del gioco; ammessi segnaposto tipo {era} */
  src: string;
  fit?: 'stretch' | 'cover';
}

export interface TextLayer extends LayerBase {
  type: 'text';
  /** testo con segnaposto sui campi carta: {era}, {gettone}, {domanda}… */
  pattern: string;
  style: LayerStyle;
}

/** Blocco composito: impaginazione ricca gestita dal renderer del mazzo. */
export interface BlockLayer extends LayerBase {
  type: 'block';
  block: 'quiz' | 'event' | 'archive' | 'character';
  /** spazio riservato in alto dentro il rettangolo (es. sotto la targhetta) */
  padTop?: number;
}

export type Layer = ImageLayer | TextLayer | BlockLayer;

export interface CardTemplate {
  deck: string;
  version: number;
  canvas: { w: number; h: number };
  layers: Layer[];
}

/** Immagini decodificate pronte per il canvas. */
export interface AssetMap {
  frame: CanvasImageSource;
  tbox: CanvasImageSource;
  plate: CanvasImageSource;
  arts: Record<string, CanvasImageSource>;
}

export interface RenderOpts {
  editing?: boolean;
  cutLine?: boolean;
  guide?: boolean;
  snapped?: boolean;
}
