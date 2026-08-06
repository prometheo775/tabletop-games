import { SectionPage } from '../section-page';

export const dynamic = 'force-dynamic';

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return SectionPage({ params, section: 'mechanics' });
}
