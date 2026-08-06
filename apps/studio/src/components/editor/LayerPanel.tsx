'use client';

import { sortedLayers, type CardTemplate } from '@tabletops-game/card-engine';
import { downloadJson } from '../../lib/canvas-io';

interface Props {
  template: CardTemplate;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** file disponibili nella cartella assets/ del gioco (per sostituire i layer immagine) */
  assetFiles: string[];
  /** chiamato dopo ogni modifica al template (toggle, z, sostituzione) */
  onChange: () => void;
  /** chiamato quando cambia il src di un layer immagine (per ricaricare le immagini) */
  onAssetReplaced?: () => void;
  /** nome del file per l'export del template (es. "sapere.template.json") */
  downloadFilename: string;
}

/**
 * Pannello "Livelli della carta": riutilizzabile in ogni sezione dell'editor
 * che monta le carte dal sistema a layer (template nella cartella del gioco).
 */
export function LayerPanel({
  template, selectedId, onSelect, assetFiles, onChange, onAssetReplaced, downloadFilename,
}: Props) {
  const moveZ = (layerId: string, dir: 1 | -1) => {
    const ordered = sortedLayers(template);
    const idx = ordered.findIndex((l) => l.id === layerId);
    const other = ordered[idx + dir];
    if (idx < 0 || !other) return;
    const l = ordered[idx];
    [l.z, other.z] = [other.z, l.z];
    onChange();
  };

  const replaceSrc = (layerId: string, src: string) => {
    const l = template.layers.find((x) => x.id === layerId);
    if (!l || l.type !== 'image') return;
    l.src = src;
    onChange();
    onAssetReplaced?.();
  };

  const sel = template.layers.find((l) => l.id === selectedId);

  return (
    <>
      <h2>Livelli della carta</h2>
      <p className="hint" style={{ marginTop: 0 }}>
        Componenti SVG dalla cartella del gioco: clicca per selezionare, trascina sul
        canvas, riordina o sostituisci.
      </p>
      <div className="layers">
        {sortedLayers(template).reverse().map((l) => (
          <div key={l.id} className={`layer-row ${selectedId === l.id ? 'on' : ''}`}>
            <input
              type="checkbox"
              title="Mostra/nascondi"
              checked={l.visible}
              onChange={(e) => { l.visible = e.target.checked; onChange(); }}
            />
            <button className="layer-name" onClick={() => onSelect(selectedId === l.id ? null : l.id)}>
              {l.name}{l.locked ? ' 🔒' : ''}
            </button>
            <button className="layer-z" title="Porta su" onClick={() => moveZ(l.id, 1)}>▲</button>
            <button className="layer-z" title="Porta giù" onClick={() => moveZ(l.id, -1)}>▼</button>
          </div>
        ))}
      </div>
      {sel && sel.type === 'image' && assetFiles.length > 0 && (
        <>
          <label className="field">Asset del layer «{sel.name}»</label>
          <select value={sel.src} onChange={(e) => replaceSrc(sel.id, e.target.value)}>
            {!assetFiles.includes(sel.src) && <option value={sel.src}>{sel.src}</option>}
            {assetFiles.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </>
      )}
      <button
        className="btn btn-ghost btn-block"
        onClick={() => downloadJson(downloadFilename, template)}
      >
        ⬇ Scarica template JSON (da salvare in docs/)
      </button>
    </>
  );
}
