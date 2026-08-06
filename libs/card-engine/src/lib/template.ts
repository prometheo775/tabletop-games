import type {
  ArchiveCard, CardTemplate, CharacterCard, EventCard, Layer, QuizCard, RenderOpts, TextLayer,
} from './types';
import { drawCover, drawGrip, drawOverlays } from './paint';
import {
  drawArchiveBody, drawCharacterBody, drawEventBody, drawQuizBody,
} from './render';

type Ctx = CanvasRenderingContext2D;
const FONT = 'Georgia, serif';

/**
 * Sistema a layer: una carta è uno stack di componenti (SVG/immagini, testi,
 * blocchi compositi) dichiarati in un template JSON nella cartella del gioco
 * (docs/<slug>/cards/templates/). Ogni layer ha rettangolo, z, visibilità.
 */

export type TemplateCard = QuizCard | EventCard | ArchiveCard | CharacterCard;

/** Sostituisce i segnaposto {campo} con i valori della carta (es. {era}, {artKey}). */
export function resolvePattern(pattern: string, card: Partial<TemplateCard> | undefined): string {
  return pattern.replace(/\{(\w+)\}/g, (m, k: string) => {
    const v = card ? (card as Record<string, unknown>)[k] : undefined;
    return v == null ? m : String(v);
  });
}

/** Tutti i src (già risolti) che servono per disegnare il template su questa carta. */
export function templateImageSrcs(tpl: CardTemplate, card: Partial<TemplateCard> | undefined): string[] {
  const out = new Set<string>();
  for (const l of tpl.layers) {
    if (l.type === 'image') out.add(resolvePattern(l.src, card));
  }
  return [...out];
}

export function sortedLayers(tpl: CardTemplate): Layer[] {
  return [...tpl.layers].sort((a, b) => a.z - b.z);
}

function drawTextLayer(c: Ctx, l: TextLayer, card: Partial<TemplateCard> | undefined) {
  const text = resolvePattern(l.pattern, card);
  if (!text) return;
  const s = l.style;
  let size = s.size;
  const weight = `${s.bold ? 'bold ' : ''}${s.italic ? 'italic ' : ''}`;
  c.font = `${weight}${size}px ${FONT}`;
  if (s.shrink) {
    while (size > 11 && c.measureText(text).width > l.rect.w) {
      size -= 1;
      c.font = `${weight}${size}px ${FONT}`;
    }
  }
  c.fillStyle = s.color;
  c.textAlign = s.align ?? 'left';
  const x = s.align === 'center' ? l.rect.x + l.rect.w / 2
    : s.align === 'right' ? l.rect.x + l.rect.w : l.rect.x;
  if (s.valign === 'middle') {
    c.textBaseline = 'middle';
    c.fillText(text, x, l.rect.y + l.rect.h / 2 + 1);
  } else {
    c.textBaseline = 'top';
    c.fillText(text, x, l.rect.y);
  }
}

function drawEmptyDeck(c: Ctx, W: number, H: number) {
  c.font = `italic 30px ${FONT}`;
  c.fillStyle = '#5a3a22';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('Nessuna carta nel mazzo', W / 2, H / 2);
}

export interface TemplateRenderOpts extends RenderOpts {
  /** layer selezionato nell'editor: viene evidenziato con bordo e maniglia */
  selectedId?: string | null;
}

export function renderTemplate(
  c: Ctx, W: number, H: number, tpl: CardTemplate,
  images: Record<string, CanvasImageSource | undefined>,
  card: TemplateCard | undefined, opts: TemplateRenderOpts = {},
) {
  c.clearRect(0, 0, W, H);

  const side = opts.side ?? 'front';

  for (const l of sortedLayers(tpl)) {
    const lSide = l.side ?? 'front';
    if (lSide !== side) continue;
    if (!l.visible) continue;
    if (l.type === 'image') {
      const img = images[resolvePattern(l.src, card)];
      if (!img) continue;
      if (l.fit === 'cover') {
        c.save();
        c.beginPath();
        c.rect(l.rect.x, l.rect.y, l.rect.w, l.rect.h);
        c.clip();
        c.translate(l.rect.x, l.rect.y);
        drawCover(c, img, l.rect.w, l.rect.h);
        c.restore();
      } else {
        c.drawImage(img, l.rect.x, l.rect.y, l.rect.w, l.rect.h);
      }
    } else if (l.type === 'text') {
      drawTextLayer(c, l, card);
    } else {
      if (!card) { drawEmptyDeck(c, W, H); continue; }
      const contentTop = l.rect.y + (l.padTop ?? 20);
      if (l.block === 'quiz') drawQuizBody(c, l.rect, card as QuizCard);
      else if (l.block === 'event') drawEventBody(c, l.rect, card as EventCard, contentTop);
      else if (l.block === 'archive') drawArchiveBody(c, l.rect, card as ArchiveCard, contentTop);
      else if (l.block === 'character') drawCharacterBody(c, l.rect, card as CharacterCard);
    }
  }

  if (opts.editing && opts.selectedId) {
    const sel = tpl.layers.find((l) => l.id === opts.selectedId);
    if (sel && sel.visible && (sel.side ?? 'front') === side) {
      c.strokeStyle = 'rgba(201,168,107,.9)';
      c.lineWidth = 2.5;
      c.setLineDash([9, 7]);
      c.strokeRect(sel.rect.x, sel.rect.y, sel.rect.w, sel.rect.h);
      c.setLineDash([]);
      if (!sel.locked) drawGrip(c, sel.rect.x + sel.rect.w, sel.rect.y + sel.rect.h);
    }
  }
  drawOverlays(c, W, H, opts);
}

/** Alias storico (il pilota era il solo mazzo Sapere). */
export const renderTemplateQuiz = renderTemplate;

/* ---------- template di fabbrica (identici ai JSON in cards/templates/) ---------- */

export const DEFAULT_QUIZ_TEMPLATE: CardTemplate = {
  deck: 'sapere',
  version: 1,
  canvas: { w: 822, h: 1122 },
  layers: [
    { id: 'sfondo-era', name: 'Sfondo Era', type: 'image', src: 'assets/sapere/sfondo-era-{era}.svg', rect: { x: 0, y: 0, w: 822, h: 1122 }, z: 0, visible: true, locked: true },
    { id: 'box-testo', name: 'Box pergamena', type: 'image', src: 'assets/tbox.svg', rect: { x: 73, y: 246, w: 676, h: 806 }, z: 10, visible: true },
    { id: 'cornice', name: 'Cornice pelle', type: 'image', src: 'assets/frame.svg', rect: { x: 0, y: 0, w: 822, h: 1122 }, z: 20, visible: true, locked: true },
    { id: 'targhetta', name: 'Targhetta', type: 'image', src: 'assets/plate.svg', rect: { x: 111, y: 50, w: 600, h: 158 }, z: 30, visible: true },
    { id: 'titolo', name: 'Titolo', type: 'text', pattern: 'SAPERE · ERA {era}', rect: { x: 141, y: 50, w: 540, h: 158 }, z: 31, visible: true, style: { size: 44, bold: true, color: '#F0E0BE', align: 'center', valign: 'middle', shrink: true } },
    { id: 'contenuto', name: 'Contenuto domanda', type: 'block', block: 'quiz', rect: { x: 73, y: 246, w: 676, h: 806 }, z: 40, visible: true },
  ],
};

export const DEFAULT_CHARACTER_TEMPLATE: CardTemplate = {
  deck: 'personaggi',
  version: 1,
  canvas: { w: 822, h: 1122 },
  layers: [
    { id: 'illustrazione', name: 'Illustrazione', type: 'image', src: 'assets/personaggi/art_{artKey}.png', fit: 'cover', rect: { x: 0, y: 0, w: 822, h: 1122 }, z: 0, visible: true, locked: true },
    { id: 'box-testo', name: 'Box pergamena', type: 'image', src: 'assets/tbox.svg', rect: { x: 49, y: 566, w: 724, h: 478 }, z: 10, visible: true },
    { id: 'cornice', name: 'Cornice pelle', type: 'image', src: 'assets/frame.svg', rect: { x: 0, y: 0, w: 822, h: 1122 }, z: 20, visible: true, locked: true },
    { id: 'targhetta', name: 'Targhetta', type: 'image', src: 'assets/plate.svg', rect: { x: 111, y: 50, w: 600, h: 158 }, z: 30, visible: true },
    { id: 'nome', name: 'Nome', type: 'text', pattern: '{name}', rect: { x: 141, y: 50, w: 540, h: 158 }, z: 31, visible: true, style: { size: 46, bold: true, color: '#F0E0BE', align: 'center', valign: 'middle', shrink: true } },
    { id: 'contenuto', name: 'Storia e potere', type: 'block', block: 'character', rect: { x: 49, y: 566, w: 724, h: 478 }, z: 40, visible: true },
  ],
};

export const DEFAULT_EVENT_TEMPLATE: CardTemplate = {
  deck: 'imprevisti',
  version: 1,
  canvas: { w: 1122, h: 822 },
  layers: [
    { id: 'sfondo', name: 'Sfondo', type: 'image', src: 'assets/imprevisti/sfondo.svg', rect: { x: 0, y: 0, w: 1122, h: 822 }, z: 0, visible: true, locked: true },
    { id: 'box-testo', name: 'Box pergamena', type: 'image', src: 'assets/tbox.svg', rect: { x: 64, y: 64, w: 994, h: 694 }, z: 10, visible: true },
    { id: 'cornice', name: 'Cornice pelle', type: 'image', src: 'assets/frame-orizzontale.svg', rect: { x: 0, y: 0, w: 1122, h: 822 }, z: 20, visible: true, locked: true },
    { id: 'targhetta', name: 'Targhetta', type: 'image', src: 'assets/plate.svg', rect: { x: 301, y: 34, w: 520, h: 137 }, z: 30, visible: true },
    { id: 'titolo', name: 'Titolo', type: 'text', pattern: 'IMPREVISTO', rect: { x: 331, y: 34, w: 460, h: 137 }, z: 31, visible: true, style: { size: 40, bold: true, color: '#F0E0BE', align: 'center', valign: 'middle', shrink: true } },
    { id: 'contenuto', name: 'Contenuto evento', type: 'block', block: 'event', rect: { x: 64, y: 64, w: 994, h: 694 }, z: 40, visible: true, padTop: 121 },
  ],
};

export const DEFAULT_ARCHIVE_TEMPLATE: CardTemplate = {
  deck: 'archivio',
  version: 1,
  canvas: { w: 1122, h: 822 },
  layers: [
    { id: 'sfondo', name: 'Sfondo', type: 'image', src: 'assets/archivio/sfondo.svg', rect: { x: 0, y: 0, w: 1122, h: 822 }, z: 0, visible: true, locked: true },
    { id: 'box-testo', name: 'Box pergamena', type: 'image', src: 'assets/tbox.svg', rect: { x: 64, y: 64, w: 994, h: 694 }, z: 10, visible: true },
    { id: 'cornice', name: 'Cornice pelle', type: 'image', src: 'assets/frame-orizzontale.svg', rect: { x: 0, y: 0, w: 1122, h: 822 }, z: 20, visible: true, locked: true },
    { id: 'targhetta', name: 'Targhetta', type: 'image', src: 'assets/plate.svg', rect: { x: 241, y: 34, w: 640, h: 169 }, z: 30, visible: true },
    { id: 'titolo', name: 'Titolo', type: 'text', pattern: 'ARCHIVIO STORICO', rect: { x: 271, y: 34, w: 580, h: 169 }, z: 31, visible: true, style: { size: 38, bold: true, color: '#F0E0BE', align: 'center', valign: 'middle', shrink: true } },
    { id: 'contenuto', name: 'Contenuto curiosità', type: 'block', block: 'archive', rect: { x: 64, y: 64, w: 994, h: 694 }, z: 40, visible: true, padTop: 153 },
  ],
};

export const DEFAULT_TEMPLATES: Record<string, CardTemplate> = {
  sapere: DEFAULT_QUIZ_TEMPLATE,
  personaggi: DEFAULT_CHARACTER_TEMPLATE,
  imprevisti: DEFAULT_EVENT_TEMPLATE,
  archivio: DEFAULT_ARCHIVE_TEMPLATE,
};

/** Valida/normalizza un template caricato da JSON esterno. */
export function parseTemplate(data: unknown): CardTemplate | null {
  const t = data as CardTemplate;
  if (!t || !Array.isArray(t.layers) || !t.canvas) return null;
  const layers = t.layers.filter((l) => l && l.id && l.rect && ['image', 'text', 'block'].includes(l.type));
  if (!layers.length) return null;
  return { deck: String(t.deck || 'sapere'), version: Number(t.version) || 1, canvas: t.canvas, layers };
}
