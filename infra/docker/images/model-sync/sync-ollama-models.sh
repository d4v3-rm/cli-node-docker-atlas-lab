#!/bin/sh
set -eu

trim() {
  printf '%s' "$1" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

runtime_models="$(trim "${OLLAMA_RUNTIME_MODELS:-}")"
if [ -z "${runtime_models}" ]; then
  runtime_models="${OLLAMA_CHAT_MODEL:-},${OLLAMA_EMBEDDING_MODEL:-}"
fi

result="present"
old_ifs="${IFS}"
IFS=','

for raw_model in ${runtime_models}; do
  model_name="$(trim "${raw_model}")"
  if [ -z "${model_name}" ]; then
    continue
  fi

  echo "Checking Ollama model '${model_name}'."
  if ollama show "${model_name}" >/dev/null 2>&1; then
    echo "Ollama model '${model_name}' is already available locally."
    continue
  fi

  echo "Pulling missing Ollama model '${model_name}'."
  ollama pull "${model_name}"
  echo "Finished pulling Ollama model '${model_name}'."
  result="pulled"
done

IFS="${old_ifs}"
echo "ATLAS_OLLAMA_MODEL_SYNC_RESULT=${result}"
