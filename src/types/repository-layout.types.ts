/**
 * Relative repository paths that define the infrastructure-oriented scaffolding.
 */
export interface RepositoryPathDefinitions {
  composeFile: string;
  composeAiLlmFile: string;
  composeAiAgentsFile: string;
  composeAiImageFile: string;
  composeAiVideoFile: string;
  composeWorkbenchFile: string;
  envFile: string;
  gatewayTemplateFile: string;
  gatewayAiLlmTemplateFile: string;
  gatewayAiAgentsTemplateFile: string;
  gatewayAiImageTemplateFile: string;
  gatewayAiVideoTemplateFile: string;
  gatewayWorkbenchTemplateFile: string;
}

/**
 * Absolute infrastructure and configuration paths resolved for a checkout.
 */
export interface RepositoryLayout {
  composeFile: string;
  composeAiLlmFile: string;
  composeAiAgentsFile: string;
  composeAiImageFile: string;
  composeAiVideoFile: string;
  composeWorkbenchFile: string;
  envFile: string;
  gatewayTemplateFile: string;
  gatewayAiLlmTemplateFile: string;
  gatewayAiAgentsTemplateFile: string;
  gatewayAiImageTemplateFile: string;
  gatewayAiVideoTemplateFile: string;
  gatewayWorkbenchTemplateFile: string;
}
