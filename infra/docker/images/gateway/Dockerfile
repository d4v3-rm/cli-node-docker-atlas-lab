ARG CADDY_VERSION=2.10.2-alpine

FROM node:22-alpine AS lab_index_builder

WORKDIR /build

COPY package*.json ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY lab-index.vite.config.ts ./
COPY tsconfig.lab-index.json ./
COPY apps/lab-index/ ./apps/lab-index/

RUN npm run build:lab-index

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

COPY --from=lab_index_builder /build/.lab-index-dist/ /opt/gateway/lab-index-dist/
COPY config/gateway/templates/ /opt/gateway/templates/
COPY infra/docker/images/gateway/bootstrap-gateway.sh /usr/local/bin/bootstrap-gateway.sh
COPY infra/docker/images/gateway/start-gateway.sh /usr/local/bin/start-gateway.sh

RUN chmod +x /usr/local/bin/bootstrap-gateway.sh /usr/local/bin/start-gateway.sh

ENTRYPOINT ["/usr/local/bin/start-gateway.sh"]
