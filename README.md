# Lab Atlas

![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2-2496ED?logo=docker&logoColor=white)
![Gateway](https://img.shields.io/badge/Gateway-Caddy-1F2937?logo=caddy&logoColor=white)
![Ingress](https://img.shields.io/badge/Ingress-HTTPS%20Only-0F766E)
![Routing](https://img.shields.io/badge/Routing-localhost%20multiport-7C3AED)
![Persistence](https://img.shields.io/badge/Persistence-Docker%20Volumes-CA8A04)
![Profiles](https://img.shields.io/badge/Compose-Workbench%20Profile-2563EB)

> Piattaforma self-hosted locale per repository, automazione, AI e workbench browser-based, esposta interamente su `localhost` con porte HTTPS dedicate, senza dipendenza da DNS interno o modifiche al file `hosts`.

---

## Indice

- [Panoramica](#panoramica)
- [Perché questa architettura](#perché-questa-architettura)
- [Catalogo servizi](#catalogo-servizi)
- [Mappa porte e URL](#mappa-porte-e-url)
- [Architettura di rete](#architettura-di-rete)
- [Persistenza e dati](#persistenza-e-dati)
- [Quick start](#quick-start)
- [Accessi e credenziali](#accessi-e-credenziali)
- [Workbench opzionali](#workbench-opzionali)
- [Bootstrap Python](#bootstrap-python)
- [File importanti del repository](#file-importanti-del-repository)
- [Comandi utili](#comandi-utili)
- [Verifiche consigliate](#verifiche-consigliate)
- [Troubleshooting](#troubleshooting)
- [Note di sicurezza](#note-di-sicurezza)
- [Fonti ufficiali](#fonti-ufficiali)

---

## Panoramica

`cli-node-lab` non è una singola applicazione. È un **lab infrastrutturale locale** costruito con Docker Compose che mette insieme:

- `Gitea` per repository Git, issue tracking e review.
- `n8n` per automazione, integrazioni e workflow.
- `Open WebUI` per l’interfaccia conversazionale AI.
- `Ollama` per inference locale e embeddings.
- `code-server` per ambienti di sviluppo browser-based.
- `PostgreSQL` condiviso tra i workbench.
- `Caddy` come unico punto di ingresso HTTPS.

L’obiettivo del progetto è avere un ambiente:

- self-hosted
- locale
- portabile
- interamente HTTPS
- persistente su volumi Docker
- leggibile da browser
- segmentato internamente
- utilizzabile senza DNS interno e senza toccare `hosts`

---

## Perché questa architettura

In una fase precedente il lab usava host dedicati come:

- `gitea.lab.home.arpa`
- `webui.lab.home.arpa`
- `n8n.lab.home.arpa`

Questa strategia funzionava bene a livello di reverse proxy, ma introduceva un vincolo operativo scomodo: per far funzionare davvero quegli URL sul browser locale era necessario:

- avere un DNS interno
- oppure modificare il file `hosts`

Dato che il requisito attuale è **non toccare la macchina host**, il progetto è stato riorganizzato in modo diverso:

- tutto resta su `localhost`
- ogni servizio pubblico usa una **porta HTTPS dedicata**
- il gateway `Caddy` continua a fare da reverse proxy
- il deck HTML resta l’indice operativo del lab
- Open WebUI non viene servito sotto subpath, quindi si evita di reintrodurre i problemi tipici dei frontend moderni dietro prefissi URL

### In pratica

Invece di:

```text
https://webui.lab.home.arpa:8443/
```

ora usi:

```text
https://localhost:8446/
```

Questa è la scelta più pragmatica per:

- ambiente locale
- portabilità
- semplicità operativa
- assenza di dipendenze dal sistema host

---

## Catalogo servizi

### Servizi core

| Servizio | Ruolo | Esposto | Note |
| --- | --- | --- | --- |
| Deck | dashboard del lab | sì | pagina iniziale con card, credenziali e link |
| Gitea | forge Git interno | sì | repo, issue, review |
| n8n | workflow automation | sì | protetto da auth gateway |
| Open WebUI | UI conversazionale AI | sì | collegato a Ollama |
| Ollama | API modelli / embeddings | sì | protetto da auth gateway |

### Workbench opzionali

| Servizio | Ruolo | Esposto | Profilo |
| --- | --- | --- | --- |
| Node Forge | JS / TS / tooling Node | sì | `workbench` |
| Python Grid | backend Python e scripting | sì | `workbench` |
| AI Reactor | AI / data science / notebook | sì | `workbench` |
| C++ Foundry | toolchain C/C++ | sì | `workbench` |
| Postgres Vault | database condiviso | no UI web | `workbench` |

---

## Mappa porte e URL

Tutti gli ingressi pubblici sono su `localhost` e usano HTTPS.

| Servizio | URL |
| --- | --- |
| Deck | `https://localhost:8443/` |
| Gitea | `https://localhost:8444/` |
| n8n | `https://localhost:8445/` |
| Open WebUI | `https://localhost:8446/` |
| Ollama | `https://localhost:8447/` |
| Node Forge | `https://localhost:8450/` |
| Python Grid | `https://localhost:8451/` |
| AI Reactor | `https://localhost:8452/` |
| C++ Foundry | `https://localhost:8453/` |

### Vantaggi di questo layout

- nessuna modifica al file `hosts`
- nessun DNS locale da configurare
- nessun subpath fragile per UI complesse
- bookmark semplici
- debug immediato

---

## Architettura di rete

Il lab non gira tutto sulla stessa rete Docker. La segmentazione è intenzionale.

### Reti Docker

| Rete | Tipo | Scopo |
| --- | --- | --- |
| `edge-net` | esposta | collega il gateway alle porte pubblicate |
| `apps-net` | interna | Gitea, n8n, Open WebUI |
| `ai-net` | interna | Ollama e Open WebUI |
| `data-net` | interna | MariaDB e bootstrap Gitea |
| `workbench-net` | interna | Postgres e workbench |
| `services-egress-net` | egress | uscita internet selettiva per servizi core |
| `workbench-egress-net` | egress | uscita internet selettiva per workbench |

### Principio di esposizione

L’unico container pubblicamente esposto è:

- `gateway`

Tutti gli altri servizi:

- restano su reti Docker interne
- vengono raggiunti dal browser solo tramite Caddy

### Perché è utile

- meno superficie esposta
- topologia più leggibile
- separazione tra traffico applicativo, AI, dati e workbench
- possibilità di controllare egress in modo selettivo

---

## Persistenza e dati

Il progetto è stato ripulito per evitare bind mount dal filesystem del repository.

Tutta la persistenza usa **volumi Docker nominati**.

### Volumi principali

| Volume | Contenuto |
| --- | --- |
| `gateway-certs` | certificati TLS del lab |
| `gateway-config` | config runtime del gateway |
| `gateway-site` | deck HTML, markdown renderizzati, asset |
| `gateway-data` | dati runtime Caddy |
| `gitea-data` | dati Gitea |
| `gitea-db` | dati MariaDB |
| `n8n-data` | dati n8n |
| `ollama-data` | modelli e cache Ollama |
| `open-webui-data` | dati applicativi Open WebUI |
| `postgres-dev-data` | dati PostgreSQL |
| `node-dev-home` / `node-dev-workspace` | home + workspace Node |
| `python-dev-home` / `python-dev-workspace` | home + workspace Python |
| `ai-dev-home` / `ai-dev-workspace` | home + workspace AI |
| `cpp-dev-home` / `cpp-dev-workspace` | home + workspace C++ |

### Implicazioni pratiche

Se ricrei i container:

- il lab mantiene i dati
- Gitea non perde repository e utenti
- n8n conserva i workflow
- Ollama conserva i modelli scaricati
- Open WebUI conserva i dati applicativi
- i workbench non perdono il workspace

Se rimuovi i volumi, azzeri lo stato persistente.

---

## Quick start

### 1. Prerequisiti

Ti servono:

- Docker Desktop con Compose v2
- Python 3 sul nodo host
- accesso a PowerShell o terminale equivalente
- spazio disco sufficiente per immagini, volumi e modelli Ollama

Non ti serve:

- DNS locale
- modifica del file `hosts`
- reverse proxy esterno

### 2. Controlla la configurazione

Il file di configurazione centrale è [`.env`](./.env).

Le sezioni principali sono:

- ingress e URL pubblici
- versioni immagini
- credenziali root
- impostazioni Open WebUI / Ollama
- workbench
- PostgreSQL

### 3. Avvio consigliato

```powershell
python scripts/lab_up.py
```

Questo comando fa due cose:

1. esegue `docker compose up -d`
2. lancia il bootstrap Python idempotente
3. rimuove eventuali residui legacy di init rimasti da versioni precedenti

Il bootstrap Python:

- crea o riallinea l'admin root di Gitea
- verifica la presenza del modello embeddings di Ollama
- scarica il modello se manca

### 4. Avvio manuale alternativo

Se preferisci tenere separati start e bootstrap:

```powershell
docker compose up -d
python scripts/bootstrap_lab.py
```

### 5. Apri il deck

```text
https://localhost:8443/
```

Da lì puoi:

- vedere i servizi attivi
- leggere cosa fa ogni servizio
- consultare le credenziali operative
- aprire i servizi core in una nuova tab
- leggere i briefing Markdown dei workbench
- scaricare il certificato del lab

### 6. Avvia i workbench se servono

```powershell
docker compose --profile workbench up -d
```

Oppure solo alcuni:

```powershell
docker compose --profile workbench up -d postgres-dev node-dev python-dev
```

Se vuoi includere anche i workbench nel flusso con bootstrap:

```powershell
python scripts/lab_up.py --with-workbench
```

---

## Accessi e credenziali

Le credenziali operative vivono in [`.env`](./.env) e sono riportate anche nel deck HTML.

### Gitea

- URL: `https://localhost:8444/`
- accesso: login applicativo
- bootstrap admin: `root`

### n8n

- URL: `https://localhost:8445/`
- primo livello: basic auth gateway
- secondo livello: owner bootstrap dentro n8n

### Open WebUI

- URL: `https://localhost:8446/`
- accesso: login applicativo
- signup: disabilitato
- admin iniziale definito via env

### Ollama

- URL: `https://localhost:8447/`
- accesso: basic auth gateway
- uso principale: API locale per inference e embeddings

### Workbench

Ogni workbench usa:

- `code-server`
- autenticazione `password`
- home persistente
- workspace persistente

Il deck non apre direttamente i workbench: mostra prima il briefing locale.

---

## Workbench opzionali

I workbench non fanno parte del core obbligatorio. Vengono attivati tramite profilo Compose:

```powershell
docker compose --profile workbench up -d
```

### Node Forge

- URL: `https://localhost:8450/`
- orientato a: JavaScript, TypeScript, frontend, tooling Node
- stack: Node, npm, pnpm, yarn

### Python Grid

- URL: `https://localhost:8451/`
- orientato a: backend Python, script, utility, integrazioni

### AI Reactor

- URL: `https://localhost:8452/`
- orientato a: AI, ML, data science, notebook e prototipi

### C++ Foundry

- URL: `https://localhost:8453/`
- orientato a: C/C++, toolchain native, build e debug

### Postgres Vault

- nessuna UI web pubblica
- host interno: `postgres-dev`
- porta interna: `5432`
- database condiviso dai workbench

Le variabili già presenti nei workbench sono:

- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `DATABASE_URL`

---

## Bootstrap Python

Il progetto non usa più servizi Compose di init come `gitea-init` o `ollama-init`.

La scelta è intenzionale:

- niente container `Exited (0)` nel runtime stabile
- niente servizi one-shot lasciati in `docker compose ps`
- niente immagine dedicata di init per Ollama
- bootstrap esplicito, idempotente e leggibile
- cleanup automatico dell'eventuale vecchia immagine `cli-node-lab-ollama-init:latest`

### Script disponibili

| Script | Ruolo |
| --- | --- |
| `python scripts/lab_up.py` | esegue `up -d`, bootstrap e cleanup legacy |
| `python scripts/lab_up.py --build` | fa rebuild + up + bootstrap + cleanup legacy |
| `python scripts/lab_up.py --with-workbench` | avvia anche il profilo workbench e fa bootstrap + cleanup |
| `python scripts/bootstrap_lab.py` | riesegue solo il bootstrap |

### Cosa fa `bootstrap_lab.py`

1. aspetta che `gitea` sia `healthy`
2. crea o aggiorna l'utente admin di Gitea
3. aspetta che `ollama` sia `healthy`
4. controlla il modello embeddings configurato
5. esegue il pull del modello se non è ancora presente

Il bootstrap è idempotente: puoi rilanciarlo in sicurezza.

---

## File importanti del repository

| File | Ruolo |
| --- | --- |
| [docker-compose.yml](./docker-compose.yml) | orchestrazione principale |
| [`.env`](./.env) | naming, URL, versioni e credenziali |
| [gateway/templates/Caddyfile.template](./gateway/templates/Caddyfile.template) | routing localhost multi-porta |
| [gateway/templates/lab-index.html.template](./gateway/templates/lab-index.html.template) | dashboard HTML del lab |
| [gateway/bootstrap-gateway.sh](./gateway/bootstrap-gateway.sh) | rendering template, cert e bootstrap gateway |
| [gateway/templates/content/network-map.md.template](./gateway/templates/content/network-map.md.template) | topologia pubblica del lab |
| [gateway/templates/content/node-dev.md.template](./gateway/templates/content/node-dev.md.template) | briefing Node Forge |
| [gateway/templates/content/python-dev.md.template](./gateway/templates/content/python-dev.md.template) | briefing Python Grid |
| [gateway/templates/content/ai-dev.md.template](./gateway/templates/content/ai-dev.md.template) | briefing AI Reactor |
| [gateway/templates/content/cpp-dev.md.template](./gateway/templates/content/cpp-dev.md.template) | briefing C++ Foundry |
| [gateway/templates/content/postgres-dev.md.template](./gateway/templates/content/postgres-dev.md.template) | briefing Postgres Vault |
| [n8n/Dockerfile](./n8n/Dockerfile) | immagine custom n8n con trust store corretto |
| [n8n-runners/Dockerfile](./n8n-runners/Dockerfile) | immagine custom runners n8n |
| [ollama/Dockerfile](./ollama/Dockerfile) | immagine custom minima Ollama per probe puliti |
| [scripts/bootstrap_lab.py](./scripts/bootstrap_lab.py) | bootstrap host-side di Gitea e Ollama |
| [scripts/lab_up.py](./scripts/lab_up.py) | `up + bootstrap` in un solo comando |

---

## Comandi utili

### Avvio core

```powershell
python scripts/lab_up.py
```

### Avvio completo con workbench

```powershell
python scripts/lab_up.py --with-workbench
```

### Avvio manuale con bootstrap separato

```powershell
docker compose up -d
python scripts/bootstrap_lab.py
```

### Stato

```powershell
docker compose ps -a
```

### Validazione configurazione

```powershell
docker compose config
```

### Log

```powershell
docker compose logs -f
docker compose logs -f gateway
docker compose logs -f open-webui
docker compose logs -f n8n
docker compose logs -f gitea
```

### Rebuild mirato

```powershell
docker compose up -d --build gateway
docker compose up -d --build n8n n8n-runners
docker compose up -d --build ollama open-webui
```

### Stop

```powershell
docker compose down
```

### Stop con workbench

```powershell
docker compose --profile workbench down
```

---

## Verifiche consigliate

### Deck

```powershell
curl.exe -sk https://localhost:8443/ -o NUL -w "%{http_code}"
```

### Gitea

```powershell
curl.exe -sk https://localhost:8444/ -o NUL -w "%{http_code}"
```

### n8n

```powershell
curl.exe -sk https://localhost:8445/ -o NUL -w "%{http_code}"
```

### Open WebUI

```powershell
curl.exe -sk https://localhost:8446/ -o NUL -w "%{http_code}"
```

### Ollama

```powershell
curl.exe -sk https://localhost:8447/api/tags
```

### Stato health

```powershell
docker compose ps -a
```

Atteso:

- `gitea`, `gitea-db`, `n8n`, `n8n-runners`, `ollama`, `open-webui` `healthy`
- nessun servizio di init presente nella stack stabile

---

## Troubleshooting

### Il deck apre ma un servizio non risponde

Controlla:

1. `docker compose ps -a`
2. `docker compose logs -f <servizio>`
3. che la porta del servizio sia corretta

### Il browser mostra warning certificato

Normale: il lab usa un certificato self-signed.

Puoi:

- accettarlo temporaneamente nel browser
- oppure scaricare `/assets/lab.crt` dal deck e importarlo nel trust store locale

### Non vedo l'utente root di Gitea o il modello Ollama

Rilancia il bootstrap:

```powershell
python scripts/bootstrap_lab.py
```

Lo script è idempotente e riallinea:

- admin Gitea
- modello embeddings di Ollama

### I workbench non compaiono in `docker compose up`

Normale: sono dietro profilo.

Usa:

```powershell
docker compose --profile workbench up -d
```

### Open WebUI parte ma non vede i modelli

Controlla:

- `docker compose ps -a`
- `docker compose logs open-webui`
- `docker compose logs ollama`
- la risposta di `https://localhost:8447/api/tags`

### n8n chiede due livelli di credenziali

Normale.

Hai:

- auth del gateway
- auth applicativa dell’owner bootstrap

---

## Note di sicurezza

Questo repository è pensato per:

- uso locale
- laboratorio tecnico
- rete interna controllata

Non è un deployment internet-facing già hardenizzato.

Punti importanti:

- le credenziali sono in [`.env`](./.env)
- il certificato è self-signed
- n8n e Ollama sono protetti da auth gateway
- i servizi non dovrebbero essere pubblicati direttamente su internet senza ulteriori misure

Se vuoi irrigidire ulteriormente il setup:

- sposta i segreti su Docker secrets o file dedicati
- usa una CA interna o certificati trusted
- aggiungi backup formalizzati dei volumi
- riduci ulteriormente la superficie di egress
- introduci monitoraggio e health reporting esterni

---

## Fonti ufficiali

### Docker

- Docker Compose file reference: https://docs.docker.com/compose/compose-file/
- Docker Compose startup order: https://docs.docker.com/compose/how-tos/startup-order/
- Docker Compose profiles: https://docs.docker.com/compose/how-tos/profiles/
- Docker Compose networks: https://docs.docker.com/reference/compose-file/networks/
- Docker Compose volumes: https://docs.docker.com/reference/compose-file/volumes/
- `docker compose config`: https://docs.docker.com/reference/cli/docker/compose/config/

### Caddy

- Caddyfile options: https://caddyserver.com/docs/caddyfile/options
- Automatic HTTPS: https://caddyserver.com/docs/automatic-https
- reverse_proxy: https://caddyserver.com/docs/caddyfile/directives/reverse_proxy
- TLS in Caddy: https://caddyserver.com/docs/caddyfile/directives/tls

### Gitea

- Install with Docker: https://docs.gitea.com/installation/install-with-docker
- Configuration Cheat Sheet: https://docs.gitea.com/administration/config-cheat-sheet

### n8n

- Environment variables overview: https://docs.n8n.io/hosting/configuration/environment-variables/
- Deployment variables: https://docs.n8n.io/hosting/configuration/environment-variables/deployment/
- Configuration methods: https://docs.n8n.io/hosting/configuration/configuration-methods/
- Hardening task runners: https://docs.n8n.io/hosting/securing/hardening-task-runners/
- Set up SSL behind reverse proxy: https://docs.n8n.io/hosting/securing/set-up-ssl/

### Open WebUI

- Environment variables: https://docs.openwebui.com/getting-started/env-configuration

### Ollama

- API reference: https://docs.ollama.com/api
- Embeddings: https://docs.ollama.com/capabilities/embeddings
- Embed API: https://docs.ollama.com/api/embed
- FAQ: https://docs.ollama.com/faq

### code-server

- Overview: https://coder.com/docs/code-server/
- Install: https://coder.com/docs/code-server/install
- FAQ: https://coder.com/docs/code-server/FAQ

---

## In sintesi

Questo progetto ora segue una regola semplice:

- tutto quello che ti serve dal browser sta su `https://localhost`
- ogni servizio ha una porta HTTPS dedicata
- il gateway resta il solo punto esposto
- non devi toccare il file `hosts`
- i workbench restano opzionali

Se vuoi una piattaforma locale self-hosted pulita, leggibile e meno fragile di un setup a subpath o host custom, questa è la direzione corretta.
