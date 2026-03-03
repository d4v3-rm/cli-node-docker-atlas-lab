/**
 * Relative repository paths that define the infrastructure-oriented scaffolding.
 */
export interface RepositoryPathDefinitions {
  composeFile: string;
  composeAiFile: string;
  composeImageFile: string;
  composeWorkbenchFile: string;
  envFile: string;
  gatewayTemplateFile: string;
  gatewayAiTemplateFile: string;
  gatewayImageTemplateFile: string;
  gatewayWorkbenchTemplateFile: string;
}

/**
 * Absolute infrastructure and configuration paths resolved for a checkout.
 */
export interface RepositoryLayout {
  composeFile: string;
  composeAiFile: string;
  composeImageFile: string;
  composeWorkbenchFile: string;
  envFile: string;
  gatewayTemplateFile: string;
  gatewayAiTemplateFile: string;
  gatewayImageTemplateFile: string;
  gatewayWorkbenchTemplateFile: string;
}
