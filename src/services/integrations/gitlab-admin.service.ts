import { createComposeCommandArgs } from '../../lib/compose.js';
import type { BootstrapEnv, ProjectContext } from '../../types/project.types.js';
import { printInfo } from '../../cli/ui/logger.js';
import { runCommand } from '../../utils/process.js';

/**
 * Ensures the configured GitLab root account exists and matches the lab credentials.
 */
export async function ensureGitLabAdmin(
  context: ProjectContext,
  env: BootstrapEnv
): Promise<'created' | 'updated'> {
  const username = env.GITLAB_ROOT_USERNAME.trim();
  const email = env.GITLAB_ROOT_EMAIL.trim().toLowerCase();

  printInfo(`Aligning GitLab root account '${username}'.`, 'bootstrap');

  const result = await runCommand(
    'docker',
    createComposeCommandArgs(context, [
      'exec',
      '-T',
      'gitlab',
      'gitlab-rails',
      'runner',
      buildGitLabRootScript(username, email, env.GITLAB_ROOT_PASSWORD)
    ]),
    {
      captureOutput: true,
      cwd: context.projectRoot,
      scope: 'bootstrap'
    }
  );

  return result.stdout.includes('created') ? 'created' : 'updated';
}

function buildGitLabRootScript(
  username: string,
  email: string,
  password: string
): string {
  return [
    `username = ${rubyString(username)}`,
    `email = ${rubyString(email)}`,
    `password = ${rubyString(password)}`,
    'organization = Organizations::Organization.default_organization',
    'user = User.find_by_username(username) || User.find_by(email: email) || User.new(username: username)',
    'created = user.new_record?',
    'user.name = "Administrator"',
    'user.email = email',
    'user.organization_id = organization.id if user.respond_to?(:organization_id)',
    'user.assign_personal_namespace(organization) if user.namespace.nil?',
    'user.password = password',
    'user.password_confirmation = password',
    'user.admin = true',
    'user.confirmed_at ||= Time.current if user.respond_to?(:confirmed_at)',
    'user.skip_confirmation! if user.respond_to?(:skip_confirmation!)',
    'user.save!',
    'ApplicationSetting.current.update!(signup_enabled: false)',
    'puts(created ? "created" : "updated")'
  ].join('; ');
}

function rubyString(value: string): string {
  return JSON.stringify(value);
}
