'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  deleteProject, listProjects, newProject, type ProjectMeta,
} from '../../lib/store';

export default function Dashboard() {
  const [projects, setProjects] = useState<ProjectMeta[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => { setProjects(listProjects()); }, []);

  const create = () => {
    const n = name.trim() || 'Nuovo gioco';
    const p = newProject(n);
    window.location.href = `/project/${p.id}`;
  };

  return (
    <div className="studio-root">
      <header className="topbar">
        <Link href="/" className="wordmark">
          Tabletops Studio
          <small>← torna all&apos;hub</small>
        </Link>
        <div className="spacer" />
      </header>

      <main className="table">
        <header>
          <h1>Il tavolo da lavoro</h1>
          <p className="sub">
            Ogni carta qui sotto è un progetto: aprilo per disegnare i personaggi, generare
            i mazzi con l&apos;IA e scaricare i PNG pronti per la stampa a 300 DPI.
          </p>
        </header>

        <div className="deck-grid">
          {projects?.map((m) => (
            <Link key={m.id} href={`/project/${m.id}`} className="project-card">
              <div className="face">
                <h3>{m.name}</h3>
                <div className="meta">
                  <span>{m.counts.quiz} domande · {m.counts.events} imprevisti</span>
                  <span>{m.counts.archive} curiosità d&apos;archivio</span>
                  <span>
                    agg. {new Date(m.updatedAt).toLocaleDateString('it-IT', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              <button
                className="delete"
                title="Elimina progetto"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm(`Eliminare «${m.name}»? L'operazione non si può annullare.`)) {
                    deleteProject(m.id);
                    setProjects(listProjects());
                  }
                }}
              >
                ✕
              </button>
            </Link>
          ))}

          {creating ? (
            <div className="project-card new" style={{ flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                placeholder="Nome del gioco…"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') create();
                  if (e.key === 'Escape') setCreating(false);
                }}
              />
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={create}>
                Crea il progetto
              </button>
            </div>
          ) : (
            <button className="project-card new" onClick={() => setCreating(true)}>
              ＋ Nuovo gioco
              <br />
              <span style={{ fontSize: '0.72rem' }}>pesca una carta bianca</span>
            </button>
          )}
        </div>

        {projects !== null && projects.length === 0 && !creating && (
          <p className="sub" style={{ marginTop: 26 }}>
            Il tavolo è sgombro: crea il primo progetto per iniziare. Troverai già i cinque
            personaggi di «Caccia alla Repubblica» come base di partenza.
          </p>
        )}
      </main>
    </div>
  );
}
