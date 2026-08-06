import { createProject, type Project, DEFAULT_STITCHES } from '@tabletops-game/card-engine';

const INDEX_KEY = 'ttg_projects_v1';
const PROJECT_KEY = (id: string) => `ttg_project_${id}`;

export interface ProjectMeta {
  id: string;
  name: string;
  updatedAt: number;
  counts: { quiz: number; events: number; archive: number };
}

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export function listProjects(): ProjectMeta[] {
  return safe(() => {
    const raw = localStorage.getItem(INDEX_KEY);
    const arr = raw ? (JSON.parse(raw) as ProjectMeta[]) : [];
    return Array.isArray(arr) ? arr.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  }, []);
}

function writeIndex(metas: ProjectMeta[]) {
  safe(() => localStorage.setItem(INDEX_KEY, JSON.stringify(metas)), undefined);
}

export function loadProject(id: string): Project | null {
  return safe(() => {
    const raw = localStorage.getItem(PROJECT_KEY(id));
    if (!raw) return null;
    const p = JSON.parse(raw) as Project;
    if (p) {
      if (!p.stitches || p.stitches.length < 2) {
        p.stitches = [
          { ...DEFAULT_STITCHES[0] },
          { ...DEFAULT_STITCHES[1] },
        ];
      }
      if (!p.format) {
        p.format = { wCm: 6.35, hCm: 8.89 };
      }
    }
    return p;
  }, null);
}

export function saveProject(p: Project) {
  p.updatedAt = Date.now();
  safe(() => localStorage.setItem(PROJECT_KEY(p.id), JSON.stringify(p)), undefined);
  const metas = listProjects().filter((m) => m.id !== p.id);
  metas.unshift({
    id: p.id,
    name: p.name,
    updatedAt: p.updatedAt,
    counts: { quiz: p.quiz.length, events: p.events.length, archive: p.archive.length },
  });
  writeIndex(metas);
}

export function newProject(name: string): Project {
  const p = createProject(name);
  saveProject(p);
  return p;
}

export function deleteProject(id: string) {
  safe(() => localStorage.removeItem(PROJECT_KEY(id)), undefined);
  writeIndex(listProjects().filter((m) => m.id !== id));
}
