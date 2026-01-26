ARG BASE_IMAGE
FROM ${BASE_IMAGE}

USER root

ARG CPP_PACKAGES
ARG INSTALL_PACKAGES

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    ${CPP_PACKAGES} \
    ${INSTALL_PACKAGES} && \
  rm -rf /var/lib/apt/lists/*

COPY start-cpp-dev.sh /usr/local/bin/start-cpp-dev.sh
RUN chmod +x /usr/local/bin/start-cpp-dev.sh

USER 1000
WORKDIR /workspace

ENTRYPOINT ["/usr/local/bin/start-cpp-dev.sh"]
