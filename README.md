# Atlas Lab

![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2-2496ED?logo=docker&logoColor=white)
![Gateway](https://img.shields.io/badge/Gateway-Caddy-1F2937?logo=caddy&logoColor=white)
![Ingress](https://img.shields.io/badge/Ingress-HTTPS%20Only-0F766E)
![Routing](https://img.shields.io/badge/Routing-localhost%20multiport-7C3AED)
![CLI](https://img.shields.io/badge/CLI-Node.js%20npm-3C873A?logo=nodedotjs&logoColor=white)
![Persistence](https://img.shields.io/badge/Persistence-Docker%20Volumes-CA8A04)

> Piattaforma self-hosted locale per repository, automazione e layer opzionali AI/workbench, esposta interamente su `localhost` con porte HTTPS dedicate, orchestrata da Docker Compose e governata da una CLI Node.js installabile anche come comando globale.

---

## Indice

- [Panoramica](#panoramica)
- [Perche Questa Architettura](#perche-questa-architettura)
- [Catalogo Servizi](#catalogo-servizi)
- [Mappa Porte E URL](#mappa-porte-e-url)
- [Architettura Di Rete](#architettura-di-rete)
- [Persistenza E Dati](#persistenza-e-dati)
- [Requisiti Host E Dipendenze](#requisiti-host-e-dipendenze)
- [CLI Node.js](#cli-nodejs)
- [Backup E Ripristino](#backup-e-ripristino)
- [Scaffolding Del Repository](#scaffolding-del-repository)
- [Quick Start](#quick-start)
- [Accessi E Credenziali](#accessi-e-credenziali)
- [Workbench Opzionali](#workbench-opzionali)
- [File Importanti Del Repository](#file-importanti-del-repository)
- [Comandi Utili](#comandi-utili)
- [Verifiche Consigliate](#verifiche-consigliate)
- [Troubleshooting](#troubleshooting)
- [Note Di Sicurezza](#note-di-sicurezza)
- [Fonti Ufficiali](#fonti-ufficiali)

---

## Panoramica

`cli-node-docker-atlas-lab` non e una singola applicazione. E un lab infrastrutturale locale che combina:

- un index grafico iniziale del lab, servito dal gateway, da cui aprire servizi, credenziali e asset operativi
- `Gitea` per repository Git, issue tracking e code review
- `n8n` per automazione e workflow
- `Open WebUI` come interfaccia AI opzionale
- `Ollama` per modelli locali ed embeddings con accelerazione GPU NVIDIA, opzionale
- `code-server` per ambienti di sviluppo browser-based
- `PostgreSQL` condiviso per i workbench
- `Caddy` come unico ingresso HTTPS
- `TypeScript CLI` su Node.js come strato operativo locale per start, bootstrap, verifiche e packaging

L'obiettivo e avere una piattaforma:

- self-hosted
- locale
- portabile
- leggibile
- completamente HTTPS
- persistente su volumi Docker
- senza DNS custom
- senza modifiche al file `hosts`

---

## Perche Questa Architettura

Il progetto e passato attraverso tre modelli:

1. subpath dietro reverse proxy
2. host dedicati tipo `*.lab.home.arpa`
3. assetto finale `localhost + porte HTTPS dedicate`

La scelta finale e la piu pragmatica per un lab locale:

- niente DNS interno
- niente modifica del file `hosts`
- niente problemi tipici dei frontend moderni dietro subpath
- URL semplici da ricordare
- reverse proxy unico e leggibile
- comportamento coerente su una macchina singola

In parallelo, il bootstrap non usa piu container Compose di init. Al loro posto c'e una CLI Node.js che:

- avvia la stack
- riallinea Gitea e, quando richiesto, Ollama
- pulisce residui legacy
- puo essere eseguita da sorgente
- puo essere buildata
- puo essere installata globalmente in stile CLI npm

---

## Catalogo Servizi

### Servizi core

| Servizio | Ruolo | Esposto | Note |
| --- | --- | --- | --- |
| Deck | index grafico e dashboard operativa del lab | si | mostra servizi, credenziali e link |
| Gitea | forge Git interno | si | repository, issue, review |
| n8n | automazione e workflow | si | login applicativo diretto |
### Layer AI opzionale

| Servizio | Ruolo | Esposto | Note |
| --- | --- | --- | --- |
| Open WebUI | interfaccia AI | si | disponibile solo con `--with-ai` |
| Ollama | API per modelli locali | si | disponibile solo con `--with-ai` |

### Workbench opzionali

| Servizio | Ruolo | Esposto | Profilo |
| --- | --- | --- | --- |
| Node Forge | sviluppo JS/TS/Node | si | layer `workbench` |
| Python Grid | backend Python e scripting | si | layer `workbench` |
| AI Reactor | AI, notebook, data work | si | layer `workbench` |
| C++ Foundry | toolchain C/C++ | si | layer `workbench` |
| Postgres Vault | database condiviso | no UI web | layer `workbench` |

---

## Mappa Porte E URL

Tutti gli ingressi web pubblici usano HTTPS su `localhost`. `Postgres Vault` espone invece una porta TCP dedicata sul sistema host.

| Servizio | URL |
| --- | --- |
| Deck | `https://localhost:8443/` |
| Gitea | `https://localhost:8444/` |
| n8n | `https://localhost:8445/` |
| Open WebUI | `https://localhost:8446/` solo con layer `ai` |
| Ollama | `https://localhost:8447/` solo con layer `ai` |
| Node Forge | `https://localhost:8450/` solo con layer `workbench` |
| Python Grid | `https://localhost:8451/` solo con layer `workbench` |
| AI Reactor | `https://localhost:8452/` solo con layer `workbench` |
| C++ Foundry | `https://localhost:8453/` solo con layer `workbench` |
| Postgres Vault | `localhost:15432` TCP solo con layer `workbench` |

### Vantaggi pratici

- nessun `hosts`
- nessun DNS interno
- nessun subpath fragile
- debug immediato
- bookmark semplici

---

## Architettura Di Rete

La topologia e segmentata deliberatamente.

| Rete | Tipo | Scopo |
| --- | --- | --- |
| `edge-net` | esposta | collega il gateway alle porte pubblicate |
| `apps-net` | interna | Gitea, n8n, Open WebUI |
| `ai-net` | interna | Ollama e Open WebUI |
| `data-net` | interna | MariaDB e servizi dati |
| `workbench-net` | interna | Postgres e workbench |
| `workbench-host-net` | bridge host | abilita il bind TCP di Postgres su `localhost` |
| `services-egress-net` | egress | uscita selettiva per servizi core |
| `workbench-egress-net` | egress | uscita selettiva per i workbench |

Principio operativo:

- i gateway pubblicano gli ingressi HTTPS su `localhost`
- `postgres-dev` pubblica anche una porta TCP host dedicata per client desktop come DBeaver
- gli altri servizi applicativi restano su reti Docker
- il browser passa sempre da Caddy

---

## Persistenza E Dati

Il progetto non usa bind mount del repository per i dati runtime. La persistenza e su volumi Docker nominati.

| Volume | Contenuto |
| --- | --- |
| `gateway-certs` | certificati TLS del lab |
| `gateway-config` | configurazione runtime del gateway |
| `gateway-site` | bundle statico dell'index React, briefing markdown, config runtime JSON e asset |
| `gateway-data` | dati runtime Caddy |
| `gitea-data` | dati applicativi Gitea |
| `gitea-db` | dati MariaDB |
| `n8n-data` | dati applicativi n8n |
| `ollama-data` | modelli e cache Ollama |
| `open-webui-data` | dati applicativi Open WebUI |
| `postgres-dev-data` | dati PostgreSQL |
| `node-dev-home` / `node-dev-workspace` | home e workspace Node |
| `python-dev-home` / `python-dev-workspace` | home e workspace Python |
| `ai-dev-home` / `ai-dev-workspace` | home e workspace AI |
| `cpp-dev-home` / `cpp-dev-workspace` | home e workspace C++ |

Se ricrei i container:

- i dati restano
- Gitea non perde utenti e repository
- n8n conserva i workflow
- Ollama conserva i modelli
- Open WebUI conserva il proprio stato
- i workbench mantengono home e workspace

Se rimuovi i volumi, azzeri lo stato persistente.

Per esportare o ripristinare lo stato senza tenere il lab acceso puoi usare anche la CLI:

- `save-images` e `restore-images` per le immagini Docker del lab
- `save-volumes` e `restore-volumes` per i volumi Docker del lab

---

## Requisiti Host E Dipendenze

### Requisiti software obbligatori

- `Docker Compose v2`
- GPU `NVIDIA` visibile da `nvidia-smi`
- Docker configurato con supporto GPU NVIDIA verso i container
- `Node.js >= 20`
- `npm`
- un terminale da cui eseguire `docker`, `node`, `npm`

Su Ubuntu o Linux desktop:

- `Docker Desktop` non e il target giusto per la GPU NVIDIA del lab
- usa il contesto Docker nativo `default`
- installa `nvidia-container-toolkit` sul Docker Engine di sistema
- se avvii Atlas Lab dal contesto `default`, nella UI di `Docker Desktop` potresti non vedere nessun container attivo

### Dipendenze CLI reali

La CLI del progetto:

- vive in [package.json](./package.json), [src/bin/atlas-lab.ts](./src/bin/atlas-lab.ts) e [src/app/create-cli-app.ts](./src/app/create-cli-app.ts)
- usa TypeScript con `tsx` in sviluppo e `tsup` per la build distributable
- usa librerie dedicate per parsing, validazione, task rendering e output CLI
- si appoggia in particolare a `commander`, `listr2`, `zod`, `find-up`, `got`, `consola`, `cli-table3` e `p-wait-for`
- richiede `npm install` prima del primo `npm run dev`

### Requisiti host consigliati

- CPU: almeno `4 vCPU`
- RAM: almeno `8 GB`, meglio `12-16 GB` se usi anche workbench e Ollama
- GPU: almeno `8 GB` di VRAM se vuoi eseguire comodamente il profilo AI locale; la configurazione di default e pensata per una scheda come `RTX 3070`
- Disco: almeno `20 GB` liberi

### Porte host richieste

Devono essere libere:

- `8443`
- `8444`
- `8445`
- `8446`
- `8447`
- `8450`
- `8451`
- `8452`
- `8453`
- `15432` solo se avvii il layer `workbench`

Se una di queste porte e occupata, `atlas-lab up` fallira subito durante il preflight host, prima di far partire Docker Compose.

### Cosa non serve sul sistema host

Non servono:

- DNS locale
- modifica del file `hosts`
- reverse proxy esterno
- PostgreSQL installato sul sistema host
- MariaDB installato sul sistema host
- pnpm o yarn installati globalmente

### Nota su PowerShell e npm

Su Windows, in shell PowerShell con execution policy restrittiva, `npm` puo essere bloccato per via dello shim `npm.ps1`.

In quel caso usa:

```powershell
npm.cmd --version
```

Lo stesso vale per il binario globale della CLI:

```powershell
atlas-lab.cmd status
```

### Nota TLS locale

Il lab usa un certificato self-signed per `localhost`.

Quindi:

- il browser puo mostrare un warning al primo accesso
- puoi proseguire temporaneamente
- oppure puoi importare il certificato del lab nel trust store locale

Se usi `Git for Windows` con backend TLS `schannel`, importa il certificato nel trust store utente di Windows dopo averlo scaricato:

```bash
mkdir -p ~/certs
curl -k https://localhost:8443/assets/lab.crt -o ~/certs/atlas-lab.crt
certutil -user -addstore Root "$(cygpath -w "$HOME/certs/atlas-lab.crt")"
```

Questo passaggio serve anche per permettere a `git push` verso `https://localhost:8444/...` di fidarsi del certificato del gateway/Gitea.

---

## CLI TypeScript

La CLI TypeScript sostituisce il vecchio bootstrap Python e i vecchi servizi Compose di init.

### Obiettivi

- niente container `Exited (0)` per bootstrap
- niente immagini di init tenute per errore nel runtime stabile
- flusso coerente tra sviluppo locale e uso operativo
- supporto a build e installazione globale locale

### Modalita supportate

| Modalita | Comando | Scopo |
| --- | --- | --- |
| dev mode | `npm run dev -- up` | usa `tsx` sulla CLI TypeScript sorgente |
| build | `npm run build` | bundle ESM della CLI in `dist/` con `tsup` |
| pack locale | `npm run pack:local` | crea un tarball npm self-contained con gli asset runtime del lab |
| install globale | `npm install -g .` | installa `atlas-lab` globalmente dalla repo con asset inclusi |
| link globale | `npm link` | collega la repo come CLI globale durante lo sviluppo |

### Log di sviluppo

Quando esegui la CLI da sorgente con `npm run dev`, viene creato automaticamente un log file per sessione in `logs/dev/atlas-lab-<timestamp>.log`.

La build distributable e la CLI installata globalmente non scrivono log su filesystem.

### Layout rapido della CLI

- [bin/atlas-lab](./bin/atlas-lab): launcher minimale del pacchetto npm globale
- [src/bin/atlas-lab.ts](./src/bin/atlas-lab.ts): entrypoint TypeScript della CLI
- [src/app/](./src/app): bootstrap dell'app Commander
- [src/commands/](./src/commands): registrazione dei comandi
- [src/config/lab-env.schema.ts](./src/config/lab-env.schema.ts): schema Zod della configurazione `config/env/lab.env`
- [src/config/repository-layout.ts](./src/config/repository-layout.ts): contratto dei path infrastrutturali della repo
- [src/services/](./src/services): logica operativa del lab
- [src/types/](./src/types): tipizzazioni dedicate con suffisso `*.types.ts`
- [src/ui/](./src/ui): banner, pannelli e summary grafici
- [src/utils/](./src/utils): helper HTTP e process execution

---

## Scaffolding Del Repository

La root del repository resta volutamente leggera. Le responsabilita sono separate per dominio:

| Dominio | Scopo | Percorsi principali |
| --- | --- | --- |
| codice applicativo | CLI TypeScript, command layer, servizi e tipizzazioni | `src/`, `bin/` |
| infrastruttura Docker | orchestrazione Compose, Dockerfile e script di immagine | `infra/docker/compose.yml`, `infra/docker/compose.ai.yml`, `infra/docker/compose.workbench.yml`, `infra/docker/images/` |
| configurazione operativa | env del lab, template gateway e briefing locali | `config/env/lab.env`, `config/gateway/templates/` |
| tooling repo | packaging, build e script di supporto | `tools/`, `scripts/`, `package.json` |

Regola pratica:

- se cambi comportamento CLI o logica applicativa, lavori in `src/`
- se cambi build container o orchestrazione, lavori in `infra/docker/`
- se cambi credenziali, porte, template o contenuti gateway, lavori in `config/`

La CLI usa questo layout come contratto esplicito: risolve sempre `infra/docker/compose.yml` come layer `core`, piu gli eventuali `infra/docker/compose.ai.yml` e `infra/docker/compose.workbench.yml`, oltre a `config/env/lab.env`.

### Comandi della CLI

| Comando | Ruolo |
| --- | --- |
| `atlas-lab up` | avvia solo il layer `core` e bootstrappa Gitea/n8n |
| `atlas-lab up --with-ai` | aggiunge il layer AI con Open WebUI e Ollama |
| `atlas-lab up --with-workbench` | aggiunge il layer workbench |
| `atlas-lab up --with-ai --with-workbench` | avvia l'intero lab |
| `atlas-lab bootstrap` | riesegue solo il bootstrap core |
| `atlas-lab bootstrap --with-ai` | riesegue anche il riallineamento modelli Ollama |
| `atlas-lab doctor` | controlla requisiti host e configurazione Compose |
| `atlas-lab doctor --smoke` | aggiunge smoke test sul solo core |
| `atlas-lab doctor --with-ai --smoke` | aggiunge anche smoke test AI |
| `atlas-lab status` | mostra lo stato Compose |
| `atlas-lab down` | ferma la stack |
| `atlas-lab save-images --with-ai --with-workbench` | esporta su disco le immagini richieste dai layer selezionati |
| `atlas-lab restore-images --input <archive.tar.gz>` | ricarica nel daemon Docker un archivio di immagini precedentemente esportato |
| `atlas-lab save-volumes --with-ai --with-workbench` | salva su disco i volumi dei layer selezionati |
| `atlas-lab restore-volumes --input <archive.tar.gz>` | ripristina i volumi Docker da un backup su disco |

### Backup e ripristino

Le immagini e i volumi possono essere gestiti separatamente:

- il backup immagini produce un singolo archivio `.tar.gz` con payload Docker e `manifest.json` interno
- il restore immagini accetta un solo file e ricarica il payload nel daemon Docker
- il backup volumi produce un singolo archivio `.tar.gz` con un payload `.tar` per volume e `manifest.json` interno
- il restore volumi accetta un solo file, ricrea i volumi mancanti e ripristina i contenuti
- durante save e restore la CLI stampa log progressivi per ogni fase e per ogni volume coinvolto

Vincoli operativi:

- per `save-volumes` e `restore-volumes` la stack Atlas Lab deve essere ferma
- i flag `--with-ai` e `--with-workbench` filtrano quali layer includere nel backup
- senza flag aggiuntivi vengono inclusi solo immagini e volumi del layer `core`

Esempi:

```powershell
npm run dev -- save-images --with-ai --with-workbench
npm run dev -- restore-images --input .\backups\images\atlas-lab-images-2026-03-09T12-00-00-000Z.tar.gz
npm run dev -- save-volumes --with-ai --with-workbench
npm run dev -- restore-volumes --input .\backups\volumes\atlas-lab-volumes-2026-03-09T12-00-00-000Z.tar.gz
```

### Cosa fa il bootstrap

1. aspetta che `gitea` sia `healthy`
2. crea o riallinea l'utente root di Gitea
3. aspetta che `n8n` e `gateway` siano raggiungibili
4. crea o riallinea l'owner bootstrap di n8n
5. se il layer AI e attivo, aspetta che `ollama` sia `healthy`
6. se il layer AI e attivo, controlla il modello embeddings configurato
7. se il layer AI e attivo, controlla il modello chat configurato
8. se il layer AI e attivo, esegue il pull dei modelli mancanti
9. rimuove l'eventuale immagine legacy `cli-node-docker-atlas-lab-ollama-init:latest`

Il bootstrap e idempotente.

### Come funziona la global install

La CLI installata globalmente include gia gli asset runtime del lab:

- file Compose
- `config/env/lab.env`
- template gateway
- Dockerfile e script delle immagini custom
- frontend `apps/atlas-dashboard`

Quindi `atlas-lab` puo essere eseguito da qualsiasi directory anche senza checkout del repository.

Ordine di risoluzione degli asset:

- se sei dentro un checkout del lab, usa quel checkout
- se passi `--project-dir`, usa il path esplicito
- altrimenti usa gli asset inclusi nel pacchetto npm installato globalmente

Esempi:

```powershell
atlas-lab status
atlas-lab up --with-workbench
atlas-lab status --project-dir C:\Users\User\Development\repos-review\cli-node-docker-atlas-lab
```

---

## Quick Start

### 1. Verifica il minimo indispensabile

```powershell
docker version
docker compose version
node --version
npm --version
```

Se `npm` e bloccato in PowerShell:

```powershell
npm.cmd --version
```

### 2. Controlla la configurazione

La configurazione centrale e in [`config/env/lab.env`](./config/env/lab.env).

Le sezioni principali sono:

- porte pubbliche
- versioni immagini
- credenziali root
- configurazione Open WebUI / Ollama
- workbench
- PostgreSQL

### 3. Installa le dipendenze della CLI

```powershell
npm install
```

Su PowerShell restrittivo:

```powershell
npm.cmd install
```

### 4. Avvio consigliato in dev mode

```powershell
npm run dev -- up
```

Su PowerShell restrittivo:

```powershell
npm.cmd run dev -- up
```

Questo e il flusso consigliato durante lo sviluppo della CLI e della stack.

### 5. Avvio con layer AI

```powershell
npm run dev -- up --with-ai
```

### 6. Avvio con workbench inclusi

```powershell
npm run dev -- up --with-workbench
```

### 7. Avvio completo con AI e workbench

```powershell
npm run dev -- up --with-ai --with-workbench
```

### 8. Build del pacchetto

```powershell
npm run build
```

La build genera:

- `dist/bin/atlas-lab.js`
- `dist/**/*.d.ts`
- `dist/**/*.js.map`

### 9. Installazione globale locale

```powershell
npm install -g .
```

Poi puoi usare:

```powershell
atlas-lab up
atlas-lab doctor --smoke
atlas-lab status
```

Su PowerShell restrittivo:

```powershell
npm.cmd install -g .
atlas-lab.cmd up
```

### 10. Modalita separata start/bootstrap core

```powershell
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env up -d
npm run dev -- bootstrap
```

### 11. Modalita separata start/bootstrap con AI

```powershell
docker compose --file infra/docker/compose.yml --file infra/docker/compose.ai.yml --env-file config/env/lab.env up -d
npm run dev -- bootstrap --with-ai
```

### 12. Apri l'index grafico del lab

```text
https://localhost:8443/
```

L'index grafico del lab e pubblicato dal gateway sulla porta `8443`.

Dal deck puoi:

- vedere i servizi attivi
- leggere la descrizione di ogni servizio
- consultare le credenziali operative
- aprire i servizi core in una nuova tab
- aprire i briefing markdown dei workbench
- scaricare il certificato del lab

---

## Accessi E Credenziali

Le credenziali operative sono in [`config/env/lab.env`](./config/env/lab.env) e sono riportate anche nell'index grafico React servito dal gateway.

### Index grafico del lab

- URL: `https://localhost:8443/`
- porta host: `8443`
- ruolo: homepage grafica del lab con link rapidi, credenziali operative e accesso ai servizi
- implementazione: app Vite + React + TypeScript in [`apps/atlas-dashboard`](./apps/atlas-dashboard)
- toolchain frontend: script npm al root e config dedicate in `config/atlas-dashboard/` (`package.json`, `config/atlas-dashboard/vite.config.ts`, `config/atlas-dashboard/tsconfig.json`)
- sviluppo locale UI: `npm run dev:atlas-dashboard` serve Atlas Dashboard via Vite e genera localmente `runtime/lab-config.json`, briefing markdown e asset placeholder senza richiedere il gateway
- toggle locali layer opzionali: `ATLAS_DASHBOARD_DEV_AI_ENABLED` e `ATLAS_DASHBOARD_DEV_WORKBENCH_ENABLED` permettono di simulare dashboard con o senza layer opzionali; il default locale li considera attivi per mostrare tutta la UI
- delivery: la build frontend viene prodotta dentro l'immagine gateway e poi pubblicata come bundle statico

### Gitea

- URL: `https://localhost:8444/`
- accesso: login applicativo
- bootstrap admin: `root`

### n8n

- URL: `https://localhost:8445/`
- accesso: login applicativo diretto, senza Basic Auth aggiuntiva al gateway
- owner bootstrap: `root@n8n.local / RootN8NApp!2026`
- owner creato o riallineato automaticamente dal bootstrap della CLI
- il setup wizard iniziale non compare piu perche l'istanza viene preinizializzata
- i template ufficiali restano abilitati dentro l'app dopo il login

### Open WebUI

- URL: `https://localhost:8446/`
- accesso: login applicativo
- disponibile solo quando avvii il layer AI con `--with-ai`
- signup: disabilitato
- admin iniziale definito via env
- usa automaticamente il modello chat configurato in `OLLAMA_CHAT_MODEL`

### Ollama

- URL: `https://localhost:8447/`
- accesso: basic auth gateway
- disponibile solo quando avvii il layer AI con `--with-ai`
- uso principale: API per inference e embeddings
- bootstrap iniziale: `OLLAMA_EMBEDDING_MODEL` + `OLLAMA_CHAT_MODEL`

### Workbench

Ogni workbench usa:

- `code-server`
- autenticazione `password`
- home persistente
- workspace persistente

Il deck non apre direttamente i workbench: mostra prima il briefing locale.

---

## Workbench Opzionali

I workbench non fanno parte del core obbligatorio. Stanno in un layer Compose separato.

### Avvio

```powershell
docker compose --file infra/docker/compose.yml --file infra/docker/compose.workbench.yml --env-file config/env/lab.env up -d
```

Oppure tramite CLI:

```powershell
npm run dev -- up --with-workbench
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
- host desktop: `localhost`
- porta desktop: `15432`
- host interno Docker: `postgres-dev`
- porta interna Docker: `5432`
- database condiviso dai workbench

Variabili preconfigurate nei workbench:

- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `DATABASE_URL`

Per DBeaver o `psql` eseguiti sul sistema host usa:

- host: `localhost`
- porta: `15432`
- database: `lab`
- username: `postgres`
- password: `RootPostgresDev!2026`

---

## File Importanti Del Repository

| File | Ruolo |
| --- | --- |
| [infra/docker/compose.yml](./infra/docker/compose.yml) | orchestrazione del layer core |
| [infra/docker/compose.ai.yml](./infra/docker/compose.ai.yml) | orchestrazione del layer AI opzionale |
| [infra/docker/compose.workbench.yml](./infra/docker/compose.workbench.yml) | orchestrazione del layer workbench opzionale |
| [infra/docker/images/](./infra/docker/images) | Dockerfile e script di build dei servizi |
| [package.json](./package.json) | metadata npm, scripts e comando binario |
| [config/env/lab.env](./config/env/lab.env) | naming, URL, versioni e credenziali operative |
| [bin/atlas-lab](./bin/atlas-lab) | launcher npm minimale che delega alla build |
| [src/bin/atlas-lab.ts](./src/bin/atlas-lab.ts) | entrypoint TypeScript della CLI |
| [src/app/create-cli-app.ts](./src/app/create-cli-app.ts) | bootstrap dell'app Commander |
| [src/commands/](./src/commands) | registrazione dei comandi CLI |
| [src/config/lab-env.schema.ts](./src/config/lab-env.schema.ts) | validazione Zod della `lab.env` |
| [src/config/repository-layout.ts](./src/config/repository-layout.ts) | contratto dei path top-level della repo |
| [src/services/](./src/services) | logica operativa del lab |
| [src/types/](./src/types) | tipizzazioni condivise `*.types.ts` |
| [src/ui/](./src/ui) | output CLI, banner e summary |
| [src/utils/](./src/utils) | helper HTTP e process execution |
| [config/atlas-dashboard/vite.config.ts](./config/atlas-dashboard/vite.config.ts) | configurazione Vite di Atlas Dashboard |
| [config/atlas-dashboard/tsconfig.json](./config/atlas-dashboard/tsconfig.json) | TypeScript config di Atlas Dashboard |
| [config/gateway/templates/Caddyfile.template](./config/gateway/templates/Caddyfile.template) | routing del layer core |
| [config/gateway/templates/Caddyfile.ai.template](./config/gateway/templates/Caddyfile.ai.template) | routing del layer AI |
| [apps/atlas-dashboard/](./apps/atlas-dashboard) | sorgenti di Atlas Dashboard: solo `src`, `public`, `index.html` |
| [config/gateway/templates/runtime/lab-config.json.template](./config/gateway/templates/runtime/lab-config.json.template) | payload runtime generato dal gateway per l'app frontend |
| [infra/docker/images/gateway/bootstrap-gateway.sh](./infra/docker/images/gateway/bootstrap-gateway.sh) | rendering template, cert e bootstrap gateway |
| [config/gateway/templates/content/network-map.md.template](./config/gateway/templates/content/network-map.md.template) | topologia pubblica del lab |
| [config/gateway/templates/content/node-dev.md.template](./config/gateway/templates/content/node-dev.md.template) | briefing Node Forge |
| [config/gateway/templates/content/python-dev.md.template](./config/gateway/templates/content/python-dev.md.template) | briefing Python Grid |
| [config/gateway/templates/content/ai-dev.md.template](./config/gateway/templates/content/ai-dev.md.template) | briefing AI Reactor |
| [config/gateway/templates/content/cpp-dev.md.template](./config/gateway/templates/content/cpp-dev.md.template) | briefing C++ Foundry |
| [config/gateway/templates/content/postgres-dev.md.template](./config/gateway/templates/content/postgres-dev.md.template) | briefing Postgres Vault |
| [infra/docker/images/n8n/Dockerfile](./infra/docker/images/n8n/Dockerfile) | immagine custom n8n con trust store corretto |
| [infra/docker/images/n8n-runners/Dockerfile](./infra/docker/images/n8n-runners/Dockerfile) | immagine custom runners n8n |
| [infra/docker/images/ollama/Dockerfile](./infra/docker/images/ollama/Dockerfile) | immagine custom minima Ollama per probe puliti |

---

## Comandi Utili

### Dev mode

```powershell
npm run dev -- up
npm run dev -- up --with-ai
npm run dev -- up --with-ai --with-workbench
npm run dev -- bootstrap
npm run dev -- bootstrap --with-ai
npm run dev -- doctor --smoke
npm run dev -- doctor --with-ai --smoke
npm run dev -- status
npm run dev -- save-images --with-ai --with-workbench
npm run dev -- save-volumes --with-ai --with-workbench
npm run dev -- restore-images --input .\backups\images\atlas-lab-images.tar.gz
npm run dev -- restore-volumes --input .\backups\volumes\atlas-lab-volumes.tar.gz
```

### Build e packaging

```powershell
npm run build
npm run pack:local
```

### Installazione globale locale

```powershell
npm install -g .
atlas-lab up
atlas-lab up --with-ai
atlas-lab status
atlas-lab doctor --smoke
atlas-lab doctor --with-ai --smoke
atlas-lab save-images --with-ai --with-workbench
atlas-lab save-volumes --with-ai --with-workbench
```

### Installazione dal tarball self-contained

```powershell
npm run pack:local
npm install -g .\cli-node-docker-atlas-lab-1.0.0.tgz
cd $HOME\Downloads
atlas-lab status
atlas-lab up
```

### Link globale per sviluppo

```powershell
npm link
atlas-lab status
```

### Docker Compose diretto

```powershell
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env ps -a
docker compose --file infra/docker/compose.yml --file infra/docker/compose.ai.yml --env-file config/env/lab.env ps -a
docker compose --file infra/docker/compose.yml --file infra/docker/compose.workbench.yml --env-file config/env/lab.env ps -a
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env config
docker compose --file infra/docker/compose.yml --file infra/docker/compose.ai.yml --env-file config/env/lab.env logs -f open-webui
docker compose --file infra/docker/compose.yml --file infra/docker/compose.ai.yml --env-file config/env/lab.env logs -f ollama
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env logs -f n8n
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env logs -f gitea
```

### Stop

```powershell
atlas-lab down
```

### Stop completo dei layer opzionali

```powershell
docker compose --file infra/docker/compose.yml --file infra/docker/compose.ai.yml --file infra/docker/compose.workbench.yml --env-file config/env/lab.env down
```

---

## Verifiche Consigliate

### Check rapido via CLI

```powershell
npm run dev -- doctor
npm run dev -- doctor --smoke
npm run dev -- doctor --with-ai --smoke
```

### Endpoint deck

```powershell
curl.exe -sk https://localhost:8443/ -o NUL -w "%{http_code}"
```

### Endpoint Gitea

```powershell
curl.exe -sk https://localhost:8444/ -o NUL -w "%{http_code}"
```

### Endpoint n8n

```powershell
curl.exe -sk https://localhost:8445/ -o NUL -w "%{http_code}"
```

### Endpoint Open WebUI

```powershell
curl.exe -sk https://localhost:8446/ -o NUL -w "%{http_code}"
```

### Endpoint Ollama

```powershell
curl.exe -sk -u root:RootOllama!2026 https://localhost:8447/api/tags
```

### Stato health

```powershell
atlas-lab status
```

Atteso:

- `gitea`, `gitea-db`, `n8n`, `n8n-runners` in salute nel core
- `ollama`, `open-webui` in salute solo se hai avviato `--with-ai`
- nessun servizio di init presente

---

## Troubleshooting

### Il deck apre ma un servizio non risponde

Controlla:

1. `atlas-lab status`
2. `docker compose --file infra/docker/compose.yml --file infra/docker/compose.ai.yml --file infra/docker/compose.workbench.yml --env-file config/env/lab.env logs -f <servizio>`
3. che la porta del servizio sia libera e corretta

### Il browser mostra warning certificato

Normale: il lab usa un certificato self-signed.

Puoi:

- accettarlo temporaneamente
- oppure scaricare `/assets/lab.crt` dal deck e importarlo nel trust store locale

### `git push` verso Gitea fallisce con `schannel: SEC_E_UNTRUSTED_ROOT`

Git for Windows usa `schannel`, quindi si appoggia al trust store di Windows.

Importa il certificato del lab:

```bash
mkdir -p ~/certs
curl -k https://localhost:8443/assets/lab.crt -o ~/certs/atlas-lab.crt
certutil -user -addstore Root "$(cygpath -w "$HOME/certs/atlas-lab.crt")"
```

Poi chiudi e riapri il terminale e riprova:

```bash
git push -u origin main
```

### Non vedo l'utente root di Gitea o il modello Ollama

Rilancia il bootstrap:

```powershell
npm run dev -- bootstrap
```

Oppure con CLI globale:

```powershell
atlas-lab bootstrap
```

Se devi riallineare anche Ollama, usa invece:

```powershell
npm run dev -- bootstrap --with-ai
atlas-lab bootstrap --with-ai
```

### `npm` non funziona in PowerShell

Usa gli shim `.cmd`:

```powershell
npm.cmd run dev -- doctor
atlas-lab.cmd status
```

### `atlas-lab up` fallisce sul preflight porte

La CLI controlla prima le porte pubbliche del gateway e dei workbench.

Se vedi un errore tipo `Host port preflight failed`, significa che una o piu porte tra `8443-8453` oppure `15432` sono gia occupate o riservate da Windows per un altro processo o da un'altra stack locale.

Controlla:

```powershell
atlas-lab status
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

Poi libera le porte in uno di questi modi:

- ferma la stack Atlas Lab gia presente con `atlas-lab down`
- ferma l'altra stack Docker che pubblica le stesse porte
- cambia le porte in `config/env/lab.env`

### `atlas-lab up` fallisce sul preflight GPU NVIDIA

Il preflight GPU NVIDIA viene eseguito solo se avvii il layer AI con `--with-ai`.

Se vedi un errore che parla di `NVIDIA GPU` o un messaggio Docker simile a `could not select device driver "" with capabilities: [[gpu]]`, il problema non e Ollama ma il pass-through GPU del daemon Docker.

Controlla:

```powershell
nvidia-smi -L
docker info | findstr /i gpu
```

Su Linux devi avere i driver NVIDIA funzionanti e Docker configurato per esporre la GPU ai container. Su Docker Desktop devi anche abilitare il supporto GPU lato daemon.

Se sei su Ubuntu/Linux e stai usando `Docker Desktop`, la strada corretta e diversa:

1. passa al Docker Engine nativo

```bash
docker context use default
```

2. installa `nvidia-container-toolkit`

```bash
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey \
  | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list \
  | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' \
  | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

3. verifica che Docker veda davvero la GPU

```bash
docker context use default
docker run --rm --gpus all nvidia/cuda:12.8.1-base-ubuntu24.04 nvidia-smi
```

4. poi rilancia Atlas Lab con il layer AI

```bash
docker context use default
npm run dev -- up --with-ai
```

Se continui a usare il contesto `desktop-linux`, Atlas Lab restera bloccato sul preflight GPU anche se `nvidia-smi` sul host funziona.

### Docker Desktop non mostra i container Atlas Lab

Su Ubuntu/Linux e normale se Atlas Lab sta girando sul Docker Engine nativo.

`Docker Desktop` e il contesto `desktop-linux` usano un daemon separato da `default`:

- `default` punta tipicamente a `unix:///var/run/docker.sock`
- `desktop-linux` punta al daemon interno di `Docker Desktop`

Quindi puoi avere la stack attiva ma non vedere nulla nella UI di `Docker Desktop`.

Controlla:

```bash
docker context show
docker ps
docker --context desktop-linux ps
```

Se `docker context show` restituisce `default`, Atlas Lab sta girando sul daemon di sistema ed e quello giusto per la GPU NVIDIA.

Per lavorare sempre sul daemon corretto:

```bash
docker context use default
```

### I workbench non compaiono in `docker compose up`

Normale: stanno in un file Compose separato.

Usa:

```powershell
docker compose --file infra/docker/compose.yml --file infra/docker/compose.workbench.yml --env-file config/env/lab.env up -d
```

Oppure:

```powershell
npm run dev -- up --with-workbench
```

### Open WebUI parte ma non vede i modelli

Controlla:

- `atlas-lab status`
- che tu abbia avviato il layer AI con `npm run dev -- up --with-ai`
- `docker compose --file infra/docker/compose.yml --file infra/docker/compose.ai.yml --env-file config/env/lab.env logs open-webui`
- `docker compose --file infra/docker/compose.yml --file infra/docker/compose.ai.yml --env-file config/env/lab.env logs ollama`
- la risposta di `https://localhost:8447/api/tags`
- che `OLLAMA_CHAT_MODEL` e `OLLAMA_EMBEDDING_MODEL` siano valorizzati in `config/env/lab.env`
- `npm run dev -- doctor --with-ai --smoke`

Se hai cambiato i modelli configurati, riesegui:

```powershell
npm run dev -- bootstrap --with-ai --skip-gitea
```

### n8n continua a chiedere accesso o sembra respingere il login

Controlla:

- `curl.exe -sk https://localhost:8445/ -o NUL -w "%{http_code}"` deve restituire `200`
- usa l'owner bootstrap `root@n8n.local / RootN8NApp!2026`
- se hai dati persistenti da tentativi precedenti, verifica lo stato utente in `n8n-data`

### n8n non mostra il wizard iniziale o gli esempi al primo avvio

Nel layout attuale e normale:

- la CLI bootstrap crea o riallinea automaticamente l'owner di n8n
- quindi il setup wizard iniziale viene saltato
- i template ufficiali sono comunque abilitati e visibili dopo il login applicativo
- su istanze con volume `n8n-data` gia esistente non avrai mai un vero first run stock

---

## Note Di Sicurezza

Questo repository e pensato per:

- uso locale
- laboratorio tecnico
- rete interna controllata

Non e un deployment internet-facing gia hardenizzato.

Punti importanti:

- credenziali locali presenti in `config/env/lab.env`
- certificato TLS self-signed
- servizi AI e automazione pensati per ambiente fidato
- gateway come singolo punto di esposizione

Se vuoi irrigidire ulteriormente il lab, i passi sensati sono:

- secret management esterno
- certificati firmati da una CA interna
- segmentazione ancora piu stretta
- backup esplicito dei volumi
- audit dei log e delle credenziali di default

---

## Fonti Ufficiali

### Docker

- Compose startup order: https://docs.docker.com/compose/how-tos/startup-order/
- Compose profiles: https://docs.docker.com/compose/how-tos/profiles/
- Compose networks: https://docs.docker.com/reference/compose-file/networks/
- Docker networking drivers: https://docs.docker.com/engine/network/drivers/

### Caddy

- Caddyfile concepts: https://caddyserver.com/docs/caddyfile
- Global options: https://caddyserver.com/docs/caddyfile/options
- Reverse proxy: https://caddyserver.com/docs/caddyfile/directives/reverse_proxy

### Gitea

- Installation with Docker: https://docs.gitea.com/installation/install-with-docker
- Command line admin: https://docs.gitea.com/administration/command-line

### n8n

- Environment variables overview: https://docs.n8n.io/hosting/configuration/environment-variables/
- Deployment variables: https://docs.n8n.io/hosting/configuration/environment-variables/deployment/
- Configuration methods: https://docs.n8n.io/hosting/configuration/configuration-methods/
- Hardening task runners: https://docs.n8n.io/hosting/securing/hardening-task-runners/
- SSL behind reverse proxy: https://docs.n8n.io/hosting/securing/set-up-ssl/

### Open WebUI

- Environment configuration: https://docs.openwebui.com/getting-started/env-configuration/
- Reverse proxy notes: https://docs.openwebui.com/tutorials/integrations/unraid

### Ollama

- FAQ and networking: https://docs.ollama.com/faq
- API reference: https://github.com/ollama/ollama/blob/main/docs/api.md

### code-server

- Official docs: https://coder.com/docs/code-server/latest

### npm e Node.js CLI

- package.json scripts: https://docs.npmjs.com/cli/v11/configuring-npm/package-json
- npm link: https://docs.npmjs.com/cli/v11/commands/npm-link
- npm pack: https://docs.npmjs.com/cli/v11/commands/npm-pack
- Node.js child_process: https://nodejs.org/api/child_process.html
- Node.js util.parseArgs: https://nodejs.org/api/util.html#utilparseargsconfig

---

In una frase: questo progetto e un lab locale self-hosted con un layer core sempre attivo, layer AI e workbench opzionali, e una CLI Node.js che consente sviluppo diretto, bootstrap selettivo e packaging in stile npm.
