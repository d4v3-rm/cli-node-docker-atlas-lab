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
  const aiImageEnabled = config.features.aiImageEnabled;
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
    model: t('credentials.model'),
    modelRevision: t('credentials.modelRevision'),
    ownerBootstrap: t('credentials.ownerBootstrap'),
    ownerEmail: t('credentials.ownerEmail'),
    ownerPassword: t('credentials.ownerPassword'),
    password: t('credentials.password'),
    rootEmail: t('credentials.rootEmail'),
    rootName: t('credentials.rootName'),
    rootPassword: t('credentials.rootPassword'),
    rootUser: t('credentials.rootUser'),
    superuser: t('credentials.superuser'),
    usage: t('credentials.usage')
  };

  return {
    accessNotes: [
      t('dashboard.accessNotes.credentials'),
      t('dashboard.accessNotes.https'),
      t('dashboard.accessNotes.n8n'),
      t(aiLlmEnabled ? 'dashboard.accessNotes.aiEnabled' : 'dashboard.accessNotes.aiDisabled'),
      t(
        aiImageEnabled
          ? 'dashboard.accessNotes.imageEnabled'
          : 'dashboard.accessNotes.imageDisabled'
      ),
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
      }
    ],
    imageLayer: {
      activationCommand: 'atlas-lab up --with-ai-image',
      capabilities: [
        {
          icon: 'image',
          label: t('dashboard.imageLayer.capabilities.invokeAi')
        },
        {
          icon: 'spark',
          label: t('dashboard.imageLayer.capabilities.models')
        },
        {
          icon: 'secure',
          label: t('dashboard.imageLayer.capabilities.gateway')
        }
      ],
      description: t('dashboard.imageLayer.description'),
      enabled: aiImageEnabled,
      summary: t(
        aiImageEnabled
          ? 'dashboard.imageLayer.summaryEnabled'
          : 'dashboard.imageLayer.summaryDisabled'
      ),
      title: t('dashboard.imageLayer.title'),
      tone: 'image'
    },
    imageServices: [
      {
        action: {
          href: config.services.invokeAi.url,
          label: t('dashboard.imageServices.invokeAi.action')
        },
        briefing: {
          path: config.services.invokeAi.briefingPath,
          title: t('dashboard.imageServices.invokeAi.title')
        },
        credentials: [
          {
            label: credentialLabels.endpoint,
            value: config.services.invokeAi.url
          },
          {
            label: credentialLabels.gatewayUser,
            value: config.services.invokeAi.gatewayUser
          },
          {
            label: credentialLabels.gatewayPassword,
            value: config.services.invokeAi.gatewayPassword
          },
          {
            label: credentialLabels.model,
            value: config.services.invokeAi.modelTitle
          },
          {
            label: credentialLabels.modelRevision,
            value: config.services.invokeAi.modelRevision
          }
        ],
        description: t('dashboard.imageServices.invokeAi.description'),
        icon: 'image',
        id: 'invokeai',
        note: t('dashboard.imageServices.invokeAi.note', {
          modelRepo: config.services.invokeAi.modelRepo
        }),
        status: t('values.imageStudio'),
        title: t('dashboard.imageServices.invokeAi.title'),
        tone: 'image'
      },
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
          value: 2
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
            aiImageEnabled
              ? 'dashboard.metrics.imageEnabled.caption'
              : 'dashboard.metrics.imageDisabled.caption'
          ),
          label: t(
            aiImageEnabled
              ? 'dashboard.metrics.imageEnabled.label'
              : 'dashboard.metrics.imageDisabled.label'
          ),
          value: aiImageEnabled ? 1 : 0
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
          value: workbenchEnabled ? 5 : 0
        },
        {
          caption: t('dashboard.metrics.ingress.caption'),
          label: t('dashboard.metrics.ingress.label'),
          value: 1 + (aiLlmEnabled ? 1 : 0) + (aiImageEnabled ? 1 : 0) + (workbenchEnabled ? 1 : 0)
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
          icon: aiImageEnabled ? 'image' : 'certificate',
          label: t(
            aiImageEnabled
              ? 'dashboard.hero.pills.imageActive'
              : 'dashboard.hero.pills.imageOptional'
          ),
          tone: 'image'
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
      t('dashboard.operatingCharter.n8n'),
      t('dashboard.operatingCharter.ai'),
      t('dashboard.operatingCharter.image'),
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
          href: config.services.n8n.url,
          label: t('dashboard.services.n8n.action')
        },
        credentials: [
          {
            label: credentialLabels.endpoint,
            value: config.services.n8n.url
          },
          {
            label: credentialLabels.accessMode,
            value: t('values.directAppLogin')
          },
          {
            label: credentialLabels.ownerBootstrap,
            value: config.services.n8n.ownerName
          },
          {
            label: credentialLabels.ownerEmail,
            value: config.services.n8n.ownerEmail
          },
          {
            label: credentialLabels.ownerPassword,
            value: config.services.n8n.ownerPassword
          }
        ],
        description: t('dashboard.services.n8n.description'),
        icon: 'workflow',
        id: 'n8n',
        note: t('dashboard.services.n8n.note'),
        status: t('values.workflowControl'),
        title: t('dashboard.services.n8n.title'),
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
        action: {
          href: config.workbenches.ai.url,
          label: t('dashboard.workbenches.common.openWorkspace')
        },
        briefing: {
          path: config.workbenches.ai.briefingPath,
          title: t('dashboard.workbenches.ai.briefingTitle')
        },
        credentials: [
          {
            label: credentialLabels.endpoint,
            value: config.workbenches.ai.url
          },
          {
            label: credentialLabels.authMode,
            value: t('values.password')
          },
          {
            label: credentialLabels.rootPassword,
            value: config.workbenches.ai.password
          }
        ],
        description: t('dashboard.workbenches.ai.description'),
        icon: 'ai',
        id: 'ai',
        status: t('values.browserWorkspace'),
        title: t('dashboard.workbenches.ai.title'),
        tone: 'workbench'
      },
      {
        action: {
          href: config.workbenches.cpp.url,
          label: t('dashboard.workbenches.common.openWorkspace')
        },
        briefing: {
          path: config.workbenches.cpp.briefingPath,
          title: t('dashboard.workbenches.cpp.briefingTitle')
        },
        credentials: [
          {
            label: credentialLabels.endpoint,
            value: config.workbenches.cpp.url
          },
          {
            label: credentialLabels.authMode,
            value: t('values.password')
          },
          {
            label: credentialLabels.rootPassword,
            value: config.workbenches.cpp.password
          }
        ],
        description: t('dashboard.workbenches.cpp.description'),
        icon: 'cpp',
        id: 'cpp',
        status: t('values.browserWorkspace'),
        title: t('dashboard.workbenches.cpp.title'),
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
