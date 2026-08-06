'use client';

import { useEffect, useState } from 'react';
import { copyText, downloadJson } from '../lib/canvas-io';

export function ImportModal({
  title, placeholder, onImport, onClose,
}: {
  title: string;
  placeholder: string;
  onImport: (text: string) => string | null; // ritorna errore o null
  onClose: () => void;
}) {
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const paste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (!t) throw new Error('vuoto');
      setText(t);
      setErr(null);
    } catch {
      setErr('Non riesco a leggere gli appunti da qui: incolla manualmente con Ctrl+V (⌘+V su Mac).');
    }
  };

  return (
    <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h3>{title}</h3>
        <p>
          Incolla la risposta dell&apos;IA. Se il JSON è dentro un blocco ```json o preceduto
          da testo, lo estraggo io.
        </p>
        <textarea
          className="mono"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        {err && <div className="err">{err}</div>}
        <div className="row">
          <button className="btn btn-ghost" onClick={paste}>📋 Incolla dagli appunti</button>
          <button className="btn btn-secondary" onClick={onClose}>Annulla</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!text.trim()) { setErr('Il campo è vuoto: incolla prima il JSON.'); return; }
              const e = onImport(text);
              if (e) setErr(e);
              else onClose();
            }}
          >
            Genera le carte
          </button>
        </div>
      </div>
    </div>
  );
}

export function ViewJsonModal({
  title, filename, data, onClose,
}: {
  title: string;
  filename: string;
  data: unknown;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h3>{title}</h3>
        <p>Copia o scarica il JSON per conservare le rifiniture: potrai reimportarlo quando vuoi.</p>
        <textarea className="mono" readOnly value={json} />
        <div className="row">
          <button className="btn btn-ghost" onClick={() => downloadJson(filename, data)}>
            ⬇ Scarica .json
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Chiudi</button>
          <button
            className="btn btn-primary"
            onClick={async () => { await copyText(json); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
          >
            {copied ? '✔ Copiato!' : '📋 Copia JSON'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PromptBox({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <textarea className="mono" rows={10} readOnly value={prompt} />
      <button
        className="btn btn-secondary btn-block"
        onClick={async () => { await copyText(prompt); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
      >
        {copied ? '✔ Copiato negli appunti!' : '📋 Copia il prompt'}
      </button>
    </>
  );
}
