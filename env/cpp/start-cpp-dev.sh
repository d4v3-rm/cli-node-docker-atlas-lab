#!/bin/sh
set -eu

require_var() {
  var_name="$1"
  eval "is_set=\${$var_name+x}"
  if [ "${is_set}" != "x" ]; then
    echo "Missing env var: ${var_name}" >&2
    exit 1
  fi
}

require_nonempty() {
  var_name="$1"
  eval "value=\${$var_name}"
  if [ -z "${value}" ]; then
    echo "Empty env var: ${var_name}" >&2
    exit 1
  fi
}

require_var CODE_SERVER_BIND_ADDR
require_var CODE_SERVER_AUTH
require_var CODE_SERVER_WORKDIR
require_var CODE_SERVER_PASSWORD
require_var CODE_SERVER_EXTENSIONS

require_nonempty CODE_SERVER_BIND_ADDR
require_nonempty CODE_SERVER_AUTH
require_nonempty CODE_SERVER_WORKDIR

if [ -n "${CODE_SERVER_PASSWORD}" ]; then
  export PASSWORD="${CODE_SERVER_PASSWORD}"
fi

state_dir="${HOME}/.lab-state"
mkdir -p "${state_dir}"

save_state() {
  key="$1"
  value="$2"
  printf '%s' "${value}" | sha256sum | awk '{print $1}' > "${state_dir}/${key}.sha256"
}

state_changed() {
  key="$1"
  value="$2"
  marker="${state_dir}/${key}.sha256"
  next="$(printf '%s' "${value}" | sha256sum | awk '{print $1}')"

  if [ ! -f "${marker}" ]; then
    return 0
  fi

  current="$(cat "${marker}")"
  [ "${current}" != "${next}" ]
}

if [ -n "${CODE_SERVER_EXTENSIONS}" ]; then
  if state_changed "code-server-extensions" "${CODE_SERVER_EXTENSIONS}"; then
    for ext in ${CODE_SERVER_EXTENSIONS}; do
      code-server --install-extension "${ext}"
    done
    save_state "code-server-extensions" "${CODE_SERVER_EXTENSIONS}"
  fi
fi

args="--bind-addr ${CODE_SERVER_BIND_ADDR} --auth ${CODE_SERVER_AUTH}"

exec /usr/bin/entrypoint.sh ${args} "${CODE_SERVER_WORKDIR}"
