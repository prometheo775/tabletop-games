import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

/**
 * L'hub legge la cartella docs/ del repo: ogni sottocartella con un game.md è un gioco.
 * La cartella docs/ è la fonte di verità (vedi la skill table-game-master).
 */

export interface GameMeta {
  slug: string;
  title: string;
  subtitle: string;
  status: string;
  players: string;
  duration: string;
  ages: string;
  cover: string | null;
  sections: SectionInfo[];
}

export interface SectionInfo {
  id: string;
  label: string;
  count: number;
}

export interface DocFile {
  name: string;
  title: string;
  content: string;
}

const SECTION_LABELS: Record<string, string> = {
  rules: 'Regole',
  cards: 'Carte',
  board: 'Tabellone',
  mechanics: 'Meccaniche',
  playtests: 'Playtest',
  references: 'Fonti',
};

export const SECTION_ORDER = Object.keys(SECTION_LABELS);

/** Risale da cwd fino a trovare la cartella docs/ del workspace. */
export function findDocsRoot(): string | null {
  if (process.env.DOCS_ROOT && fs.existsSync(process.env.DOCS_ROOT)) return process.env.DOCS_ROOT;
  let dir = process.cwd();
  for (let i = 0; i < 6; i += 1) {
    const candidate = path.join(dir, 'docs');
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function readGameMeta(docsRoot: string, slug: string): GameMeta | null {
  const gameFile = path.join(docsRoot, slug, 'game.md');
  if (!fs.existsSync(gameFile)) return null;
  const { data } = matter(fs.readFileSync(gameFile, 'utf-8'));
  const sections: SectionInfo[] = [];
  for (const id of SECTION_ORDER) {
    const dir = path.join(docsRoot, slug, id);
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      const count = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length;
      sections.push({ id, label: SECTION_LABELS[id], count });
    }
  }
  return {
    slug,
    title: String(data.title ?? slug),
    subtitle: String(data.subtitle ?? ''),
    status: String(data.status ?? 'idea'),
    players: String(data.players ?? '—'),
    duration: String(data.duration ?? '—'),
    ages: String(data.ages ?? '—'),
    cover: data.cover ? String(data.cover) : null,
    sections,
  };
}

export function listGames(): GameMeta[] {
  const docsRoot = findDocsRoot();
  if (!docsRoot) return [];
  return fs
    .readdirSync(docsRoot)
    .filter((d) => fs.statSync(path.join(docsRoot, d)).isDirectory())
    .map((slug) => readGameMeta(docsRoot, slug))
    .filter((g): g is GameMeta => g !== null)
    .sort((a, b) => a.title.localeCompare(b.title, 'it'));
}

export function getGame(slug: string): (GameMeta & { body: string }) | null {
  const docsRoot = findDocsRoot();
  if (!docsRoot || !/^[a-z0-9-]+$/.test(slug)) return null;
  const meta = readGameMeta(docsRoot, slug);
  if (!meta) return null;
  const { content } = matter(fs.readFileSync(path.join(docsRoot, slug, 'game.md'), 'utf-8'));
  return { ...meta, body: content };
}

function docTitle(content: string, fallback: string): string {
  const m = content.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback;
}

export function getSectionDocs(slug: string, section: string): DocFile[] {
  const docsRoot = findDocsRoot();
  if (!docsRoot) return [];
  if (!/^[a-z0-9-]+$/.test(slug) || !SECTION_ORDER.includes(section)) return [];
  const dir = path.join(docsRoot, slug, section);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b, 'it'))
    .map((name) => {
      const raw = fs.readFileSync(path.join(dir, name), 'utf-8');
      const { content } = matter(raw);
      return { name, title: docTitle(content, name.replace(/\.md$/, '')), content };
    });
}

/** File non-markdown di una sezione (es. i .json dei mazzi). */
export function getSectionExtras(slug: string, section: string): string[] {
  const docsRoot = findDocsRoot();
  if (!docsRoot) return [];
  if (!/^[a-z0-9-]+$/.test(slug) || !SECTION_ORDER.includes(section)) return [];
  const dir = path.join(docsRoot, slug, section);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => !f.endsWith('.md') && !f.startsWith('.')).sort();
}

export const STATUS_LABEL: Record<string, string> = {
  idea: 'Idea',
  design: 'In design',
  playtest: 'In playtest',
  pronto: 'Pronto',
};
