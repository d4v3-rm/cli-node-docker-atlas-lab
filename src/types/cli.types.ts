/**
 * Shared options available on commands that operate on a lab checkout.
 */
export interface GlobalCliOptions {
  projectDir?: string;
}

/**
 * Legacy Commander alias keys emitted by multi-long-option definitions.
 */
export interface LegacyAiAliasOptions {
  withAi?: boolean;
}

/**
 * Options supported by the `up` command.
 */
export interface UpCommandOptions extends GlobalCliOptions, LegacyAiAliasOptions {
  build?: boolean;
  skipOllama?: boolean;
  withAiLlm?: boolean;
  withWorkbench?: boolean;
}

/**
 * Options supported by the `bootstrap` command.
 */
export interface BootstrapCommandOptions extends GlobalCliOptions, LegacyAiAliasOptions {
  skipOllama?: boolean;
  withAiLlm?: boolean;
}

/**
 * Options supported by the `doctor` command.
 */
export interface DoctorCommandOptions extends GlobalCliOptions, LegacyAiAliasOptions {
  smoke?: boolean;
  withAiLlm?: boolean;
  withWorkbench?: boolean;
}

/**
 * Options supported by the `save-images` command.
 */
export interface SaveImagesCommandOptions extends GlobalCliOptions, LegacyAiAliasOptions {
  output?: string;
  withAiLlm?: boolean;
  withWorkbench?: boolean;
}

/**
 * Options supported by the `restore-images` command.
 */
export interface RestoreImagesCommandOptions extends GlobalCliOptions {
  input: string;
}

/**
 * Options supported by the `save-volumes` command.
 */
export interface SaveVolumesCommandOptions extends GlobalCliOptions, LegacyAiAliasOptions {
  output?: string;
  withAiLlm?: boolean;
  withWorkbench?: boolean;
}

/**
 * Options supported by the `restore-volumes` command.
 */
export interface RestoreVolumesCommandOptions extends GlobalCliOptions {
  input: string;
}
