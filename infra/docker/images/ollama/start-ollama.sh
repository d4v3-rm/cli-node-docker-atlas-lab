#!/bin/sh
set -eu

start_ollama() {
  ollama serve &
  OLLAMA_PID=$!

  trap 'echo "Stopping Ollama runtime..."; kill "${OLLAMA_PID}" 2>/dev/null || true; wait "${OLLAMA_PID}" 2>/dev/null || true' TERM INT
}

wait_for_ready() {
  local max_wait_seconds="${OLLAMA_STARTUP_TIMEOUT_SECONDS:-120}"
  local elapsed=0

  until nc -z 127.0.0.1 11434; do
    if [ "${elapsed}" -ge "${max_wait_seconds}" ]; then
      echo "Timeout waiting for Ollama server on 11434."
      kill "${OLLAMA_PID}" 2>/dev/null || true
      wait "${OLLAMA_PID}" 2>/dev/null || true
      exit 1
    fi

    sleep 1
    elapsed=$((elapsed + 1))
  done
}

sync_models_if_configured() {
  if [ "${OLLAMA_SYNC_ON_START:-0}" != "1" ]; then
    echo "Skipping startup model sync; Atlas Lab bootstrap handles model reconciliation."
    return
  fi

  if [ -f /opt/atlas-lab/model-sync/sync-ollama-models.sh ]; then
    sh /opt/atlas-lab/model-sync/sync-ollama-models.sh
  else
    echo "Model sync script not found, skipping model preinstall."
  fi
}

start_ollama
wait_for_ready
sync_models_if_configured

wait "${OLLAMA_PID}"
