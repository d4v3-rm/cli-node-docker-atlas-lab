FROM nginx:1.27-alpine

RUN apk add --no-cache apache2-utils gettext openssl

COPY docker-entrypoint.d/ /docker-entrypoint.d/
COPY templates/ /opt/gateway/templates/
RUN chmod +x /docker-entrypoint.d/*.sh
