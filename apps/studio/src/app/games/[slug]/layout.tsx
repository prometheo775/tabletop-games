import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Dices, PencilRuler } from 'lucide-react';
import { getGame, STATUS_LABEL } from '../../../lib/games';
import { Badge } from '../../../components/ui/badge';
import { buttonVariants } from '../../../components/ui/button';
import { GameNav } from './game-nav';

export const dynamic = 'force-dynamic';

export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  return (
    <div className="hub-root min-h-screen font-sans text-foreground">
      <header className="border-b border-border bg-[var(--pelle-scuro,#3e2814)]">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Dices className="size-6 text-primary" />
            <div>
              <div className="font-[family-name:var(--font-display)] text-sm uppercase tracking-[0.14em] text-[#e8d6a8]">
                Tabletops
              </div>
              <div className="text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                ← tutti i giochi
              </div>
            </div>
          </Link>
          <div className="flex-1" />
          <div className="hidden items-center gap-2 sm:flex">
            <span className="font-[family-name:var(--font-display)] text-[#f0e4c8]">{game.title}</span>
            <Badge>{STATUS_LABEL[game.status] ?? game.status}</Badge>
          </div>
          <Link href="/studio" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            <PencilRuler className="size-4" />
            Studio
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <GameNav slug={game.slug} sections={game.sections} />
        </aside>
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
