'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Layers, Map, Cog, FlaskConical, Library, ScrollText } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { SectionInfo } from '../../../lib/games';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  rules: BookOpen,
  cards: Layers,
  board: Map,
  mechanics: Cog,
  playtests: FlaskConical,
  references: Library,
};

export function GameNav({ slug, sections }: { slug: string; sections: SectionInfo[] }) {
  const pathname = usePathname();
  const base = `/games/${slug}`;

  const item = (href: string, label: string, Icon: React.ComponentType<{ className?: string }>, count?: number) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
          active
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1">{label}</span>
        {typeof count === 'number' && count > 0 && (
          <span className={cn('text-xs', active ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>
            {count}
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="sticky top-6 flex flex-col gap-1 lg:min-h-0">
      {item(base, 'Scheda gioco', ScrollText)}
      {sections.map((s) => item(`${base}/${s.id}`, s.label, ICONS[s.id] ?? BookOpen, s.count))}
    </nav>
  );
}
