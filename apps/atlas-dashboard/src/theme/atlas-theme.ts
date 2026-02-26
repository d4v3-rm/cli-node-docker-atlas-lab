import { alpha, createTheme } from '@mui/material/styles';

/**
 * Shared MUI theme for the redesigned Atlas Lab dashboard.
 */
export const atlasDashboardColors = {
  ai: '#b56a2f',
  canvas: '#edf1ec',
  core: '#0f766e',
  coreDark: '#0a4f4a',
  heroCard: '#163238',
  ink: '#102127',
  neutral: '#5c6870',
  onDark: '#f7faf7',
  panel: '#f8fbf7',
  panelAlt: '#f1f5f2',
  panelMuted: '#e8efea',
  workbench: '#2f5f8a'
} as const;

export const atlasTheme = createTheme({
  palette: {
    background: {
      default: atlasDashboardColors.canvas,
      paper: atlasDashboardColors.panel
    },
    error: {
      main: '#b24a3a'
    },
    info: {
      main: atlasDashboardColors.workbench
    },
    primary: {
      dark: atlasDashboardColors.coreDark,
      main: atlasDashboardColors.core
    },
    secondary: {
      main: atlasDashboardColors.ai
    },
    success: {
      main: '#21685d'
    },
    text: {
      primary: atlasDashboardColors.ink,
      secondary: '#526169'
    },
    warning: {
      main: '#9f5b22'
    }
  },
  shape: {
    borderRadius: 24
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '5.4rem',
      fontWeight: 700,
      letterSpacing: '-0.05em'
    },
    h2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '2.65rem',
      fontWeight: 700,
      letterSpacing: '-0.045em'
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.035em'
    },
    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '1.55rem',
      fontWeight: 700,
      letterSpacing: '-0.03em'
    },
    h5: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '1.25rem',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7
    },
    body2: {
      fontSize: '0.94rem',
      lineHeight: 1.65
    },
    button: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      textTransform: 'none'
    }
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          minHeight: 48,
          paddingInline: '1.1rem'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: atlasDashboardColors.panel,
          border: `1px solid ${alpha(atlasDashboardColors.ink, 0.08)}`,
          boxShadow: `0 18px 42px ${alpha(atlasDashboardColors.coreDark, 0.08)}`
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            `radial-gradient(circle at top left, ${alpha(atlasDashboardColors.core, 0.12)}, transparent 28%), radial-gradient(circle at 85% 15%, ${alpha(atlasDashboardColors.ai, 0.12)}, transparent 24%), linear-gradient(180deg, #f4f7f3 0%, ${atlasDashboardColors.canvas} 100%)`,
          minHeight: '100vh',
          overflowX: 'hidden',
          WebkitFontSmoothing: 'antialiased'
        },
        '#root': {
          minHeight: '100vh'
        },
        '::selection': {
          backgroundColor: alpha(atlasDashboardColors.core, 0.22)
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: atlasDashboardColors.panel
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 600
        }
      }
    }
  }
});
