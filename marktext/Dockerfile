FROM jlesage/baseimage-gui:debian-12-v4

ARG MARKTEXT_VERSION

RUN \
  apt-get update && \
  apt-get install -y --no-install-recommends ca-certificates curl && \
  curl -L -o /tmp/marktext.deb "https://github.com/marktext/marktext/releases/download/v${MARKTEXT_VERSION}/marktext-amd64.deb" && \
  apt-get install -y --no-install-recommends /tmp/marktext.deb && \
  rm -f /tmp/marktext.deb && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

COPY startapp.sh /startapp.sh
RUN chmod +x /startapp.sh && set-cont-env APP_NAME "MarkText"
