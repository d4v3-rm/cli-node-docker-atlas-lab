#!/usr/bin/env bash
set -euo pipefail

"${INVOKEAI_PYTHON:-python}" /usr/local/bin/download-model.py

if [ "$#" -eq 0 ]; then
  set -- invokeai-web
fi

exec /opt/invokeai/docker-entrypoint.sh "$@"
