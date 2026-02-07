ARG CADDY_VERSION=2.10.2-alpine
FROM caddy:${CADDY_VERSION}

RUN apk add --no-cache gettext openssl

COPY config/gateway/templates/ /opt/gateway/templates/
COPY infra/docker/images/gateway/bootstrap-gateway.sh /usr/local/bin/bootstrap-gateway.sh
COPY infra/docker/images/gateway/start-gateway.sh /usr/local/bin/start-gateway.sh

RUN chmod +x /usr/local/bin/bootstrap-gateway.sh /usr/local/bin/start-gateway.sh

ENTRYPOINT ["/usr/local/bin/start-gateway.sh"]
