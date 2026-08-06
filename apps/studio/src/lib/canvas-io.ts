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
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = filename;
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); res(); }, 150);
    }, 'image/png');
  });
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
