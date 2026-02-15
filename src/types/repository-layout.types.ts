/**
 * Relative repository paths that define the infrastructure-oriented scaffolding.
 */
export interface RepositoryPathDefinitions {
  composeFile: string;
  composeAiFile: string;
  composeWorkbenchFile: string;
  envFile: string;
  gatewayTemplateFile: string;
  gatewayAiTemplateFile: string;
  gatewayWorkbenchTemplateFile: string;
}

/**
 * Absolute infrastructure and configuration paths resolved for a checkout.
 */
export interface RepositoryLayout {
  composeFile: string;
  composeAiFile: string;
  composeWorkbenchFile: string;
  envFile: string;
  gatewayTemplateFile: string;
  gatewayAiTemplateFile: string;
  gatewayWorkbenchTemplateFile: string;
}
