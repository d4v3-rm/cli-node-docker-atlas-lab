#!/usr/bin/env bash
set -euo pipefail

python /usr/local/bin/download-model.py

exec /opt/invokeai/docker-entrypoint.sh "$@"
