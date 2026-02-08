ARG N8N_VERSION=2.2.6

FROM debian:bookworm-slim AS ca_bundle

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && update-ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM n8nio/runners:${N8N_VERSION}

USER root

COPY --from=ca_bundle /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

RUN ln -sf /etc/ssl/certs/ca-certificates.crt /etc/ssl/cert.pem

USER runner
