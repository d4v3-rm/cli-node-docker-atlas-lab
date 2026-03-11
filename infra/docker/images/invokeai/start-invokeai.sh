#!/usr/bin/env bash
set -euo pipefail

"${INVOKEAI_PYTHON:-python}" /usr/local/bin/download-model.py

exec /opt/invokeai/docker-entrypoint.sh "$@"
