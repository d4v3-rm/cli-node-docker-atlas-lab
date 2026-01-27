#!/bin/sh
set -eu

require_nonempty() {
  var_name="$1"
  eval "is_set=\${$var_name+x}"
  if [ "${is_set}" != "x" ]; then
    echo "Missing env var: ${var_name}" >&2
    exit 1
  fi
  eval "value=\${$var_name}"
  if [ -z "${value}" ]; then
    echo "Empty env var: ${var_name}" >&2
    exit 1
  fi
}

require_nonempty LAB_EXTERNAL_URL
require_nonempty SSL_CERT_AUTOGEN
require_nonempty SSL_CERT_CN
require_nonempty SSL_CERT_SAN
require_nonempty SSL_CERT_DAYS
require_nonempty GITEA_ROOT_USERNAME
require_nonempty GITEA_ROOT_PASSWORD
require_nonempty GITEA_ROOT_EMAIL
require_nonempty N8N_GATEWAY_USER
require_nonempty N8N_GATEWAY_PASSWORD
require_nonempty N8N_ROOT_FIRST_NAME
require_nonempty N8N_ROOT_LAST_NAME
require_nonempty N8N_ROOT_EMAIL
require_nonempty N8N_ROOT_PASSWORD
require_nonempty OPENWEBUI_ROOT_NAME
require_nonempty OPENWEBUI_ROOT_EMAIL
require_nonempty OPENWEBUI_ROOT_PASSWORD
require_nonempty OLLAMA_GATEWAY_USER
require_nonempty OLLAMA_GATEWAY_PASSWORD
require_nonempty NODE_DEV_PASSWORD
require_nonempty PYTHON_DEV_PASSWORD
require_nonempty AI_DEV_PASSWORD
require_nonempty CPP_DEV_PASSWORD

cert_dir="/etc/nginx/certs"
cert_file="${cert_dir}/fullchain.pem"
key_file="${cert_dir}/privkey.pem"
auth_dir="/etc/nginx/auth"
html_dir="/usr/share/nginx/html"
content_dir="${html_dir}/content"
template_root="/opt/gateway/templates"

mkdir -p "${cert_dir}" "${auth_dir}" "${content_dir}"

if [ "${SSL_CERT_AUTOGEN}" = "1" ] && { [ ! -f "${cert_file}" ] || [ ! -f "${key_file}" ]; }; then
  openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout "${key_file}" \
    -out "${cert_file}" \
    -days "${SSL_CERT_DAYS}" \
    -subj "/CN=${SSL_CERT_CN}" \
    -addext "subjectAltName=${SSL_CERT_SAN}"
fi

chmod 600 "${key_file}"
chmod 644 "${cert_file}"

htpasswd -bc "${auth_dir}/n8n.htpasswd" "${N8N_GATEWAY_USER}" "${N8N_GATEWAY_PASSWORD}" >/dev/null 2>&1
htpasswd -bc "${auth_dir}/ollama.htpasswd" "${OLLAMA_GATEWAY_USER}" "${OLLAMA_GATEWAY_PASSWORD}" >/dev/null 2>&1

envsubst '${LAB_EXTERNAL_URL}' \
  < "${template_root}/nginx.conf.template" \
  > /etc/nginx/nginx.conf

render_vars='${LAB_EXTERNAL_URL} ${GITEA_ROOT_USERNAME} ${GITEA_ROOT_PASSWORD} ${GITEA_ROOT_EMAIL} ${N8N_GATEWAY_USER} ${N8N_GATEWAY_PASSWORD} ${N8N_ROOT_FIRST_NAME} ${N8N_ROOT_LAST_NAME} ${N8N_ROOT_EMAIL} ${N8N_ROOT_PASSWORD} ${OPENWEBUI_ROOT_NAME} ${OPENWEBUI_ROOT_EMAIL} ${OPENWEBUI_ROOT_PASSWORD} ${OLLAMA_GATEWAY_USER} ${OLLAMA_GATEWAY_PASSWORD} ${NODE_DEV_PASSWORD} ${PYTHON_DEV_PASSWORD} ${AI_DEV_PASSWORD} ${CPP_DEV_PASSWORD}'

envsubst "${render_vars}" \
  < "${template_root}/lab-index.html.template" \
  > "${html_dir}/lab-index.html"

if [ -d "${template_root}/content" ]; then
  find "${template_root}/content" -type f -name '*.template' | while read -r src; do
    dst="${content_dir}/$(basename "${src}" .template)"
    envsubst "${render_vars}" < "${src}" > "${dst}"
  done
fi
