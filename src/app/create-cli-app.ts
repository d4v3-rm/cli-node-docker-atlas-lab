import { Command } from 'commander';
import packageJson from '../../package.json' with { type: 'json' };
import { APP_METADATA } from '../config/app-metadata.js';
import { registerBootstrapCommand } from '../commands/register-bootstrap-command.js';
import { registerDoctorCommand } from '../commands/register-doctor-command.js';
import { registerDownCommand } from '../commands/register-down-command.js';
import { registerRestoreImagesCommand } from '../commands/register-restore-images-command.js';
import { registerRestoreVolumesCommand } from '../commands/register-restore-volumes-command.js';
import { registerSaveImagesCommand } from '../commands/register-save-images-command.js';
import { registerSaveVolumesCommand } from '../commands/register-save-volumes-command.js';
import { registerStatusCommand } from '../commands/register-status-command.js';
import { registerUpCommand } from '../commands/register-up-command.js';
import { renderHelpBanner, renderHelpFooter } from '../ui/banner.js';

/**
 * Builds the Commander program and wires every CLI command in one place.
 */
export function createCliApp(): Command {
  const program = new Command();

  program
    .name(APP_METADATA.cliName)
    .description(APP_METADATA.description)
    .version(packageJson.version)
    .showHelpAfterError()
    .showSuggestionAfterError()
    .addHelpText('beforeAll', `${renderHelpBanner()}\n`)
    .addHelpText('afterAll', renderHelpFooter());

  registerUpCommand(program);
  registerBootstrapCommand(program);
  registerDoctorCommand(program);
  registerStatusCommand(program);
  registerDownCommand(program);
  registerSaveImagesCommand(program);
  registerRestoreImagesCommand(program);
  registerSaveVolumesCommand(program);
  registerRestoreVolumesCommand(program);

  return program;
}
