import type { AssetMap } from '@tabletops-game/card-engine';

const ART_KEYS = [
  'il_patriota', 'la_staffetta', 'l_operaio', 'la_prima_elettrice', 'il_segretario',
] as const;

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error(`Immagine non trovata: ${src}`));
    i.src = src;
  });
}

let cached: AssetMap | null = null;

export async function loadAssets(): Promise<AssetMap> {
  if (cached) return cached;
  const [frame, tbox, plate, ...arts] = await Promise.all([
    loadImg('/assets/frame.png'),
    loadImg('/assets/tbox.png'),
    loadImg('/assets/plate.png'),
    ...ART_KEYS.map((k) => loadImg(`/assets/art_${k}.png`)),
  ]);
  const artMap: Record<string, HTMLImageElement> = {};
  ART_KEYS.forEach((k, i) => { artMap[k] = arts[i]; });
  cached = { frame, tbox, plate, arts: artMap };
  return cached;
}

export type ExportFormat = 'png' | 'svg';

function triggerDownload(blob: Blob, filename: string): Promise<void> {
  return new Promise((res) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); res(); }, 150);
  });
}

export function exportPng(
  filename: string, w: number, h: number,
  draw: (c: CanvasRenderingContext2D) => void,
): Promise<void> {
  return new Promise((res) => {
    const oc = document.createElement('canvas');
    oc.width = w;
    oc.height = h;
    const ctx = oc.getContext('2d');
    if (!ctx) { res(); return; }
    draw(ctx);
    oc.toBlob((b) => {
      if (!b) { res(); return; }
      triggerDownload(b, filename).then(res);
    }, 'image/png');
  });
}

/**
 * Esporta come SVG. Il motore di rendering delle carte disegna su canvas 2D
 * (testo, illustrazioni e box sono tutti raster), quindi non esiste un
 * percorso vettoriale nativo: il PNG risultante viene incapsulato in un file
 * SVG come <image> a piena pagina. Il file è un SVG valido, apribile e
 * ridimensionabile in Illustrator/Inkscape/InDesign, ma il contenuto resta
 * un'immagine raster incorporata (non testo o forme editabili).
 */
export function exportSvg(
  filename: string, w: number, h: number,
  draw: (c: CanvasRenderingContext2D) => void,
): Promise<void> {
  return new Promise((res) => {
    const oc = document.createElement('canvas');
    oc.width = w;
    oc.height = h;
    const ctx = oc.getContext('2d');
    if (!ctx) { res(); return; }
    draw(ctx);
    const dataUrl = oc.toDataURL('image/png');
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n`
      + `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n`
      + `  <image href="${dataUrl}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none"/>\n`
      + `</svg>\n`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    triggerDownload(blob, filename).then(res);
  });
}

export function exportImage(
  format: ExportFormat, filename: string, w: number, h: number,
  draw: (c: CanvasRenderingContext2D) => void,
): Promise<void> {
  return format === 'svg' ? exportSvg(filename, w, h, draw) : exportPng(filename, w, h, draw);
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 300);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
