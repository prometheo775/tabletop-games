import { BLEED } from './defaults';
import type { StitchLine } from './types';

type Ctx = CanvasRenderingContext2D;

/** Impagina il testo rispettando gli a-capo manuali (\n); riga vuota = spazio. */
export function wrapText(c: Ctx, text: string, maxW: number): string[] {
  const out: string[] = [];
  String(text).split('\n').forEach((par) => {
    const words = par.split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(''); return; }
    let cur = '';
    for (const w of words) {
      const t = cur ? `${cur} ${w}` : w;
      if (c.measureText(t).width <= maxW) cur = t;
      else { if (cur) out.push(cur); cur = w; }
    }
    if (cur) out.push(cur);
  });
  return out;
}

export function drawCover(c: Ctx, img: CanvasImageSource, w: number, h: number) {
  const iw = (img as HTMLImageElement).width || w;
  const ih = (img as HTMLImageElement).height || h;
  const s = Math.max(w / iw, h / ih);
  c.drawImage(img, (w - iw * s) / 2, (h - ih * s) / 2, iw * s, ih * s);
}

export function roundRectPath(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  if (typeof c.roundRect === 'function') { c.roundRect(x, y, w, h, r); return; }
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

export function drawStitchLines(c: Ctx, W: number, H: number, lines: StitchLine[]) {
  for (const st of lines) {
    if (!st.on) continue;
    const o = BLEED + st.inset;
    if (W - 2 * o < 40 || H - 2 * o < 40) continue;
    c.strokeStyle = st.color;
    c.lineWidth = st.width;
    c.setLineDash([st.dash, st.gap]);
    roundRectPath(c, o, o, W - 2 * o, H - 2 * o, 24);
    c.stroke();
    c.setLineDash([]);
  }
}

/** Cornice pelle: dritta in ritratto, ruotata di 90° in orizzontale per fasce uniformi. */
export function drawFrameOriented(
  c: Ctx, frame: CanvasImageSource, W: number, H: number, stitches: StitchLine[],
) {
  if (W <= H) {
    c.drawImage(frame, 0, 0, W, H);
  } else {
    c.save();
    c.translate(W / 2, H / 2);
    c.rotate(Math.PI / 2);
    c.drawImage(frame, -H / 2, -W / 2, H, W);
    c.restore();
  }
  drawStitchLines(c, W, H, stitches);
}

export function drawGrip(c: Ctx, hx: number, hy: number) {
  c.strokeStyle = 'rgba(201,168,107,.95)';
  c.lineWidth = 3;
  c.lineCap = 'round';
  c.beginPath();
  for (let k = 0; k < 3; k++) {
    c.moveTo(hx - 8 - k * 9, hy - 6);
    c.lineTo(hx - 6, hy - 8 - k * 9);
  }
  c.stroke();
  c.lineCap = 'butt';
}

export function drawRays(
  c: Ctx, cx: number, cy: number, r0: number, r1: number, n: number, color: string, alpha: number,
) {
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n;
    const da = (Math.PI / n) * 0.5;
    c.beginPath();
    c.moveTo(cx + r0 * Math.cos(a - da), cy + r0 * Math.sin(a - da));
    c.lineTo(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a));
    c.lineTo(cx + r0 * Math.cos(a + da), cy + r0 * Math.sin(a + da));
    c.fill();
  }
  c.restore();
}

export function drawBolt(c: Ctx, cx: number, cy: number, s: number, color: string) {
  c.fillStyle = color;
  c.beginPath();
  const p = [[3, -30], [17, -30], [7, -8], [19, -8], [-9, 30], [-1, 2], [-13, 2]];
  p.forEach((pt, i) => {
    const x = cx + (pt[0] * s) / 30;
    const y = cy + (pt[1] * s) / 30;
    if (i) c.lineTo(x, y); else c.moveTo(x, y);
  });
  c.closePath();
  c.fill();
}

export function drawStar(c: Ctx, cx: number, cy: number, s: number, color: string) {
  c.fillStyle = color;
  c.beginPath();
  const R = s / 2;
  const r = s / 5.5;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i - Math.PI / 2;
    const rad = i % 2 ? r : R;
    const x = cx + rad * Math.cos(a);
    const y = cy + rad * Math.sin(a);
    if (i) c.lineTo(x, y); else c.moveTo(x, y);
  }
  c.closePath();
  c.fill();
}

export function drawOverlays(
  c: Ctx, W: number, H: number,
  opts: { guide?: boolean; snapped?: boolean; snappedH?: boolean; snappedV?: boolean; cutLine?: boolean },
) {
  if (opts.guide) {
    const isSnapV = opts.snappedV ?? opts.snapped ?? false;
    const isSnapH = opts.snappedH ?? false;

    // Linea guida verticale (centro X)
    c.strokeStyle = isSnapV ? 'rgba(232,160,90,.95)' : 'rgba(201,168,107,.55)';
    c.lineWidth = isSnapV ? 2.5 : 1.5;
    c.setLineDash([10, 8]);
    c.beginPath();
    c.moveTo(W / 2, 0);
    c.lineTo(W / 2, H);
    c.stroke();

    // Linea guida orizzontale (centro Y)
    c.strokeStyle = isSnapH ? 'rgba(232,160,90,.95)' : 'rgba(201,168,107,.55)';
    c.lineWidth = isSnapH ? 2.5 : 1.5;
    c.beginPath();
    c.moveTo(0, H / 2);
    c.lineTo(W, H / 2);
    c.stroke();

    c.setLineDash([]);
  }
  if (opts.cutLine) {
    c.strokeStyle = 'rgba(255,255,255,.65)';
    c.lineWidth = 1.5;
    c.setLineDash([7, 7]);
    c.strokeRect(BLEED, BLEED, W - 2 * BLEED, H - 2 * BLEED);
    c.setLineDash([]);
  }
}
