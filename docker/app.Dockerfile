# Base image - installs dependencies
FROM node:20 AS base
WORKDIR /ctm
COPY package.json package-lock.json ./
RUN npm ci

# Build stage
FROM base AS builder
COPY . .
RUN npm run build

# Runner stage
FROM base as runner
WORKDIR /ctm
ENV NODE_ENV production
# Disable Next telemetry for production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user to run as
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY package.json package-lock.json ./
RUN npm install --ignore-scripts
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
ENV HOSTNAME "0.0.0.0"

CMD [ "node", "server.js" ]
