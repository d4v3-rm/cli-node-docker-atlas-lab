import type { IconType } from 'react-icons';
import type { BriefingReference } from '@/types/briefing.types';

export interface CredentialItem {
  label: string;
  value: string;
}

export interface ActionItem {
  href: string;
  label: string;
}

export interface PillItem {
  icon: IconType;
  label: string;
}

export interface MetricItem {
  label: string;
  value: number;
}

export interface ServiceCardViewModel {
  action: ActionItem;
  credentials: CredentialItem[];
  description: string;
  icon: IconType;
  id: string;
  note?: string;
  status: string;
  title: string;
}

export interface WorkbenchCardViewModel {
  briefing: BriefingReference;
  credentials: CredentialItem[];
  description: string;
  icon: IconType;
  id: string;
  note?: string;
  status: string;
  title: string;
}

export interface FooterCardViewModel {
  body: string;
  id: string;
  label: string;
}

export interface DashboardViewModel {
  accessNotes: string[];
  footerCards: FooterCardViewModel[];
  hero: {
    eyebrow: string;
    metrics: MetricItem[];
    pills: PillItem[];
    summary: string;
    titleLines: string[];
  };
  networkMap: BriefingReference;
  operatingCharter: string[];
  services: ServiceCardViewModel[];
  workbenches: WorkbenchCardViewModel[];
}

export interface HeroSectionProps {
  accessNotes: string[];
  certificateUrl: string;
  eyebrow: string;
  metrics: MetricItem[];
  networkMap: BriefingReference;
  onOpenBriefing: (briefing: BriefingReference) => void;
  operatingCharter: string[];
  pills: PillItem[];
  summary: string;
  titleLines: string[];
}

export interface MetricCardProps {
  metric: MetricItem;
}

export interface SectionHeaderProps {
  body: string;
  kicker: string;
  title: string;
}

export interface ServiceCardProps {
  service: ServiceCardViewModel;
}

export interface WorkbenchCardProps {
  onOpenBriefing: (briefing: BriefingReference) => void;
  workbench: WorkbenchCardViewModel;
}

export interface FooterCardProps {
  card: FooterCardViewModel;
}

export interface BriefingModalProps {
  briefing: BriefingReference | null;
  onClose: () => void;
}
