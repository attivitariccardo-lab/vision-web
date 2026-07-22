# Vision Web

Sito web one-page statico per **Vision Web** — realizzazione di siti web professionali per attività locali (artigiani, ristoranti, negozi, professionisti, piccole aziende).

Titolare: **Riccardo Cavazzina**

## Struttura

```
vision-web/
├── index.html          # pagina unica
├── style.css           # design system (Fraunces + Hanken Grotesk, palette navy + verde)
├── script.js           # menu, animazioni scroll, hero a sequenza di immagini
└── assets/
    ├── logo.png        # logo
    ├── og-image.jpg    # immagine anteprima social (1200×630)
    ├── examples/       # 6 screenshot esempi di siti
    └── frames/         # 30 fotogrammi dell'hero animato allo scroll
```

Nessun database, backend o build step: sono file statici puri.

## Vedere il sito in locale

Serve un piccolo server locale (i file esterni non caricano aprendo l'HTML col doppio click):

```bash
python -m http.server 8000
```

Poi apri <http://localhost:8000>.

## Pubblicazione

Il sito è pubblicato su **Vercel**: <https://vision-web-xi.vercel.app/>

Ogni `git push` sul branch `main` fa ripubblicare il sito automaticamente.

### Se colleghi un dominio personale
Nei meta tag social di `index.html` (`og:url`, `og:image`, `twitter:image`) e nel `link rel="canonical"`
è impostato l'URL Vercel. Se in futuro colleghi un dominio tuo (es. visionweb.it), aggiorna questi URL
col nuovo dominio affinché l'anteprima su WhatsApp/social continui a funzionare.

## Contatti

- WhatsApp: <https://wa.me/393913679150>
- Telefono: 391 367 9150
- Email: attivitariccardo@gmail.com
