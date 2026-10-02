# Stage 1: deps
FROM node:20-alpine AS deps
RUN npm install -g pnpm@10.33.2
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/game-logic/package.json ./packages/game-logic/
COPY apps/server/package.json ./apps/server/
RUN pnpm install --frozen-lockfile

# Stage 2: builder
FROM node:20-alpine AS builder
RUN npm install -g pnpm@10.33.2
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/game-logic/node_modules ./packages/game-logic/node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/game-logic/ ./packages/game-logic/
COPY apps/server/ ./apps/server/
# game-logic 먼저 빌드 후 server 빌드
RUN pnpm --filter @lexio/game-logic build
RUN pnpm --filter @lexio/server build

# Stage 3: runner (production)
FROM node:20-alpine AS runner
RUN npm install -g pnpm@10.33.2
WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/game-logic/package.json ./packages/game-logic/
COPY apps/server/package.json ./apps/server/
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/packages/game-logic/dist ./packages/game-logic/dist
COPY --from=builder /app/apps/server/dist ./apps/server/dist

EXPOSE 3001
CMD ["node", "apps/server/dist/index.js"]
