import { createComposeCommandArgs } from '../lib/compose.js';
import type { BootstrapEnv, ProjectContext } from '../types/project.types.js';
import { printInfo } from '../ui/logger.js';
import { runCommand } from '../utils/process.js';

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

InstanceAdmin.objects.get_or_create(user=user, instance=instance, defaults={"role": 20})
instance.instance_name = instance_name
instance.is_setup_done = True
instance.save()

print(f"ATLAS_PLANE_BOOTSTRAP_RESULT={result}")
`;

  printInfo(`Aligning Plane instance admin '${planeAdminEmail}'.`, 'bootstrap');
  const result = await runCommand(
    'docker',
    createComposeCommandArgs(context, [
      'exec',
      '-T',
      'plane-api',
      'python',
      'manage.py',
      'shell',
      '-c',
      bootstrapScript
    ]),
    {
      captureOutput: true,
      cwd: context.projectRoot,
      scope: 'bootstrap'
    }
  );

  return result.stdout.includes('ATLAS_PLANE_BOOTSTRAP_RESULT=created') ? 'created' : 'updated';
}
