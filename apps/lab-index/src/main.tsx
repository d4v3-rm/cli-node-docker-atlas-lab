import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import { atlasTheme } from '@/theme/atlas-theme';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={atlasTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
