import type { BriefingReference } from '@/shared/types';

export type DashboardIconKey =
  | 'ai'
  | 'book'
  | 'certificate'
  | 'forge'
  | 'host'
  | 'network'
  | 'node'
  | 'ollama'
  | 'openWebUi'
  | 'postgres'
  | 'route'
  | 'secure'
  | 'spark'
  | 'terminal'
  | 'workflow';

export type DashboardTone = 'ai' | 'core' | 'neutral' | 'workbench';

export interface CredentialItem {
  concealed?: boolean;
  label: string;
  value: string;
}

export interface LinkActionItem {
  href: string;
  label: string;
}

export interface PillItem {
  icon: DashboardIconKey;
  label: string;
  tone: DashboardTone;
}

export interface ServiceCardViewModel {
  action: LinkActionItem;
  briefing?: BriefingReference;
  credentials: CredentialItem[];
  description: string;
  icon: DashboardIconKey;
  id: string;
  note?: string;
  status: string;
  title: string;
  tone: DashboardTone;
}

export interface WorkbenchCardViewModel {
  action?: LinkActionItem;
  briefing: BriefingReference;
  credentials: CredentialItem[];
  description: string;
  icon: DashboardIconKey;
  id: string;
  note?: string;
  status: string;
  title: string;
  tone: DashboardTone;
}

export interface LayerCapability {
  icon: DashboardIconKey;
  label: string;
}

export interface OptionalLayerViewModel {
  activationCommand: string;
  capabilities: LayerCapability[];
  description: string;
  enabled: boolean;
  summary: string;
  title: string;
  tone: DashboardTone;
}

export interface DashboardHeroViewModel {
  eyebrow: string;
  pills: PillItem[];
  summary: string;
  titleLines: string[];
}

export interface DashboardViewModel {
  aiLayer: OptionalLayerViewModel;
  aiServices: ServiceCardViewModel[];
  hero: DashboardHeroViewModel;
  networkMap: BriefingReference;
  services: ServiceCardViewModel[];
  workbenchLayer: OptionalLayerViewModel;
  workbenches: WorkbenchCardViewModel[];
}
