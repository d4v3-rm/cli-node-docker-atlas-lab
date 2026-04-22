import type { IncomingMessage, ServerResponse } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { parse as parseDotenv } from 'dotenv';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const atlasDashboardRoot = fileURLToPath(new URL('./', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));
const atlasDashboardSourceRoot = resolve(atlasDashboardRoot, 'src');
const labEnvPath = resolve(repositoryRoot, 'env/lab.env');
const runtimeConfigTemplatePath = resolve(
  repositoryRoot,
  'config/gateway/templates/runtime/lab-config.json.template'
);
const contentTemplateRoot = resolve(repositoryRoot, 'config/gateway/templates/content');
const atlasDashboardDevServerPort = 5173;
const atlasDashboardPreviewServerPort = 4173;

/**
 * Builds the Atlas Dashboard from the app workspace while keeping
 * repo-level runtime assets explicit.
 */
export default defineConfig({
  root: atlasDashboardRoot,
  plugins: [react(), atlasDashboardLocalRuntimePlugin()],
  preview: {
    host: '127.0.0.1',
    port: atlasDashboardPreviewServerPort,
    strictPort: true
  },
  build: {
    assetsDir: 'static',
    outDir: resolve(repositoryRoot, '.atlas-dashboard-dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('antd') || id.includes('@ant-design')) {
            return 'antd';
          }

          if (
            id.includes('react-markdown') ||
            id.includes('remark-gfm') ||
            id.includes('mdast') ||
            id.includes('micromark') ||
            id.includes('unist')
          ) {
            return 'markdown';
          }

          return undefined;
        }
      }
    },
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': atlasDashboardSourceRoot
    }
  },
  server: {
    host: '127.0.0.1',
    port: atlasDashboardDevServerPort,
    strictPort: true,
    watch: {
      interval: 120,
      usePolling: shouldUsePollingForDevServer()
    }
  }
});

function atlasDashboardLocalRuntimePlugin(): Plugin {
  const middleware = (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void
  ) => {
    const pathname = new URL(request.url ?? '/', 'http://atlas-dashboard.local').pathname;

    if (pathname === '/runtime/lab-config.json') {
      try {
        writeJson(
          response,
          200,
          createLocalRuntimeConfig(resolveRequestOrigin(request))
        );
      } catch (error) {
        writeJson(response, 500, {
          error:
            error instanceof Error
              ? error.message
              : 'Unable to generate the local runtime configuration.'
        });
      }

      return;
    }

    if (pathname === '/assets/lab.crt') {
      writeText(
        response,
        200,
        [
          'Atlas Dashboard local mode',
          'This is a placeholder served by Vite.',
          'Start Atlas Lab through the gateway to fetch the real certificate.'
        ].join('\n'),
        'application/x-x509-ca-cert'
      );
      return;
    }

    if (pathname.startsWith('/content/')) {
      try {
        const content = loadRenderedContent(pathname, resolveRequestOrigin(request));

        if (content === null) {
          next();
          return;
        }

        writeText(response, 200, content, 'text/markdown; charset=utf-8');
      } catch (error) {
        writeText(
          response,
          500,
          error instanceof Error ? error.message : 'Unable to generate the local briefing.'
        );
      }

      return;
    }

    next();
  };

  return {
    name: 'atlas-dashboard-local-runtime',
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
    configureServer(server) {
      server.middlewares.use(middleware);
    }
  };
}

function createLocalRuntimeConfig(requestOrigin: string) {
  const environment = createTemplateEnvironment(requestOrigin);
  const rendered = renderTemplate(
    readRequiredTextFile(runtimeConfigTemplatePath),
    environment
  );

  return JSON.parse(rendered) as unknown;
}

function loadRenderedContent(pathname: string, requestOrigin: string): string | null {
  const safePath = pathname.replace(/^\/content\//, '');

  if (!safePath.endsWith('.md') || safePath.includes('..')) {
    return null;
  }

  const templatePath = resolve(contentTemplateRoot, `${safePath}.template`);

  if (!existsSync(templatePath)) {
    return null;
  }

  return renderTemplate(
    readRequiredTextFile(templatePath),
    createTemplateEnvironment(requestOrigin)
  );
}

function createTemplateEnvironment(requestOrigin: string): Record<string, string> {
  const environment = parseDotenv(readRequiredTextFile(labEnvPath));
  const normalizedOrigin = requestOrigin.endsWith('/') ? requestOrigin : `${requestOrigin}/`;

  return {
    ...environment,
    ATLAS_AI_LLM_ENABLED: resolveDevBooleanFlag('ATLAS_DASHBOARD_DEV_AI_LLM_ENABLED', true),
    ATLAS_WORKBENCH_ENABLED: resolveDevBooleanFlag(
      'ATLAS_DASHBOARD_DEV_WORKBENCH_ENABLED',
      true
    ),
    LAB_LOCAL_URL: normalizedOrigin
  };
}

function renderTemplate(
  template: string,
  environment: Record<string, string>
): string {
  return template.replace(/\$\{([A-Z0-9_]+)\}/g, (_match, variableName: string) => {
    return environment[variableName] ?? '';
  });
}

function resolveDevBooleanFlag(name: string, fallback: boolean): string {
  const raw = process.env[name];

  if (raw === undefined) {
    return String(fallback);
  }

  return ['1', 'true', 'yes', 'on'].includes(raw.trim().toLowerCase())
    ? 'true'
    : 'false';
}

function shouldUsePollingForDevServer(): boolean {
  const raw = process.env.ATLAS_DASHBOARD_DEV_USE_POLLING;

  if (raw !== undefined) {
    return ['1', 'true', 'yes', 'on'].includes(raw.trim().toLowerCase());
  }

  return process.platform === 'win32';
}

function resolveRequestOrigin(request: IncomingMessage): string {
  const host = request.headers.host ?? `127.0.0.1:${atlasDashboardDevServerPort}`;
  const forwardedProto = request.headers['x-forwarded-proto'];
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto ?? 'http';

  return `${protocol}://${host}`;
}

function readRequiredTextFile(path: string): string {
  return readFileSync(path, 'utf8');
}

function writeJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown
) {
  response.statusCode = statusCode;
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload, null, 2));
}

function writeText(
  response: ServerResponse,
  statusCode: number,
  body: string,
  contentType = 'text/plain; charset=utf-8'
) {
  response.statusCode = statusCode;
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', contentType);
  response.end(body);
}
