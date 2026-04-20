import type { TFunction } from 'i18next';
import type { LabRuntimeConfig } from '@/entities/runtime-config';
import type {
  ServiceCardViewModel
} from '@/entities/dashboard/model/dashboard-view-model.types';
import type { DashboardCredentialLabels } from './dashboard-credential-labels.builder';
import type { BriefingReference } from '@/shared/types';

export function createNetworkMap(
  config: LabRuntimeConfig,
  t: TFunction
): BriefingReference {
  return {
    path: config.content.networkMapPath,
    title: t('dashboard.networkMap.title')
  };
}

export function createCoreServices(
  config: LabRuntimeConfig,
  labels: DashboardCredentialLabels,
  t: TFunction
): ServiceCardViewModel[] {
  return [
    {
      action: {
        href: config.services.gitea.url,
        label: t('dashboard.services.gitea.action')
      },
      credentials: [
        {
          label: labels.endpoint,
          value: config.services.gitea.url
        },
        {
          label: labels.rootUser,
          value: config.services.gitea.rootUsername
        },
        {
          label: labels.password,
          value: config.services.gitea.rootPassword
        },
        {
          label: labels.email,
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
        href: config.services.bookStack.url,
        label: t('dashboard.services.bookStack.action')
      },
      credentials: [
        {
          label: labels.endpoint,
          value: config.services.bookStack.url
        },
        {
          label: labels.rootName,
          value: config.services.bookStack.rootName
        },
        {
          label: labels.rootEmail,
          value: config.services.bookStack.rootEmail
        },
        {
          label: labels.password,
          value: config.services.bookStack.rootPassword
        },
        {
          label: labels.accessMode,
          value: t('values.directAppLogin')
        }
      ],
      description: t('dashboard.services.bookStack.description'),
      icon: 'host',
      id: 'bookstack',
      status: t('values.knowledgeBase'),
      title: t('dashboard.services.bookStack.title'),
      tone: 'core'
    },
    {
      action: {
        href: config.services.plane.url,
        label: t('dashboard.services.plane.action')
      },
      credentials: [
        {
          label: labels.endpoint,
          value: config.services.plane.url
        },
        {
          label: labels.rootName,
          value: config.services.plane.rootName
        },
        {
          label: labels.rootEmail,
          value: config.services.plane.rootEmail
        },
        {
          label: labels.password,
          value: config.services.plane.rootPassword
        },
        {
          label: labels.accessMode,
          value: t('values.directAppLogin')
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
          label: labels.endpoint,
          value: config.services.penpot.url
        },
        {
          label: labels.rootName,
          value: config.services.penpot.rootName
        },
        {
          label: labels.rootEmail,
          value: config.services.penpot.rootEmail
        },
        {
          label: labels.password,
          value: config.services.penpot.rootPassword
        },
        {
          label: labels.accessMode,
          value: t('values.directAppLogin')
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
        href: config.services.hedgeDoc.url,
        label: t('dashboard.services.hedgeDoc.action')
      },
      credentials: [
        {
          label: labels.endpoint,
          value: config.services.hedgeDoc.url
        },
        {
          label: labels.accessMode,
          value: t('values.directAppOnboarding')
        },
        {
          label: labels.usage,
          value: t('values.collaborativeMarkdown')
        }
      ],
      description: t('dashboard.services.hedgeDoc.description'),
      icon: 'workflow',
      id: 'hedgedoc',
      note: t('dashboard.services.hedgeDoc.note'),
      status: t('values.collaborativeNotes'),
      title: t('dashboard.services.hedgeDoc.title'),
      tone: 'core'
    }
  ];
}
