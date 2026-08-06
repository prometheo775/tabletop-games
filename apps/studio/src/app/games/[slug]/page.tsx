import { notFound } from 'next/navigation';
import { Users, Clock, GraduationCap } from 'lucide-react';
import { getGame } from '../../../lib/games';
import { Markdown } from '../../../components/hub/Markdown';
import { Card, CardContent } from '../../../components/ui/card';

export const dynamic = 'force-dynamic';

export default async function GameOverview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, label: 'Giocatori', value: game.players },
          { icon: Clock, label: 'Durata', value: game.duration },
          { icon: GraduationCap, label: 'Età', value: game.ages },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className="size-5 shrink-0 text-primary" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
                <div className="text-sm text-foreground">{value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <Markdown>{game.body}</Markdown>
        </CardContent>
      </Card>
    </div>
  );
}
