import type { ElementType } from 'react';
import { useState } from 'react';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import LanRoundedIcon from '@mui/icons-material/LanRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import PsychologyAltRoundedIcon from '@mui/icons-material/PsychologyAltRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import SchemaRoundedIcon from '@mui/icons-material/SchemaRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import SourceRoundedIcon from '@mui/icons-material/SourceRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Link,
  Stack,
  Typography
} from '@mui/material';
import { BriefingDialog } from '@/components/briefing-dialog';
import { useLabConfig } from '@/hooks/use-lab-config';
import { createDashboardViewModel } from '@/models/dashboard-model';
import type {
  BriefingActionItem,
  DashboardIconKey,
  DashboardTone,
  HeroLinkActionItem,
  ServiceCardViewModel,
  WorkbenchCardViewModel
} from '@/types/dashboard.types';
import type { BriefingReference } from '@/types/briefing.types';

const iconMap: Record<DashboardIconKey, ElementType> = {
  ai: MemoryRoundedIcon,
  certificate: VerifiedRoundedIcon,
  cpp: PrecisionManufacturingRoundedIcon,
  forge: SourceRoundedIcon,
  host: PublicRoundedIcon,
  network: HubRoundedIcon,
  node: CodeRoundedIcon,
  ollama: PsychologyAltRoundedIcon,
  openWebUi: SmartToyRoundedIcon,
  postgres: StorageRoundedIcon,
  route: RouteRoundedIcon,
  secure: LockRoundedIcon,
  spark: AutoAwesomeRoundedIcon,
  terminal: TerminalRoundedIcon,
  workflow: SchemaRoundedIcon
};

const toneStyles: Record<
  DashboardTone,
  {
    accent: string;
    border: string;
    surface: string;
  }
> = {
  ai: {
    accent: '#bb5f18',
    border: alpha('#bb5f18', 0.24),
    surface: alpha('#bb5f18', 0.08)
  },
  core: {
    accent: '#0f766e',
    border: alpha('#0f766e', 0.24),
    surface: alpha('#0f766e', 0.08)
  },
  neutral: {
    accent: '#4c5d62',
    border: alpha('#4c5d62', 0.18),
    surface: alpha('#4c5d62', 0.06)
  },
  workbench: {
    accent: '#265d8d',
    border: alpha('#265d8d', 0.24),
    surface: alpha('#265d8d', 0.08)
  }
};

/**
 * Renders the Atlas Lab control index with a MUI-based command center layout.
 */
export default function App() {
  const { config, error, isLoading } = useLabConfig();
  const [activeBriefing, setActiveBriefing] = useState<BriefingReference | null>(null);

  if (isLoading) {
    return (
      <StatusScreen
        eyebrow="atlas command deck"
        summary="Sto caricando configurazione runtime, layer opzionali e briefing del lab."
        title="Allineamento del deck in corso"
      />
    );
  }

  if (error || !config) {
    return (
      <StatusScreen
        eyebrow="atlas command deck"
        summary={error ?? 'La configurazione runtime del lab non e disponibile.'}
        title="Impossibile inizializzare il deck"
        tone="error"
      />
    );
  }

  const dashboard = createDashboardViewModel(config);

  return (
    <>
      <Container maxWidth="xl" sx={{ position: 'relative', py: { xs: 3, md: 5 }, zIndex: 1 }}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'minmax(0, 1.55fr) minmax(320px, 0.95fr)'
              }
            }}
          >
            <HeroPanel
              certificateUrl={config.assets.certificateUrl}
              eyebrow={dashboard.hero.eyebrow}
              onOpenBriefing={setActiveBriefing}
              pills={dashboard.hero.pills}
              primaryBriefing={dashboard.networkMap}
              quickActions={dashboard.hero.quickActions}
              summary={dashboard.hero.summary}
              titleLines={dashboard.hero.titleLines}
            />

            <Card sx={{ overflow: 'hidden' }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography color="text.secondary" sx={{ letterSpacing: '0.12em', textTransform: 'uppercase' }} variant="overline">
                      live footprint
                    </Typography>
                    <Typography sx={{ maxWidth: '34ch' }} variant="h4">
                      Stato sintetico dei layer che il gateway sta esponendo adesso.
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gap: 2,
                      gridTemplateColumns: {
                        xs: 'repeat(2, minmax(0, 1fr))',
                        sm: 'repeat(4, minmax(0, 1fr))',
                        lg: 'repeat(2, minmax(0, 1fr))'
                      }
                    }}
                  >
                    {dashboard.hero.metrics.map((metric) => (
                      <MetricTile
                        caption={metric.caption}
                        key={metric.label}
                        label={metric.label}
                        value={metric.value}
                      />
                    ))}
                  </Box>

                  <Divider />

                  <Stack spacing={1.5}>
                    <LayerSummaryTile
                      enabled
                      summary="Gitea e n8n restano il piano sempre acceso del lab."
                      title="Core"
                      tone="core"
                    />
                    <LayerSummaryTile
                      enabled={dashboard.aiLayer.enabled}
                      summary={dashboard.aiLayer.summary}
                      title="AI"
                      tone="ai"
                    />
                    <LayerSummaryTile
                      enabled={dashboard.workbenchLayer.enabled}
                      summary={dashboard.workbenchLayer.summary}
                      title="Workbench"
                      tone="workbench"
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }
            }}
          >
            <IntelPanel
              eyebrow="operating doctrine"
              icon="route"
              items={dashboard.operatingCharter}
              title="Come e stato pensato il lab"
              tone="core"
            />
            <IntelPanel
              eyebrow="access notes"
              icon="certificate"
              items={dashboard.accessNotes}
              title="Indicazioni operative e di accesso"
              tone="neutral"
            />
          </Box>

          <SectionBand
            body="Il piano core resta sempre disponibile. Ogni card raccoglie endpoint, credenziali operative e link diretto verso il servizio."
            kicker="service plane"
            title="Servizi Core"
          />

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))'
              }
            }}
          >
            {dashboard.services.map((service) => (
              <OperationalCard
                item={service}
                key={service.id}
                primaryAction={service.action}
                tone={service.tone}
              />
            ))}
          </Box>

          <SectionBand
            body={
              dashboard.aiLayer.enabled
                ? 'Il layer AI e online: il deck ti porta in Open WebUI oppure sulle API di Ollama senza nascondere credenziali o contesto operativo.'
                : 'Il layer AI resta opzionale. Quando e spento il deck lo dichiara chiaramente e ti mostra il comando esatto da usare.'
            }
            kicker="optional plane"
            title="AI Layer"
          />

          <LayerStateCard layer={dashboard.aiLayer} />

          {dashboard.aiLayer.enabled ? (
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))'
                }
              }}
            >
              {dashboard.aiServices.map((service) => (
                <OperationalCard
                  item={service}
                  key={service.id}
                  primaryAction={service.action}
                  tone={service.tone}
                />
              ))}
            </Box>
          ) : null}

          <SectionBand
            body={
              dashboard.workbenchLayer.enabled
                ? 'Gli ambienti sono attivi: puoi entrare direttamente nel workspace o aprire prima il briefing dedicato per capire rete, credenziali e strumenti.'
                : 'Gli ambienti restano staccati dal core. Li abiliti solo quando ti servono code-server o Postgres condiviso.'
            }
            kicker="workspace plane"
            title="Workbench Layer"
          />

          <LayerStateCard layer={dashboard.workbenchLayer} />

          {dashboard.workbenchLayer.enabled ? (
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                  xl: 'repeat(3, minmax(0, 1fr))'
                }
              }}
            >
              {dashboard.workbenches.map((workbench) => (
                <OperationalCard
                  briefing={workbench.briefing}
                  item={workbench}
                  key={workbench.id}
                  onOpenBriefing={setActiveBriefing}
                  primaryAction={workbench.action}
                  tone={workbench.tone}
                />
              ))}
            </Box>
          ) : null}

          <SectionBand
            body="Quattro segnali rapidi per routing, persistenza, uso consigliato e segmentazione dei layer."
            kicker="atlas signals"
            title="Indicazioni di chiusura"
          />

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(4, minmax(0, 1fr))'
              }
            }}
          >
            {dashboard.footerCards.map((card) => (
              <InsightCard
                body={card.body}
                icon={card.icon}
                key={card.id}
                label={card.label}
              />
            ))}
          </Box>
        </Stack>
      </Container>

      <BriefingDialog briefing={activeBriefing} onClose={() => setActiveBriefing(null)} />
    </>
  );
}

interface StatusScreenProps {
  eyebrow: string;
  summary: string;
  title: string;
  tone?: 'default' | 'error';
}

function StatusScreen({ eyebrow, summary, title, tone = 'default' }: StatusScreenProps) {
  const theme = useTheme();
  const accent = tone === 'error' ? theme.palette.error.main : theme.palette.primary.main;

  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        overflow: 'hidden',
        px: 2,
        position: 'relative'
      }}
    >
      <Card
        sx={{
          maxWidth: 680,
          position: 'relative',
          width: '100%',
          zIndex: 1
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2}>
            <Typography color="text.secondary" sx={{ letterSpacing: '0.14em', textTransform: 'uppercase' }} variant="overline">
              {eyebrow}
            </Typography>
            <Typography sx={{ lineHeight: 1.02, maxWidth: '16ch' }} variant="h2">
              {title}
            </Typography>
            <Typography color="text.secondary" variant="body1">
              {summary}
            </Typography>
            <Box
              sx={{
                backgroundColor: alpha(accent, 0.12),
                border: `1px solid ${alpha(accent, 0.22)}`,
                borderRadius: 999,
                color: accent,
                display: 'inline-flex',
                px: 2,
                py: 0.75,
                width: 'fit-content'
              }}
            >
              <Typography sx={{ fontWeight: 700 }} variant="caption">
                atlas lab runtime
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

interface HeroPanelProps {
  certificateUrl: string;
  eyebrow: string;
  onOpenBriefing: (briefing: BriefingReference) => void;
  pills: {
    icon: DashboardIconKey;
    label: string;
    tone: DashboardTone;
  }[];
  primaryBriefing: BriefingReference;
  quickActions: (HeroLinkActionItem | BriefingActionItem)[];
  summary: string;
  titleLines: string[];
}

function HeroPanel({
  certificateUrl,
  eyebrow,
  onOpenBriefing,
  pills,
  primaryBriefing,
  quickActions,
  summary,
  titleLines
}: HeroPanelProps) {
  return (
    <Card
      sx={{
        isolation: 'isolate',
        minHeight: { xs: 'auto', lg: 460 },
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          background:
            'linear-gradient(135deg, #0b4b46 0%, #0f766e 54%, #b76523 100%)',
          inset: 0,
          position: 'absolute'
        }}
      />
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.4fr) minmax(280px, 0.9fr)' },
          minHeight: '100%',
          p: { xs: 3, md: 4 },
          position: 'relative',
          zIndex: 1
        }}
      >
        <Stack spacing={3}>
          <Typography sx={{ color: 'rgba(255,255,255,0.72)', letterSpacing: '0.16em', textTransform: 'uppercase' }} variant="overline">
            {eyebrow}
          </Typography>

          <Stack spacing={1}>
            {titleLines.map((line) => (
              <Typography
                key={line}
                sx={{
                  color: 'common.white',
                  fontSize: { xs: '2.9rem', sm: '3.8rem', md: '4.8rem' },
                  lineHeight: 0.96
                }}
                variant="h1"
              >
                {line}
              </Typography>
            ))}
          </Stack>

          <Typography sx={{ color: 'rgba(255,255,255,0.84)', maxWidth: '42ch' }} variant="h6">
            {summary}
          </Typography>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {pills.map((pill) => {
              const Icon = iconMap[pill.icon];
              const tone = toneStyles[pill.tone];

              return (
                <Chip
                  icon={<Icon />}
                  key={pill.label}
                  label={pill.label}
                  sx={{
                    backgroundColor: alpha('#ffffff', 0.14),
                    border: `1px solid ${alpha('#ffffff', 0.16)}`,
                    color: 'common.white',
                    '& .MuiChip-icon': {
                      color: 'common.white'
                    }
                  }}
                />
              );
            })}
          </Stack>
        </Stack>

        <Card
          sx={{
            alignSelf: 'stretch',
            backgroundColor: 'rgba(8, 32, 40, 0.76)',
            borderColor: alpha('#ffffff', 0.16),
            color: 'common.white'
          }}
        >
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%', p: 3 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.72)', letterSpacing: '0.14em', textTransform: 'uppercase' }} variant="overline">
              quick access
            </Typography>
            <Typography sx={{ maxWidth: '18ch' }} variant="h4">
              Apri subito il briefing topologico o il certificato del gateway.
            </Typography>
            <Stack spacing={1.5}>
              <Button
                color="inherit"
                endIcon={<OpenInNewRoundedIcon />}
                onClick={() => onOpenBriefing(primaryBriefing)}
                sx={{
                  backgroundColor: alpha('#ffffff', 0.18),
                  justifyContent: 'space-between',
                  px: 2.25
                }}
                variant="contained"
              >
                Apri network map
              </Button>
              <Button
                color="inherit"
                component="a"
                endIcon={<DownloadRoundedIcon />}
                href={certificateUrl}
                rel="noreferrer"
                sx={{
                  backgroundColor: alpha('#ffffff', 0.12),
                  borderColor: alpha('#ffffff', 0.18),
                  justifyContent: 'space-between',
                  px: 2.25
                }}
                target="_blank"
                variant="outlined"
              >
                Scarica certificato
              </Button>
            </Stack>

            <Divider sx={{ borderColor: alpha('#ffffff', 0.16) }} />

            <Stack spacing={1.5}>
              {quickActions.map((action) => {
                const Icon = iconMap[action.icon];

                return (
                  <Card
                    key={action.label}
                    sx={{
                      backgroundColor: alpha('#ffffff', 0.12),
                      borderColor: alpha('#ffffff', 0.14),
                      color: 'inherit'
                    }}
                    variant="outlined"
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack alignItems="center" direction="row" spacing={1.5}>
                        <Avatar
                          sx={{
                            backgroundColor: alpha('#ffffff', 0.12),
                            color: 'common.white',
                            height: 40,
                            width: 40
                          }}
                        >
                          <Icon fontSize="small" />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700 }} variant="body2">
                            {action.label}
                          </Typography>
                          {'href' in action ? (
                            <Link
                              color="inherit"
                              href={action.href}
                              rel="noreferrer"
                              sx={{ textDecorationColor: alpha('#ffffff', 0.32) }}
                              target="_blank"
                              underline="hover"
                              variant="body2"
                            >
                              {action.description}
                            </Link>
                          ) : (
                            <Link
                              component="button"
                              onClick={() => onOpenBriefing(action.briefing)}
                              sx={{ color: 'inherit', textAlign: 'left', textDecorationColor: alpha('#ffffff', 0.32) }}
                              underline="hover"
                              variant="body2"
                            >
                              {action.description}
                            </Link>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Card>
  );
}

interface MetricTileProps {
  caption: string;
  label: string;
  value: number;
}

function MetricTile({ caption, label, value }: MetricTileProps) {
  return (
    <Box
      sx={{
        backgroundColor: '#fffaf5',
        border: (theme) => `1px solid ${alpha(theme.palette.primary.dark, 0.08)}`,
        borderRadius: 3,
        minHeight: 128,
        p: 2.25
      }}
    >
      <Stack height="100%" justifyContent="space-between" spacing={1.5}>
        <Typography color="text.secondary" sx={{ letterSpacing: '0.12em', textTransform: 'uppercase' }} variant="caption">
          {label}
        </Typography>
        <Typography variant="h2">{value}</Typography>
        <Typography color="text.secondary" variant="body2">
          {caption}
        </Typography>
      </Stack>
    </Box>
  );
}

interface LayerSummaryTileProps {
  enabled: boolean;
  summary: string;
  title: string;
  tone: DashboardTone;
}

function LayerSummaryTile({ enabled, summary, title, tone }: LayerSummaryTileProps) {
  const palette = toneStyles[tone];
  const Icon = tone === 'ai' ? MemoryRoundedIcon : tone === 'workbench' ? TerminalRoundedIcon : BoltRoundedIcon;

  return (
    <Box
      sx={{
        alignItems: 'flex-start',
        backgroundColor: palette.surface,
        border: `1px solid ${palette.border}`,
        borderRadius: 3,
        display: 'flex',
        gap: 1.5,
        p: 2
      }}
    >
      <Avatar
        sx={{
          backgroundColor: alpha(palette.accent, 0.14),
          color: palette.accent,
          height: 42,
          width: 42
        }}
      >
        <Icon fontSize="small" />
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1} sx={{ mb: 0.5 }}>
          <Typography variant="subtitle1">{title}</Typography>
          <Chip
            label={enabled ? 'active' : 'optional'}
            size="small"
            sx={{
              backgroundColor: alpha(palette.accent, 0.14),
              color: palette.accent
            }}
          />
        </Stack>
        <Typography color="text.secondary" variant="body2">
          {summary}
        </Typography>
      </Box>
    </Box>
  );
}

interface IntelPanelProps {
  eyebrow: string;
  icon: DashboardIconKey;
  items: string[];
  title: string;
  tone: DashboardTone;
}

function IntelPanel({ eyebrow, icon, items, title, tone }: IntelPanelProps) {
  const palette = toneStyles[tone];
  const Icon = iconMap[icon];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2.5}>
          <Stack alignItems="center" direction="row" spacing={1.5}>
            <Avatar
              sx={{
                backgroundColor: palette.surface,
                color: palette.accent,
                height: 52,
                width: 52
              }}
            >
              <Icon />
            </Avatar>
            <Box>
              <Typography color="text.secondary" sx={{ letterSpacing: '0.12em', textTransform: 'uppercase' }} variant="overline">
                {eyebrow}
              </Typography>
              <Typography variant="h4">{title}</Typography>
            </Box>
          </Stack>

          <Stack spacing={1.5}>
            {items.map((item) => (
              <Box
                key={item}
                sx={{
                  alignItems: 'flex-start',
                  display: 'grid',
                  gap: 1.25,
                  gridTemplateColumns: 'auto 1fr'
                }}
              >
                <Box
                  sx={{
                    backgroundColor: palette.surface,
                    borderRadius: '50%',
                    color: palette.accent,
                    height: 9,
                    mt: 1,
                    width: 9
                  }}
                />
                <Typography color="text.secondary" variant="body1">
                  {item}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

interface SectionBandProps {
  body: string;
  kicker: string;
  title: string;
}

function SectionBand({ body, kicker, title }: SectionBandProps) {
  return (
    <Box
      sx={{
        alignItems: 'end',
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 0.95fr) minmax(0, 1.05fr)' }
      }}
    >
      <Box>
        <Typography color="text.secondary" sx={{ letterSpacing: '0.14em', textTransform: 'uppercase' }} variant="overline">
          {kicker}
        </Typography>
        <Typography variant="h2">{title}</Typography>
      </Box>
      <Typography color="text.secondary" sx={{ maxWidth: { md: '52ch' } }} variant="body1">
        {body}
      </Typography>
    </Box>
  );
}

interface LayerStateCardProps {
  layer: {
    activationCommand: string;
    capabilities: { icon: DashboardIconKey; label: string }[];
    description: string;
    enabled: boolean;
    summary: string;
    title: string;
    tone: DashboardTone;
  };
}

function LayerStateCard({ layer }: LayerStateCardProps) {
  const palette = toneStyles[layer.tone];
  const Icon = layer.tone === 'ai' ? MemoryRoundedIcon : TerminalRoundedIcon;

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${alpha(palette.accent, 0.12)} 0%, #fffaf3 100%)`,
        borderColor: palette.border
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)' }
          }}
        >
          <Stack spacing={2.5}>
            <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1.5}>
              <Avatar
                sx={{
                  backgroundColor: alpha(palette.accent, 0.16),
                  color: palette.accent,
                  height: 56,
                  width: 56
                }}
              >
                <Icon />
              </Avatar>
              <Box>
                <Typography variant="h4">{layer.title}</Typography>
                <Typography color="text.secondary" variant="body1">
                  {layer.description}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={1}>
              {layer.capabilities.map((capability) => {
                const CapabilityIcon = iconMap[capability.icon];

                return (
                  <Chip
                    icon={<CapabilityIcon />}
                    key={capability.label}
                    label={capability.label}
                    sx={{
                      backgroundColor: alpha(palette.accent, 0.12),
                      color: palette.accent
                    }}
                  />
                );
              })}
            </Stack>
          </Stack>

          <Card
            sx={{
              alignSelf: 'stretch',
              backgroundColor: '#fffaf6',
              borderColor: palette.border
            }}
            variant="outlined"
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', p: 3 }}>
              <Stack alignItems="center" direction="row" gap={1} justifyContent="space-between">
                <Typography variant="subtitle1">
                  {layer.enabled ? 'Layer attivo' : 'Layer non attivo'}
                </Typography>
                <Chip
                  label={layer.enabled ? 'online' : 'manual activation'}
                  size="small"
                  sx={{
                    backgroundColor: alpha(palette.accent, 0.12),
                    color: palette.accent
                  }}
                />
              </Stack>
              <Typography color="text.secondary" variant="body2">
                {layer.summary}
              </Typography>
              {!layer.enabled ? (
                <Box
                  component="code"
                  sx={{
                    backgroundColor: alpha('#0b1720', 0.92),
                    borderRadius: 3,
                    color: '#f6eadb',
                    display: 'block',
                    fontFamily: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
                    fontSize: '0.95rem',
                    p: 2
                  }}
                >
                  {layer.activationCommand}
                </Box>
              ) : null}
            </CardContent>
          </Card>
        </Box>
      </CardContent>
    </Card>
  );
}

interface OperationalCardProps {
  briefing?: BriefingReference;
  item: ServiceCardViewModel | WorkbenchCardViewModel;
  onOpenBriefing?: (briefing: BriefingReference) => void;
  primaryAction?: {
    href: string;
    label: string;
  };
  tone: DashboardTone;
}

function OperationalCard({
  briefing,
  item,
  onOpenBriefing,
  primaryAction,
  tone
}: OperationalCardProps) {
  const palette = toneStyles[tone];
  const Icon = iconMap[item.icon];

  return (
    <Card sx={{ height: '100%', overflow: 'hidden' }}>
      <Box
        sx={{
          alignItems: 'center',
          background: `linear-gradient(135deg, ${alpha(palette.accent, 0.16)} 0%, ${alpha('#ffffff', 0)} 100%)`,
          borderBottom: `1px solid ${palette.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          px: 3,
          py: 2.25
        }}
      >
        <Stack alignItems="center" direction="row" spacing={1.5}>
          <Avatar
            sx={{
              backgroundColor: alpha(palette.accent, 0.14),
              color: palette.accent,
              height: 52,
              width: 52
            }}
          >
            <Icon />
          </Avatar>
          <Box>
            <Typography variant="h5">{item.title}</Typography>
            <Typography color="text.secondary" variant="body2">
              {item.status}
            </Typography>
          </Box>
        </Stack>
        <Chip
          label={tone}
          size="small"
          sx={{
            backgroundColor: alpha(palette.accent, 0.12),
            color: palette.accent,
            textTransform: 'capitalize'
          }}
        />
      </Box>

      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
        <Typography color="text.secondary" variant="body1">
          {item.description}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }
          }}
        >
          {item.credentials.map((credential) => (
            <Box
              key={`${item.id}-${credential.label}`}
              sx={{
                backgroundColor: '#fffaf5',
                border: `1px solid ${alpha(palette.accent, 0.12)}`,
                borderRadius: 3,
                minHeight: 84,
                p: 2
              }}
            >
              <Typography color="text.secondary" sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }} variant="caption">
                {credential.label}
              </Typography>
              <Typography
                sx={{
                  fontFamily:
                    credential.value.includes(':') || credential.value.includes('@')
                      ? '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace'
                      : undefined,
                  mt: 0.75,
                  overflowWrap: 'anywhere'
                }}
                variant="body2"
              >
                {credential.value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25}>
          {primaryAction ? (
            <Button
              component="a"
              endIcon={<OpenInNewRoundedIcon />}
              href={primaryAction.href}
              rel="noreferrer"
              sx={{ justifyContent: 'space-between' }}
              target="_blank"
              variant="contained"
            >
              {primaryAction.label}
            </Button>
          ) : null}

          {briefing && onOpenBriefing ? (
            <Button
              onClick={() => onOpenBriefing(briefing)}
              startIcon={<LanRoundedIcon />}
              variant={primaryAction ? 'outlined' : 'contained'}
            >
              Apri briefing
            </Button>
          ) : null}
        </Stack>

        {item.note ? (
          <Box
            sx={{
              backgroundColor: alpha(palette.accent, 0.08),
              borderLeft: `4px solid ${palette.accent}`,
              borderRadius: 2,
              p: 2
            }}
          >
            <Typography color="text.secondary" variant="body2">
              {item.note}
            </Typography>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface InsightCardProps {
  body: string;
  icon: DashboardIconKey;
  label: string;
}

function InsightCard({ body, icon, label }: InsightCardProps) {
  const Icon = iconMap[icon];
  const palette = toneStyles.neutral;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', p: 3 }}>
        <Avatar
          sx={{
            backgroundColor: palette.surface,
            color: palette.accent,
            height: 48,
            width: 48
          }}
        >
          <Icon />
        </Avatar>
        <Typography sx={{ letterSpacing: '0.12em', textTransform: 'uppercase' }} variant="overline">
          {label}
        </Typography>
        <Typography color="text.secondary" variant="body1">
          {body}
        </Typography>
      </CardContent>
    </Card>
  );
}
