#!/bin/sh
set -eu

ATLAS_AI_LLM_ENABLED="${ATLAS_AI_LLM_ENABLED:-false}"
ATLAS_WORKBENCH_ENABLED="${ATLAS_WORKBENCH_ENABLED:-false}"
export ATLAS_AI_LLM_ENABLED ATLAS_WORKBENCH_ENABLED

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

required_vars="
LAB_HTTPS_PORT
GITEA_HTTPS_PORT
PLANE_HTTPS_PORT
OPENWEBUI_HTTPS_PORT
OLLAMA_HTTPS_PORT
PENPOT_HTTPS_PORT
NEXTCLOUD_AIO_HTTPS_PORT
NODE_DEV_HTTPS_PORT
PYTHON_DEV_HTTPS_PORT
NEXTCLOUD_AIO_SETUP_HTTPS_PORT
LAB_PUBLIC_HOST
LAB_GATEWAY_IP
LAB_LOCAL_URL
LAB_URL
SSL_CERT_AUTOGEN
SSL_CERT_CN
SSL_CERT_DAYS
GITEA_URL
PLANE_URL
OPENWEBUI_URL
OLLAMA_URL
PENPOT_URL
NEXTCLOUD_AIO_URL
NODE_DEV_URL
PYTHON_DEV_URL
NEXTCLOUD_AIO_SETUP_URL
GITEA_ROOT_USERNAME
GITEA_ROOT_PASSWORD
GITEA_ROOT_EMAIL
PLANE_ROOT_NAME
PLANE_ROOT_EMAIL
PLANE_ROOT_PASSWORD
OPENWEBUI_ROOT_NAME
OPENWEBUI_ROOT_EMAIL
OPENWEBUI_ROOT_PASSWORD
PENPOT_ROOT_NAME
PENPOT_ROOT_EMAIL
PENPOT_ROOT_PASSWORD
NEXTCLOUD_AIO_ROOT_USERNAME
NEXTCLOUD_AIO_ROOT_PASSWORD
OLLAMA_GATEWAY_USER
OLLAMA_GATEWAY_PASSWORD
NEXTCLOUD_AIO_MASTER_PORT
NEXTCLOUD_AIO_APACHE_PORT
POSTGRES_DEV_SUPERUSER
POSTGRES_DEV_PASSWORD
POSTGRES_DEV_DATABASE
NODE_DEV_PASSWORD
PYTHON_DEV_PASSWORD
"

for var_name in ${required_vars}; do
  require_nonempty "${var_name}"
done

template_root="/opt/gateway/templates"
frontend_dist_root="/opt/gateway/atlas-dashboard-dist"
site_root="/srv"
content_dir="${site_root}/content"
asset_dir="${site_root}/assets"
runtime_dir="${site_root}/runtime"
dynamic_dir="/etc/caddy/dynamic"
cert_dir="/etc/caddy/certs"
cert_file="${cert_dir}/lab.crt"
key_file="${cert_dir}/lab.key"
caddy_template="${ATLAS_GATEWAY_TEMPLATE:-Caddyfile.template}"

mkdir -p "${site_root}" "${content_dir}" "${asset_dir}" "${runtime_dir}" "${dynamic_dir}" "${cert_dir}"

if [ ! -f "${template_root}/${caddy_template}" ]; then
  echo "Missing gateway template: ${caddy_template}" >&2
  exit 1
fi

if [ ! -f "${frontend_dist_root}/index.html" ]; then
  echo "Missing Atlas Dashboard frontend build output." >&2
  exit 1
fi

host_list="
${LAB_PUBLIC_HOST}
${LAB_GATEWAY_IP}
"

if [ "${SSL_CERT_AUTOGEN}" = "1" ] && { [ ! -f "${cert_file}" ] || [ ! -f "${key_file}" ]; }; then
  tmp_config="$(mktemp)"
  {
    echo "[req]"
    echo "distinguished_name = dn"
    echo "x509_extensions = v3_req"
    echo "prompt = no"
    echo
    echo "[dn]"
    echo "CN = ${SSL_CERT_CN}"
    echo
    echo "[v3_req]"
    echo "subjectAltName = @alt_names"
    echo
    echo "[alt_names]"
  } > "${tmp_config}"

  dns_idx=1
  ip_idx=1

  printf '%s\n' "${host_list}" | awk 'NF { print $0 }' | while read -r host; do
    case "${host}" in
      *[!0-9.]*)
        echo "DNS.${dns_idx} = ${host}" >> "${tmp_config}"
        dns_idx=$((dns_idx + 1))
        ;;
      *)
        echo "IP.${ip_idx} = ${host}" >> "${tmp_config}"
        ip_idx=$((ip_idx + 1))
        ;;
    esac
  done

  openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout "${key_file}" \
    -out "${cert_file}" \
    -days "${SSL_CERT_DAYS}" \
    -config "${tmp_config}" \
    -extensions v3_req

  rm -f "${tmp_config}"
fi

chmod 600 "${key_file}"
chmod 644 "${cert_file}"
cp "${cert_file}" "${asset_dir}/lab.crt"

OLLAMA_GATEWAY_PASSWORD_HASH="$(caddy hash-password --plaintext "${OLLAMA_GATEWAY_PASSWORD}")"

export OLLAMA_GATEWAY_PASSWORD_HASH

render_vars='${LAB_HTTPS_PORT} ${GITEA_HTTPS_PORT} ${PLANE_HTTPS_PORT} ${OPENWEBUI_HTTPS_PORT} ${OLLAMA_HTTPS_PORT} ${PENPOT_HTTPS_PORT} ${NEXTCLOUD_AIO_HTTPS_PORT} ${NODE_DEV_HTTPS_PORT} ${PYTHON_DEV_HTTPS_PORT} ${NEXTCLOUD_AIO_SETUP_HTTPS_PORT} ${LAB_PUBLIC_HOST} ${LAB_GATEWAY_IP} ${LAB_LOCAL_URL} ${LAB_URL} ${ATLAS_AI_LLM_ENABLED} ${ATLAS_WORKBENCH_ENABLED} ${GITEA_URL} ${PLANE_URL} ${OPENWEBUI_URL} ${OLLAMA_URL} ${PENPOT_URL} ${NEXTCLOUD_AIO_URL} ${NODE_DEV_URL} ${PYTHON_DEV_URL} ${NEXTCLOUD_AIO_SETUP_URL} ${GITEA_ROOT_USERNAME} ${GITEA_ROOT_PASSWORD} ${GITEA_ROOT_EMAIL} ${PLANE_ROOT_NAME} ${PLANE_ROOT_EMAIL} ${PLANE_ROOT_PASSWORD} ${OPENWEBUI_ROOT_NAME} ${OPENWEBUI_ROOT_EMAIL} ${OPENWEBUI_ROOT_PASSWORD} ${PENPOT_ROOT_NAME} ${PENPOT_ROOT_EMAIL} ${PENPOT_ROOT_PASSWORD} ${NEXTCLOUD_AIO_ROOT_USERNAME} ${NEXTCLOUD_AIO_ROOT_PASSWORD} ${OLLAMA_GATEWAY_USER} ${OLLAMA_GATEWAY_PASSWORD} ${OLLAMA_GATEWAY_PASSWORD_HASH} ${NEXTCLOUD_AIO_MASTER_PORT} ${NEXTCLOUD_AIO_APACHE_PORT} ${POSTGRES_DEV_SUPERUSER} ${POSTGRES_DEV_PASSWORD} ${POSTGRES_DEV_DATABASE} ${POSTGRES_DEV_HOST_PORT} ${NODE_DEV_PASSWORD} ${PYTHON_DEV_PASSWORD}'

envsubst "${render_vars}" \
  < "${template_root}/${caddy_template}" \
  > /etc/caddy/Caddyfile

caddy fmt --overwrite /etc/caddy/Caddyfile >/dev/null 2>&1 || true

rm -rf "${site_root}/index.html" "${site_root}/static" "${site_root}/runtime"
mkdir -p "${runtime_dir}"
cp -R "${frontend_dist_root}/." "${site_root}/"

envsubst "${render_vars}" \
  < "${template_root}/runtime/lab-config.json.template" \
  > "${runtime_dir}/lab-config.json"

if [ -d "${template_root}/content" ]; then
  find "${template_root}/content" -type f -name '*.template' | while read -r src; do
    dst="${content_dir}/$(basename "${src}" .template)"
    envsubst "${render_vars}" < "${src}" > "${dst}"
  done
fi
