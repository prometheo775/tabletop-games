---
name: svg-card-reference
description: >
  Usa questa skill quando devi analizzare documenti storici, immagini di riferimento
  o elementi grafici per generare, modificare o comporre porzioni di codice SVG per le carte del gioco.
  Fornisce linee guida per estrarre stili storici (es. trame, sigilli, cornici)
  e convertirli in SVG puliti e strutturati per il card engine.
---

# SVG Card Reference Skill

Questa skill funge da ponte tra le fonti visive storiche (immagini di documenti originali, stampe d'epoca, sigilli, proclami) e lo sviluppo di asset grafici vettoriali in formato SVG per le carte del gioco "Caccia alla Repubblica".

---

## 📂 Struttura e Collocazione delle Risorse

Le risorse grafiche di riferimento per ciascun gioco non vivono nella cartella della skill, ma direttamente nella cartella documentale di ogni gioco:
- `docs/<slug-gioco>/references/immagini/` — Contiene i file grafici (PNG, JPG, SVG) dei documenti storici reali (es. proclami, costituzioni, cartoline d'epoca).
- La cartella `examples/` all'interno di questa skill contiene invece esempi riutilizzabili di codice SVG (es. sigilli, cornici).

---

## 🎨 Linee Guida per l'Analisi delle Fonti Storiche

Quando analizzi un documento o un'immagine storica situata in `docs/<slug-gioco>/references/immagini/` per ricavarne elementi grafici:

1. **Elementi Chiave da Estrarre**:
   - **Cornici e Bordi**: Linee doppie, angoli arrotondati ornati, motivi floreali o geometrici (stile ottocentesco o Liberty).
   - **Sigilli e Timbri**: Sigilli in ceralacca (rotondi, bordi irregolari, stemma in rilievo), timbri ad inchiostro con scritte concentriche o date d'epoca.
   - **Targhe e Box di Testo**: Cartigli, pergamene arrotolate, targhette metalliche o etichette vintage.
   - **Palette Cromatica Storica**:
     - Carta/Supporto: Seppia, avorio, pergamena ingiallita (`#F4EAD4`, `#DFD0B8`).
     - Inchiostri: Inchiostro ferrogallico (marrone scuro/nero ossidato, `#2B231D`), blu sabaudo (`#003366`), rosso bandiera d'epoca (`#A62626`).
     - Metalli: Oro antico, ottone, bronzo (simulati con gradienti lineari/radiali).

---

## 🛠️ Generazione e Struttura del Codice SVG

Per garantire la massima compatibilità con lo **Studio Carte** e il rendering nell'app Next.js, i frammenti SVG generati devono rispettare i seguenti criteri:

### 📐 Dimensioni e Canvas
I template delle carte lavorano con coordinate pixel fisse:
- **Carte Orizzontali** (es. Archivio Storico, Sapere, Imprevisti): `1122` x `822` pixel.
- **Carte Verticali** (es. Personaggi): `822` x `1122` pixel.
- Ogni pezzo SVG (come sfondi, cornici o icone) deve avere un `viewBox` esplicito e coerente con la porzione di canvas che andrà ad occupare.

### 📝 Standard di Scrittura SVG
- **Pulizia del codice**: Evita metadati proprietari di software di grafica (es. Adobe Illustrator, Inkscape). Rimuovi namespace inutili.
- **Semantica**: Usa elementi geometrici appropriati (`<path>`, `<rect>`, `<circle>`, `<g>`).
- **Gradienti e Colori**: Definisci i gradienti nella sezione `<defs>` con ID parlanti (es. `grad-oro-bordo`). Usa valori HSL o esadecimali coerenti con la palette storica.
- **Responsività**: Imposta `width="100%"` e `height="100%"` per i sotto-elementi se devono adattarsi a un container, ma mantieni sempre il `viewBox` per preservare le proporzioni.

---

## 📋 Esempi di Frammenti SVG Comuni

### 1. Sigillo in Ceralacca Reale / Repubblicano (Esempio)
```xml
<svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradiente tridimensionale per la ceralacca rossa -->
    <radialGradient id="ceralacca" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#D32F2F" />
      <stop offset="70%" stop-color="#B71C1C" />
      <stop offset="100%" stop-color="#5D0808" />
    </radialGradient>
    <!-- Gradiente per l'oro dello stemma interno -->
    <linearGradient id="oro" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082" />
      <stop offset="50%" stop-color="#FFB300" />
      <stop offset="100%" stop-color="#B27A00" />
    </linearGradient>
  </defs>
  <!-- Bordo esterno irregolare del sigillo -->
  <path d="M 50,5 C 65,3 85,12 92,28 C 98,42 93,65 87,80 C 78,95 56,97 40,92 C 22,88 5,78 7,55 C 8,36 28,12 50,5 Z" fill="url(#ceralacca)" filter="drop-shadow(2px 3px 4px rgba(0,0,0,0.4))"/>
  <!-- Cerchio interno pressato -->
  <circle cx="50" cy="50" r="32" fill="#901414" stroke="#7A0F0F" stroke-width="1.5"/>
  <!-- Esempio di stemma interno (stella o corona semplificata) -->
  <path d="M 50,30 L 55,43 L 68,43 L 58,51 L 62,64 L 50,56 L 38,64 L 42,51 L 32,43 L 45,43 Z" fill="url(#oro)" opacity="0.85"/>
</svg>
```

### 2. Angolo Cornice d'Epoca Ottocentesca (Esempio)
```xml
<svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <!-- Linea d'angolo decorata -->
  <path d="M 10,90 L 10,10 L 90,10" fill="none" stroke="#2B231D" stroke-width="3" stroke-linecap="round"/>
  <path d="M 16,84 L 16,16 L 84,16" fill="none" stroke="#2B231D" stroke-width="1" stroke-linecap="round" stroke-dasharray="2,2"/>
  <!-- Rosetta decorativa d'angolo -->
  <circle cx="16" cy="16" r="6" fill="#2B231D"/>
  <circle cx="16" cy="16" r="3" fill="#DFD0B8"/>
</svg>
```

---

## 🔗 Come Usare le Risorse nelle Carte

Una volta generati gli elementi SVG:
1. Salvali nella cartella appropriata del gioco (es. `docs/caccia-alla-repubblica/assets/`).
2. Associali come layer di tipo `"image"` nei file `.template.json` in `cards/templates/`.
3. Ad esempio, per aggiungere una nuova targhetta storica personalizzata:
   ```json
   {
     "id": "targhetta-storica",
     "name": "Targhetta d'Epoca",
     "type": "image",
     "src": "assets/targhetta-storica.svg",
     "rect": { "x": 200, "y": 30, "w": 722, "h": 150 },
     "z": 30,
     "visible": true
   }
   ```
