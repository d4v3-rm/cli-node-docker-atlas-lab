#!/bin/sh
set -eu

if [ "$#" -eq 0 ]; then
  echo "usage: install-apt-packages.sh <package> [<package> ...]" >&2
  exit 64
fi

max_attempts="${APT_MAX_ATTEMPTS:-5}"
base_delay_seconds="${APT_RETRY_DELAY_SECONDS:-5}"
apt_update_options="-o Acquire::Retries=3 -o Acquire::http::No-Cache=true -o Acquire::https::No-Cache=true"

cleanup_apt_state() {
  apt-get clean
  rm -rf /var/lib/apt/lists/*
}

attempt=1
while [ "$attempt" -le "$max_attempts" ]; do
  cleanup_apt_state

  if apt-get ${apt_update_options} update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends "$@"; then
    cleanup_apt_state
    exit 0
  fi

  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "apt transaction failed after ${max_attempts} attempts" >&2
    exit 1
  fi

  sleep_seconds=$((attempt * base_delay_seconds))
  echo "apt transaction failed on attempt ${attempt}/${max_attempts}; retrying in ${sleep_seconds}s..." >&2
  attempt=$((attempt + 1))
  sleep "${sleep_seconds}"
done
