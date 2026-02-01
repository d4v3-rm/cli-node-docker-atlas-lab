ARG CADDY_VERSION=2.10.2-alpine
FROM caddy:${CADDY_VERSION}

RUN apk add --no-cache gettext openssl

COPY templates/ /opt/gateway/templates/
COPY bootstrap-gateway.sh /usr/local/bin/bootstrap-gateway.sh
COPY start-gateway.sh /usr/local/bin/start-gateway.sh

RUN chmod +x /usr/local/bin/bootstrap-gateway.sh /usr/local/bin/start-gateway.sh

ENTRYPOINT ["/usr/local/bin/start-gateway.sh"]
