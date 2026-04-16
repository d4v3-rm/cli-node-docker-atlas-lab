import { createComposeCommandArgs } from '../lib/compose.js';
import type { BootstrapEnv, ProjectContext } from '../types/project.types.js';
import { printInfo } from '../ui/logger.js';
import { runCommand } from '../utils/process.js';

const PLANE_MIGRATOR_WAIT_ATTEMPTS = 90;
const PLANE_SCHEMA_WAIT_ATTEMPTS = 60;
const PLANE_INSTANCE_WAIT_ATTEMPTS = 20;
const PLANE_INSTANCE_WAIT_DELAY_MS = 3000;
const PLANE_SCHEMA_READY_QUERY =
  "select count(*) from information_schema.columns where table_name = 'users' and column_name in ('avatar_asset_id', 'cover_image_asset_id');";

/**
 * Waits for Plane to finish its one-shot migrator and expose the post-migration schema needed by the admin bootstrap.
 */
export async function waitForPlaneBootstrapPrerequisites(context: ProjectContext): Promise<void> {
  await waitForPlaneMigrator(context);
  await waitForPlaneSchema(context);
}

/**
 * Ensures the configured Plane instance admin exists and can sign in with the lab credentials.
 */
export async function ensurePlaneAdmin(
  context: ProjectContext,
  env: BootstrapEnv
): Promise<'created' | 'updated'> {
  const planeAdminName = env.PLANE_ROOT_NAME.trim();
  const planeAdminEmail = env.PLANE_ROOT_EMAIL.trim().toLowerCase();
  const bootstrapScript = `
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from plane.db.models import Profile, User
from plane.license.models import Instance, InstanceAdmin
import uuid

root_name = ${JSON.stringify(planeAdminName)}
root_email = ${JSON.stringify(planeAdminEmail)}
root_password = ${JSON.stringify(env.PLANE_ROOT_PASSWORD)}
instance_name = ${JSON.stringify(env.PLANE_INSTANCE_NAME.trim())}

user = User.objects.filter(email=root_email).first()
result = "updated"

if user is None:
    user = User.objects.create(
        first_name=root_name,
        email=root_email,
        username=uuid.uuid4().hex,
        password=make_password(root_password),
        is_password_autoset=False,
    )
    result = "created"
else:
    user.first_name = root_name
    user.password = make_password(root_password)
    user.is_password_autoset = False

user.is_active = True
user.last_active = timezone.now()
user.last_login_time = timezone.now()
user.token_updated_at = timezone.now()
user.save()

profile, _ = Profile.objects.get_or_create(user=user)
profile.company_name = instance_name
profile.save()

instance = Instance.objects.first()
if instance is None:
    raise SystemExit("Plane instance is not registered yet")

instance_admin, _ = InstanceAdmin.objects.get_or_create(
    user=user,
    instance=instance,
    defaults={"role": 20},
)
if instance_admin.role != 20:
    instance_admin.role = 20
    instance_admin.save(update_fields=["role"])

instance.instance_name = instance_name
instance.is_setup_done = True
instance.save()

print(f"ATLAS_PLANE_BOOTSTRAP_RESULT={result}")
`;

  const bootstrapCommand = `cat <<'PY' | python manage.py shell
${bootstrapScript.trim()}
PY`;

  printInfo(`Aligning Plane instance admin '${planeAdminEmail}'.`, 'bootstrap');
  for (let attempt = 1; attempt <= PLANE_INSTANCE_WAIT_ATTEMPTS; attempt += 1) {
    const result = await runCommand(
      'docker',
      createComposeCommandArgs(context, ['exec', '-T', 'plane-api', 'sh', '-lc', bootstrapCommand]),
      {
        allowFailure: true,
        captureOutput: true,
        cwd: context.projectRoot,
        scope: 'bootstrap'
      }
    );

    if (result.exitCode === 0) {
      return result.stdout.includes('ATLAS_PLANE_BOOTSTRAP_RESULT=created') ? 'created' : 'updated';
    }

    const combinedOutput = `${result.stdout}\n${result.stderr}`;
    if (attempt < PLANE_INSTANCE_WAIT_ATTEMPTS) {
      const failureSummary = summarizePlaneBootstrapFailure(combinedOutput);
      printInfo(
        `Plane bootstrap is not ready yet (${failureSummary}). Retrying in ${PLANE_INSTANCE_WAIT_DELAY_MS / 1000}s.`,
        'bootstrap'
      );
      await sleep(PLANE_INSTANCE_WAIT_DELAY_MS);
      continue;
    }

    throw new Error(
      combinedOutput.trim() || `Plane bootstrap failed with exit code ${result.exitCode}.`
    );
  }

  throw new Error('Plane bootstrap did not complete within the retry window.');
}

/**
 * Waits until the Plane migrator container completes successfully.
 */
async function waitForPlaneMigrator(context: ProjectContext): Promise<void> {
  let lastReportedState = '';

  for (let attempt = 1; attempt <= PLANE_MIGRATOR_WAIT_ATTEMPTS; attempt += 1) {
    const containerId = await runCommand(
      'docker',
      createComposeCommandArgs(context, ['ps', '--all', '-q', 'plane-migrator']),
      {
        allowFailure: true,
        captureOutput: true,
        cwd: context.projectRoot,
        scope: 'bootstrap'
      }
    );

    const normalizedContainerId = containerId.stdout.trim();
    if (!normalizedContainerId) {
      lastReportedState = reportPlanePrerequisiteState(
        'Plane migrator',
        'container not created yet',
        lastReportedState
      );
      await sleep(PLANE_INSTANCE_WAIT_DELAY_MS);
      continue;
    }

    const stateResult = await runCommand(
      'docker',
      ['inspect', '--format', '{{.State.Status}}|{{.State.ExitCode}}', normalizedContainerId],
      {
        allowFailure: true,
        captureOutput: true,
        cwd: context.projectRoot,
        scope: 'bootstrap'
      }
    );

    const normalizedState = normalizePlaneMigratorState(stateResult.stdout);
    lastReportedState = reportPlanePrerequisiteState('Plane migrator', normalizedState, lastReportedState);

    if (normalizedState === 'exited (0)') {
      return;
    }

    await sleep(PLANE_INSTANCE_WAIT_DELAY_MS);
  }

  throw new Error(
    `Timed out waiting for Plane migrator completion (${lastReportedState || 'unknown state'}).`
  );
}

/**
 * Waits until the specific Plane schema columns required by the bootstrap script are present in Postgres.
 */
async function waitForPlaneSchema(context: ProjectContext): Promise<void> {
  let lastReportedState = '';

  for (let attempt = 1; attempt <= PLANE_SCHEMA_WAIT_ATTEMPTS; attempt += 1) {
    const schemaProbe = await runCommand(
      'docker',
      createComposeCommandArgs(context, [
        'exec',
        '-T',
        'plane-db',
        'sh',
        '-lc',
        `psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "${PLANE_SCHEMA_READY_QUERY}"`
      ]),
      {
        allowFailure: true,
        captureOutput: true,
        cwd: context.projectRoot,
        scope: 'bootstrap'
      }
    );

    const normalizedProbeOutput = schemaProbe.stdout.trim();
    if (schemaProbe.exitCode === 0 && normalizedProbeOutput === '2') {
      if (lastReportedState !== 'ready') {
        printInfo('Plane schema readiness probe passed.', 'bootstrap');
      }
      return;
    }

    const nextState =
      schemaProbe.exitCode === 0
        ? `schema columns available=${normalizedProbeOutput || '0'}/2`
        : summarizePlaneBootstrapFailure(`${schemaProbe.stdout}\n${schemaProbe.stderr}`);
    lastReportedState = reportPlanePrerequisiteState('Plane schema', nextState, lastReportedState);
    await sleep(PLANE_INSTANCE_WAIT_DELAY_MS);
  }

  throw new Error(
    `Timed out waiting for the Plane schema to become ready (${lastReportedState || 'unknown state'}).`
  );
}

/**
 * Small async sleep helper for transient Plane setup delays.
 */
function sleep(delayMilliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMilliseconds);
  });
}

/**
 * Extracts the most useful line from a failed Plane bootstrap attempt.
 */
function summarizePlaneBootstrapFailure(output: string): string {
  const lines = output
    .replace(/\r\n/gu, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line !== '^');

  return lines.at(-1) ?? 'unknown bootstrap error';
}

/**
 * Emits a progress line for Plane readiness only when the observed state changes.
 */
function reportPlanePrerequisiteState(
  subject: string,
  nextState: string,
  previousState: string
): string {
  if (nextState !== previousState) {
    printInfo(`Waiting for ${subject}: ${nextState}.`, 'bootstrap');
  }

  return nextState;
}

/**
 * Normalizes the migrator inspect output into a short status string.
 */
function normalizePlaneMigratorState(rawState: string): string {
  const [status = 'unknown', exitCode = '?'] = rawState.trim().split('|');
  return status === 'exited' ? `${status} (${exitCode})` : status;
}
