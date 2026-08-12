'use client';

import type { BlueprintSetting } from '@tabletops-game/card-engine';

interface Props {
  /** file disponibili in assets/blueprints/ della cartella del gioco */
  files: string[];
  setting: BlueprintSetting | null;
  onChange: (next: BlueprintSetting | null) => void;
}

/**
 * Pannello "Blueprint di stampa": sovrappone alla carta la guida della tipografia
 * (taglio, area sicura) con opacità regolabile. Solo editor: mai nell'export PNG.
 */
export function BlueprintPanel({ files, setting, onChange }: Props) {
  if (!files.length) return null;
  const opacity = setting?.opacity ?? 0.5;

  return (
    <>
      <h2>Blueprint di stampa</h2>
      <p className="hint" style={{ marginTop: 0 }}>
        La guida della tipografia in sovraimpressione (taglio e area sicura). Non
        viene mai esportata nei PNG.
      </p>
      <label className="field">Schema</label>
      <select
        value={setting?.visible ? setting.src : ''}
        onChange={(e) => {
          const src = e.target.value;
          onChange(src ? { src, opacity, visible: true } : null);
        }}
      >
        <option value="">— nessuno —</option>
        {files.map((f) => (
          <option key={f} value={f}>{f.replace('assets/blueprints/', '')}</option>
        ))}
      </select>
      {setting?.visible && (
        <>
          <label className="field">Opacità · {Math.round(opacity * 100)}%</label>
          <input
            type="range"
            min={5}
            max={100}
            value={Math.round(opacity * 100)}
            onChange={(e) => onChange({ ...setting, opacity: +e.target.value / 100 })}
          />
        </>
      )}
    </>
  );
}
