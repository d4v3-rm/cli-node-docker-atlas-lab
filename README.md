# 🧭 Lab Atlas

![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2-2496ED?logo=docker&logoColor=white)
![HTTPS Only](https://img.shields.io/badge/Ingress-HTTPS%20Only-0F766E)
![Caddy](https://img.shields.io/badge/Gateway-Caddy-1F2937?logo=caddy&logoColor=white)
![Host Based Routing](https://img.shields.io/badge/Routing-Host--Based-7C3AED)
![Self Hosted](https://img.shields.io/badge/Mode-Self--Hosted-CA8A04)
![Profiles](https://img.shields.io/badge/Compose-Workbench%20Profile-2563EB)

> Una piattaforma self-hosted locale per codice, automazione, AI e ambienti di sviluppo browser-based, esposta tramite un unico gateway HTTPS ma organizzata con host dedicati, reti interne separate e persistenza solo su volumi Docker.

---

## ✨ Cos'è questo progetto

`cli-node-lab` non è una singola applicazione web: è un **laboratorio infrastrutturale self-hosted** costruito con Docker Compose.

Il progetto accende un insieme coerente di servizi:

- **Gitea** per repository Git, issue tracking e review.
- **n8n** per workflow, integrazioni e automazione.
- **Open WebUI** come interfaccia conversazionale per AI locale.
- **Ollama** come motore di inference e embeddings.
- **code-server** per workbench `Node`, `Python`, `AI` e `C++`.
- **PostgreSQL** condiviso tra i workbench di sviluppo.
- **Caddy** come gateway HTTPS unico, con deck HTML locale e reverse proxy host-based.

L'obiettivo è avere un ambiente:

- **portabile**
- **self-hosted**
- **segmentato internamente**
- **semplice da avviare**
- **navigabile da browser**
- **senza bind mount sul filesystem del progetto**

Tutta la persistenza è demandata a **volumi Docker nominati**.

---

## 🧩 Concetti chiave

### 1. Dashboard locale

Il punto di ingresso umano è:

- `https://localhost:8443/`

Questa pagina è il **deck HTML del lab**:

- mostra i servizi disponibili
- espone ruolo e finalità di ogni servizio
- mostra le credenziali operative definite nel lab
- apre i servizi core in **una nuova tab**
- apre briefing Markdown locali per i workbench, invece di esporre link diretti nel deck

### 2. Routing host-based

Ogni servizio non vive sotto subpath tipo `/lab/...`, ma sotto un **host dedicato**:

- `gitea.lab.home.arpa`
- `n8n.lab.home.arpa`
- `webui.lab.home.arpa`
- `ollama.lab.home.arpa`
- `node.lab.home.arpa`
- `python.lab.home.arpa`
- `ai.lab.home.arpa`
- `cpp.lab.home.arpa`

Questa scelta evita i problemi classici dei frontend moderni serviti sotto subpath, in particolare con UI complesse come Open WebUI.

### 3. HTTPS only

Il gateway pubblica solo:

- `443` interno nel container
- `${LAB_HTTPS_PORT}` sul nodo host, attualmente `8443`

Non esiste una porta HTTP pubblica separata per il lab.

### 4. DNS locale o file hosts

Per aprire gli host dedicati dal browser, il tuo sistema operativo deve saper risolvere i nomi `*.lab.home.arpa`.

Se non hai un DNS interno, devi usare:

- il file `hosts`
- oppure gli script PowerShell inclusi nel repo

Se mancano queste entry, vedrai errori come:

- `DNS_PROBE_FINISHED_NXDOMAIN`

### 5. Profili Compose

I servizi core partono con:

```powershell
docker compose up -d
```

I workbench partono solo col profilo dedicato:

```powershell
docker compose --profile workbench up -d
```

Questa divisione tiene il core sempre disponibile, senza imporre l'avvio degli ambienti di sviluppo quando non servono.

---

## 🏗️ Architettura ad alto livello

```text
Browser
  |
  v
Caddy Gateway (HTTPS only, host-based routing)
  |----> Gitea
  |----> n8n
  |----> Open WebUI
  |----> Ollama
  |----> Node workbench
  |----> Python workbench
  |----> AI workbench
  |----> C++ workbench
  |
  \----> deck HTML + briefing Markdown + certificato lab
```

### Segmentazione di rete

Il lab non usa una rete Docker unica. Le reti sono separate per funzione:

| Rete | Tipo | Scopo |
| --- | --- | --- |
| `edge-net` | esposta | collega il gateway alla porta pubblica del nodo |
| `apps-net` | `internal` | Gitea, n8n, Open WebUI |
| `ai-net` | `internal` | Ollama, Open WebUI, init AI |
| `data-net` | `internal` | MariaDB/Gitea e bootstrap correlato |
| `workbench-net` | `internal` | Postgres e workbench code-server |
| `services-egress-net` | egress | uscita internet selettiva per i servizi core |
| `workbench-egress-net` | egress | uscita internet selettiva per i workbench |

### Perché `home.arpa`

Gli host del lab usano il suffisso `home.arpa`, che è uno **special-use domain** standardizzato per scenari locali/home network. Questo riduce il rischio di collisioni con domini pubblici reali.

---

## 📦 Catalogo servizi

## 🛡️ Core sempre attivi

| Servizio | URL | Funzione | Accesso |
| --- | --- | --- | --- |
| Deck | `https://localhost:8443/` | dashboard locale del lab | libero |
| Gitea | `https://gitea.lab.home.arpa:8443/` | Git forge, issue, review | login applicativo |
| n8n | `https://n8n.lab.home.arpa:8443/` | workflow automation | basic auth gateway + owner app |
| Open WebUI | `https://webui.lab.home.arpa:8443/` | UI AI locale | login applicativo |
| Ollama | `https://ollama.lab.home.arpa:8443/` | API modelli / embeddings | basic auth gateway |

## 🧪 Workbench opzionali

Questi servizi sono sotto profilo `workbench`:

| Servizio | URL | Funzione |
| --- | --- | --- |
| Node Forge | `https://node.lab.home.arpa:8443/` | JavaScript, TypeScript, tooling Node |
| Python Grid | `https://python.lab.home.arpa:8443/` | backend Python, script, tooling |
| AI Reactor | `https://ai.lab.home.arpa:8443/` | AI, data science, notebooks |
| C++ Foundry | `https://cpp.lab.home.arpa:8443/` | toolchain C/C++, build e debug |
| Postgres Vault | non esposto sul gateway | database condiviso tra workbench |

---

## 🔐 Modello di autenticazione

Il lab usa più livelli di accesso, volutamente semplici per uso locale.

### Gitea

- autenticazione applicativa
- utente root bootstrap creato/aggiornato da `gitea-init`

### n8n

- **primo livello:** basic auth sul gateway
- **secondo livello:** owner bootstrap dentro n8n

### Open WebUI

- autenticazione applicativa interna
- signup disabilitato
- admin iniziale definito via env

### Ollama

- non ha UI pubblica del lab
- è esposto come API dietro basic auth del gateway

### Workbench code-server

- autenticazione `password`
- accesso operativo tramite host dedicato
- nel deck non c'è un redirect diretto: c'è un briefing Markdown locale

> Le credenziali operative correnti sono definite in [`.env`](./.env) e vengono anche visualizzate nel deck HTML.

---

## 🗂️ Struttura del repository

```text
.
├─ docker-compose.yml
├─ .env
├─ README.md
├─ gateway/
│  ├─ Dockerfile
│  ├─ start-gateway.sh
│  ├─ bootstrap-gateway.sh
│  └─ templates/
│     ├─ Caddyfile.template
│     ├─ lab-index.html.template
│     └─ content/
│        ├─ network-map.md.template
│        ├─ node-dev.md.template
│        ├─ python-dev.md.template
│        ├─ ai-dev.md.template
│        ├─ cpp-dev.md.template
│        └─ postgres-dev.md.template
├─ n8n/
│  └─ Dockerfile
├─ n8n-runners/
│  └─ Dockerfile
├─ ollama/
│  └─ Dockerfile
├─ env/
│  ├─ node/
│  ├─ python/
│  └─ cpp/
└─ scripts/
   ├─ install-lab-hosts.ps1
   └─ remove-lab-hosts.ps1
```

---

## 🚀 Quick Start

### 1. Prerequisiti

Ti servono almeno:

- Docker Desktop con Compose v2
- PowerShell
- privilegi amministrativi **solo** se vuoi scrivere il file `hosts` con lo script incluso

### 2. Controlla `.env`

Il file [`.env`](./.env) è già organizzato per sezioni:

- gateway e naming
- versioni immagini
- host pubblici
- credenziali root
- workbench
- PostgreSQL

Per un uso locale puoi avviare direttamente il lab. Se vuoi cambiare host, porte, password o versioni, questo è il punto corretto.

### 3. Installa la mappa host locale

### Windows

Apri PowerShell **come amministratore**:

```powershell
cd <path-del-repo>
.\scripts\install-lab-hosts.ps1
```

Lo script scrive nel file `hosts` le entry:

```text
127.0.0.1 lab.home.arpa
127.0.0.1 gitea.lab.home.arpa
127.0.0.1 n8n.lab.home.arpa
127.0.0.1 webui.lab.home.arpa
127.0.0.1 ollama.lab.home.arpa
127.0.0.1 node.lab.home.arpa
127.0.0.1 python.lab.home.arpa
127.0.0.1 ai.lab.home.arpa
127.0.0.1 cpp.lab.home.arpa
```

Per rimuoverle:

```powershell
.\scripts\remove-lab-hosts.ps1
```

### Linux / macOS

Aggiungi manualmente nel tuo `hosts`:

```text
127.0.0.1 lab.home.arpa gitea.lab.home.arpa n8n.lab.home.arpa webui.lab.home.arpa ollama.lab.home.arpa node.lab.home.arpa python.lab.home.arpa ai.lab.home.arpa cpp.lab.home.arpa
```

### 4. Avvia il core

```powershell
docker compose up -d
```

### 5. Apri la dashboard

```text
https://localhost:8443/
```

Da qui puoi:

- vedere tutti i servizi attivi
- aprire i servizi core in una nuova tab
- leggere i briefing dei workbench
- scaricare il certificato self-signed del lab

### 6. Avvia i workbench se servono

```powershell
docker compose --profile workbench up -d
```

Oppure solo alcuni:

```powershell
docker compose --profile workbench up -d postgres-dev node-dev python-dev
```

---

## 🪪 Hostname, DNS e problema `NXDOMAIN`

Se apri:

```text
https://webui.lab.home.arpa:8443/
```

e il browser risponde con:

- `DNS_PROBE_FINISHED_NXDOMAIN`

il problema non è il container `open-webui`: è il tuo sistema operativo che **non risolve l'hostname**.

### Come diagnosticarlo

Su Windows:

```powershell
Resolve-DnsName webui.lab.home.arpa
```

Se fallisce, devi:

- configurare un DNS locale
- oppure usare il file `hosts`

### Perché il deck locale funziona comunque

`https://localhost:8443/` funziona perché `localhost` viene già risolto dal sistema.

Gli altri host del lab sono invece nomi custom, quindi senza DNS/hosts non possono funzionare.

---

## 🔒 HTTPS e certificati

Il gateway genera e usa un certificato **self-signed SAN** che copre gli host del lab.

### Dove viene tenuto

Non nel filesystem del progetto, ma nel volume Docker:

- `gateway-certs`

### Cosa significa in pratica

- il browser può segnalare certificato non trusted finché non importi il certificato
- il deck permette di scaricare il certificato da `/assets/lab.crt`
- il lab resta comunque interamente sotto HTTPS

### Filosofia adottata

Per un lab locale:

- HTTPS obbligatorio
- certificato self-signed controllato localmente
- niente dipendenza da ACME/Let's Encrypt

---

## 🧠 Servizi nel dettaglio

<details>
<summary><strong>🧭 Gateway / Caddy</strong></summary>

Il gateway:

- è l'unico container con porta pubblicata
- serve il deck HTML locale
- serve i briefing Markdown
- serve il certificato scaricabile
- reverse-proxia tutti i servizi applicativi sui rispettivi host

File chiave:

- [gateway/Dockerfile](./gateway/Dockerfile)
- [gateway/start-gateway.sh](./gateway/start-gateway.sh)
- [gateway/bootstrap-gateway.sh](./gateway/bootstrap-gateway.sh)
- [gateway/templates/Caddyfile.template](./gateway/templates/Caddyfile.template)
- [gateway/templates/lab-index.html.template](./gateway/templates/lab-index.html.template)

Scelte rilevanti:

- `auto_https disable_redirects` per restare `https-only` senza listener HTTP accessorio
- `protocols h1 h2` per evitare rumore HTTP/3 inutile in questo contesto
- certificati caricati manualmente

</details>

<details>
<summary><strong>🌿 Gitea + MariaDB + gitea-init</strong></summary>

Gitea è il forge Git del lab.

Ruoli:

- `gitea`: applicazione web
- `gitea-db`: MariaDB
- `gitea-init`: job one-shot che crea o riallinea l'admin root

Dettagli operativi:

- SSH Git integrato disabilitato
- registrazione pubblica disabilitata
- visualizzazione richiede signin
- cookie secure attivo
- persistenza in volumi Docker

`gitea-init` in `Exited (0)` è **normale**: non è un servizio long-running, è un bootstrap job.

</details>

<details>
<summary><strong>⚙️ n8n + external runners</strong></summary>

n8n viene esposto dietro reverse proxy HTTPS, con:

- base URL coerente
- cookie sicuri
- basic auth gateway
- runner esterni separati
- telemetria, template e notification disabilitati

Il sidecar `n8n-runners` serve a far girare i task runner in modo separato dal processo principale.

Questo allineamento è utile perché:

- riduce il coupling del processo n8n
- separa il runtime dei Code node / task
- rende la topologia più chiara

Le immagini custom di `n8n` e `n8n-runners` esistono per sistemare il trust store TLS e mantenere funzionanti le richieste HTTPS outbound.

</details>

<details>
<summary><strong>🤖 Open WebUI + Ollama</strong></summary>

Open WebUI è configurato per parlare solo con Ollama:

- `ENABLE_OPENAI_API=false`
- `ENABLE_OLLAMA_API=true`

In più:

- embeddings locali via Ollama
- modello embeddings bootstrapato con `ollama-init`
- niente download runtime da Hugging Face per il percorso embeddings configurato

Ollama è protetto da basic auth gateway e resta il backend AI del lab.

Modello embeddings attuale:

- `${OLLAMA_EMBEDDING_MODEL}` nella configurazione
- attualmente `nomic-embed-text`

</details>

<details>
<summary><strong>💻 Workbench code-server</strong></summary>

I workbench sono pensati come ambienti browser-based persistenti:

- `Node Forge`
- `Python Grid`
- `AI Reactor`
- `C++ Foundry`

Ogni workbench usa:

- `code-server`
- password dedicata
- workspace persistente su volume
- home persistente su volume

I workbench non sono lanciati di default. Questo è intenzionale.

</details>

<details>
<summary><strong>🗄️ Postgres Vault</strong></summary>

`postgres-dev` non è esposto sul gateway e non ha UI web.

Serve esclusivamente come database condiviso tra i workbench.

Ogni workbench riceve già:

- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `DATABASE_URL`

Quindi il database è immediatamente utilizzabile da CLI, ORM, script e toolchain interne.

</details>

---

## 💾 Persistenza

Il progetto è stato ripulito per evitare bind mount dal filesystem del repository.

Tutto persiste su **volumi Docker nominati**.

### Volumi principali

| Volume | Contenuto |
| --- | --- |
| `gateway-certs` | certificati TLS del lab |
| `gateway-config` | configurazione runtime del gateway |
| `gateway-site` | deck HTML, contenuti statici e markdown renderizzati |
| `gateway-data` | dati runtime di Caddy |
| `gitea-data` | dati applicativi Gitea |
| `gitea-db` | dati MariaDB |
| `n8n-data` | dati n8n |
| `ollama-data` | modelli e cache Ollama |
| `open-webui-data` | dati applicativi Open WebUI |
| `postgres-dev-data` | dati PostgreSQL |
| `node-dev-home` / `node-dev-workspace` | home e workspace Node |
| `python-dev-home` / `python-dev-workspace` | home e workspace Python |
| `ai-dev-home` / `ai-dev-workspace` | home e workspace AI |
| `cpp-dev-home` / `cpp-dev-workspace` | home e workspace C++ |

### Implicazione pratica

Se ricrei i container:

- i dati restano
- le configurazioni bootstrap restano
- i workbench non perdono workspace

Se elimini i volumi, azzeri il lab.

---

## 🛠️ Comandi operativi utili

### Avvio

```powershell
docker compose up -d
```

### Avvio completo con workbench

```powershell
docker compose --profile workbench up -d
```

### Stato

```powershell
docker compose ps -a
```

### Log aggregati

```powershell
docker compose logs -f
```

### Log di un servizio

```powershell
docker compose logs -f gateway
docker compose logs -f open-webui
docker compose logs -f n8n
```

### Rebuild mirato

```powershell
docker compose up -d --build gateway
docker compose up -d --build ollama open-webui
docker compose up -d --build n8n n8n-runners
```

### Stop

```powershell
docker compose down
```

### Stop con workbench

```powershell
docker compose --profile workbench down
```

### Validazione Compose

```powershell
docker compose config
```

---

## ✅ Verifiche consigliate dopo l'avvio

### Deck

```powershell
curl.exe -sk https://localhost:8443/ -o NUL -w "%{http_code}"
```

Atteso:

```text
200
```

### Gitea

```powershell
curl.exe -sk --resolve gitea.lab.home.arpa:8443:127.0.0.1 https://gitea.lab.home.arpa:8443/ -o NUL -w "%{http_code}"
```

### n8n

```powershell
curl.exe -sk --resolve n8n.lab.home.arpa:8443:127.0.0.1 https://n8n.lab.home.arpa:8443/ -o NUL -w "%{http_code}"
```

Con gateway auth, il browser ti chiederà le credenziali.

### Open WebUI

```powershell
curl.exe -sk --resolve webui.lab.home.arpa:8443:127.0.0.1 https://webui.lab.home.arpa:8443/ -o NUL -w "%{http_code}"
```

### Ollama

```powershell
curl.exe -sk --resolve ollama.lab.home.arpa:8443:127.0.0.1 https://ollama.lab.home.arpa:8443/api/tags
```

### Compose health

```powershell
docker compose ps -a
```

Controlla che:

- `gitea`, `gitea-db`, `n8n`, `n8n-runners`, `ollama`, `open-webui` siano `healthy`
- `gitea-init` e `ollama-init` risultino `Exited (0)`

---

## 🧯 Troubleshooting

### Browser: `DNS_PROBE_FINISHED_NXDOMAIN`

Causa:

- hostname `*.lab.home.arpa` non risolto localmente

Soluzione:

- esegui [scripts/install-lab-hosts.ps1](./scripts/install-lab-hosts.ps1) da PowerShell elevata
- oppure configura un DNS interno

### Browser: warning certificato

Causa:

- il lab usa certificati self-signed

Soluzione:

- scarica `/assets/lab.crt` dal deck
- importalo nel trust store locale se vuoi evitare il warning

### `gitea-init` è `Exited (0)`

Non è un errore.

È un job one-shot che:

- aspetta `app.ini`
- crea o riallinea l'admin root
- termina correttamente

### `docker compose up` non mostra i workbench

Normale.

I workbench sono dietro il profilo:

```powershell
docker compose --profile workbench up -d
```

### n8n chiede due credenziali diverse

Normale.

Hai:

- basic auth del gateway
- owner bootstrap dentro n8n

### Open WebUI parte ma non risponde dal browser

Controlla in ordine:

1. hostname risolto
2. certificato accettato
3. `docker compose ps -a`
4. log di `open-webui`
5. log di `ollama`

### Il deck locale funziona ma gli host dedicati no

Quasi sempre significa:

- `localhost` funziona
- `*.lab.home.arpa` non sono in DNS/hosts

---

## 🧱 File chiave del progetto

| File | Ruolo |
| --- | --- |
| [docker-compose.yml](./docker-compose.yml) | orchestrazione principale |
| [`.env`](./.env) | naming, versioni, credenziali e parametri del lab |
| [gateway/templates/Caddyfile.template](./gateway/templates/Caddyfile.template) | routing host-based HTTPS |
| [gateway/templates/lab-index.html.template](./gateway/templates/lab-index.html.template) | deck HTML del lab |
| [gateway/templates/content/network-map.md.template](./gateway/templates/content/network-map.md.template) | topologia e mappa host |
| [scripts/install-lab-hosts.ps1](./scripts/install-lab-hosts.ps1) | installazione hosts su Windows |
| [scripts/remove-lab-hosts.ps1](./scripts/remove-lab-hosts.ps1) | rimozione hosts su Windows |

---

## 🧭 Filosofia del lab

Le decisioni architetturali principali sono queste:

- **Compose, non Kubernetes**
- **Caddy come edge gateway**
- **routing per host, non per subpath**
- **reti interne separate**
- **egress selettivo**
- **volumi Docker nominati per tutta la persistenza**
- **workbench opzionali via profilo**
- **dashboard locale come indice operativo**

Questa combinazione tiene il progetto:

- semplice da capire
- portabile su una singola macchina
- più robusto di una stack "tutto sulla stessa rete"
- meno fragile dei proxy sotto subpath

---

## ⚠️ Note di sicurezza

Questo repository è pensato come **lab locale / rete interna**, non come deployment internet-facing hardenizzato.

Punti da tenere presenti:

- le credenziali sono in [`.env`](./.env)
- il certificato è self-signed
- `n8n` e `Ollama` usano basic auth gateway
- i servizi non dovrebbero essere esposti direttamente a internet senza ulteriori misure

Se vuoi alzare il livello:

- sposta i segreti su Docker secrets o `_FILE`
- usa un DNS interno serio
- usa una CA interna o certificati trusted
- limita ulteriormente egress e accessi
- aggiungi backup formale dei volumi

---

## 📚 Fonti ufficiali utili

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
- The Caddyfile: https://caddyserver.com/docs/caddyfile
- reverse_proxy: https://caddyserver.com/docs/caddyfile/directives/reverse_proxy

### Gitea

- Install with Docker: https://docs.gitea.com/installation/install-with-docker
- Configuration Cheat Sheet: https://docs.gitea.com/administration/config-cheat-sheet

### n8n

- Environment variables overview: https://docs.n8n.io/hosting/configuration/environment-variables/
- Deployment environment variables: https://docs.n8n.io/hosting/configuration/environment-variables/deployment/
- Configuration methods: https://docs.n8n.io/hosting/configuration/configuration-methods/
- Isolate n8n: https://docs.n8n.io/hosting/configuration/configuration-examples/isolation/
- Set up SSL behind reverse proxy: https://docs.n8n.io/hosting/securing/set-up-ssl/
- Hardening task runners: https://docs.n8n.io/hosting/securing/hardening-task-runners/

### Open WebUI

- Environment variable configuration: https://docs.openwebui.com/getting-started/env-configuration

### Ollama

- API overview: https://docs.ollama.com/api
- Embeddings: https://docs.ollama.com/capabilities/embeddings
- Embed API: https://docs.ollama.com/api/embed
- FAQ: https://docs.ollama.com/faq

### code-server

- Overview: https://coder.com/docs/code-server/
- Install: https://coder.com/docs/code-server/install
- Guide: https://coder.com/docs/code-server/guide
- FAQ: https://coder.com/docs/code-server/FAQ

### Naming locale

- RFC 8375, `home.arpa`: https://www.rfc-editor.org/rfc/rfc8375

---

## 🏁 In sintesi

Se vuoi usare questo progetto bene, ricordati tre regole:

1. Apri il deck da `https://localhost:8443/`.
2. Mappa gli host `*.lab.home.arpa` sul tuo sistema, altrimenti gli URL dedicati non funzionano.
3. Considera i workbench come un profilo opzionale, non parte obbligatoria del core.

Se queste tre condizioni sono rispettate, il lab risulta coerente, leggibile e operativamente comodo per sviluppo locale, automazione, repository management e AI self-hosted.
