ARG CADDY_VERSION=2.11.2-alpine

FROM node:22-alpine AS atlas_dashboard_builder

WORKDIR /build

COPY package*.json ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY config/atlas-dashboard/ ./config/atlas-dashboard/
COPY apps/atlas-dashboard/ ./apps/atlas-dashboard/

RUN npm run build:atlas-dashboard

FROM caddy:${CADDY_VERSION}

RUN set -eu; \
    attempts=0; \
    until apk add --no-cache gettext openssl; do \
      attempts=$((attempts + 1)); \
      if [ "${attempts}" -ge 5 ]; then \
        echo "apk add failed after ${attempts} attempts" >&2; \
        exit 1; \
      fi; \
      sleep $((attempts * 2)); \
    done

COPY --from=atlas_dashboard_builder /build/.atlas-dashboard-dist/ /opt/gateway/atlas-dashboard-dist/
COPY config/gateway/templates/ /opt/gateway/templates/
COPY infra/docker/images/gateway/bootstrap-gateway.sh /usr/local/bin/bootstrap-gateway.sh
COPY infra/docker/images/gateway/start-gateway.sh /usr/local/bin/start-gateway.sh

RUN chmod +x /usr/local/bin/bootstrap-gateway.sh /usr/local/bin/start-gateway.sh

ENTRYPOINT ["/usr/local/bin/start-gateway.sh"]
