import {
  PLATE_W, PLATE_H, TBOX_W, TBOX_H, PAD, ERA_STYLE, IMP_ACCENT, ARC_ERA_COL,
} from './defaults';
import {
  wrapText, drawCover, drawFrameOriented, drawGrip, drawRays, drawBolt, drawStar,
  roundRectPath, drawOverlays,
} from './paint';
import type {
  AssetMap, ArchiveCard, CharacterCard, EventCard, QuizCard, Rect, RenderOpts, StitchLine,
} from './types';

type Ctx = CanvasRenderingContext2D;
const FONT = 'Georgia, serif';

function drawPlate(
  c: Ctx, assets: AssetMap, P: Rect, title: string, baseSize: number, editing?: boolean,
) {
  c.drawImage(assets.plate, P.x, P.y, P.w, P.h);
  let size = Math.max(12, baseSize * (P.h / PLATE_H));
  const maxW = P.w - 130 * (P.w / PLATE_W);
  c.font = `bold ${size}px ${FONT}`;
  while (size > 11 && c.measureText(title).width > maxW) {
    size -= 1;
    c.font = `bold ${size}px ${FONT}`;
  }
  c.fillStyle = '#F0E0BE';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(title, P.x + P.w / 2, P.y + P.h / 2 + 1);
  if (editing) drawGrip(c, P.x + P.w, P.y + P.h);
}

export interface CharacterRenderResult { overflow: boolean }

export function renderCharacter(
  c: Ctx, W: number, H: number, assets: AssetMap, stitches: StitchLine[],
  card: CharacterCard, opts: RenderOpts = {},
): CharacterRenderResult {
  c.clearRect(0, 0, W, H);
  const art = assets.arts[card.artKey];
  if (art) drawCover(c, art, W, H);
  drawFrameOriented(c, assets.frame, W, H, stitches);

  if (card.showPlate) {
    drawPlate(c, assets, card.layout.plate, card.name, card.nameSize, opts.editing);
  }

  let overflow = false;
  if (card.showBox) {
    const B = card.layout.box;
    c.drawImage(assets.tbox, B.x, B.y, B.w, B.h);
    overflow = drawCharacterBody(c, B, card);
    if (opts.editing) drawGrip(c, B.x + B.w, B.y + B.h);
  }

  drawOverlays(c, W, H, opts);
  return { overflow };
}

/** Corpo della carta Personaggio (era, storia, potere) dentro un rettangolo. */
export function drawCharacterBody(c: Ctx, B: Rect, card: CharacterCard): boolean {
  const padX = PAD * (B.w / TBOX_W);
  const padY = PAD * (B.h / TBOX_H);
  const ix = B.x + padX + 44;
  const iw = Math.max(120, B.w - 2 * padX - 88);
  const lh = card.bodySize + 7;
  const bottomLimit = B.y + B.h - padY - 26;
  let y = B.y + padY + 34;

  c.textBaseline = 'top';
  c.font = `bold ${Math.max(17, card.bodySize - 4)}px ${FONT}`;
  c.fillStyle = '#603A20';
  c.textAlign = 'center';
  const cxm = B.x + B.w / 2;
  c.fillText(card.era, cxm, y);
  const ew = c.measureText(card.era).width;
  c.strokeStyle = 'rgba(150,105,62,.8)';
  c.lineWidth = 2;
  const ly = y + 11;
  c.beginPath();
  c.moveTo(ix - 14, ly); c.lineTo(cxm - ew / 2 - 18, ly);
  c.moveTo(cxm + ew / 2 + 18, ly); c.lineTo(ix + iw + 14, ly);
  c.stroke();
  y += 30 + 16;

  c.textAlign = 'left';
  c.font = `bold ${card.bodySize + 1}px ${FONT}`;
  c.fillStyle = '#603A20';
  c.fillText('STORIA', ix, y);
  y += lh + 4;
  c.font = `italic ${card.bodySize}px ${FONT}`;
  c.fillStyle = '#3A2618';
  for (const ln of wrapText(c, card.storia, iw)) { c.fillText(ln, ix, y); y += lh; }
  y += 18;
  c.font = `bold ${card.bodySize + 1}px ${FONT}`;
  c.fillStyle = '#603A20';
  let head = `POTERE · ${card.potereNome}`;
  if (c.measureText(head).width > iw) head = card.potereNome;
  c.fillText(head, ix, y);
  y += lh + 4;
  c.font = `${card.bodySize}px ${FONT}`;
  c.fillStyle = '#3A2618';
  for (const ln of wrapText(c, card.potere, iw)) { c.fillText(ln, ix, y); y += lh; }

  return y - lh + card.bodySize > bottomLimit;
}

export function renderQuiz(
  c: Ctx, W: number, H: number, assets: AssetMap, stitches: StitchLine[],
  layout: { plate: Rect; box: Rect }, card: QuizCard | undefined, opts: RenderOpts = {},
) {
  c.clearRect(0, 0, W, H);
  const st = ERA_STYLE[card?.era ?? 1];
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, st.top);
  g.addColorStop(1, st.bottom);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  drawRays(c, W / 2, H * 0.27, 120, W * 0.75, 22, st.ray, 0.45);
  drawFrameOriented(c, assets.frame, W, H, stitches);

  drawPlate(c, assets, layout.plate, `SAPERE · ERA ${card?.era ?? 1}`, 44, opts.editing);

  if (!card) {
    c.font = `italic 30px ${FONT}`;
    c.fillStyle = '#5a3a22';
    c.textAlign = 'center';
    c.fillText('Nessuna carta nel mazzo', W / 2, H / 2);
    drawOverlays(c, W, H, opts);
    return;
  }

  const QB = layout.box;
  c.drawImage(assets.tbox, QB.x, QB.y, QB.w, QB.h);
  drawQuizBody(c, QB, card);

  if (opts.editing) drawGrip(c, QB.x + QB.w, QB.y + QB.h);
  drawOverlays(c, W, H, opts);
}

/**
 * Impagina il contenuto di una carta Sapere dentro un rettangolo: etichetta era,
 * domanda, opzioni, premio e risposta capovolta. Usato sia dal renderer classico
 * sia dal layer "block quiz" del sistema a template.
 */
export function drawQuizBody(c: Ctx, QB: Rect, card: QuizCard) {
  const st = ERA_STYLE[card.era ?? 1];
  const padX = PAD * (QB.w / TBOX_W);
  const padY = PAD * (QB.h / TBOX_H);
  const ix = QB.x + padX + 44;
  const iw = Math.max(120, QB.w - 2 * padX - 88);
  const cxm = QB.x + QB.w / 2;
  const answerY = QB.y + QB.h - padY - 40;
  const bottomLimit = answerY - 46;

  let fs = 21;
  let layoutRes: { lh: number; qLines: string[]; optLines: string[][] } | null = null;
  for (fs = 30; fs >= 21; fs--) {
    const lh = fs + 10;
    c.font = `${fs}px ${FONT}`;
    const qLines = wrapText(c, card.domanda, iw);
    const optLines = (card.opzioni || []).map((o, i) => {
      c.font = `${fs}px ${FONT}`;
      return wrapText(c, `${String.fromCharCode(65 + i)})  ${o}`, iw - 26);
    });
    let hTot = 30 + 16 + lh + 6 + qLines.length * lh;
    if (optLines.length) hTot += 18 + optLines.reduce((a, l) => a + l.length * lh + 8, 0);
    hTot += 26 + 34;
    if (QB.y + padY + 30 + hTot <= bottomLimit) { layoutRes = { lh, qLines, optLines }; break; }
  }
  if (!layoutRes) {
    fs = 21;
    const lh = 31;
    c.font = `21px ${FONT}`;
    layoutRes = {
      lh,
      qLines: wrapText(c, card.domanda, iw),
      optLines: (card.opzioni || []).map((o, i) =>
        wrapText(c, `${String.fromCharCode(65 + i)})  ${o}`, iw - 26)),
    };
  }

  let y = QB.y + padY + 30;
  c.textBaseline = 'top';
  c.font = `bold 24px ${FONT}`;
  c.fillStyle = '#603A20';
  c.textAlign = 'center';
  c.fillText(st.label, cxm, y);
  const ew = c.measureText(st.label).width;
  c.strokeStyle = 'rgba(150,105,62,.8)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(ix - 14, y + 11); c.lineTo(cxm - ew / 2 - 18, y + 11);
  c.moveTo(cxm + ew / 2 + 18, y + 11); c.lineTo(ix + iw + 14, y + 11);
  c.stroke();
  y += 30 + 16;

  const { lh, qLines, optLines } = layoutRes;
  c.textAlign = 'left';
  c.font = `bold ${fs + 1}px ${FONT}`;
  c.fillStyle = '#603A20';
  c.fillText('DOMANDA', ix, y);
  y += lh + 6;
  c.font = `${fs}px ${FONT}`;
  c.fillStyle = '#3A2618';
  for (const ln of qLines) { c.fillText(ln, ix, y); y += lh; }

  if (optLines.length) {
    y += 18;
    optLines.forEach((lines, i) => {
      c.font = `bold ${fs}px ${FONT}`;
      c.fillStyle = '#7A3A28';
      c.fillText(`${String.fromCharCode(65 + i)})`, ix, y);
      c.font = `${fs}px ${FONT}`;
      c.fillStyle = '#3A2618';
      lines.forEach((ln, j) => {
        const txt = j === 0 ? ln.replace(/^[A-D]\)\s*/, '') : ln;
        c.fillText(txt, ix + 44, y);
        y += lh;
      });
      y += 8;
    });
  }

  y += 12;
  c.strokeStyle = 'rgba(150,105,62,.7)';
  c.lineWidth = 2;
  c.beginPath(); c.moveTo(ix, y); c.lineTo(ix + iw, y); c.stroke();
  y += 14;
  c.font = `bold 25px ${FONT}`;
  c.fillStyle = '#603A20';
  c.textAlign = 'center';
  c.fillText(`PREMIO · 1 GETTONE «${card.gettone || 'VALORE'}»`, cxm, y);

  const ans = /^[A-D]$/i.test(String(card.risposta).trim())
    ? `Risposta: ${String(card.risposta).trim().toUpperCase()}`
    : `Risposta: ${card.risposta}`;
  c.save();
  c.translate(cxm, answerY + 12);
  c.rotate(Math.PI);
  let asz = 23;
  c.font = `italic ${asz}px ${FONT}`;
  c.fillStyle = 'rgba(90,58,34,.85)';
  c.textAlign = 'center';
  c.textBaseline = 'top';
  while (asz > 15 && c.measureText(ans).width > iw) {
    asz--;
    c.font = `italic ${asz}px ${FONT}`;
  }
  c.fillText(ans, 0, 0);
  c.restore();
}

export function renderEvent(
  c: Ctx, W: number, H: number, assets: AssetMap, stitches: StitchLine[],
  layout: { plate: Rect; box: Rect }, card: EventCard | undefined, opts: RenderOpts = {},
) {
  c.clearRect(0, 0, W, H);
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#D9C7A0');
  g.addColorStop(1, '#C4AC7E');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  drawFrameOriented(c, assets.frame, W, H, stitches);

  if (!card) {
    c.font = `italic 30px ${FONT}`;
    c.fillStyle = '#5a3a22';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('Nessuna carta nel mazzo', W / 2, H / 2);
    drawOverlays(c, W, H, opts);
    return;
  }
  const B = layout.box;
  c.drawImage(assets.tbox, B.x, B.y, B.w, B.h);
  const P = layout.plate;
  const padYev = PAD * (B.h / TBOX_H);
  drawEventBody(c, B, card, Math.max(P.y + P.h + 14, B.y + padYev + 20));

  if (opts.editing) drawGrip(c, B.x + B.w, B.y + B.h);
  drawPlate(c, assets, P, 'IMPREVISTO', 40, opts.editing);
  drawOverlays(c, W, H, opts);
}

/** Corpo della carta Imprevisto (icona, titolo, testo, pillola effetto). */
export function drawEventBody(c: Ctx, B: Rect, card: EventCard, contentTop: number) {
  const accent = IMP_ACCENT[card.tipo] || IMP_ACCENT.malus;
  const padX = PAD * (B.w / TBOX_W);
  const padY = PAD * (B.h / TBOX_H);
  const iw = Math.max(160, B.w - 2 * padX - 80);
  const cxm = B.x + B.w / 2;
  const bottomLimit = B.y + B.h - padY - 22;

  let fs = 18;
  let tLines: string[] = [];
  let lh = 27;
  for (fs = 27; fs >= 18; fs--) {
    lh = fs + 9;
    c.font = `italic ${fs}px ${FONT}`;
    tLines = wrapText(c, card.testo || '', iw * 0.92);
    const hTot = 52 + 12 + 44 + 10 + tLines.length * lh + 16 + 2 + 16 + 54;
    if (contentTop + hTot <= bottomLimit) break;
  }
  const contentH = 52 + 12 + 44 + 10 + tLines.length * lh + 16 + 2 + 16 + 54;
  let y = contentTop + Math.max(0, (bottomLimit - contentTop - contentH) / 2);

  if (card.tipo === 'bonus') drawStar(c, cxm, y + 26, 52, accent);
  else drawBolt(c, cxm, y + 26, 52, accent);
  y += 52 + 12;

  c.textBaseline = 'top';
  c.textAlign = 'center';
  let ts = 40;
  c.font = `bold ${ts}px ${FONT}`;
  const tit = (card.titolo || '').toUpperCase();
  while (ts > 18 && c.measureText(tit).width > iw * 0.94) {
    ts--;
    c.font = `bold ${ts}px ${FONT}`;
  }
  c.fillStyle = '#3A2618';
  c.fillText(tit, cxm, y + (44 - ts) / 2);
  y += 44 + 10;

  c.font = `italic ${fs}px ${FONT}`;
  c.fillStyle = '#4A3324';
  for (const ln of tLines) { c.fillText(ln, cxm, y); y += lh; }

  y += 16;
  c.strokeStyle = 'rgba(150,105,62,.7)';
  c.lineWidth = 2;
  c.beginPath(); c.moveTo(cxm - 110, y); c.lineTo(cxm + 110, y); c.stroke();
  y += 16;

  let es = 27;
  c.font = `bold ${es}px ${FONT}`;
  const eff = card.effetto || '';
  while (es > 15 && c.measureText(eff).width > iw * 0.8) {
    es--;
    c.font = `bold ${es}px ${FONT}`;
  }
  const ewd = c.measureText(eff).width;
  const pw = ewd + 64;
  const ph = 50;
  roundRectPath(c, cxm - pw / 2, y, pw, ph, 25);
  c.fillStyle = accent;
  c.fill();
  c.strokeStyle = 'rgba(58,38,24,.5)';
  c.lineWidth = 3;
  c.stroke();
  c.fillStyle = '#F6EDD8';
  c.fillText(eff, cxm, y + (ph - es) / 2 - 2);
}

export function renderArchive(
  c: Ctx, W: number, H: number, assets: AssetMap, stitches: StitchLine[],
  layout: { plate: Rect; box: Rect }, card: ArchiveCard | undefined, opts: RenderOpts = {},
) {
  c.clearRect(0, 0, W, H);
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#E2D2AC');
  g.addColorStop(1, '#CBB488');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  drawFrameOriented(c, assets.frame, W, H, stitches);

  if (!card) {
    c.font = `italic 30px ${FONT}`;
    c.fillStyle = '#5a3a22';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('Nessuna carta nel mazzo', W / 2, H / 2);
    drawOverlays(c, W, H, opts);
    return;
  }
  const B = layout.box;
  c.drawImage(assets.tbox, B.x, B.y, B.w, B.h);
  const P = layout.plate;
  const padYar = PAD * (B.h / TBOX_H);
  drawArchiveBody(c, B, card, Math.max(P.y + P.h + 14, B.y + padYar + 20));

  if (opts.editing) drawGrip(c, B.x + B.w, B.y + B.h);
  drawPlate(c, assets, P, 'ARCHIVIO STORICO', 38, opts.editing);
  drawOverlays(c, W, H, opts);
}

/** Corpo della carta Archivio (timbro dell'anno, titolo, testo, etichetta era). */
export function drawArchiveBody(c: Ctx, B: Rect, card: ArchiveCard, contentTop: number) {
  const eraCol = ARC_ERA_COL[card.era] || '#8A6B3E';
  const padX = PAD * (B.w / TBOX_W);
  const padY = PAD * (B.h / TBOX_H);
  const iw = Math.max(160, B.w - 2 * padX - 80);
  const cxm = B.x + B.w / 2;
  const bottomLimit = B.y + B.h - padY - 22;

  let fs = 17;
  let tLines: string[] = [];
  let lh = 26;
  for (fs = 26; fs >= 17; fs--) {
    lh = fs + 9;
    c.font = `italic ${fs}px ${FONT}`;
    tLines = wrapText(c, card.testo || '', iw * 0.9);
    const hTot = 86 + 10 + 42 + 8 + tLines.length * lh + 14 + 2 + 14 + 26;
    if (contentTop + hTot <= bottomLimit) break;
  }
  const contentH = 86 + 10 + 42 + 8 + tLines.length * lh + 14 + 2 + 14 + 26;
  let y = contentTop + Math.max(0, (bottomLimit - contentTop - contentH) / 2);

  // timbro dell'anno: tondo per anni brevi, a targa per date lunghe
  const anno = String(card.anno || '').trim();
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  let asz = 27;
  c.font = `bold ${asz}px ${FONT}`;
  let aw = c.measureText(anno).width;
  const stampCy = y + 43;
  if (anno && aw <= 62) {
    c.strokeStyle = eraCol;
    c.lineWidth = 4;
    c.beginPath(); c.arc(cxm, stampCy, 40, 0, 2 * Math.PI); c.stroke();
    c.lineWidth = 2;
    c.beginPath(); c.arc(cxm, stampCy, 32, 0, 2 * Math.PI); c.stroke();
    c.fillStyle = eraCol;
    c.fillText(anno, cxm, stampCy + 1);
  } else if (anno) {
    while (asz > 13 && c.measureText(anno).width > iw * 0.5) {
      asz--;
      c.font = `bold ${asz}px ${FONT}`;
    }
    aw = c.measureText(anno).width;
    const pw = aw + 52;
    const ph = 54;
    c.strokeStyle = eraCol;
    c.lineWidth = 4;
    roundRectPath(c, cxm - pw / 2, stampCy - ph / 2, pw, ph, 12);
    c.stroke();
    c.lineWidth = 2;
    roundRectPath(c, cxm - pw / 2 + 7, stampCy - ph / 2 + 7, pw - 14, ph - 14, 7);
    c.stroke();
    c.fillStyle = eraCol;
    c.fillText(anno, cxm, stampCy + 1);
  }
  y += 86 + 10;

  c.textBaseline = 'top';
  let ts = 38;
  c.font = `bold ${ts}px ${FONT}`;
  const tit = (card.titolo || '').toUpperCase();
  while (ts > 17 && c.measureText(tit).width > iw * 0.94) {
    ts--;
    c.font = `bold ${ts}px ${FONT}`;
  }
  c.fillStyle = '#3A2618';
  c.fillText(tit, cxm, y + (42 - ts) / 2);
  y += 42 + 8;

  c.font = `italic ${fs}px ${FONT}`;
  c.fillStyle = '#4A3324';
  for (const ln of tLines) { c.fillText(ln, cxm, y); y += lh; }

  y += 14;
  c.strokeStyle = 'rgba(150,105,62,.7)';
  c.lineWidth = 2;
  c.beginPath(); c.moveTo(cxm - 110, y); c.lineTo(cxm + 110, y); c.stroke();
  y += 14;
  const eraLbl = (card.era && ERA_STYLE[card.era as 1 | 2 | 3]?.label) || 'ITALIA · 1861–1948';
  c.font = `bold 21px ${FONT}`;
  c.fillStyle = eraCol;
  c.fillText(eraLbl, cxm, y);
}
