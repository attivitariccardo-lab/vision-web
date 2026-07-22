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

## Pubblicazione (GitHub Pages)

1. Carica questa cartella su un repository GitHub.
2. Repository → **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main` / cartella `/ (root)`.
3. Dopo qualche minuto il sito è online su `https://<utente>.github.io/<repo>/`.

### Importante dopo la pubblicazione
Nei meta tag social di `index.html` gli URL `og:image` e `og:url` usano `https://visionweb.it/`
come dominio di esempio. **Sostituiscili con l'URL reale** (dominio personale o quello di GitHub
Pages) affinché l'anteprima su WhatsApp/social mostri l'immagine.

## Contatti

- WhatsApp: <https://wa.me/393913679150>
- Telefono: 391 367 9150
- Email: attivitariccardo@gmail.com
