import Link from 'next/link';
import { Dices, PencilRuler, BookOpen, Users, Clock, GraduationCap } from 'lucide-react';
import { listGames, STATUS_LABEL } from '../lib/games';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { buttonVariants } from '../components/ui/button';
import { Separator } from '../components/ui/separator';

export const dynamic = 'force-dynamic';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  idea: 'outline',
  design: 'secondary',
  playtest: 'default',
  pronto: 'default',
};

export default function HubPage() {
  const games = listGames();

  return (
    <div className="hub-root min-h-screen font-sans text-foreground">
      <header className="border-b border-border bg-[var(--pelle-scuro,#3e2814)]">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-5">
          <Dices className="size-7 text-primary" />
          <div>
            <div className="font-[family-name:var(--font-display)] text-lg uppercase tracking-[0.14em] text-[#e8d6a8]">
              Tabletops
            </div>
            <div className="text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">
              hub dei giochi da tavolo
            </div>
          </div>
          <div className="flex-1" />
          <Link href="/studio" className={buttonVariants({ variant: 'outline' })}>
            <PencilRuler className="size-4" />
            Apri lo Studio carte
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="mb-10">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[#f0e4c8]">
            I giochi del laboratorio
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Ogni gioco vive in una cartella di documenti nel repository: regole, mazzi di
            carte, tabellone, meccaniche e playtest. Questo hub li mostra così come sono
            versionati — la carta è la fonte di verità.
          </p>
        </section>

        {games.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nessun gioco trovato</CardTitle>
              <CardDescription>
                Crea una cartella <code>docs/&lt;nome-gioco&gt;/</code> con un{' '}
                <code>game.md</code> (la skill <em>table-game-master</em> lo fa per te).
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => (
              <Link key={g.slug} href={`/games/${g.slug}`} className="group">
                <Card className="h-full overflow-hidden transition-all group-hover:-translate-y-1 group-hover:border-primary/60 group-hover:shadow-lg">
                  {g.cover && (
                    <div className="h-44 overflow-hidden border-b border-border bg-[#2b241e]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={g.cover}
                        alt={g.title}
                        className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="font-[family-name:var(--font-display)] text-xl text-[#e8d6a8]">
                        {g.title}
                      </CardTitle>
                      <Badge variant={STATUS_VARIANT[g.status] ?? 'outline'}>
                        {STATUS_LABEL[g.status] ?? g.status}
                      </Badge>
                    </div>
                    <CardDescription>{g.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 shrink-0 text-primary/80" />
                      <span>{g.players}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 shrink-0 text-primary/80" />
                      <span>{g.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="size-4 shrink-0 text-primary/80" />
                      <span>{g.ages}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-1.5">
                    {g.sections.map((s) => (
                      <Badge key={s.id} variant="outline" className="text-muted-foreground">
                        {s.label}
                        {s.count > 0 ? ` · ${s.count}` : ''}
                      </Badge>
                    ))}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <Separator className="my-12" />

        <section className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-display)] text-[#e8d6a8]">
                <PencilRuler className="size-5 text-primary" /> Studio carte
              </CardTitle>
              <CardDescription>
                Disegna le carte dei mazzi con anteprima WYSIWYG e scarica i PNG pronti per
                la stampa a 300 DPI con abbondanza 3&nbsp;mm.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/studio" className={buttonVariants({ variant: 'secondary' })}>
                Vai allo Studio →
              </Link>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-display)] text-[#e8d6a8]">
                <BookOpen className="size-5 text-primary" /> Come si aggiunge un gioco
              </CardTitle>
              <CardDescription>
                I giochi si progettano con la skill <em>table-game-master</em>: pipeline per
                nuovo gioco, meccaniche, regole, carte e playtest. Tutto finisce in{' '}
                <code>docs/</code> e appare qui.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Tabletops · giochi da tavolo didattici · i documenti in <code>docs/</code> sono la fonte di verità
      </footer>
    </div>
  );
}
