ARG OLLAMA_VERSION=0.17.7
FROM ollama/ollama:${OLLAMA_VERSION}

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*
