'use client';

import Link from 'next/link';
import {
  use, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  AI_PROMPTS, portraitPx, renderArchive, renderCharacter, renderEvent, renderQuiz,
  parseArchiveJson, parseEventJson, parseQuizJson,
  defPlate, defBox, defQuizBox, defLandPlate, defLandWidePlate, defLandBox,
  renderTemplate, templateImageSrcs, sortedLayers, parseTemplate, DEFAULT_TEMPLATES,
  type AssetMap, type Project, type Era, type CardTemplate, type TemplateCard,
} from '@tabletops-game/card-engine';
import { CardCanvas, type CanvasGeom } from '../../../components/CardCanvas';
import { LayerCanvas } from '../../../components/LayerCanvas';
import { LayerPanel } from '../../../components/editor/LayerPanel';
import { DeckNav } from '../../../components/editor/DeckNav';
import { ImportModal, PromptBox, ViewJsonModal } from '../../../components/JsonModals';
import { loadAssets, exportPng } from '../../../lib/canvas-io';
import { loadProject, saveProject } from '../../../lib/store';

const DEFAULT_SLUG = 'caccia-alla-repubblica';
const docsAssetUrl = (slug: string, path: string) =>
  `/api/docs-asset?slug=${encodeURIComponent(slug)}&path=${encodeURIComponent(path)}`;

/** Mappa tab → file template in docs/ e campo del progetto. */
const TPL_META = {
  characters: { file: 'personaggi', field: 'charTemplate' },
  quiz: { file: 'sapere', field: 'quizTemplate' },
  events: { file: 'imprevisti', field: 'eventTemplate' },
  archive: { file: 'archivio', field: 'archiveTemplate' },
} as const;

type Tab = 'characters' | 'quiz' | 'events' | 'archive';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'characters', label: '🎭 Personaggi' },
  { id: 'quiz', label: '❓ Domande' },
  { id: 'events', label: '⚡ Imprevisti' },
  { id: 'archive', label: '📜 Archivio' },
];

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null | 'missing'>(null);
  const [assets, setAssets] = useState<AssetMap | null>(null);
  const [tab, setTab] = useState<Tab>('characters');
  const [charIdx, setCharIdx] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [eventIdx, setEventIdx] = useState(0);
  const [arcIdx, setArcIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [status, setStatus] = useState<{ msg: string; err?: boolean } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selLayer, setSelLayer] = useState<string | null>(null);
  const [assetFiles, setAssetFiles] = useState<string[]>([]);
  const tplImages = useRef<Record<string, HTMLImageElement>>({});
  const [imgVer, setImgVer] = useState(0);

  useEffect(() => {
    setProject(loadProject(id) ?? 'missing');
    loadAssets().then(setAssets).catch(() => setAssets(null));
  }, [id]);

  const touch = useCallback(() => {
    setTick((t) => t + 1);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setProject((p) => {
        if (p && p !== 'missing') saveProject(p);
        return p;
      });
    }, 350);
  }, []);

  const p = project !== 'missing' ? project : null;
  const portrait = useMemo(() => (p ? portraitPx(p.format) : { w: 822, h: 1122 }), [p]);
  const landscape = { w: portrait.h, h: portrait.w };
  const isLand = tab === 'events' || tab === 'archive';
  const dims = isLand ? landscape : portrait;
  const slug = p?.docsSlug ?? DEFAULT_SLUG;
  const curTplField = TPL_META[tab].field;
  const curTpl = p?.[curTplField] ?? null;
  const curCard = !p ? undefined
    : tab === 'characters' ? p.characters[charIdx]
      : tab === 'quiz' ? p.quiz[quizIdx]
        : tab === 'events' ? p.events[eventIdx]
          : p.archive[arcIdx];

  // template del mazzo corrente: caricato dalla cartella del gioco (docs/) alla prima apertura
  useEffect(() => {
    if (!p || p[curTplField]) return;
    const { file, field } = TPL_META[tab];
    let cancel = false;
    (async () => {
      let tpl: CardTemplate | null = null;
      try {
        const r = await fetch(docsAssetUrl(slug, `cards/templates/${file}.template.json`));
        if (r.ok) tpl = parseTemplate(await r.json());
      } catch { /* offline o file mancante: si usa il default */ }
      if (cancel) return;
      p.docsSlug = slug;
      p[field] = tpl ?? (JSON.parse(JSON.stringify(DEFAULT_TEMPLATES[file])) as CardTemplate);
      touch();
    })();
    return () => { cancel = true; };
  }, [p, tab, curTplField, p?.[curTplField], slug, touch]);

  // carica (e tiene in cache) le immagini richieste dal template per la carta corrente
  const ensureTplImages = useCallback(() => {
    const tpl = p?.[curTplField];
    if (!p || !tpl) return;
    const card = curCard ?? { era: 1 as Era };
    for (const src of templateImageSrcs(tpl, card)) {
      if (tplImages.current[src]) continue;
      const img = new Image();
      img.onload = () => { tplImages.current[src] = img; setImgVer((v) => v + 1); };
      img.src = docsAssetUrl(slug, src);
    }
  }, [p, curTplField, curCard, slug]);

  useEffect(() => { ensureTplImages(); }, [ensureTplImages, curTpl]);

  // cambiando tab si azzera la selezione del layer
  useEffect(() => { setSelLayer(null); }, [tab]);

  // elenco degli asset disponibili nella cartella del gioco (per sostituire i layer o aggiungerne di nuovi)
  const refreshAssets = useCallback(() => {
    if (!slug) return;
    fetch(`/api/docs-asset?slug=${encodeURIComponent(slug)}&list=assets`)
      .then((r) => (r.ok ? r.json() : { files: [] }))
      .then((j) => setAssetFiles(Array.isArray(j.files) ? j.files : []))
      .catch(() => setAssetFiles([]));
  }, [slug]);

  useEffect(() => {
    if (p) refreshAssets();
  }, [p, refreshAssets]);

  const geom: CanvasGeom | null = useMemo(() => {
    if (!p) return null;
    if (tab === 'characters') {
      const ch = p.characters[charIdx];
      return ch
        ? { ...ch.layout, plateActive: ch.showPlate, boxActive: ch.showBox }
        : null;
    }
    if (tab === 'quiz') return p.quizLayout;
    if (tab === 'events') return p.eventLayout;
    return p.archiveLayout;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p, tab, charIdx, p?.updatedAt]);

  const paint = useCallback(
    (c: CanvasRenderingContext2D, o: { guide: boolean; snapped: boolean }) => {
      if (!p || !assets) return;
      const opts = { editing: true, cutLine: true, ...o };
      const tpl = p[TPL_META[tab].field];
      if (tpl) {
        const card = tab === 'characters' ? p.characters[charIdx]
          : tab === 'quiz' ? p.quiz[quizIdx]
            : tab === 'events' ? p.events[eventIdx] : p.archive[arcIdx];
        renderTemplate(c, dims.w, dims.h, tpl, tplImages.current, card, { ...opts, selectedId: selLayer });
      } else if (tab === 'characters') {
        const ch = p.characters[charIdx];
        if (ch) renderCharacter(c, dims.w, dims.h, assets, p.stitches, ch, opts);
      } else if (tab === 'quiz') {
        renderQuiz(c, dims.w, dims.h, assets, p.stitches, p.quizLayout, p.quiz[quizIdx], opts);
      } else if (tab === 'events') {
        renderEvent(c, dims.w, dims.h, assets, p.stitches, p.eventLayout, p.events[eventIdx], opts);
      } else {
        renderArchive(c, dims.w, dims.h, assets, p.stitches, p.archiveLayout, p.archive[arcIdx], opts);
      }
    },
    // tick: ogni modifica (toggle layer, z, testi) deve ridisegnare subito il canvas
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p, assets, tab, charIdx, quizIdx, eventIdx, arcIdx, dims.w, dims.h, selLayer, imgVer, curTpl, tick],
  );

  if (project === 'missing') {
    return (
      <div className="studio-root">
        <main className="table">
          <h1>Progetto non trovato</h1>
          <p className="sub">
            Forse è stato eliminato o appartiene a un altro browser.{' '}
            <Link href="/studio" style={{ color: 'var(--oro)' }}>Torna al tavolo</Link>.
          </p>
        </main>
      </div>
    );
  }
  if (!p) {
    return (
      <div className="studio-root">
        <main className="table"><p className="sub">Apro il progetto…</p></main>
      </div>
    );
  }

  const deckLen = { quiz: p.quiz.length, events: p.events.length, archive: p.archive.length };
  const idxState = {
    quiz: [quizIdx, setQuizIdx] as const,
    events: [eventIdx, setEventIdx] as const,
    archive: [arcIdx, setArcIdx] as const,
  };

  const exportName = (i: number): string => {
    if (tab === 'characters') return `carta_${p.characters[i].id}.png`;
    if (tab === 'quiz') return `carta_sapere_era${p.quiz[i].era}_${String(i + 1).padStart(2, '0')}.png`;
    if (tab === 'events') return `carta_imprevisto_${p.events[i].tipo}_${String(i + 1).padStart(2, '0')}.png`;
    return `carta_archivio_${String(i + 1).padStart(2, '0')}.png`;
  };

  const drawCardPlain = (c: CanvasRenderingContext2D, i: number) => {
    if (!assets) return;
    const plain = { editing: false, cutLine: false, guide: false, snapped: false };
    const tpl = p[TPL_META[tab].field];
    const card: TemplateCard | undefined = tab === 'characters' ? p.characters[i]
      : tab === 'quiz' ? p.quiz[i]
        : tab === 'events' ? p.events[i] : p.archive[i];
    if (tpl) {
      renderTemplate(c, dims.w, dims.h, tpl, tplImages.current, card, plain);
    } else if (tab === 'characters') {
      renderCharacter(c, dims.w, dims.h, assets, p.stitches, p.characters[i], plain);
    } else if (tab === 'quiz') {
      renderQuiz(c, dims.w, dims.h, assets, p.stitches, p.quizLayout, p.quiz[i], plain);
    } else if (tab === 'events') {
      renderEvent(c, dims.w, dims.h, assets, p.stitches, p.eventLayout, p.events[i], plain);
    } else {
      renderArchive(c, dims.w, dims.h, assets, p.stitches, p.archiveLayout, p.archive[i], plain);
    }
  };

  const deckCards = (): TemplateCard[] => (tab === 'characters' ? p.characters
    : tab === 'quiz' ? p.quiz : tab === 'events' ? p.events : p.archive);

  /** Precarica le immagini del template per tutte le carte del mazzo corrente. */
  const preloadTplImages = async () => {
    const tpl = p[TPL_META[tab].field];
    if (!tpl) return;
    const srcs = new Set<string>();
    deckCards().forEach((card) => templateImageSrcs(tpl, card).forEach((s) => srcs.add(s)));
    await Promise.all([...srcs].map((src) => new Promise<void>((res) => {
      if (tplImages.current[src]) { res(); return; }
      const img = new Image();
      img.onload = () => { tplImages.current[src] = img; res(); };
      img.onerror = () => res();
      img.src = docsAssetUrl(slug, src);
    })));
  };

  const exportCurrent = async () => {
    if (!assets) return;
    const i = tab === 'characters' ? charIdx : idxState[tab][0];
    if (!deckCards()[i]) return;
    await preloadTplImages();
    await exportPng(exportName(i), dims.w, dims.h, (c) => drawCardPlain(c, i));
  };

  const exportAll = async () => {
    if (!assets) return;
    const pause = () => new Promise((r) => setTimeout(r, 400));
    await preloadTplImages();
    const n = deckCards().length;
    for (let i = 0; i < n; i++) {
      await exportPng(exportName(i), dims.w, dims.h, (c) => drawCardPlain(c, i));
      await pause();
    }
  };

  const doImport = (text: string): string | null => {
    if (tab === 'quiz') {
      const r = parseQuizJson(text);
      if ('err' in r) return r.err;
      p.quiz = r.cards; setQuizIdx(0);
      setStatus({ msg: `✔ ${r.cards.length} carte caricate` });
    } else if (tab === 'events') {
      const r = parseEventJson(text);
      if ('err' in r) return r.err;
      p.events = r.cards; setEventIdx(0);
      const nb = r.cards.filter((c) => c.tipo === 'bonus').length;
      setStatus({ msg: `✔ ${r.cards.length} carte caricate (${nb} bonus, ${r.cards.length - nb} malus)` });
    } else {
      const r = parseArchiveJson(text);
      if ('err' in r) return r.err;
      p.archive = r.cards; setArcIdx(0);
      setStatus({ msg: `✔ ${r.cards.length} curiosità caricate` });
    }
    touch();
    return null;
  };

  const syncFromDocs = async () => {
    if (!p || tab === 'characters') return;
    const fileMap: Record<string, string> = {
      quiz: 'cards/sapere.json',
      events: 'cards/imprevisti.json',
      archive: 'cards/archivio.json',
    };
    const filePath = fileMap[tab];
    if (!filePath) return;
    try {
      const res = await fetch(docsAssetUrl(slug, filePath));
      if (!res.ok) throw new Error(`File ${filePath} non trovato in docs/`);
      const text = await res.text();
      const err = doImport(text);
      if (!err) {
        setStatus({ msg: `✔ Sincronizzato con successo da ${filePath}` });
      } else {
        setStatus({ msg: `✖ Errore sincronizzazione: ${err}`, err: true });
      }
    } catch (e: any) {
      setStatus({ msg: `✖ Impossibile sincronizzare: ${e.message}`, err: true });
    }
  };

  const deckMeta = {
    quiz: { key: 'carte', file: 'mazzo_sapere.json', prompt: AI_PROMPTS.quiz, data: () => ({ carte: p.quiz }) },
    events: { key: 'imprevisti', file: 'mazzo_imprevisti.json', prompt: AI_PROMPTS.events, data: () => ({ imprevisti: p.events }) },
    archive: { key: 'archivio', file: 'mazzo_archivio.json', prompt: AI_PROMPTS.archive, data: () => ({ archivio: p.archive }) },
  } as const;

  const ch = p.characters[charIdx];
  const resetLayout = () => {
    const { w: W, h: H } = portrait;
    const { w: LW, h: LH } = landscape;
    // ricarica il template ufficiale dalla cartella del gioco + layout legacy di fabbrica
    p[TPL_META[tab].field] = undefined;
    setSelLayer(null);
    if (tab === 'characters') ch.layout = { plate: defPlate(W), box: defBox(W, H) };
    else if (tab === 'quiz') p.quizLayout = { plate: defPlate(W), box: defQuizBox(W, H) };
    else if (tab === 'events') p.eventLayout = { plate: defLandPlate(LW), box: defLandBox(LW, LH) };
    else p.archiveLayout = { plate: defLandWidePlate(LW), box: defLandBox(LW, LH) };
    touch();
  };


  return (
    <div className="studio-root">
      <header className="topbar">
        <Link href="/studio" className="wordmark">Tabletops Studio<small>← torna al tavolo</small></Link>
        <div className="spacer" />
        <span className="crumb">
          Progetto <b>{p.name}</b> · salvataggio automatico
        </span>
      </header>

      <div className="editor">
        <aside className="side">
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'characters' && ch && (
            <>
              <h2>Personaggio</h2>
              <div className="thumbs">
                {p.characters.map((c, i) => (
                  <button
                    key={c.id}
                    className={`thumb ${i === charIdx ? 'on' : ''}`}
                    onClick={() => setCharIdx(i)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/assets/art_${c.artKey}.png`} alt={c.name} />
                    <small>{c.name}</small>
                  </button>
                ))}
              </div>

              <h2>Testi</h2>
              <label className="field">Nome (targhetta)</label>
              <input type="text" value={ch.name} onChange={(e) => { ch.name = e.target.value; touch(); }} />
              <label className="field">Etichetta Era</label>
              <input type="text" value={ch.era} onChange={(e) => { ch.era = e.target.value; touch(); }} />
              <label className="field">Storia (Invio = a capo sulla carta)</label>
              <textarea value={ch.storia} onChange={(e) => { ch.storia = e.target.value; touch(); }} />
              <label className="field">Nome del potere</label>
              <input type="text" value={ch.potereNome} onChange={(e) => { ch.potereNome = e.target.value; touch(); }} />
              <label className="field">Descrizione del potere</label>
              <textarea value={ch.potere} onChange={(e) => { ch.potere = e.target.value; touch(); }} />

              <h2>Dimensioni testo</h2>
              <label className="field">Nome · {ch.nameSize}px</label>
              <input
                type="range" min={24} max={54} value={ch.nameSize}
                onChange={(e) => { ch.nameSize = +e.target.value; touch(); }}
              />
              <label className="field">Corpo · {ch.bodySize}px</label>
              <input
                type="range" min={20} max={32} value={ch.bodySize}
                onChange={(e) => { ch.bodySize = +e.target.value; touch(); }}
              />

              <h2>Livelli</h2>
              <label className="check">
                <input type="checkbox" checked={ch.showPlate} onChange={(e) => { ch.showPlate = e.target.checked; touch(); }} />
                Mostra targhetta nome
              </label>
              <label className="check">
                <input type="checkbox" checked={ch.showBox} onChange={(e) => { ch.showBox = e.target.checked; touch(); }} />
                Mostra box testo
              </label>
            </>
          )}

          {tab !== 'characters' && (
            <>
              <h2>1 · Genera con l&apos;IA</h2>
              <p className="hint" style={{ marginTop: 0 }}>
                Copia il prompt e incollalo in un&apos;IA allegando il tuo file: otterrai un
                JSON pronto da importare.
              </p>
              <PromptBox prompt={deckMeta[tab].prompt} />

              <h2>2 · Importa e conserva</h2>
              <button className="btn btn-primary btn-block" onClick={() => setImportOpen(true)}>
                📥 Importa JSON (incolla)
              </button>
              <button className="btn btn-secondary btn-block" onClick={syncFromDocs}>
                🔄 Sincronizza da file di progetto (docs/)
              </button>
              <button className="btn btn-ghost btn-block" onClick={() => setJsonOpen(true)}>
                📄 Mostra / copia JSON del mazzo
              </button>
              {status && <p className={`status ${status.err ? 'err' : ''}`}>{status.msg}</p>}

              <h2>3 · Rifinisci la carta corrente</h2>
              {tab === 'quiz' && (p.quiz[quizIdx] ? (
                <QuizFields p={p} i={quizIdx} touch={touch} />
              ) : <p className="hint">Il mazzo è vuoto: importa un JSON.</p>)}
              {tab === 'events' && (p.events[eventIdx] ? (
                <EventFields p={p} i={eventIdx} touch={touch} />
              ) : <p className="hint">Il mazzo è vuoto: importa un JSON.</p>)}
              {tab === 'archive' && (p.archive[arcIdx] ? (
                <ArchiveFields p={p} i={arcIdx} touch={touch} />
              ) : <p className="hint">Il mazzo è vuoto: importa un JSON.</p>)}
            </>
          )}

          {curTpl && (
            <LayerPanel
              template={curTpl}
              selectedId={selLayer}
              onSelect={setSelLayer}
              assetFiles={assetFiles}
              onChange={touch}
              onAssetReplaced={ensureTplImages}
              onRefreshAssets={refreshAssets}
              downloadFilename={`${TPL_META[tab].file}.template.json`}
            />
          )}

          <h2>Esporta</h2>
          <button className="btn btn-ghost btn-block" onClick={resetLayout}>
            ↺ Ripristina il layout di questa carta
          </button>
          <button className="btn btn-primary btn-block" onClick={exportCurrent}>
            ⬇ Scarica questa carta (PNG 300 DPI)
          </button>
          <button className="btn btn-secondary btn-block" onClick={exportAll}>
            ⬇ Scarica tutto il mazzo
          </button>
          <p className="hint">
            Trascina targhetta e box sul canvas; maniglia in basso a destra per
            ridimensionare (Shift = proporzioni), frecce per spostamenti fini, la calamita
            aggancia al centro. Tutto si salva da solo nel browser.
          </p>
        </aside>

        <section className="stage">
          {curTpl ? (
            <LayerCanvas
              w={dims.w}
              h={dims.h}
              layers={sortedLayers(curTpl)}
              selectedId={selLayer}
              onSelect={setSelLayer}
              paint={paint}
              onChange={touch}
            />
          ) : (
            <CardCanvas w={dims.w} h={dims.h} geom={geom} paint={paint} onGeomChange={touch} />
          )}
          {tab !== 'characters' && (
            <DeckNav
              index={idxState[tab][0]}
              length={deckLen[tab]}
              onIndexChange={(i) => idxState[tab][1](i)}
            />
          )}
        </section>
      </div>

      {importOpen && tab !== 'characters' && (
        <ImportModal
          title={`📥 Importa il JSON — ${TABS.find((t) => t.id === tab)?.label}`}
          placeholder={`{"${deckMeta[tab].key}":[…]}`}
          onImport={doImport}
          onClose={() => setImportOpen(false)}
        />
      )}
      {jsonOpen && tab !== 'characters' && (
        <ViewJsonModal
          title={`📄 JSON — ${TABS.find((t) => t.id === tab)?.label}`}
          filename={deckMeta[tab].file}
          data={deckMeta[tab].data()}
          onClose={() => setJsonOpen(false)}
        />
      )}
    </div>
  );
}

function QuizFields({ p, i, touch }: { p: Project; i: number; touch: () => void }) {
  const q = p.quiz[i];
  return (
    <>
      <label className="field">Era</label>
      <select value={q.era} onChange={(e) => { q.era = +e.target.value as Era; touch(); }}>
        <option value={1}>Era 1 · Unità</option>
        <option value={2}>Era 2 · Resistenza</option>
        <option value={3}>Era 3 · Repubblica</option>
      </select>
      <label className="field">Domanda (Invio = a capo sulla carta)</label>
      <textarea value={q.domanda} onChange={(e) => { q.domanda = e.target.value; touch(); }} />
      <label className="field">Opzioni — una per riga (vuoto = risposta aperta)</label>
      <textarea
        defaultValue={q.opzioni.join('\n')}
        key={`opt-${i}`}
        onChange={(e) => {
          q.opzioni = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 4);
          touch();
        }}
      />
      <label className="field">Risposta</label>
      <input type="text" value={q.risposta} onChange={(e) => { q.risposta = e.target.value; touch(); }} />
      <label className="field">Gettone</label>
      <input
        type="text" value={q.gettone}
        onChange={(e) => { q.gettone = e.target.value.toUpperCase(); touch(); }}
      />
    </>
  );
}

function EventFields({ p, i, touch }: { p: Project; i: number; touch: () => void }) {
  const ev = p.events[i];
  return (
    <>
      <label className="field">Titolo</label>
      <input type="text" value={ev.titolo} onChange={(e) => { ev.titolo = e.target.value; touch(); }} />
      <label className="field">Testo (Invio = a capo sulla carta)</label>
      <textarea value={ev.testo} onChange={(e) => { ev.testo = e.target.value; touch(); }} />
      <label className="field">Effetto</label>
      <input type="text" value={ev.effetto} onChange={(e) => { ev.effetto = e.target.value; touch(); }} />
      <label className="field">Tipo</label>
      <select value={ev.tipo} onChange={(e) => { ev.tipo = e.target.value as 'bonus' | 'malus'; touch(); }}>
        <option value="bonus">Bonus (verde)</option>
        <option value="malus">Malus (rosso)</option>
      </select>
    </>
  );
}

function ArchiveFields({ p, i, touch }: { p: Project; i: number; touch: () => void }) {
  const ar = p.archive[i];
  return (
    <>
      <label className="field">Titolo</label>
      <input type="text" value={ar.titolo} onChange={(e) => { ar.titolo = e.target.value; touch(); }} />
      <label className="field">Anno / data</label>
      <input type="text" value={ar.anno} onChange={(e) => { ar.anno = e.target.value; touch(); }} />
      <label className="field">Testo (Invio = a capo sulla carta)</label>
      <textarea value={ar.testo} onChange={(e) => { ar.testo = e.target.value; touch(); }} />
      <label className="field">Era</label>
      <select value={ar.era} onChange={(e) => { ar.era = +e.target.value as Era | 0; touch(); }}>
        <option value={0}>— nessuna</option>
        <option value={1}>Era 1 · Unità</option>
        <option value={2}>Era 2 · Resistenza</option>
        <option value={3}>Era 3 · Repubblica</option>
      </select>
    </>
  );
}
