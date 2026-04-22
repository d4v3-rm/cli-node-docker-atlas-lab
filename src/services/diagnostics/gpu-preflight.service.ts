import type { HostCheckResult } from '../../types/doctor.types.js';
import { runCommand } from '../../utils/process.js';

interface DockerInfoPayload {
  DiscoveredDevices?: Array<{
    ID?: string;
  }>;
  Runtimes?: Record<string, unknown>;
}

/**
 * Fails fast when the host does not expose an NVIDIA GPU to Docker.
 */
export async function assertNvidiaGpuRuntime(): Promise<void> {
  const result = await checkNvidiaGpuRuntime();

  if (!result.ok) {
    throw new Error(result.detail);
  }
}

/**
 * Validates that Atlas Lab can access an NVIDIA GPU from Docker for Ollama inference.
 */
export async function checkNvidiaGpuRuntime(): Promise<HostCheckResult> {
  const gpuProbe = await runCommand(
    'nvidia-smi',
    ['--query-gpu=name', '--format=csv,noheader'],
    {
      allowFailure: true,
      captureOutput: true,
      scope: 'host'
    }
  );

  const gpuNames = parseNvidiaGpuNames(gpuProbe.stdout);
  if (gpuProbe.exitCode !== 0 || gpuNames.length === 0) {
    return {
      name: 'NVIDIA GPU',
      ok: false,
      detail: 'No NVIDIA GPU detected on the host. Atlas Lab now expects GPU-backed Ollama by default.'
    };
  }

  const dockerInfo = await runCommand('docker', ['info', '--format', '{{json .}}'], {
    allowFailure: true,
    captureOutput: true,
    scope: 'host'
  });

  if (dockerInfo.exitCode !== 0) {
    return {
      name: 'NVIDIA GPU',
      ok: false,
      detail: dockerInfo.stderr.trim() || dockerInfo.stdout.trim() || 'Could not inspect Docker GPU capabilities.'
    };
  }

  if (!dockerInfoSupportsNvidiaGpu(dockerInfo.stdout)) {
    return {
      name: 'NVIDIA GPU',
      ok: false,
      detail: `Host GPU detected (${gpuNames.join(', ')}), but Docker does not expose an NVIDIA compute device. Enable NVIDIA GPU support in Docker before starting Atlas Lab.`
    };
  }

  return {
    name: 'NVIDIA GPU',
    ok: true,
    detail: `${gpuNames.join(', ')} available for Ollama inference`
  };
}

/**
 * Parses the GPU names reported by `nvidia-smi --query-gpu=name --format=csv,noheader`.
 */
export function parseNvidiaGpuNames(stdout: string): string[] {
  return stdout
    .split(/\r?\n/gu)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Detects whether Docker advertises an NVIDIA-capable runtime or CDI compute device.
 */
export function dockerInfoSupportsNvidiaGpu(stdout: string): boolean {
  let payload: DockerInfoPayload;

  try {
    payload = JSON.parse(stdout) as DockerInfoPayload;
  } catch {
    return false;
  }

  const runtimeNames = Object.keys(payload.Runtimes ?? {}).map((name) => name.toLowerCase());
  if (runtimeNames.includes('nvidia')) {
    return true;
  }

  return (payload.DiscoveredDevices ?? []).some((device) => {
    const id = device.ID?.toLowerCase() ?? '';

    return /nvidia\.com\/gpu/iu.test(id) || /docker\.com\/gpu=(?!webgpu)/iu.test(id);
  });
}
