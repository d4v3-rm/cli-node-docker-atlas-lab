export const HELP_TEXT = `Lab Atlas CLI

Usage:
  lab-atlas <command> [options]

Commands:
  up           Start Docker Compose, run bootstrap, clean legacy artifacts
  bootstrap    Run the idempotent bootstrap only
  doctor       Check host requirements and optionally run smoke tests
  status       Show Docker Compose status
  down         Stop the lab stack
  help         Show this help

Options:
  --project-dir <path>   Explicit project root if you are not in the repo

Examples:
  lab-atlas up
  lab-atlas up --build --with-workbench
  lab-atlas bootstrap
  lab-atlas doctor --smoke
  lab-atlas status --project-dir C:\\path\\to\\cli-node-lab`;
