import { z } from 'zod';
import i18n from '@/shared/config/i18n';

const nonEmptyString = z.string().min(1);

const namedAccountSchema = z.object({
  rootEmail: nonEmptyString,
  rootName: nonEmptyString,
  rootPassword: nonEmptyString,
  url: nonEmptyString
});

const urlOnlyServiceSchema = z.object({
  url: nonEmptyString
});

export const labRuntimeConfigSchema = z.object({
  assets: z.object({
    certificateUrl: nonEmptyString
  }),
  content: z.object({
    networkMapPath: nonEmptyString
  }),
  features: z.object({
    aiLlmEnabled: z.boolean(),
    workbenchEnabled: z.boolean()
  }),
  lab: z.object({
    localUrl: nonEmptyString,
    name: nonEmptyString,
    publicUrl: nonEmptyString
  }),
  services: z.object({
    gitLab: z.object({
      externalUrl: nonEmptyString,
      rootEmail: nonEmptyString,
      rootPassword: nonEmptyString,
      rootUsername: nonEmptyString,
      url: nonEmptyString
    }),
    n8n: z.object({
      ownerEmail: nonEmptyString,
      ownerName: nonEmptyString,
      ownerPassword: nonEmptyString,
      url: nonEmptyString
    }),
    ollama: z.object({
      gatewayPassword: nonEmptyString,
      gatewayUser: nonEmptyString,
      url: nonEmptyString
    }),
    openWebUi: namedAccountSchema,
    trilium: urlOnlyServiceSchema,
    penpot: namedAccountSchema
  }),
  workbenches: z.object({
    node: z.object({
      briefingPath: nonEmptyString,
      password: nonEmptyString,
      url: nonEmptyString
    }),
    postgres: z.object({
      briefingPath: nonEmptyString,
      database: nonEmptyString,
      host: nonEmptyString,
      internalHost: nonEmptyString,
      internalPort: nonEmptyString,
      password: nonEmptyString,
      port: nonEmptyString,
      superuser: nonEmptyString
    }),
    python: z.object({
      briefingPath: nonEmptyString,
      password: nonEmptyString,
      url: nonEmptyString
    })
  })
});

export type LabRuntimeConfig = z.infer<typeof labRuntimeConfigSchema>;

export function parseLabRuntimeConfig(value: unknown): LabRuntimeConfig {
  const result = labRuntimeConfigSchema.safeParse(value);

  if (result.success) {
    return result.data;
  }

  const reason = result.error.issues
    .slice(0, 4)
    .map((issue) => {
      const fieldPath = issue.path.join('.');
      return fieldPath ? `${fieldPath}: ${issue.message}` : issue.message;
    })
    .join('; ');

  throw new Error(
    i18n.t('errors.runtimeInvalidResponseWithReason', {
      reason
    })
  );
}
