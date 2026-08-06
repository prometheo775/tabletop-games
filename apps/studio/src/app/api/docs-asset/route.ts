import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { findDocsRoot } from '../../../lib/games';

export const dynamic = 'force-dynamic';

const MIME: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8',
};

/**
 * Accesso in sola lettura agli asset e ai template della cartella del gioco:
 *   GET /api/docs-asset?slug=<gioco>&path=assets/frame.svg   → il file
 *   GET /api/docs-asset?slug=<gioco>&list=assets             → elenco file immagine
 * Il salvataggio resta manuale (localStorage + export del template dall'editor).
 */
export function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') ?? '';
  const rel = req.nextUrl.searchParams.get('path') ?? '';
  const list = req.nextUrl.searchParams.get('list') ?? '';

  const docsRoot = findDocsRoot();
  if (!docsRoot || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'gioco non trovato' }, { status: 404 });
  }
  const gameRoot = path.join(docsRoot, slug);

  if (list) {
    if (!/^[a-z0-9/_-]+$/.test(list)) return NextResponse.json({ error: 'lista non valida' }, { status: 400 });
    const dir = path.join(gameRoot, list);
    if (!dir.startsWith(gameRoot) || !fs.existsSync(dir)) return NextResponse.json({ files: [] });
    const files: string[] = [];
    const walk = (d: string, prefix: string) => {
      for (const name of fs.readdirSync(d)) {
        const full = path.join(d, name);
        if (fs.statSync(full).isDirectory()) walk(full, `${prefix}${name}/`);
        else if (MIME[path.extname(name).toLowerCase()]?.startsWith('image/')) files.push(`${list}/${prefix}${name}`);
      }
    };
    walk(dir, '');
    return NextResponse.json({ files: files.sort() });
  }

  // solo asset, carte e template, niente path traversal
  if (!/^(assets|cards(\/templates)?)\/[a-zA-Z0-9._/-]+$/.test(rel) || rel.includes('..')) {
    return NextResponse.json({ error: 'percorso non valido' }, { status: 400 });
  }
  const file = path.join(gameRoot, rel);
  if (!file.startsWith(gameRoot) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    return NextResponse.json({ error: 'file non trovato' }, { status: 404 });
  }
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime) return NextResponse.json({ error: 'tipo non ammesso' }, { status: 415 });
  return new NextResponse(fs.readFileSync(file), {
    headers: { 'Content-Type': mime, 'Cache-Control': 'no-store' },
  });
}
