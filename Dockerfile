FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global pnpm@9.14.4
WORKDIR /app
ENV DATABASE_URL=file:/app/data/oracle.db
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm exec prisma generate && pnpm exec nuxt prepare && pnpm build

FROM node:22-bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY deploy/start.mjs ./deploy/start.mjs
RUN mkdir /app/data && chown node:node /app/data
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DATABASE_URL=file:/app/data/oracle.db
USER node
EXPOSE 3000
CMD ["node", "deploy/start.mjs"]
