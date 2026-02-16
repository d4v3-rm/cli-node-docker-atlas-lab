/**
 * Shared options available on commands that operate on a lab checkout.
 */
export interface GlobalCliOptions {
  projectDir?: string;
}

/**
 * Options supported by the `up` command.
 */
export interface UpCommandOptions extends GlobalCliOptions {
  build?: boolean;
  withAi?: boolean;
  withWorkbench?: boolean;
}

/**
 * Options supported by the `bootstrap` command.
 */
export interface BootstrapCommandOptions extends GlobalCliOptions {
  skipGitea?: boolean;
  skipOllama?: boolean;
  withAi?: boolean;
}

/**
 * Options supported by the `doctor` command.
 */
export interface DoctorCommandOptions extends GlobalCliOptions {
  smoke?: boolean;
  withAi?: boolean;
  withWorkbench?: boolean;
}

/**
 * Options supported by the `save-images` command.
 */
export interface SaveImagesCommandOptions extends GlobalCliOptions {
  output?: string;
  withAi?: boolean;
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
export interface SaveVolumesCommandOptions extends GlobalCliOptions {
  outputDir?: string;
  withAi?: boolean;
  withWorkbench?: boolean;
}

/**
 * Options supported by the `restore-volumes` command.
 */
export interface RestoreVolumesCommandOptions extends GlobalCliOptions {
  inputDir: string;
}
