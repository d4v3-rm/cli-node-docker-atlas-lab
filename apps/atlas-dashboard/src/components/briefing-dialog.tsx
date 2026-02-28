import { ExportOutlined, FileTextOutlined, LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Modal, Spin, Typography } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import { useBriefing } from '@/hooks/use-briefing';
import { atlasDashboardPalette } from '@/theme/atlas-theme';
import type { BriefingReference } from '@/types/briefing.types';

const { Link, Paragraph, Text, Title } = Typography;

interface BriefingDialogProps {
  briefing: BriefingReference | null;
  onClose: () => void;
}

const markdownCardStyle = {
  background: atlasDashboardPalette.panelAlt,
  border: `1px solid ${atlasDashboardPalette.line}`,
  borderRadius: 24
} as const;

/**
 * Shows markdown briefings inside an Ant Design modal while preserving gateway-hosted content.
 */
export function BriefingDialog({ briefing, onClose }: BriefingDialogProps) {
  const state = useBriefing(briefing);
  const { t } = useTranslation();

  return (
    <Modal
      centered
      footer={null}
      onCancel={onClose}
      open={Boolean(briefing)}
      style={{
        maxWidth: 980
      }}
      title={null}
      width={980}
      styles={{
        body: {
          background: atlasDashboardPalette.panel,
          border: `1px solid ${atlasDashboardPalette.line}`,
          borderRadius: 32,
          overflow: 'hidden',
          padding: 0
        },
        mask: {
          background: 'rgba(2, 5, 10, 0.88)'
        }
      }}
    >
      <Flex vertical>
        <Flex
          align="flex-start"
          justify="space-between"
          style={{
            borderBottom: `1px solid ${atlasDashboardPalette.line}`,
            gap: 24,
            padding: 32
          }}
        >
          <Flex vertical gap={8} style={{ minWidth: 0 }}>
            <Text
              style={{
                color: atlasDashboardPalette.muted,
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase'
              }}
            >
              {t('briefing.titleEyebrow')}
            </Text>
            <Title
              level={2}
              style={{
                letterSpacing: '-0.05em',
                lineHeight: 0.98,
                margin: 0
              }}
            >
              {briefing?.title ?? t('briefing.fallbackTitle')}
            </Title>
            {briefing ? (
              <Link href={briefing.path} rel="noreferrer" target="_blank">
                <Flex align="center" gap={8}>
                  <Text strong style={{ color: atlasDashboardPalette.core }}>
                    {t('briefing.openSourceMarkdown')}
                  </Text>
                  <ExportOutlined style={{ color: atlasDashboardPalette.core }} />
                </Flex>
              </Link>
            ) : null}
          </Flex>

          <Button onClick={onClose} type="text">
            {t('briefing.close')}
          </Button>
        </Flex>

        <Flex vertical gap={24} style={{ padding: 32 }}>
          {state.isLoading ? (
            <Flex align="center" justify="center" style={{ minHeight: 240 }}>
              <Flex align="center" gap={14} vertical>
                <Spin indicator={<LoadingOutlined spin style={{ color: atlasDashboardPalette.core, fontSize: 28 }} />} />
                <Text style={{ color: atlasDashboardPalette.muted }}>
                  {t('briefing.loading')}
                </Text>
              </Flex>
            </Flex>
          ) : null}

          {!state.isLoading && state.error ? (
            <Alert
              message={state.error}
              showIcon
              style={{
                background: 'rgba(178, 74, 58, 0.08)',
                border: '1px solid rgba(178, 74, 58, 0.18)',
                borderRadius: 20
              }}
              type="error"
            />
          ) : null}

          {!state.isLoading && !state.error ? (
            <Card
              style={markdownCardStyle}
              styles={{
                body: {
                  padding: 28
                }
              }}
            >
              <div
                style={{
                  color: atlasDashboardPalette.ink
                }}
              >
                <ReactMarkdown
                  components={{
                    a: ({ children, href }) => (
                      <Link href={href} rel="noreferrer" target="_blank">
                        {children}
                      </Link>
                    ),
                    blockquote: ({ children }) => (
                      <Card
                        size="small"
                        style={{
                          background: atlasDashboardPalette.bg,
                          border: `1px solid ${atlasDashboardPalette.line}`,
                          borderLeft: `4px solid ${atlasDashboardPalette.core}`,
                          borderRadius: 20,
                          marginBottom: 16
                        }}
                        styles={{
                          body: {
                            padding: 16
                          }
                        }}
                      >
                        <Paragraph
                          style={{
                            color: atlasDashboardPalette.muted,
                            lineHeight: 1.75,
                            margin: 0
                          }}
                        >
                          {children}
                        </Paragraph>
                      </Card>
                    ),
                    code: ({ children }) => (
                      <Text
                        code
                        style={{
                          background: atlasDashboardPalette.hero,
                          borderRadius: 10,
                          color: atlasDashboardPalette.white,
                          fontFamily: '"SFMono-Regular", Consolas, monospace',
                          fontSize: 14,
                          padding: '2px 8px'
                        }}
                      >
                        {children}
                      </Text>
                    ),
                    h1: ({ children }) => (
                      <Title level={1} style={markdownHeadingStyle(34)}>
                        {children}
                      </Title>
                    ),
                    h2: ({ children }) => (
                      <Title level={2} style={markdownHeadingStyle(28)}>
                        {children}
                      </Title>
                    ),
                    h3: ({ children }) => (
                      <Title level={3} style={markdownHeadingStyle(22)}>
                        {children}
                      </Title>
                    ),
                    h4: ({ children }) => (
                      <Title level={4} style={markdownHeadingStyle(18)}>
                        {children}
                      </Title>
                    ),
                    li: ({ children }) => (
                      <li style={{ color: atlasDashboardPalette.muted, marginBottom: 10 }}>
                        <Text style={{ color: atlasDashboardPalette.muted, lineHeight: 1.8 }}>
                          {children}
                        </Text>
                      </li>
                    ),
                    ol: ({ children }) => (
                      <ol
                        style={{
                          color: atlasDashboardPalette.muted,
                          marginBottom: 16,
                          paddingLeft: 22
                        }}
                      >
                        {children}
                      </ol>
                    ),
                    p: ({ children }) => (
                      <Paragraph
                        style={{
                          color: atlasDashboardPalette.muted,
                          lineHeight: 1.85,
                          marginBottom: 16
                        }}
                      >
                        {children}
                      </Paragraph>
                    ),
                    pre: ({ children }) => (
                      <Card
                        size="small"
                        style={{
                          background: atlasDashboardPalette.hero,
                          border: 'none',
                          borderRadius: 20,
                          marginBottom: 16,
                          overflow: 'auto'
                        }}
                        styles={{
                          body: {
                            padding: 18
                          }
                        }}
                      >
                        <Text
                          style={{
                            color: atlasDashboardPalette.white,
                            display: 'block',
                            fontFamily: '"SFMono-Regular", Consolas, monospace',
                            fontSize: 14,
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {children}
                        </Text>
                      </Card>
                    ),
                    table: ({ children }) => (
                      <div style={{ marginBottom: 16, overflowX: 'auto' }}>
                        <table
                          style={{
                            borderCollapse: 'collapse',
                            minWidth: '100%',
                            width: '100%'
                          }}
                        >
                          {children}
                        </table>
                      </div>
                    ),
                    td: ({ children }) => (
                      <td
                        style={{
                          borderBottom: `1px solid ${atlasDashboardPalette.line}`,
                          color: atlasDashboardPalette.muted,
                          padding: '12px 14px',
                          textAlign: 'left'
                        }}
                      >
                        {children}
                      </td>
                    ),
                    th: ({ children }) => (
                      <th
                        style={{
                          borderBottom: `1px solid ${atlasDashboardPalette.line}`,
                          color: atlasDashboardPalette.ink,
                          padding: '12px 14px',
                          textAlign: 'left'
                        }}
                      >
                        {children}
                      </th>
                    ),
                    ul: ({ children }) => (
                      <ul
                        style={{
                          color: atlasDashboardPalette.muted,
                          marginBottom: 16,
                          paddingLeft: 22
                        }}
                      >
                        {children}
                      </ul>
                    )
                  }}
                  remarkPlugins={[remarkGfm]}
                >
                  {state.content}
                </ReactMarkdown>
              </div>
            </Card>
          ) : null}

          {!state.isLoading && !state.error && briefing ? (
            <Flex
              align="center"
              justify="space-between"
              style={{
                borderTop: `1px solid ${atlasDashboardPalette.line}`,
                gap: 16,
                paddingTop: 20
              }}
              wrap="wrap"
            >
              <Flex align="center" gap={10}>
                <FileTextOutlined style={{ color: atlasDashboardPalette.muted }} />
                <Text style={{ color: atlasDashboardPalette.muted }}>
                  {t('briefing.contentServedByRuntime')}
                </Text>
              </Flex>
              <Link href={briefing.path} rel="noreferrer" target="_blank">
                <Flex align="center" gap={8}>
                  <Text strong style={{ color: atlasDashboardPalette.core }}>
                    {t('briefing.openSourceFile')}
                  </Text>
                  <ExportOutlined style={{ color: atlasDashboardPalette.core }} />
                </Flex>
              </Link>
            </Flex>
          ) : null}
        </Flex>
      </Flex>
    </Modal>
  );
}

function markdownHeadingStyle(size: number) {
  return {
    color: atlasDashboardPalette.ink,
    fontSize: size,
    fontWeight: 700,
    letterSpacing: '-0.03em',
    lineHeight: 1.08,
    marginBottom: 16,
    marginTop: 24
  };
}
