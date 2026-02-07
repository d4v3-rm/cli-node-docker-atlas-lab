/**
 * Relative repository paths that define the infrastructure-oriented scaffolding.
 */
export interface RepositoryPathDefinitions {
  composeFile: string;
  envFile: string;
  gatewayTemplateFile: string;
}

/**
 * Absolute infrastructure and configuration paths resolved for a checkout.
 */
export interface RepositoryLayout {
  composeFile: string;
  envFile: string;
  gatewayTemplateFile: string;
}
