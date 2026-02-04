const OPTION_MAP = {
  up: { '--build': 'build', '--with-workbench': 'withWorkbench' },
  bootstrap: { '--skip-gitea': 'skipGitea', '--skip-ollama': 'skipOllama' },
  doctor: { '--smoke': 'smoke' },
  status: {},
  down: {},
  help: {}
};

const DEFAULT_COMMAND_OPTIONS = {
  build: false,
  withWorkbench: false,
  skipGitea: false,
  skipOllama: false,
  smoke: false
};

export function parseCli(argv) {
  let command;
  let projectDir;
  let help = false;
  const commandArgs = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--project-dir') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('Missing value for --project-dir');
      }
      projectDir = value;
      index += 1;
      continue;
    }

    if (token === '--help' || token === '-h') {
      help = true;
      continue;
    }

    if (!command && !token.startsWith('-')) {
      command = token;
      continue;
    }

    commandArgs.push(token);
  }

  command ??= 'help';

  return {
    command,
    help,
    projectDir,
    commandOptions: parseCommandOptions(command, commandArgs)
  };
}

function parseCommandOptions(command, args) {
  const allowedOptions = OPTION_MAP[command];
  if (!allowedOptions) {
    throw new Error(`Unknown command: ${command}`);
  }

  const options = { ...DEFAULT_COMMAND_OPTIONS };

  for (const token of args) {
    const optionKey = allowedOptions[token];
    if (!optionKey) {
      throw new Error(`Unknown option for ${command}: ${token}`);
    }
    options[optionKey] = true;
  }

  return options;
}
