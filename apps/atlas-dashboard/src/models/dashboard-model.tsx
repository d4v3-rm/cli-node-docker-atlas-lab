import type { TFunction } from 'i18next';
import type { DashboardViewModel } from '@/types/dashboard.types';
import type { LabRuntimeConfig } from '@/types/lab-config.types';

/**
 * Converts the gateway runtime payload into the view model consumed by the Ant Design dashboard.
 */
export function createDashboardViewModel(
  config: LabRuntimeConfig,
  t: TFunction
): DashboardViewModel {
  const aiLlmEnabled = config.features.aiLlmEnabled;
  const n8nUrl = config.services.n8n?.url ?? 'https://n8n.io/';
  const workbenchEnabled = config.features.workbenchEnabled;

  const credentialLabels = {
    accessMode: t('credentials.accessMode'),
    authMode: t('credentials.authMode'),
    database: t('credentials.database'),
    desktopHost: t('credentials.desktopHost'),
    desktopPort: t('credentials.desktopPort'),
    dockerHost: t('credentials.dockerHost'),
    dockerPort: t('credentials.dockerPort'),
    email: t('credentials.email'),
    endpoint: t('credentials.endpoint'),
    gatewayPassword: t('credentials.gatewayPassword'),
    gatewayUser: t('credentials.gatewayUser'),
    password: t('credentials.password'),
    rootEmail: t('credentials.rootEmail'),
    rootName: t('credentials.rootName'),
    rootPassword: t('credentials.rootPassword'),
    rootUser: t('credentials.rootUser'),
    setupUrl: t('credentials.setupUrl'),
    superuser: t('credentials.superuser'),
    usage: t('credentials.usage')
  };

  return {
    accessNotes: [
      t('dashboard.accessNotes.credentials'),
      t('dashboard.accessNotes.https'),
      t(aiLlmEnabled ? 'dashboard.accessNotes.aiEnabled' : 'dashboard.accessNotes.aiDisabled'),
      t(
        workbenchEnabled
          ? 'dashboard.accessNotes.workbenchEnabled'
          : 'dashboard.accessNotes.workbenchDisabled'
      )
    ],
    aiLayer: {
      activationCommand: 'atlas-lab up --with-ai-llm',
      capabilities: [
        {
          icon: 'openWebUi',
          label: t('dashboard.aiLayer.capabilities.openWebUi')
        },
        {
          icon: 'ollama',
          label: t('dashboard.aiLayer.capabilities.ollama')
        },
        {
          icon: 'ai',
          label: t('dashboard.aiLayer.capabilities.llmModels')
        }
      ],
      description: t('dashboard.aiLayer.description'),
      enabled: aiLlmEnabled,
      summary: t(
        aiLlmEnabled
          ? 'dashboard.aiLayer.summaryEnabled'
          : 'dashboard.aiLayer.summaryDisabled'
      ),
      title: t('dashboard.aiLayer.title'),
      tone: 'ai'
    },
    aiServices: [
      {
        action: {
          href: config.services.openWebUi.url,
          label: t('dashboard.aiServices.openWebUi.action')
        },
        credentials: [
          {
            label: credentialLabels.endpoint,
            value: config.services.openWebUi.url
          },
          {
            label: credentialLabels.rootName,
            value: config.services.openWebUi.rootName
          },
          {
            label: credentialLabels.rootEmail,
            value: config.services.openWebUi.rootEmail
          },
          {
            label: credentialLabels.password,
            value: config.services.openWebUi.rootPassword
          }
        ],
        description: t('dashboard.aiServices.openWebUi.description'),
        icon: 'openWebUi',
        id: 'open-webui',
        status: t('values.browserConsole'),
        title: t('dashboard.aiServices.openWebUi.title'),
        tone: 'ai'
      },
      {
        action: {
          href: config.services.ollama.url,
          label: t('dashboard.aiServices.ollama.action')
        },
        credentials: [
          {
            label: credentialLabels.endpoint,
            value: config.services.ollama.url
          },
          {
            label: credentialLabels.gatewayUser,
            value: config.services.ollama.gatewayUser
          },
          {
            label: credentialLabels.gatewayPassword,
            value: config.services.ollama.gatewayPassword
          },
          {
            label: credentialLabels.usage,
            value: t('values.localInferenceApi')
          }
        ],
        description: t('dashboard.aiServices.ollama.description'),
        icon: 'ollama',
        id: 'ollama',
        status: t('values.protectedApi'),
        title: t('dashboard.aiServices.ollama.title'),
        tone: 'ai'
      },
      {
        action: {
          href: n8nUrl,
          label: t('dashboard.aiServices.n8n.action')
        },
        credentials: [
          {
            label: credentialLabels.endpoint,
            value: n8nUrl
          },
          {
            label: credentialLabels.usage,
            value: t('values.workflowControl')
          }
        ],
        description: t('dashboard.aiServices.n8n.description'),
        icon: 'workflow',
        id: 'n8n',
        status: t('values.workflowControl'),
        title: t('dashboard.aiServices.n8n.title'),
        tone: 'ai'
      }
    ],
    footerCards: [
      {
        body: t('dashboard.footerCards.routing.body', {
          localUrl: config.lab.localUrl,
          postgresHost: config.workbenches.postgres.host,
          postgresPort: config.workbenches.postgres.port
        }),
        icon: 'route',
        id: 'routing',
        label: t('dashboard.footerCards.routing.label')
      },
      {
        body: t('dashboard.footerCards.persistence.body'),
        icon: 'postgres',
        id: 'persistence',
        label: t('dashboard.footerCards.persistence.label')
      },
      {
        body: t('dashboard.footerCards.usage.body'),
        icon: 'spark',
        id: 'usage',
        label: t('dashboard.footerCards.usage.label')
      },
      {
        body: t('dashboard.footerCards.segmentation.body'),
        icon: 'network',
        id: 'segmentation',
        label: t('dashboard.footerCards.segmentation.label')
      }
    ],
    hero: {
      eyebrow: t('dashboard.hero.eyebrow'),
      metrics: [
        {
          caption: t('dashboard.metrics.core.caption'),
          label: t('dashboard.metrics.core.label'),
          value: 4
        },
        {
          caption: t(
            aiLlmEnabled
              ? 'dashboard.metrics.aiEnabled.caption'
              : 'dashboard.metrics.aiDisabled.caption'
          ),
          label: t(
            aiLlmEnabled
              ? 'dashboard.metrics.aiEnabled.label'
              : 'dashboard.metrics.aiDisabled.label'
          ),
          value: aiLlmEnabled ? 2 : 0
        },
        {
          caption: t(
            workbenchEnabled
              ? 'dashboard.metrics.workbenchEnabled.caption'
              : 'dashboard.metrics.workbenchDisabled.caption'
          ),
          label: t(
            workbenchEnabled
              ? 'dashboard.metrics.workbenchEnabled.label'
              : 'dashboard.metrics.workbenchDisabled.label'
          ),
          value: workbenchEnabled ? 3 : 0
        },
        {
          caption: t('dashboard.metrics.ingress.caption'),
          label: t('dashboard.metrics.ingress.label'),
          value: 6 + (aiLlmEnabled ? 2 : 0) + (workbenchEnabled ? 2 : 0)
        }
      ],
      pills: [
        {
          icon: 'route',
          label: t('dashboard.hero.pills.deck', {
            localUrl: config.lab.localUrl
          }),
          tone: 'core'
        },
        {
          icon: 'secure',
          label: t('dashboard.hero.pills.httpsOnly'),
          tone: 'neutral'
        },
        {
          icon: 'host',
          label: t('dashboard.hero.pills.host', {
            publicUrl: config.lab.publicUrl
          }),
          tone: 'neutral'
        },
        {
          icon: 'postgres',
          label: t('dashboard.hero.pills.volumes'),
          tone: 'core'
        },
        {
          icon: aiLlmEnabled ? 'spark' : 'certificate',
          label: t(
            aiLlmEnabled
              ? 'dashboard.hero.pills.aiActive'
              : 'dashboard.hero.pills.aiOptional'
          ),
          tone: 'ai'
        },
        {
          icon: workbenchEnabled ? 'terminal' : 'certificate',
          label: t(
            workbenchEnabled
              ? 'dashboard.hero.pills.workbenchActive'
              : 'dashboard.hero.pills.workbenchOptional'
          ),
          tone: 'workbench'
        }
      ],
      quickActions: [
        {
          briefing: {
            path: config.content.networkMapPath,
            title: t('dashboard.networkMap.title')
          },
          description: t('dashboard.hero.quickActions.networkMapDescription'),
          icon: 'network',
          label: t('dashboard.hero.quickActions.networkMapLabel')
        },
        {
          description: t('dashboard.hero.quickActions.localDeckDescription'),
          href: config.lab.localUrl,
          icon: 'host',
          label: t('dashboard.hero.quickActions.localDeckLabel')
        }
      ],
      summary: t('dashboard.hero.summary'),
      titleLines: [
        t('dashboard.hero.titleLines.first'),
        t('dashboard.hero.titleLines.second')
      ]
    },
    networkMap: {
      path: config.content.networkMapPath,
      title: t('dashboard.networkMap.title')
    },
    operatingCharter: [
      t('dashboard.operatingCharter.gitea'),
      t('dashboard.operatingCharter.ai'),
      t('dashboard.operatingCharter.workbench')
    ],
    services: [
      {
        action: {
          href: config.services.gitea.url,
          label: t('dashboard.services.gitea.action')
        },
        credentials: [
          {
            label: credentialLabels.endpoint,
            value: config.services.gitea.url
          },
          {
            label: credentialLabels.rootUser,
            value: config.services.gitea.rootUsername
          },
          {
            label: credentialLabels.password,
            value: config.services.gitea.rootPassword
          },
          {
            label: credentialLabels.email,
            value: config.services.gitea.rootEmail
          }
        ],
        description: t('dashboard.services.gitea.description'),
        icon: 'forge',
        id: 'gitea',
        status: t('values.alwaysOnForge'),
        title: t('dashboard.services.gitea.title'),
        tone: 'core'
      },
      {
        action: {
          href: config.services.plane.url,
          label: t('dashboard.services.plane.action')
        },
        credentials: [
          {
            label: credentialLabels.endpoint,
            value: config.services.plane.url
          },
          {
            label: credentialLabels.accessMode,
            value: t('values.directAppOnboarding')
          }
        ],
        description: t('dashboard.services.plane.description'),
        icon: 'route',
        id: 'plane',
        status: t('values.projectHub'),
        title: t('dashboard.services.plane.title'),
        tone: 'core'
      },
      {
        action: {
          href: config.services.penpot.url,
          label: t('dashboard.services.penpot.action')
        },
        credentials: [
          {
            label: credentialLabels.endpoint,
            value: config.services.penpot.url
          },
          {
            label: credentialLabels.accessMode,
            value: t('values.directAppOnboarding')
          }
        ],
        description: t('dashboard.services.penpot.description'),
        icon: 'host',
        id: 'penpot',
        status: t('values.designCollaboration'),
        title: t('dashboard.services.penpot.title'),
        tone: 'core'
      },
      {
        action: {
          href: config.services.nextcloudAio.setupUrl,
          label: t('dashboard.services.nextcloudAio.action')
        },
        credentials: [
          {
            label: credentialLabels.endpoint,
            value: config.services.nextcloudAio.url
          },
          {
            label: credentialLabels.setupUrl,
            value: config.services.nextcloudAio.setupUrl
          },
          {
            label: credentialLabels.accessMode,
            value: t('values.guidedSetup')
          }
        ],
        description: t('dashboard.services.nextcloudAio.description'),
        icon: 'secure',
        id: 'nextcloud-aio',
        note: t('dashboard.services.nextcloudAio.note'),
        status: t('values.privateCloud'),
        title: t('dashboard.services.nextcloudAio.title'),
        tone: 'core'
      }
    ],
    workbenchLayer: {
      activationCommand: 'atlas-lab up --with-workbench',
      capabilities: [
        {
          icon: 'node',
          label: t('dashboard.workbenchLayer.capabilities.node')
        },
        {
          icon: 'terminal',
          label: t('dashboard.workbenchLayer.capabilities.codeServer')
        },
        {
          icon: 'postgres',
          label: t('dashboard.workbenchLayer.capabilities.postgres')
        }
      ],
      description: t('dashboard.workbenchLayer.description'),
      enabled: workbenchEnabled,
      summary: t(
        workbenchEnabled
          ? 'dashboard.workbenchLayer.summaryEnabled'
          : 'dashboard.workbenchLayer.summaryDisabled'
      ),
      title: t('dashboard.workbenchLayer.title'),
      tone: 'workbench'
    },
    workbenches: [
      {
        action: {
          href: config.workbenches.node.url,
          label: t('dashboard.workbenches.common.openWorkspace')
        },
        briefing: {
          path: config.workbenches.node.briefingPath,
          title: t('dashboard.workbenches.node.briefingTitle')
        },
        credentials: [
          {
            label: credentialLabels.endpoint,
            value: config.workbenches.node.url
          },
          {
            label: credentialLabels.authMode,
            value: t('values.password')
          },
          {
            label: credentialLabels.rootPassword,
            value: config.workbenches.node.password
          }
        ],
        description: t('dashboard.workbenches.node.description'),
        icon: 'node',
        id: 'node',
        status: t('values.browserWorkspace'),
        title: t('dashboard.workbenches.node.title'),
        tone: 'workbench'
      },
      {
        action: {
          href: config.workbenches.python.url,
          label: t('dashboard.workbenches.common.openWorkspace')
        },
        briefing: {
          path: config.workbenches.python.briefingPath,
          title: t('dashboard.workbenches.python.briefingTitle')
        },
        credentials: [
          {
            label: credentialLabels.endpoint,
            value: config.workbenches.python.url
          },
          {
            label: credentialLabels.authMode,
            value: t('values.password')
          },
          {
            label: credentialLabels.rootPassword,
            value: config.workbenches.python.password
          }
        ],
        description: t('dashboard.workbenches.python.description'),
        icon: 'terminal',
        id: 'python',
        status: t('values.browserWorkspace'),
        title: t('dashboard.workbenches.python.title'),
        tone: 'workbench'
      },
      {
        briefing: {
          path: config.workbenches.postgres.briefingPath,
          title: t('dashboard.workbenches.postgres.briefingTitle')
        },
        credentials: [
          {
            label: credentialLabels.desktopHost,
            value: config.workbenches.postgres.host
          },
          {
            label: credentialLabels.desktopPort,
            value: config.workbenches.postgres.port
          },
          {
            label: credentialLabels.dockerHost,
            value: config.workbenches.postgres.internalHost
          },
          {
            label: credentialLabels.dockerPort,
            value: config.workbenches.postgres.internalPort
          },
          {
            label: credentialLabels.database,
            value: config.workbenches.postgres.database
          },
          {
            label: credentialLabels.superuser,
            value: config.workbenches.postgres.superuser
          },
          {
            label: credentialLabels.password,
            value: config.workbenches.postgres.password
          }
        ],
        description: t('dashboard.workbenches.postgres.description'),
        icon: 'postgres',
        id: 'postgres',
        note: t('dashboard.workbenches.postgres.note'),
        status: t('values.sharedDatabase'),
        title: t('dashboard.workbenches.postgres.title'),
        tone: 'workbench'
      }
    ]
  };
}
