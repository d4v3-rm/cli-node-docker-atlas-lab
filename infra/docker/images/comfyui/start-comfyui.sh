#!/usr/bin/env bash
set -euo pipefail

mkdir -p /opt/ComfyUI/models /opt/ComfyUI/output

python /usr/local/bin/download-model.py

exec python main.py --listen 0.0.0.0 --port 8188
