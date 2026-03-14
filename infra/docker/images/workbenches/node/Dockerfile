ARG BASE_IMAGE=ghcr.io/coder/code-server:4.109.5
FROM ${BASE_IMAGE}

USER root

ARG NODE_VERSION
ARG PNPM_VERSION
ARG YARN_VERSION
ARG INSTALL_PACKAGES
ARG TARGETARCH

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    openssh-client \
    python3 \
    make \
    g++ \
    xz-utils \
    bash \
    ${INSTALL_PACKAGES} && \
  rm -rf /var/lib/apt/lists/*

RUN set -eux; \
  case "${TARGETARCH}" in \
    amd64) node_arch="linux-x64" ;; \
    arm64) node_arch="linux-arm64" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" >&2; exit 1 ;; \
  esac; \
  curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-${node_arch}.tar.xz" -o /tmp/node.tar.xz; \
  tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1; \
  rm /tmp/node.tar.xz; \
  corepack enable; \
  corepack prepare "pnpm@${PNPM_VERSION}" --activate; \
  corepack prepare "yarn@${YARN_VERSION}" --activate

COPY infra/docker/images/workbenches/node/start-node-dev.sh /usr/local/bin/start-node-dev.sh
RUN chmod +x /usr/local/bin/start-node-dev.sh

USER 1000
WORKDIR /workspace

ENTRYPOINT ["/usr/local/bin/start-node-dev.sh"]
