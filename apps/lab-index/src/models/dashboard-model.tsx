import type { DashboardViewModel } from '@/types/dashboard.types';
import type { LabRuntimeConfig } from '@/types/lab-config.types';

/**
 * Converts the gateway runtime payload into the view model consumed by the MUI dashboard.
 */
export function createDashboardViewModel(config: LabRuntimeConfig): DashboardViewModel {
  const aiEnabled = config.features.aiEnabled;
  const workbenchEnabled = config.features.workbenchEnabled;

  return {
    accessNotes: [
      'Le credenziali operative sono esposte qui e restano allineate al bootstrap del lab.',
      'Tutti gli ingressi browser usano localhost con HTTPS dedicato, senza DNS custom o file hosts.',
      'n8n entra direttamente con owner bootstrap: non c e un secondo login al gateway.',
      aiEnabled
        ? 'Open WebUI e Ollama sono realmente online e raggiungibili sulle porte AI del gateway.'
        : 'Il layer AI non viene piu acceso di default: il deck lo marca come opzionale invece di fingere che sia online.',
      workbenchEnabled
        ? 'I workbench e Postgres sono attivi: puoi aprire ambienti browser-based o connetterti dal desktop alla porta host di Postgres.'
        : 'Workbench e Postgres restano separati dal core operativo finche non abiliti il layer dedicato.'
    ],
    aiLayer: {
      activationCommand: 'atlas-lab up --with-ai',
      capabilities: [
        { icon: 'openWebUi', label: 'Open WebUI locale' },
        { icon: 'ollama', label: 'API Ollama protetta' },
        { icon: 'ai', label: 'modelli GPU-backed' }
      ],
      description:
        'Layer AI opzionale per console conversazionale locale e inference LLM GPU-backed. Il deck lo attiva solo quando lo chiedi esplicitamente.',
      enabled: aiEnabled,
      summary: aiEnabled
        ? 'Open WebUI e Ollama sono attivi e serviti dal gateway AI.'
        : 'AI layer spento. Nessun servizio AI viene avviato o esposto finche non abiliti il flag dedicato.',
      title: 'AI Layer',
      tone: 'ai'
    },
    aiServices: [
      {
        action: {
          href: config.services.openWebUi.url,
          label: 'Apri Open WebUI'
        },
        credentials: [
          { label: 'endpoint', value: config.services.openWebUi.url },
          { label: 'root name', value: config.services.openWebUi.rootName },
          { label: 'root email', value: config.services.openWebUi.rootEmail },
          { label: 'password', value: config.services.openWebUi.rootPassword }
        ],
        description:
          'Interfaccia conversazionale per lavorare sui modelli locali del lab dal browser, con credenziali esplicite e accesso immediato dal gateway.',
        icon: 'openWebUi',
        id: 'open-webui',
        status: 'browser console',
        title: 'Open WebUI',
        tone: 'ai'
      },
      {
        action: {
          href: config.services.ollama.url,
          label: 'Apri endpoint API'
        },
        credentials: [
          { label: 'endpoint', value: config.services.ollama.url },
          { label: 'gateway user', value: config.services.ollama.gatewayUser },
          { label: 'gateway password', value: config.services.ollama.gatewayPassword },
          { label: 'usage', value: 'local inference API' }
        ],
        description:
          'Gateway sicuro verso l endpoint Ollama locale. Serve modelli LLM ed embeddings con accelerazione GPU del nodo host.',
        icon: 'ollama',
        id: 'ollama',
        status: 'protected API',
        title: 'Ollama Core',
        tone: 'ai'
      }
    ],
    footerCards: [
      {
        body: `Il deck resta su ${config.lab.localUrl}; i servizi browser passano dal gateway HTTPS mentre Postgres per i client desktop usa ${config.workbenches.postgres.host}:${config.workbenches.postgres.port}.`,
        icon: 'route',
        id: 'routing',
        label: 'routing'
      },
      {
        body: 'Database, workspace, modelli, certificati e configurazione runtime restano persistiti solo in volumi Docker nominati.',
        icon: 'postgres',
        id: 'persistence',
        label: 'persistence'
      },
      {
        body: 'Gitea e n8n sono il piano core sempre acceso; AI e workbench vengono abilitati a layer solo quando servono davvero.',
        icon: 'spark',
        id: 'usage',
        label: 'usage'
      },
      {
        body: 'Le reti interne restano separate per edge, AI, servizi dati e workbench. I gateway sono gli unici ingressi pubblicati.',
        icon: 'network',
        id: 'segmentation',
        label: 'segmentation'
      }
    ],
    hero: {
      eyebrow: 'atlas command deck',
      metrics: [
        { caption: 'servizi sempre accesi e bootstrap mandatory', label: 'core online', value: 2 },
        { caption: aiEnabled ? 'layer AI pubblicato sul gateway dedicato' : 'layer AI non attivo', label: 'ai live', value: aiEnabled ? 2 : 0 },
        {
          caption: workbenchEnabled ? 'workspace e database esposti nel layer dedicato' : 'layer workbench non attivo',
          label: 'workbench live',
          value: workbenchEnabled ? 5 : 0
        },
        {
          caption: 'gateway pubblici serviti adesso',
          label: 'ingress planes',
          value: 1 + (aiEnabled ? 1 : 0) + (workbenchEnabled ? 1 : 0)
        }
      ],
      pills: [
        { icon: 'route', label: `deck ${config.lab.localUrl}`, tone: 'core' },
        { icon: 'secure', label: 'ingress solo https', tone: 'neutral' },
        { icon: 'host', label: `host ${config.lab.publicUrl}`, tone: 'neutral' },
        { icon: 'postgres', label: 'persistenza su volumi', tone: 'core' },
        { icon: aiEnabled ? 'spark' : 'certificate', label: aiEnabled ? 'layer ai attivo' : 'layer ai opzionale', tone: 'ai' },
        {
          icon: workbenchEnabled ? 'terminal' : 'certificate',
          label: workbenchEnabled ? 'workbench attivi' : 'workbench opzionali',
          tone: 'workbench'
        }
      ],
      quickActions: [
        {
          briefing: {
            path: config.content.networkMapPath,
            title: 'Network Map'
          },
          description: 'Leggi la topologia del lab e i piani di rete pubblicati.',
          icon: 'network',
          label: 'Network map'
        },
        {
          description: 'Rivedi da browser il routing locale che il deck sta usando.',
          href: config.lab.localUrl,
          icon: 'host',
          label: 'Local deck'
        }
      ],
      summary:
        'Control room unificata per repository, automazione, AI opzionale e ambienti di sviluppo. Le porte browser restano HTTPS su localhost, mentre Postgres del layer workbench espone anche una porta TCP host-side.',
      titleLines: ['LAB', 'ATLAS']
    },
    networkMap: {
      path: config.content.networkMapPath,
      title: 'Network Map'
    },
    operatingCharter: [
      'Gitea governa codice, review e governance Git del progetto.',
      'n8n coordina automazioni, webhook e job operativi del lab.',
      'Open WebUI e Ollama vivono in un layer AI esplicitamente opzionale.',
      'Code-server e Postgres restano in un piano workbench separato dal core.'
    ],
    services: [
      {
        action: {
          href: config.services.gitea.url,
          label: 'Apri Gitea'
        },
        credentials: [
          { label: 'endpoint', value: config.services.gitea.url },
          { label: 'root user', value: config.services.gitea.rootUsername },
          { label: 'password', value: config.services.gitea.rootPassword },
          { label: 'email', value: config.services.gitea.rootEmail }
        ],
        description:
          'Forge Git interna per repository, issue, review e flusso di collaborazione tecnica del lab.',
        icon: 'forge',
        id: 'gitea',
        status: 'always-on forge',
        title: 'Gitea Forge',
        tone: 'core'
      },
      {
        action: {
          href: config.services.n8n.url,
          label: 'Apri n8n'
        },
        credentials: [
          { label: 'endpoint', value: config.services.n8n.url },
          { label: 'access mode', value: 'direct app login' },
          { label: 'owner bootstrap', value: config.services.n8n.ownerName },
          { label: 'owner email', value: config.services.n8n.ownerEmail },
          { label: 'owner password', value: config.services.n8n.ownerPassword }
        ],
        description:
          'Motore di orchestrazione per webhook, integrazioni e pipeline operative, gia bootstrapato con owner applicativo.',
        icon: 'workflow',
        id: 'n8n',
        note:
          'Il primo accesso salta il setup wizard ma non nasconde i template ufficiali disponibili dentro l applicazione.',
        status: 'workflow control',
        title: 'n8n Automation',
        tone: 'core'
      }
    ],
    workbenchLayer: {
      activationCommand: 'atlas-lab up --with-workbench',
      capabilities: [
        { icon: 'node', label: 'workbench Node' },
        { icon: 'terminal', label: 'code-server dedicati' },
        { icon: 'postgres', label: 'Postgres condiviso' }
      ],
      description:
        'Layer separato per workspace browser-based e database condiviso. Il core resta pulito finche non ti serve realmente l ambiente di sviluppo.',
      enabled: workbenchEnabled,
      summary: workbenchEnabled
        ? 'Node, Python, AI, C++ e Postgres sono online nel piano workbench.'
        : 'Workbench layer spento. Nessun code-server o Postgres viene esposto dal lab.',
      title: 'Workbench Layer',
      tone: 'workbench'
    },
    workbenches: [
      {
        action: {
          href: config.workbenches.node.url,
          label: 'Apri workspace'
        },
        briefing: {
          path: config.workbenches.node.briefingPath,
          title: 'Node Forge'
        },
        credentials: [
          { label: 'endpoint', value: config.workbenches.node.url },
          { label: 'auth mode', value: 'password' },
          { label: 'root password', value: config.workbenches.node.password }
        ],
        description:
          'Workspace code-server per JavaScript, TypeScript, frontend e tooling npm o pnpm.',
        icon: 'node',
        id: 'node',
        status: 'browser workspace',
        title: 'Node Forge',
        tone: 'workbench'
      },
      {
        action: {
          href: config.workbenches.python.url,
          label: 'Apri workspace'
        },
        briefing: {
          path: config.workbenches.python.briefingPath,
          title: 'Python Grid'
        },
        credentials: [
          { label: 'endpoint', value: config.workbenches.python.url },
          { label: 'auth mode', value: 'password' },
          { label: 'root password', value: config.workbenches.python.password }
        ],
        description:
          'Workspace code-server per backend Python, scripting e automazioni operative.',
        icon: 'terminal',
        id: 'python',
        status: 'browser workspace',
        title: 'Python Grid',
        tone: 'workbench'
      },
      {
        action: {
          href: config.workbenches.ai.url,
          label: 'Apri workspace'
        },
        briefing: {
          path: config.workbenches.ai.briefingPath,
          title: 'AI Reactor'
        },
        credentials: [
          { label: 'endpoint', value: config.workbenches.ai.url },
          { label: 'auth mode', value: 'password' },
          { label: 'root password', value: config.workbenches.ai.password }
        ],
        description:
          'Workspace code-server per notebook, esperimenti ML e tooling AI locale.',
        icon: 'ai',
        id: 'ai',
        status: 'browser workspace',
        title: 'AI Reactor',
        tone: 'workbench'
      },
      {
        action: {
          href: config.workbenches.cpp.url,
          label: 'Apri workspace'
        },
        briefing: {
          path: config.workbenches.cpp.briefingPath,
          title: 'C++ Foundry'
        },
        credentials: [
          { label: 'endpoint', value: config.workbenches.cpp.url },
          { label: 'auth mode', value: 'password' },
          { label: 'root password', value: config.workbenches.cpp.password }
        ],
        description:
          'Workspace code-server per sviluppo C o C++, compilazione nativa e debugging.',
        icon: 'cpp',
        id: 'cpp',
        status: 'browser workspace',
        title: 'C++ Foundry',
        tone: 'workbench'
      },
      {
        briefing: {
          path: config.workbenches.postgres.briefingPath,
          title: 'Postgres Vault'
        },
        credentials: [
          { label: 'desktop host', value: config.workbenches.postgres.host },
          { label: 'desktop port', value: config.workbenches.postgres.port },
          { label: 'docker host', value: config.workbenches.postgres.internalHost },
          { label: 'docker port', value: config.workbenches.postgres.internalPort },
          { label: 'database', value: config.workbenches.postgres.database },
          { label: 'superuser', value: config.workbenches.postgres.superuser },
          { label: 'password', value: config.workbenches.postgres.password }
        ],
        description:
          'PostgreSQL condiviso per schema design, query locali, migrazioni e test relazionali dal desktop o dai container.',
        icon: 'postgres',
        id: 'postgres',
        note:
          'Dal sistema host usa localhost con la porta desktop. Dentro i container continua invece a usare postgres-dev:5432.',
        status: 'shared database',
        title: 'Postgres Vault',
        tone: 'workbench'
      }
    ]
  };
}
