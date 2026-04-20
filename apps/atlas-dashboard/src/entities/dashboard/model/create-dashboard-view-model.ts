import type { TFunction } from 'i18next';
import type { LabRuntimeConfig } from '@/entities/runtime-config';
import type { DashboardViewModel } from '@/entities/dashboard/model/dashboard-view-model.types';
import { createAiLayer, createAiServices } from './builders/dashboard-ai.builder';
import {
  createCoreServices,
  createFooterCards,
  createNetworkMap
} from './builders/dashboard-core.builder';
import { createCredentialLabels } from './builders/dashboard-credential-labels.builder';
import { createDashboardHero } from './builders/dashboard-hero.builder';
import {
  createWorkbenchLayer,
  createWorkbenches
} from './builders/dashboard-workbench.builder';

/**
 * Converts the gateway runtime payload into the view model consumed by the dashboard.
 */
export function createDashboardViewModel(
  config: LabRuntimeConfig,
  t: TFunction
): DashboardViewModel {
  const credentialLabels = createCredentialLabels(t);

  return {
    aiLayer: createAiLayer(config, t),
    aiServices: createAiServices(config, credentialLabels, t),
    footerCards: createFooterCards(config, t),
    hero: createDashboardHero(config, t),
    networkMap: createNetworkMap(config, t),
    services: createCoreServices(config, credentialLabels, t),
    workbenchLayer: createWorkbenchLayer(config, t),
    workbenches: createWorkbenches(config, credentialLabels, t)
  };
}
