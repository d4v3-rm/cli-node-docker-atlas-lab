import process from 'node:process';
import { commandBootstrap } from './commands/bootstrap.mjs';
import { commandDoctor } from './commands/doctor.mjs';
import { commandDown, commandStatus, commandUp } from './commands/stack.mjs';
import { HELP_TEXT } from './help.mjs';
import { parseCli } from './lib/cli-parser.mjs';
import { parseEnvFile, resolveProjectRoot } from './lib/project.mjs';

export async function runCli(argv = process.argv.slice(2)) {
  const parsed = parseCli(argv);

  if (parsed.help || parsed.command === 'help') {
    console.log(HELP_TEXT);
    return;
  }

  const projectRoot = resolveProjectRoot(parsed.projectDir);
  const env = parseEnvFile(projectRoot);

  switch (parsed.command) {
    case 'up':
      await commandUp(projectRoot, env, parsed.commandOptions);
      return;
    case 'bootstrap':
      await commandBootstrap(projectRoot, env, parsed.commandOptions);
      return;
    case 'doctor':
      await commandDoctor(projectRoot, env, parsed.commandOptions);
      return;
    case 'status':
      commandStatus(projectRoot);
      return;
    case 'down':
      commandDown(projectRoot);
      return;
    default:
      throw new Error(`Unknown command: ${parsed.command}`);
  }
}
