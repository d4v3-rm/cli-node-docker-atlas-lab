import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createDashboardViewModel
} from '@/entities/dashboard';
import { createNetworkGraphViewModel } from '@/entities/network-map';
import { useLabConfig } from '@/entities/runtime-config';
import type { BriefingReference, DashboardLayerView } from '@/shared/types';

export function useDashboardPageState() {
  const { config, error, isLoading } = useLabConfig();
  const { t } = useTranslation();
  const [activeBriefing, setActiveBriefing] = useState<BriefingReference | null>(null);
  const [isNetworkMapOpen, setIsNetworkMapOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<DashboardLayerView>('all');

  return {
    activeBriefing,
    config,
    dashboard: config ? createDashboardViewModel(config, t) : null,
    error,
    isNetworkMapOpen,
    isLoading,
    networkGraph: config ? createNetworkGraphViewModel(config, t) : null,
    selectedLayer,
    setActiveBriefing,
    setIsNetworkMapOpen,
    setSelectedLayer
  };
}
