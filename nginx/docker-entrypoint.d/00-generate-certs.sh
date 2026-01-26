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

require_nonempty SSL_CERT_AUTOGEN
require_nonempty SSL_CERT_CN
require_nonempty SSL_CERT_SAN
require_nonempty SSL_CERT_DAYS

if [ "${SSL_CERT_AUTOGEN}" != "1" ]; then
  exit 0
fi

cert_dir="/etc/nginx/certs"
cert_file="${cert_dir}/fullchain.pem"
key_file="${cert_dir}/privkey.pem"

if [ -f "${cert_file}" ] && [ -f "${key_file}" ]; then
  exit 0
fi

mkdir -p "${cert_dir}"

cn="${SSL_CERT_CN}"
days="${SSL_CERT_DAYS}"
san="${SSL_CERT_SAN}"

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "${key_file}" \
  -out "${cert_file}" \
  -days "${days}" \
  -subj "/CN=${cn}" \
  -addext "subjectAltName=${san}"

chmod 600 "${key_file}"
chmod 644 "${cert_file}"
