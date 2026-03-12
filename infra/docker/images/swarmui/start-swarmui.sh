#!/usr/bin/env bash
set -euo pipefail

: "${SWARMUI_MODEL_REPO:?Missing SWARMUI_MODEL_REPO}"
: "${SWARMUI_MODEL_REVISION:?Missing SWARMUI_MODEL_REVISION}"
: "${SWARMUI_MODEL_FILE:?Missing SWARMUI_MODEL_FILE}"
: "${SWARMUI_MODEL_TITLE:?Missing SWARMUI_MODEL_TITLE}"

bash /usr/local/bin/setup-swarmui.sh

model_basename="${SWARMUI_MODEL_FILE##*/}"

MODEL_MODE=single_file \
MODEL_REPO="${SWARMUI_MODEL_REPO}" \
MODEL_REVISION="${SWARMUI_MODEL_REVISION}" \
MODEL_FILENAME="${SWARMUI_MODEL_FILE}" \
MODEL_TARGET_FILE="/SwarmUI/Models/diffusion_models/${model_basename}" \
MODEL_TITLE="${SWARMUI_MODEL_TITLE}" \
"${SWARMUI_PYTHON:-python3}" /usr/local/bin/download-model.py

cd /SwarmUI

if [ ! -f Data/Settings.fds ] || [ ! -f Data/Backends.fds ] || [ ! -f dlbackend/ComfyUI/main.py ]; then
  echo "SwarmUI is not initialized. Run /usr/local/bin/setup-swarmui.sh first." >&2
  exit 1
fi

exec bash /SwarmUI/launch-linux.sh --launch_mode none --host 0.0.0.0 --port 7801
