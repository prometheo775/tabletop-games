import type { Metadata } from 'next';
import './global.css';
import './hub.css';

export const metadata: Metadata = {
  title: 'Tabletops — Hub dei giochi da tavolo',
  description:
    "L'hub dei giochi da tavolo didattici: regole, carte, tabellone e meccaniche di ogni gioco, più lo studio per disegnare e stampare le carte.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
