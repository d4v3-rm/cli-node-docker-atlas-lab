import { Command } from 'commander';
import packageJson from '../../package.json' with { type: 'json' };
import { registerBootstrapCommand } from '../commands/register-bootstrap-command.js';
import { registerDoctorCommand } from '../commands/register-doctor-command.js';
import { registerDownCommand } from '../commands/register-down-command.js';
import { registerStatusCommand } from '../commands/register-status-command.js';
import { registerUpCommand } from '../commands/register-up-command.js';
import { renderHelpBanner, renderHelpFooter } from '../ui/banner.js';

/**
 * Builds the Commander program and wires every CLI command in one place.
 */
export function createCliApp(): Command {
  const program = new Command();

  program
    .name('lab-atlas')
    .description('Operate the local self-hosted lab stack')
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

  return program;
}
