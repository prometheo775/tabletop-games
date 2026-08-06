'use client';

import { useCallback, useEffect, useRef } from 'react';
import { HANDLE, SNAP, type Layer } from '@tabletops-game/card-engine';

const MIN = { w: 60, h: 40 };

interface Props {
  w: number;
  h: number;
  /** layer manipolabili (ordinati per z crescente); null = solo anteprima */
  layers: Layer[] | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  paint: (c: CanvasRenderingContext2D, o: { guide: boolean; snapped: boolean }) => void;
  onChange?: () => void;
  guideEnabled?: boolean;
}

type DragState =
  | { kind: 'move'; id: string; dx: number; dy: number }
  | { kind: 'resize'; id: string; aspect: number };

/** Canvas con drag/resize/selezione per N layer (evoluzione di CardCanvas). */
export function LayerCanvas({
  w, h, layers, selectedId, onSelect, paint, onChange, guideEnabled = true,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drag = useRef<DragState | null>(null);
  const snapped = useRef(false);

  const repaint = useCallback(() => {
    const c = ref.current?.getContext('2d');
    if (!c) return;
    paint(c, { guide: guideEnabled && drag.current?.kind === 'move', snapped: snapped.current });
  }, [paint, guideEnabled]);

  useEffect(() => { repaint(); }, [repaint, w, h]);

  const toCanvas = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * w) / r.width, y: ((e.clientY - r.top) * h) / r.height };
  };

  const editable = () => (layers ?? []).filter((l) => l.visible && !l.locked);

  const onDown = (e: React.PointerEvent) => {
    if (!layers) return;
    const p = toCanvas(e);
    // 1. maniglia del layer selezionato
    const sel = layers.find((l) => l.id === selectedId);
    if (sel && !sel.locked && sel.visible
      && Math.abs(p.x - (sel.rect.x + sel.rect.w)) < HANDLE
      && Math.abs(p.y - (sel.rect.y + sel.rect.h)) < HANDLE) {
      drag.current = { kind: 'resize', id: sel.id, aspect: sel.rect.w / sel.rect.h };
      ref.current!.setPointerCapture(e.pointerId);
      repaint();
      return;
    }
    // 2. hit-test dal layer più alto al più basso
    const hit = [...editable()].reverse().find((l) =>
      p.x >= l.rect.x && p.x <= l.rect.x + l.rect.w && p.y >= l.rect.y && p.y <= l.rect.y + l.rect.h);
    onSelect(hit?.id ?? null);
    if (hit) {
      drag.current = { kind: 'move', id: hit.id, dx: p.x - hit.rect.x, dy: p.y - hit.rect.y };
      ref.current!.setPointerCapture(e.pointerId);
    }
    repaint();
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !layers) return;
    const l = layers.find((x) => x.id === d.id);
    if (!l) return;
    const p = toCanvas(e);
    if (d.kind === 'resize') {
      const nw = Math.min(Math.max(p.x - l.rect.x, MIN.w), w + 60 - l.rect.x);
      let nh = Math.min(Math.max(p.y - l.rect.y, MIN.h), h + 60 - l.rect.y);
      if (e.shiftKey) nh = nw / d.aspect;
      l.rect.w = nw;
      l.rect.h = nh;
      snapped.current = false;
    } else {
      let nx = Math.min(Math.max(p.x - d.dx, -60), w - l.rect.w + 60);
      const ny = Math.min(Math.max(p.y - d.dy, -60), h - l.rect.h + 60);
      snapped.current = false;
      if (guideEnabled && Math.abs(nx + l.rect.w / 2 - w / 2) <= SNAP) {
        nx = w / 2 - l.rect.w / 2;
        snapped.current = true;
      }
      l.rect.x = nx;
      l.rect.y = ny;
    }
    onChange?.();
    repaint();
  };

  const onUp = () => {
    drag.current = null;
    snapped.current = false;
    repaint();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement;
      if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
      if (e.key === 'Escape') { onSelect(null); return; }
      if (!layers || !selectedId) return;
      const l = layers.find((x) => x.id === selectedId);
      if (!l || l.locked) return;
      const step = e.shiftKey ? 10 : 2;
      if (e.key === 'ArrowLeft') l.rect.x -= step;
      else if (e.key === 'ArrowRight') l.rect.x += step;
      else if (e.key === 'ArrowUp') l.rect.y -= step;
      else if (e.key === 'ArrowDown') l.rect.y += step;
      else return;
      e.preventDefault();
      onChange?.();
      repaint();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [layers, selectedId, onSelect, onChange, repaint]);

  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      className={w <= h ? 'portrait' : 'landscape'}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    />
  );
}
