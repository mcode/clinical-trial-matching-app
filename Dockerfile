# syntax=docker/dockerfile:1

# Base image - allows the Node version to be set once
FROM node:20 AS base

# Build stage
FROM base AS deps
WORKDIR /ctm
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Target "dev" to run the system in dev mode, rather than production mode.
FROM deps AS dev
EXPOSE 3200
CMD [ "node", "server.js" ]

FROM deps AS builder
RUN npm run build

# Runner stage
FROM base AS runner
WORKDIR /ctm
ENV NODE_ENV production
# Disable Next telemetry for production
ENV NEXT_TELEMETRY_DISABLED 1

COPY package.json package-lock.json ./
# Because this is a local copy, we can modify it. Remove the prepare script -
# otherwise NPM will attempt to run it, even in production mode, which appears
# to be a bug that will never be fixed
# (see https://github.com/npm/cli/issues/4027)
RUN npm pkg delete scripts.prepare
RUN npm ci

# Create a non-root user to run as
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY ./public/ ./public/
# The local* thing is effectively a way of saying "if exists"
COPY ./.env ./.env.local* ./.env.production.local* ./next.config.js ./server.js ./
# Copy final code over from the builder
COPY --from=builder --chown=nextjs:nodejs /ctm/.next/ ./.next/

# Create a sessions dir to store sessions in
# (The workdir is owned by root and it makes the most sense to leave it that
# way - this also makes it possible for a future version to mount the session
# dir on a Docker volume to potentially share between multiple containers)
RUN mkdir ./sessions
RUN chown nextjs:nodejs ./sessions

USER nextjs
EXPOSE 3200

ENV SESSION_DIR "/ctm/sessions"

CMD [ "node", "server.js" ]
