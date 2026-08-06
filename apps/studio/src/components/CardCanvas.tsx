'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  BOX_MIN, HANDLE, PLATE_MIN, SNAP, type Rect,
} from '@tabletops-game/card-engine';

export interface CanvasGeom { plate: Rect; box: Rect; plateActive?: boolean; boxActive?: boolean }

interface Props {
  w: number;
  h: number;
  /** rettangoli manipolabili; null = solo anteprima */
  geom: CanvasGeom | null;
  paint: (c: CanvasRenderingContext2D, o: { guide: boolean; snapped: boolean; snappedH?: boolean; snappedV?: boolean }) => void;
  onGeomChange?: () => void;
  guideEnabled?: boolean;
  onNavigate?: (dir: -1 | 1) => void;
}

type DragState =
  | { kind: 'move'; target: 'plate' | 'box'; dx: number; dy: number }
  | { kind: 'resize'; target: 'plate' | 'box'; aspect: number };

export function CardCanvas({
  w, h, geom, paint, onGeomChange, guideEnabled = true, onNavigate,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drag = useRef<DragState | null>(null);
  const selected = useRef<'plate' | 'box' | null>(null);
  const snappedV = useRef(false);
  const snappedH = useRef(false);

  const repaint = useCallback(() => {
    const cv = ref.current;
    const c = cv?.getContext('2d');
    if (!cv || !c) return;
    paint(c, {
      guide: guideEnabled && drag.current?.kind === 'move',
      snapped: snappedV.current || snappedH.current,
      snappedV: snappedV.current,
      snappedH: snappedH.current,
    });
  }, [paint, guideEnabled]);

  useEffect(() => {
    repaint();
  }, [repaint, w, h, geom]);

  const toCanvas = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * w) / r.width, y: ((e.clientY - r.top) * h) / r.height };
  };

  const onDown = (e: React.PointerEvent) => {
    if (!geom) return;
    const p = toCanvas(e);
    const { plate: P, box: B } = geom;
    const plateOn = geom.plateActive !== false;
    const boxOn = geom.boxActive !== false;
    if (plateOn && Math.abs(p.x - (P.x + P.w)) < HANDLE && Math.abs(p.y - (P.y + P.h)) < HANDLE) {
      drag.current = { kind: 'resize', target: 'plate', aspect: P.w / P.h };
      selected.current = 'plate';
    } else if (boxOn && Math.abs(p.x - (B.x + B.w)) < HANDLE && Math.abs(p.y - (B.y + B.h)) < HANDLE) {
      drag.current = { kind: 'resize', target: 'box', aspect: B.w / B.h };
      selected.current = 'box';
    } else {
      const inPlate = plateOn && p.x >= P.x && p.x <= P.x + P.w && p.y >= P.y && p.y <= P.y + P.h;
      const inBox = boxOn && p.x >= B.x && p.x <= B.x + B.w && p.y >= B.y && p.y <= B.y + B.h;
      const target = inPlate ? 'plate' : inBox ? 'box' : null;
      selected.current = target;
      if (!target) { repaint(); return; }
      const el = geom[target];
      drag.current = { kind: 'move', target, dx: p.x - el.x, dy: p.y - el.y };
    }
    ref.current!.setPointerCapture(e.pointerId);
    repaint();
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !geom) return;
    const p = toCanvas(e);
    const el = geom[d.target];
    if (d.kind === 'resize') {
      const min = d.target === 'plate' ? PLATE_MIN : BOX_MIN;
      const nw = Math.min(Math.max(p.x - el.x, min.w), w + 60 - el.x);
      let nh = Math.min(Math.max(p.y - el.y, min.h), h + 60 - el.y);
      if (e.shiftKey) nh = nw / d.aspect;
      el.w = nw;
      el.h = nh;
      snappedV.current = false;
      snappedH.current = false;
    } else {
      let nx = Math.min(Math.max(p.x - d.dx, -60), w - el.w + 60);
      let ny = Math.min(Math.max(p.y - d.dy, -60), h - el.h + 60);
      snappedV.current = false;
      snappedH.current = false;
      if (guideEnabled && Math.abs(nx + el.w / 2 - w / 2) <= SNAP) {
        nx = w / 2 - el.w / 2;
        snappedV.current = true;
      }
      if (guideEnabled && Math.abs(ny + el.h / 2 - h / 2) <= SNAP) {
        ny = h / 2 - el.h / 2;
        snappedH.current = true;
      }
      el.x = nx;
      el.y = ny;
    }
    onGeomChange?.();
    repaint();
  };

  const onUp = () => {
    drag.current = null;
    snappedV.current = false;
    snappedH.current = false;
    repaint();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement;
      if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
      if (e.key === 'Escape') { selected.current = null; repaint(); return; }
      const sel = selected.current;
      if (!sel) {
        if (e.key === 'ArrowLeft') { onNavigate?.(-1); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { onNavigate?.(1); e.preventDefault(); }
        return;
      }
      if (!geom) return;
      const step = e.shiftKey ? 10 : 2;
      const el = geom[sel];
      if (e.key === 'ArrowLeft') el.x -= step;
      else if (e.key === 'ArrowRight') el.x += step;
      else if (e.key === 'ArrowUp') el.y -= step;
      else if (e.key === 'ArrowDown') el.y += step;
      else return;
      e.preventDefault();
      onGeomChange?.();
      repaint();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [geom, onGeomChange, onNavigate, repaint]);

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
