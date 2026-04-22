import { useMemo, useState } from 'react';
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
  const { i18n } = useTranslation();
  const [activeBriefing, setActiveBriefing] = useState<BriefingReference | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLayer = parseDashboardLayer(searchParams.get('layer'));
  const selectedNetworkNodeId = searchParams.get('node');
  const isNetworkMapOpen =
    searchParams.get('map') === networkMapParamValue || Boolean(selectedNetworkNodeId);
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const fixedT = useMemo(() => i18n.getFixedT(activeLanguage), [activeLanguage, i18n]);

  const dashboard = useMemo(() => {
    return config ? createDashboardViewModel(config, fixedT) : null;
  }, [config, fixedT]);

  const networkGraph = useMemo(() => {
    return config ? createNetworkGraphViewModel(config, fixedT) : null;
  }, [config, fixedT]);

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
    dashboard,
    error,
    isNetworkMapOpen,
    isLoading,
    networkGraph,
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
