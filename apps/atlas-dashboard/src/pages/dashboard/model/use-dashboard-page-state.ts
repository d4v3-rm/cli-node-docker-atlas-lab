import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  createDashboardViewModel
} from '@/entities/dashboard';
import { createNetworkGraphViewModel } from '@/entities/network-map';
import { useLabConfig } from '@/entities/runtime-config';
import type { BriefingReference, DashboardLayerView } from '@/shared/types';

const dashboardLayerParams: DashboardLayerView[] = ['all', 'core', 'ai', 'workbench'];
const networkMapParamValue = 'network';

export function useDashboardPageState() {
  const { config, error, isLoading } = useLabConfig();
  const { t } = useTranslation();
  const [activeBriefing, setActiveBriefing] = useState<BriefingReference | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLayer = parseDashboardLayer(searchParams.get('layer'));
  const selectedNetworkNodeId = searchParams.get('node');
  const isNetworkMapOpen =
    searchParams.get('map') === networkMapParamValue || Boolean(selectedNetworkNodeId);

  const updateSearchState = (
    updates: Record<'layer' | 'map' | 'node', string | null>,
    replace = false
  ) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextSearchParams.set(key, value);
        return;
      }

      nextSearchParams.delete(key);
    });

    setSearchParams(nextSearchParams, { replace });
  };

  const setSelectedLayer = (nextLayer: DashboardLayerView) => {
    updateSearchState(
      {
        layer: nextLayer,
        map: searchParams.get('map'),
        node: selectedNetworkNodeId
      }
    );
  };

  const setIsNetworkMapOpen = (nextOpen: boolean) => {
    updateSearchState(
      {
        layer: searchParams.get('layer'),
        map: nextOpen ? networkMapParamValue : null,
        node: nextOpen ? selectedNetworkNodeId ?? 'gateway' : null
      }
    );
  };

  const setSelectedNetworkNodeId = (nodeId: string) => {
    updateSearchState(
      {
        layer: searchParams.get('layer'),
        map: networkMapParamValue,
        node: nodeId
      },
      true
    );
  };

  return {
    activeBriefing,
    config,
    dashboard: config ? createDashboardViewModel(config, t) : null,
    error,
    isNetworkMapOpen,
    isLoading,
    networkGraph: config ? createNetworkGraphViewModel(config, t) : null,
    selectedNetworkNodeId,
    selectedLayer,
    setActiveBriefing,
    setIsNetworkMapOpen,
    setSelectedNetworkNodeId,
    setSelectedLayer
  };
}

function parseDashboardLayer(value: string | null): DashboardLayerView {
  if (value && dashboardLayerParams.includes(value as DashboardLayerView)) {
    return value as DashboardLayerView;
  }

  return 'all';
}
