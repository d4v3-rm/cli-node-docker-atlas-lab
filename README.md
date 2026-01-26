# Lab pseudo-aziendale con Docker Compose

Questo lab espone i servizi tramite un solo gateway HTTPS con subpath per categoria sotto `/lab` (porta default `8443`).

## Avvio rapido

1) Copia e personalizza le variabili:
   - `cp .env.example .env`
   - imposta `PENPOT_SECRET_KEY` con un valore casuale
   - imposta `BOOKSTACK_APP_KEY` (vedi sezione BookStack)
   - imposta `NODE_DEV_PASSWORD` per l'ambiente Node
   - imposta `PYTHON_DEV_PASSWORD` e `AI_DEV_PASSWORD` per gli ambienti Python/AI
   - imposta `CPP_DEV_PASSWORD` per l'ambiente C++
2) Certificati SSL: se mancanti, verranno generati automaticamente (self-signed).
   - Puoi comunque fornire i tuoi file in `nginx/certs` (`fullchain.pem` e `privkey.pem`).
3) Avvia i servizi:
   - `docker compose up -d`

Se vuoi esporre solo HTTPS, puoi rimuovere il mapping di `LAB_HTTP_PORT`.

## URL dei servizi

- Indice: `https://<host>:<port>/lab/`
- Ambienti: `https://<host>:<port>/lab/env/`
- Gitea: `https://<host>:<port>/lab/dev/gitea/`
- Penpot: `https://<host>:<port>/lab/design/penpot/`
- Draw.io: `https://<host>:<port>/lab/design/drawio/`
- MarkText (GUI via browser): `https://<host>:<port>/lab/docs/marktext/`
- BookStack: `https://<host>:<port>/lab/docs/bookstack/`
- Node Dev: `https://<host>:<port>/lab/env/node/`
- Python Dev: `https://<host>:<port>/lab/env/python/`
- AI Lab: `https://<host>:<port>/lab/env/ai/`
- C++ Dev: `https://<host>:<port>/lab/env/cpp/`

## Certificati SSL (self-signed)

Auto-generazione attiva se `SSL_CERT_AUTOGEN=1`. Puoi configurare:
- `SSL_CERT_CN`
- `SSL_CERT_SAN` (es. `DNS:localhost,DNS:lab.local`)
- `SSL_CERT_DAYS`

Per disattivare la generazione automatica, imposta `SSL_CERT_AUTOGEN=0`.

## Note per ambienti cloud/HTTPS

- Aggiorna `LAB_EXTERNAL_URL` con il dominio pubblico (es. `https://lab.example.com`).
- `LAB_EXTERNAL_URL` deve combaciare con il certificato (CN/SAN).
- Se cambi `LAB_HTTPS_PORT`, aggiorna il redirect in `nginx/nginx.conf`.
- Rimuovi `disable-email-verification` e configura un SMTP per scenari reali.

## Database Gitea

Gitea usa MariaDB tramite il servizio `gitea-db`. Le credenziali sono in `.env`.

## BookStack

BookStack richiede `APP_KEY`. Generala con:

```bash
docker run -it --rm --entrypoint /bin/bash lscr.io/linuxserver/bookstack:latest appkey
```

Credenziali di default: `admin@admin.com` / `password` (cambiale al primo accesso).

## Node Dev Environment

Il servizio `node-dev` usa code-server e include Node.js, npm, pnpm e yarn.
Variabili utili in `.env`:

- `NODE_DEV_NODE_VERSION`, `NODE_DEV_PNPM_VERSION`, `NODE_DEV_YARN_VERSION`
- `NODE_DEV_INSTALL_PACKAGES` (pacchetti apt aggiuntivi)
- `NODE_DEV_BASE_IMAGE` (immagine base, consigliata: `coder/code-server`)
- `NODE_DEV_PASSWORD`, `NODE_DEV_AUTH` (autenticazione code-server)
- `NODE_DEV_EXTENSIONS` (lista di estensioni code-server, separata da spazi)
- `NODE_DEV_GLOBAL_PACKAGES` (pacchetti npm globali, separati da spazi)

Se modifichi i parametri di build, esegui:

```bash
docker compose build node-dev
```

Nota: il Dockerfile assume una base compatibile con `ghcr.io/coder/code-server` (entrypoint incluso).
Se hai gia copiato `.env`, aggiorna `*_DEV_BASE_IMAGE` al nuovo valore.

## Python Dev Environment

Il servizio `python-dev` usa code-server con Python via pyenv.
Variabili utili in `.env`:

- `PYTHON_DEV_PYTHON_VERSION`
- `PYTHON_DEV_PIP_PACKAGES` (installati in build)
- `PYTHON_DEV_RUNTIME_PIP_PACKAGES` (installati al primo avvio)
- `PYTHON_DEV_PIP_INDEX_URL`, `PYTHON_DEV_PIP_EXTRA_INDEX_URL`
- `PYTHON_DEV_PASSWORD`, `PYTHON_DEV_AUTH`

Se modifichi i parametri di build, esegui:

```bash
docker compose build python-dev
```

## AI Dev Environment

Il servizio `ai-dev` estende l'ambiente Python con pacchetti AI.
Variabili utili in `.env`:

- `AI_DEV_PIP_PACKAGES` (pacchetti base in build)
- `AI_DEV_RUNTIME_PIP_PACKAGES` (pacchetti extra al primo avvio)
- `AI_DEV_PIP_INDEX_URL`, `AI_DEV_PIP_EXTRA_INDEX_URL`
- `AI_DEV_PASSWORD`, `AI_DEV_AUTH`

Se modifichi i parametri di build, esegui:

```bash
docker compose build ai-dev
```

## C++ Dev Environment

Il servizio `cpp-dev` usa code-server con toolchain C/C++.
Variabili utili in `.env`:

- `CPP_DEV_PACKAGES` (toolchain, cmake, clang, gdb, ecc.)
- `CPP_DEV_INSTALL_PACKAGES` (pacchetti apt aggiuntivi)
- `CPP_DEV_PASSWORD`, `CPP_DEV_AUTH`
- `CPP_DEV_EXTENSIONS`

Se modifichi i parametri di build, esegui:

```bash
docker compose build cpp-dev
```

## Estendere gli ambienti

Per aggiungere nuovi ambienti in `/lab/env`:
- crea una cartella sotto `env/` con Dockerfile e script di avvio
- aggiungi un nuovo servizio in `docker-compose.yml`
- aggiungi la route in `nginx/nginx.conf` e il link in `nginx/html/lab-env-index.html`
