import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useBriefing } from '@/hooks/use-briefing';
import type { BriefingReference } from '@/types/briefing.types';

interface BriefingDialogProps {
  briefing: BriefingReference | null;
  onClose: () => void;
}

/**
 * Shows markdown briefings inside a MUI dialog while preserving gateway-hosted content.
 */
export function BriefingDialog({ briefing, onClose }: BriefingDialogProps) {
  const state = useBriefing(briefing);

  return (
    <Dialog fullWidth maxWidth="md" onClose={onClose} open={Boolean(briefing)}>
      <DialogTitle sx={{ pb: 1.5, pr: 7 }}>
        <Stack spacing={0.75}>
          <Typography color="text.secondary" sx={{ letterSpacing: '0.12em', textTransform: 'uppercase' }} variant="overline">
            atlas briefing
          </Typography>
          <Typography variant="h4">{briefing?.title ?? 'Briefing'}</Typography>
          {briefing ? (
            <Link
              href={briefing.path}
              rel="noreferrer"
              sx={{ alignItems: 'center', display: 'inline-flex', gap: 0.5, width: 'fit-content' }}
              target="_blank"
              underline="hover"
              variant="body2"
            >
              Apri il markdown sorgente
              <LaunchRoundedIcon fontSize="inherit" />
            </Link>
          ) : null}
        </Stack>
        <IconButton
          aria-label="Chiudi briefing"
          onClick={onClose}
          sx={{ position: 'absolute', right: 16, top: 16 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pb: 4, pt: 2 }}>
        {state.isLoading ? (
          <Stack alignItems="center" py={7} spacing={2}>
            <CircularProgress size={28} />
            <Typography color="text.secondary" variant="body2">
              Sto caricando il briefing selezionato.
            </Typography>
          </Stack>
        ) : null}

        {!state.isLoading && state.error ? (
          <Box
            sx={{
              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
              border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.18)}`,
              borderRadius: 3,
              p: 3
            }}
          >
            <Typography color="error.main" variant="body1">
              {state.error}
            </Typography>
          </Box>
        ) : null}

        {!state.isLoading && !state.error ? (
          <Box
            sx={{
              color: 'text.primary',
              '& h1, & h2, & h3, & h4': {
                fontFamily: '"Space Grotesk", sans-serif',
                mt: 3
              },
              '& h1': {
                fontSize: '2.1rem'
              },
              '& h2': {
                fontSize: '1.7rem'
              },
              '& h3': {
                fontSize: '1.35rem'
              },
              '& p': {
                color: 'text.secondary',
                lineHeight: 1.8,
                mb: 2
              },
              '& ul, & ol': {
                color: 'text.secondary',
                mb: 2,
                pl: 3
              },
              '& li': {
                mb: 0.75
              },
              '& code': {
                backgroundColor: alpha('#0b1720', 0.92),
                borderRadius: 1,
                color: '#f6eadb',
                fontFamily: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
                fontSize: '0.92rem',
                px: 0.8,
                py: 0.25
              },
              '& pre': {
                backgroundColor: '#0b1720',
                borderRadius: 3,
                color: '#f6eadb',
                overflowX: 'auto',
                p: 2
              },
              '& pre code': {
                backgroundColor: 'transparent',
                p: 0
              },
              '& blockquote': {
                borderLeft: (theme) => `4px solid ${alpha(theme.palette.primary.main, 0.28)}`,
                color: 'text.secondary',
                m: 0,
                my: 3,
                pl: 2
              },
              '& table': {
                borderCollapse: 'collapse',
                display: 'block',
                mb: 2,
                overflowX: 'auto',
                width: '100%'
              },
              '& th, & td': {
                borderBottom: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                padding: '0.75rem',
                textAlign: 'left'
              },
              '& a': {
                color: 'primary.main'
              }
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.content}</ReactMarkdown>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
