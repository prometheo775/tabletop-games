'use client';

import { useState } from 'react';
import { sortedLayers, type CardTemplate, type Layer } from '@tabletops-game/card-engine';
import { downloadJson } from '../../lib/canvas-io';

interface Props {
  template: CardTemplate;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** file disponibili nella cartella assets/ del gioco (per sostituire i layer o aggiungerne di nuovi) */
  assetFiles: string[];
  /** chiamato dopo ogni modifica al template (toggle, z, sostituzione, aggiunta, eliminazione) */
  onChange: () => void;
  /** chiamato quando cambia il src di un layer o viene aggiunto un layer immagine */
  onAssetReplaced?: () => void;
  /** chiamato per ricaricare l'elenco degli asset dal disco */
  onRefreshAssets?: () => void;
  /** nome del file per l'export del template (es. "sapere.template.json") */
  downloadFilename: string;
}

/**
 * Pannello "Livelli della carta": riutilizzabile in ogni sezione dell'editor
 * che monta le carte dal sistema a layer (template nella cartella del gioco).
 */
export function LayerPanel({
  template, selectedId, onSelect, assetFiles, onChange, onAssetReplaced, onRefreshAssets, downloadFilename,
}: Props) {
  const [selectedSvg, setSelectedSvg] = useState<string>('');

  // SVG attivo per l'aggiunta/sostituzione (usa quello selezionato o il primo dell'elenco)
  const activeSvg = selectedSvg || assetFiles[0] || '';

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

  const addSvgLayer = (svgPath: string) => {
    if (!svgPath) return;
    const baseName = svgPath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Nuovo SVG';
    const formattedName = baseName.charAt(0).toUpperCase() + baseName.slice(1).replace(/[_-]/g, ' ');
    const maxZ = template.layers.reduce((max, l) => Math.max(max, l.z), 0);

    const cw = template.canvas?.w ?? 822;
    const ch = template.canvas?.h ?? 1122;
    const w = Math.round(cw * 0.4);
    const h = Math.round(ch * 0.4);
    const x = Math.round((cw - w) / 2);
    const y = Math.round((ch - h) / 2);

    const newLayer: Layer = {
      id: `svg-${Date.now()}`,
      name: formattedName,
      type: 'image',
      src: svgPath,
      rect: { x, y, w, h },
      z: maxZ + 10,
      visible: true,
    };

    template.layers.push(newLayer);
    onSelect(newLayer.id);
    onChange();
    onAssetReplaced?.();
  };

  const deleteLayer = (layerId: string) => {
    const idx = template.layers.findIndex((x) => x.id === layerId);
    if (idx < 0) return;
    template.layers.splice(idx, 1);
    if (selectedId === layerId) onSelect(null);
    onChange();
    onAssetReplaced?.();
  };

  const sel = template.layers.find((l) => l.id === selectedId);

  return (
    <>
      <h2>Livelli della carta</h2>
      <p className="hint" style={{ marginTop: 0 }}>
        Componenti SVG dalla cartella del gioco: seleziona, trascina sul canvas, riordina, aggiungi o sostituisci.
      </p>

      {/* Sezione per scegliere/aggiungere componenti SVG dalla cartella del gioco */}
      <div className="asset-picker-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="field" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>
            SVG dal gioco ({assetFiles.length} disponibil{assetFiles.length === 1 ? 'o' : 'i'})
          </label>
          {onRefreshAssets && (
            <button
              className="btn btn-ghost"
              style={{ padding: '2px 6px', fontSize: '0.7rem' }}
              title="Ricarica elenco file SVG dalla cartella assets/"
              onClick={onRefreshAssets}
            >
              🔄 Aggiorna
            </button>
          )}
        </div>

        {assetFiles.length > 0 ? (
          <>
            <select
              value={activeSvg}
              onChange={(e) => setSelectedSvg(e.target.value)}
            >
              {assetFiles.map((f) => (
                <option key={f} value={f}>
                  {f.replace(/^assets\//, '')}
                </option>
              ))}
            </select>
            <div className="asset-picker-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => addSvgLayer(activeSvg)}
                title="Aggiungi questo SVG come nuovo livello sulla carta"
              >
                + Aggiungi livello
              </button>
              {sel && sel.type === 'image' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => replaceSrc(sel.id, activeSvg)}
                  title={`Sostituisci asset del livello selezionato «${sel.name}»`}
                >
                  Sostituisci in «{sel.name}»
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="hint" style={{ margin: 0, fontSize: '0.75rem' }}>
            Nessun file SVG trovato nella cartella assets/ del gioco.
          </p>
        )}
      </div>

      {/* Lista dei livelli attuali */}
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
            {!l.locked && (
              <button
                className="layer-del"
                title="Elimina livello"
                onClick={() => deleteLayer(l.id)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Dettaglio del livello selezionato */}
      {sel && (
        <div style={{ marginTop: '12px', padding: '10px', background: 'var(--panel-2)', borderRadius: '8px', border: '1px solid var(--bordo)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--oro)' }}>
              Livello: {sel.name}
            </span>
            {!sel.locked && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '2px 8px', fontSize: '0.75rem', color: '#e88a7a' }}
                onClick={() => deleteLayer(sel.id)}
              >
                Elimina
              </button>
            )}
          </div>
          {sel.type === 'image' && (
            <>
              <label className="field" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Asset SVG associato:</label>
              <select
                value={sel.src}
                onChange={(e) => replaceSrc(sel.id, e.target.value)}
                style={{ fontSize: '0.8rem' }}
              >
                {!assetFiles.includes(sel.src) && <option value={sel.src}>{sel.src}</option>}
                {assetFiles.map((f) => (
                  <option key={f} value={f}>
                    {f.replace(/^assets\//, '')}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      <button
        className="btn btn-ghost btn-block"
        style={{ marginTop: '12px' }}
        onClick={() => downloadJson(downloadFilename, template)}
      >
        ⬇ Scarica template JSON (da salvare in docs/)
      </button>
    </>
  );
}

