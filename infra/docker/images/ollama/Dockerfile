ARG OLLAMA_VERSION=0.20.5
FROM ollama/ollama:${OLLAMA_VERSION}

USER root

COPY infra/docker/images/common/install-apt-packages.sh /usr/local/bin/install-apt-packages.sh

RUN chmod +x /usr/local/bin/install-apt-packages.sh \
    && /usr/local/bin/install-apt-packages.sh netcat-openbsd

COPY infra/docker/images/ollama/start-ollama.sh /usr/local/bin/start-ollama.sh
RUN chmod +x /usr/local/bin/start-ollama.sh

ENTRYPOINT ["/usr/local/bin/start-ollama.sh"]
