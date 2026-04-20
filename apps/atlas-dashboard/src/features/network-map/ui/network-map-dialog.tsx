import { CloseOutlined, ExportOutlined } from '@ant-design/icons';
import { Button, Flex, Tag, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { dashboardToneStyles } from '@/entities/dashboard';
import type { NetworkGraphViewModel } from '@/entities/network-map';
import { useNetworkMapScene } from '@/features/network-map/model/use-network-map-scene';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';
import { overlineStyle } from '@/shared/ui';
import type { BriefingReference } from '@/shared/types';

const { Paragraph, Text, Title, Link } = Typography;

interface NetworkMapDialogProps {
  graph: NetworkGraphViewModel;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
  open: boolean;
  selectedNodeId: string | null;
  source: BriefingReference;
}

export function NetworkMapDialog({
  graph,
  onClose,
  onSelectNode,
  open,
  selectedNodeId,
  source
}: NetworkMapDialogProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const nextSelectedNodeId =
      selectedNodeId && graph.nodes.some((node) => node.id === selectedNodeId)
        ? selectedNodeId
        : graph.nodes[0]?.id;

    if (nextSelectedNodeId && nextSelectedNodeId !== selectedNodeId) {
      onSelectNode(nextSelectedNodeId);
    }
  }, [graph.nodes, onSelectNode, open, selectedNodeId]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  useNetworkMapScene({
    containerRef,
    graph,
    onSelectNode,
    open,
    selectedNodeId
  });

  const selectedNode = useMemo(() => {
    if (selectedNodeId) {
      return graph.nodes.find((node) => node.id === selectedNodeId) ?? graph.nodes[0];
    }

    return graph.nodes[0];
  }, [graph.nodes, selectedNodeId]);

  const connectedNodes = useMemo(() => {
    if (!selectedNode) {
      return [];
    }

    const ids = graph.links.reduce<string[]>((collection, link) => {
      if (link.sourceId === selectedNode.id) {
        collection.push(link.targetId);
      }

      if (link.targetId === selectedNode.id) {
        collection.push(link.sourceId);
      }

      return collection;
    }, []);

    return Array.from(new Set(ids))
      .map((nodeId) => graph.nodes.find((node) => node.id === nodeId))
      .filter((node): node is NonNullable<typeof node> => Boolean(node));
  }, [graph.links, graph.nodes, selectedNode]);

  if (!open || !isMounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      aria-modal="true"
      role="dialog"
      style={{
        background: 'rgba(2, 5, 10, 0.96)',
        inset: 0,
        position: 'fixed',
        zIndex: 1200
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: atlasDashboardPalette.bg,
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          width: '100%'
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <Flex
          style={{
            height: '100%',
            overflow: 'hidden',
            position: 'relative',
            width: '100%'
          }}
        >
          <div
            ref={containerRef}
            style={{
              height: '100%',
              inset: 0,
              minHeight: '100vh',
              overflow: 'hidden',
              position: 'absolute',
              width: '100%'
            }}
          />

          <Flex
            align="flex-start"
            gap={18}
            justify="space-between"
            style={floatingPanelStyle({
              left: 24,
              maxWidth: 'min(620px, calc(100vw - 48px))',
              top: 24
            })}
            wrap="wrap"
          >
            <Flex flex={1} vertical gap={8} style={{ minWidth: 280 }}>
              <Text style={overlineStyle}>{t('networkMapDialog.eyebrow')}</Text>
              <Title
                level={2}
                style={{
                  color: atlasDashboardPalette.white,
                  letterSpacing: '-0.05em',
                  margin: 0,
                  maxWidth: 560
                }}
              >
                {graph.title}
              </Title>
              <Paragraph
                style={{
                  color: atlasDashboardPalette.muted,
                  fontSize: 16,
                  lineHeight: 1.8,
                  margin: 0,
                  maxWidth: 560
                }}
              >
                {graph.summary}
              </Paragraph>
            </Flex>

            <Flex gap={10} wrap="wrap">
              <Link href={source.path} rel="noreferrer" target="_blank">
                <Button icon={<ExportOutlined />} size="large" type="text">
                  {t('networkMapDialog.openSource')}
                </Button>
              </Link>
              <Button
                icon={<CloseOutlined />}
                onClick={onClose}
                size="large"
                type="text"
              >
                {t('briefing.close')}
              </Button>
            </Flex>
          </Flex>

          <Flex
            gap={12}
            style={{
              position: 'absolute',
              right: 24,
              top: 132,
              zIndex: 2
            }}
            wrap="wrap"
          >
            {graph.stats.map((stat) => {
              const palette = dashboardToneStyles[stat.tone];

              return (
                <Flex
                  key={stat.id}
                  style={{
                    background: atlasDashboardPalette.panelAlt,
                    borderRadius: 22,
                    minWidth: 120,
                    padding: '12px 14px'
                  }}
                  vertical
                >
                  <Text style={{ ...overlineStyle, color: palette.accent }}>{stat.label}</Text>
                  <Title
                    level={4}
                    style={{
                      color: atlasDashboardPalette.white,
                      letterSpacing: '-0.05em',
                      margin: 0
                    }}
                  >
                    {stat.value}
                  </Title>
                </Flex>
              );
            })}
          </Flex>

          {selectedNode ? (
            <Flex
              gap={14}
              style={floatingPanelStyle({
                bottom: 24,
                left: 24,
                maxWidth: 'min(380px, calc(100vw - 48px))'
              })}
              vertical
            >
              <Text style={overlineStyle}>{t('networkMapDialog.selectionEyebrow')}</Text>
              <Flex align="center" gap={10} justify="space-between" wrap="wrap">
                <Title
                  level={3}
                  style={{
                    color: atlasDashboardPalette.white,
                    letterSpacing: '-0.05em',
                    margin: 0
                  }}
                >
                  {selectedNode.title}
                </Title>
                <Tag
                  color={dashboardToneStyles[selectedNode.tone].accent}
                  style={{
                    background: atlasDashboardPalette.panel,
                    fontWeight: 700,
                    marginInlineEnd: 0
                  }}
                >
                  {selectedNode.active
                    ? t('networkMapDialog.statusActive')
                    : t('networkMapDialog.statusOptional')}
                </Tag>
              </Flex>
              <Paragraph
                style={{
                  color: atlasDashboardPalette.muted,
                  lineHeight: 1.8,
                  margin: 0
                }}
              >
                {selectedNode.description}
              </Paragraph>

              <Flex vertical gap={8}>
                <Text style={overlineStyle}>{t('networkMapDialog.labelsTitle')}</Text>
                <Flex gap={8} wrap="wrap">
                  {selectedNode.labels.map((label) => (
                    <Tag
                      key={`${selectedNode.id}-${label}`}
                      style={{
                        background: atlasDashboardPalette.panel,
                        color: atlasDashboardPalette.white,
                        fontWeight: 600,
                        marginInlineEnd: 0,
                        paddingInline: 12,
                        paddingBlock: 6
                      }}
                    >
                      {label}
                    </Tag>
                  ))}
                </Flex>
              </Flex>

              <Flex vertical gap={8}>
                <Text style={overlineStyle}>{t('networkMapDialog.connectionsTitle')}</Text>
                <Flex gap={8} wrap="wrap">
                  {connectedNodes.map((node) => (
                    <Tag
                      key={`${selectedNode.id}-${node.id}`}
                      color={dashboardToneStyles[node.tone].accent}
                      style={{
                        background: atlasDashboardPalette.panel,
                        fontWeight: 600,
                        marginInlineEnd: 0,
                        paddingInline: 12,
                        paddingBlock: 6
                      }}
                    >
                      {node.title}
                    </Tag>
                  ))}
                </Flex>
              </Flex>
            </Flex>
          ) : null}

          <Flex
            gap={12}
            style={floatingPanelStyle({
              bottom: 24,
              maxWidth: 'min(420px, calc(100vw - 48px))',
              right: 24
            })}
            vertical
          >
            <Text style={overlineStyle}>{t('networkMapDialog.legendTitle')}</Text>
            <Flex gap={8} wrap="wrap">
              {(['neutral', 'core', 'ai', 'workbench'] as const).map((tone) => (
                <Tag
                  color={dashboardToneStyles[tone].accent}
                  key={tone}
                  style={{
                    background: atlasDashboardPalette.panel,
                    fontWeight: 700,
                    marginInlineEnd: 0,
                    paddingInline: 12,
                    paddingBlock: 6
                  }}
                >
                  {tone === 'neutral'
                    ? t('networkMapDialog.legend.edge')
                    : tone === 'core'
                      ? t('networkMapDialog.legend.core')
                      : tone === 'ai'
                        ? t('networkMapDialog.legend.ai')
                        : t('networkMapDialog.legend.workbench')}
                </Tag>
              ))}
            </Flex>
            <Paragraph
              style={{
                color: atlasDashboardPalette.muted,
                lineHeight: 1.8,
                margin: 0
              }}
            >
              {graph.instructions}
            </Paragraph>
          </Flex>
        </Flex>
      </div>
    </div>,
    document.body
  );
}

function floatingPanelStyle(
  position: Partial<Record<'bottom' | 'left' | 'right' | 'top', number>> & {
    maxWidth?: string;
  }
) {
  return {
    background: atlasDashboardPalette.panelAlt,
    borderRadius: 28,
    padding: 20,
    position: 'absolute' as const,
    zIndex: 2,
    ...position
  };
}
