# Tabletops Game — monorepo Nx

Piattaforma per progettare giochi da tavolo: gestisce più progetti, ognuno con i suoi
mazzi di carte (Personaggi, Domande/Sapere, Imprevisti, Archivio Storico), anteprima
WYSIWYG su canvas e download dei PNG pronti per la stampa a 300 DPI con abbondanza 3 mm.

Il primo gioco supportato è **«Caccia alla Repubblica»** (storia italiana 1861–1948,
scuola secondaria): ogni nuovo progetto parte con i suoi 5 personaggi già impostati.

## Comandi

```bash
npm install            # prima volta
npx nx dev studio      # sviluppo → http://localhost:3000
npx nx build studio    # build di produzione
```

Nota: se npm mostra `npm error config prefix…` è un avviso innocuo dell'ambiente.

## Architettura

```
apps/
  studio/                 App Next.js (App Router, client-first)
    src/app/              dashboard (/) ed editor (/project/[id])
    src/components/       CardCanvas (drag/resize/snap/tastiera), modali JSON
    src/lib/              store localStorage, caricamento asset, export PNG
    public/assets/        bordo pelle, box pergamena, targhetta, 5 illustrazioni
libs/
  card-engine/            Libreria TS pura, indipendente dal framework
    lib/types.ts          modello dati (Project, mazzi, layout)
    lib/defaults.ts       formati carta, stili Ere, factory createProject()
    lib/paint.ts          primitive canvas (wrap testo con \n, cuciture, raggi…)
    lib/render.ts         i 4 renderer delle carte
    lib/io.ts             parser JSON tolleranti + prompt IA per i 3 mazzi
```

La separazione engine/app permette di riusare i renderer ovunque (export batch
server-side, anteprime, PDF) senza toccare la UI.

## Flusso di lavoro nell'app

1. **Tavolo** (`/`): i progetti sono carte da gioco; creane uno nuovo o aprine uno.
2. **Editor**: 4 tab. Per i mazzi generabili: copia il prompt → incollalo in un'IA con il
   tuo materiale → importa il JSON risultante (anche se avvolto in ``` o testo).
3. Trascina targhetta e box sul canvas (Shift = proporzioni, frecce = fine, calamita al
   centro), rifinisci i testi carta per carta, poi scarica il PNG singolo o l'intero mazzo.
4. Tutto si salva da solo in `localStorage` (nessun backend richiesto).

## Roadmap suggerita

- **Supabase**: auth + tabelle progetti per multi-utente e sync tra dispositivi;
  storage per illustrazioni personalizzate caricate dall'utente.
- Impostazioni formato carta e cuciture esposte nella UI (già nel modello dati).
- Export foglio A4/A3 con crocini di taglio e dorso carte.
- Quinto mazzo «Pietra Miliare» {titolo, anno, racconto, sfida, gettone}.
- Deploy: `npx nx build studio` produce output standalone per Vercel o qualsiasi host Node.
