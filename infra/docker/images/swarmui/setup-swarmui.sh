#!/usr/bin/env bash
set -euo pipefail

cd /SwarmUI

mkdir -p Data Models Output dlbackend src/BuiltinExtensions/ComfyUIBackend/DLNodes src/Extensions

if [ ! -f Data/Settings.fds ]; then
  cat > Data/Settings.fds <<EOF
IsInstalled: true
InstallDate: $(date -I)
InstallVersion: atlas-lab
LaunchMode: none
Paths:
    ModelRoot: Models
    SDModelFolder: Stable-Diffusion
    SDLoraFolder: Lora
    SDVAEFolder: VAE
    SDEmbeddingFolder: Embeddings
    SDControlNetsFolder: controlnet;model_patches
    SDClipFolder: text_encoders;clip
    SDClipVisionFolder: clip_vision
    DataPath: Data
    OutputPath: Output
    AppendUserNameToOutputPath: false
Network:
    Host: 0.0.0.0
    Port: 7801
    PortCanChange: false
    BackendStartingPort: 7820
UserAuthorization:
    AuthorizationRequired: false
    AllowLocalhostBypass: true
    InstanceTitle: ${SWARMUI_INSTANCE_TITLE:-AtlasSwarmUI}
DefaultUser:
    Language: en
    Theme: modern_dark
EOF
fi

if [ ! -f Data/Backends.fds ]; then
  cat > Data/Backends.fds <<EOF
0:
    type: comfyui_selfstart
    title: AtlasComfyUI
    enabled: true
    settings:
        StartScript: dlbackend/ComfyUI/main.py
        ExtraArgs:
        DisableInternalArgs: false
        AutoUpdate: false
        UpdateManagedNodes: false
        FrontendVersion: LatestSwarmValidated
        EnablePreviews: true
        GPU_ID: 0
        OverQueue: 1
        AutoRestart: true
EOF
fi

if [ ! -f dlbackend/ComfyUI/main.py ]; then
  bash /SwarmUI/launchtools/comfy-install-linux.sh nv
fi
