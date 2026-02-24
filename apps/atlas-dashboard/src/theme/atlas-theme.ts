import { alpha, createTheme } from '@mui/material/styles';

/**
 * Shared MUI theme for the redesigned Atlas Lab dashboard.
 */
export const atlasTheme = createTheme({
  palette: {
    background: {
      default: '#efe7db',
      paper: 'rgba(255, 252, 247, 0.82)'
    },
    error: {
      main: '#b24a3a'
    },
    info: {
      main: '#265d8d'
    },
    primary: {
      dark: '#0b4b46',
      main: '#0f766e'
    },
    secondary: {
      main: '#bb5f18'
    },
    success: {
      main: '#21685d'
    },
    text: {
      primary: '#11212a',
      secondary: '#495a62'
    },
    warning: {
      main: '#a9601e'
    }
  },
  shape: {
    borderRadius: 28
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
          backdropFilter: 'blur(18px)',
          backgroundColor: 'rgba(255, 252, 247, 0.82)',
          border: '1px solid rgba(17, 33, 42, 0.08)',
          boxShadow: '0 24px 70px rgba(17, 33, 42, 0.08)'
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
            'radial-gradient(circle at top left, rgba(15, 118, 110, 0.12), transparent 28%), radial-gradient(circle at 85% 15%, rgba(187, 95, 24, 0.12), transparent 24%), linear-gradient(180deg, #f6f0e8 0%, #efe7db 100%)',
          minHeight: '100vh'
        },
        '#root': {
          minHeight: '100vh'
        },
        '::selection': {
          backgroundColor: alpha('#0f766e', 0.22)
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(255, 252, 247, 0.95)',
          backdropFilter: 'blur(22px)'
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
