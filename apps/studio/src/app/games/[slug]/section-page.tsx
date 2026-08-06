import { notFound } from 'next/navigation';
import { FileJson } from 'lucide-react';
import { getGame, getSectionDocs, getSectionExtras } from '../../../lib/games';
import { Markdown } from '../../../components/hub/Markdown';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

/** Pagina di sezione condivisa: le sezioni sono un insieme fisso (contratto docs/). */
export async function SectionPage({
  params,
  section,
}: {
  params: Promise<{ slug: string }>;
  section: string;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const docs = getSectionDocs(slug, section);
  const extras = getSectionExtras(slug, section);
  const label = game.sections.find((s) => s.id === section)?.label ?? section;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#f0e4c8]">
          {label}
        </h1>
        {extras.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {extras.map((f) => (
              <Badge key={f} variant="outline" className="gap-1 text-muted-foreground">
                <FileJson className="size-3" /> {f}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {docs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Questa sezione è ancora vuota: la si riempie con la skill{' '}
            <em>table-game-master</em>.
          </CardContent>
        </Card>
      ) : (
        docs.map((doc) => (
          <Card key={doc.name} id={doc.name.replace(/\.md$/, '')}>
            <CardContent className="p-6 sm:p-8">
              <Markdown>{doc.content}</Markdown>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
