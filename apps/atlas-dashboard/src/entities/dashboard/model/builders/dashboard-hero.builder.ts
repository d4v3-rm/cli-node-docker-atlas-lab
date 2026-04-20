import type { TFunction } from 'i18next';
import type { LabRuntimeConfig } from '@/entities/runtime-config';
import type { DashboardHeroViewModel } from '@/entities/dashboard/model/dashboard-view-model.types';

export function createDashboardHero(
  config: LabRuntimeConfig,
  t: TFunction
): DashboardHeroViewModel {
  const aiLlmEnabled = config.features.aiLlmEnabled;
  const workbenchEnabled = config.features.workbenchEnabled;

  return {
    eyebrow: t('dashboard.hero.eyebrow'),
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
    summary: t('dashboard.hero.summary'),
    titleLines: [
      t('dashboard.hero.titleLines.first'),
      t('dashboard.hero.titleLines.second')
    ]
  };
}
