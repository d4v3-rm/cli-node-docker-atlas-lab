ARG OLLAMA_VERSION=0.17.7
FROM ollama/ollama:${OLLAMA_VERSION}

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY infra/docker/images/ollama/start-ollama.sh /usr/local/bin/start-ollama.sh
RUN chmod +x /usr/local/bin/start-ollama.sh

ENTRYPOINT ["/usr/local/bin/start-ollama.sh"]
