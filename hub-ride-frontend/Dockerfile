FROM node:22-alpine AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build

RUN corepack enable

ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1
ARG NEXT_PUBLIC_WS_URL=ws://localhost:8081/ws
ARG NEXT_PUBLIC_GOONG_API_KEY=
ARG NEXT_PUBLIC_ROOM_COUNTDOWN_SECONDS=30

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_GOONG_API_KEY=$NEXT_PUBLIC_GOONG_API_KEY
ENV NEXT_PUBLIC_ROOM_COUNTDOWN_SECONDS=$NEXT_PUBLIC_ROOM_COUNTDOWN_SECONDS

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
