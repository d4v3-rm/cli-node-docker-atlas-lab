FROM mcr.microsoft.com/dotnet/sdk:8.0-bookworm-slim

ARG SWARMUI_GIT_REF

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      bash \
      build-essential \
      ca-certificates \
      ffmpeg \
      git \
      libgl1 \
      libglib2.0-0 \
      python3-pip \
      python3.11 \
      python3.11-dev \
      python3.11-venv \
      wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt

RUN git clone https://github.com/mcmonkeyprojects/SwarmUI.git /SwarmUI \
    && cd /SwarmUI \
    && git checkout "${SWARMUI_GIT_REF}" \
    && git config --global --add safe.directory '*' \
    && mkdir -p ./src/bin \
    && dotnet build src/SwarmUI.csproj --configuration Release -o ./src/bin/live_release \
    && git rev-parse HEAD > ./src/bin/last_build

COPY infra/docker/images/swarmui/setup-swarmui.sh /usr/local/bin/setup-swarmui.sh
COPY infra/docker/images/swarmui/start-swarmui.sh /usr/local/bin/start-swarmui.sh

RUN chmod +x /usr/local/bin/setup-swarmui.sh /usr/local/bin/start-swarmui.sh

WORKDIR /SwarmUI

ENTRYPOINT ["/usr/local/bin/start-swarmui.sh"]
