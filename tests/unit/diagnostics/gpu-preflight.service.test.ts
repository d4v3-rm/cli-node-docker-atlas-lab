import {
  dockerInfoSupportsNvidiaGpu,
  parseNvidiaGpuNames
} from '../../../src/services/diagnostics/gpu-preflight.service.js';

describe('gpu-preflight.service', () => {
  it('parses the GPU names returned by nvidia-smi', () => {
    const stdout = ['NVIDIA GeForce RTX 3070', 'NVIDIA RTX A4000'].join('\n');

    expect(parseNvidiaGpuNames(stdout)).toEqual(['NVIDIA GeForce RTX 3070', 'NVIDIA RTX A4000']);
  });

  it('detects the classic nvidia runtime in docker info', () => {
    expect(
      dockerInfoSupportsNvidiaGpu(
        JSON.stringify({
          Runtimes: {
            nvidia: {},
            runc: {}
          }
        })
      )
    ).toBe(true);
  });

  it('detects CDI NVIDIA GPU devices in docker info', () => {
    expect(
      dockerInfoSupportsNvidiaGpu(
        JSON.stringify({
          DiscoveredDevices: [{ ID: 'nvidia.com/gpu=all', Source: 'cdi' }]
        })
      )
    ).toBe(true);
  });

  it('does not treat WebGPU devices as CUDA compute support', () => {
    expect(
      dockerInfoSupportsNvidiaGpu(
        JSON.stringify({
          DiscoveredDevices: [{ ID: 'docker.com/gpu=webgpu', Source: 'cdi' }]
        })
      )
    ).toBe(false);
  });
});
