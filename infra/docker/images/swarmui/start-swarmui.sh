#!/usr/bin/env bash
set -euo pipefail

cd /SwarmUI

if [ ! -f Data/Settings.fds ] || [ ! -f Data/Backends.fds ] || [ ! -f dlbackend/ComfyUI/main.py ]; then
  echo "SwarmUI is not initialized. Run /usr/local/bin/setup-swarmui.sh first." >&2
  exit 1
fi

exec bash /SwarmUI/launch-linux.sh --launch_mode none --host 0.0.0.0 --port 7801
