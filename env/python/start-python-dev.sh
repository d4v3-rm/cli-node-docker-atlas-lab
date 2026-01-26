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

require_var CODE_SERVER_BASE_PATH
require_var CODE_SERVER_BIND_ADDR
require_var CODE_SERVER_AUTH
require_var CODE_SERVER_WORKDIR
require_var CODE_SERVER_PASSWORD
require_var CODE_SERVER_ABS_PROXY_BASE_PATH
require_var CODE_SERVER_EXTENSIONS
require_var PYTHON_DEV_PIP_PACKAGES
require_var PYTHON_DEV_PIP_EXTRA_INDEX_URL

require_nonempty CODE_SERVER_BASE_PATH
require_nonempty CODE_SERVER_BIND_ADDR
require_nonempty CODE_SERVER_AUTH
require_nonempty CODE_SERVER_WORKDIR
require_nonempty CODE_SERVER_ABS_PROXY_BASE_PATH

export PATH="${HOME}/.local/bin:${PATH}"

if [ -n "${CODE_SERVER_PASSWORD}" ]; then
  export PASSWORD="${CODE_SERVER_PASSWORD}"
fi

if [ -n "${PYTHON_DEV_PIP_PACKAGES}" ]; then
  marker="${HOME}/.python-dev-pip-packages-installed"
  if [ ! -f "${marker}" ]; then
    if [ -n "${PYTHON_DEV_PIP_EXTRA_INDEX_URL}" ]; then
      pip install --user --extra-index-url "${PYTHON_DEV_PIP_EXTRA_INDEX_URL}" ${PYTHON_DEV_PIP_PACKAGES}
    else
      pip install --user ${PYTHON_DEV_PIP_PACKAGES}
    fi
    touch "${marker}"
  fi
fi

if [ -n "${CODE_SERVER_EXTENSIONS}" ]; then
  marker="${HOME}/.code-server-extensions-installed"
  if [ ! -f "${marker}" ]; then
    for ext in ${CODE_SERVER_EXTENSIONS}; do
      code-server --install-extension "${ext}"
    done
    touch "${marker}"
  fi
fi

args="--bind-addr ${CODE_SERVER_BIND_ADDR} --auth ${CODE_SERVER_AUTH}"
if [ -n "${CODE_SERVER_ABS_PROXY_BASE_PATH}" ]; then
  args="${args} --abs-proxy-base-path ${CODE_SERVER_ABS_PROXY_BASE_PATH}"
fi

exec /usr/bin/entrypoint.sh ${args} "${CODE_SERVER_WORKDIR}"
