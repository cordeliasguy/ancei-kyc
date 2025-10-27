# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.2.19
FROM oven/bun:${BUN_VERSION}-slim AS base

WORKDIR /app
ENV NODE_ENV=production

# --- build stage ----------------------------------------------------
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
        build-essential node-gyp pkg-config python-is-python3

# install root deps
COPY --link bun.lock package.json ./
RUN bun install --ci

# install frontend deps
COPY --link frontend/bun.lock frontend/package.json ./frontend/
RUN cd frontend && bun install --ci

# build the app
COPY --link . .
WORKDIR /app/frontend
RUN bun run build

# keep only the dist folder
RUN find . -mindepth 1 ! -regex '^./dist\(/.*\)?' -delete

# --- runtime stage ---------------------------------------------------
FROM base
COPY --from=build /app /app
EXPOSE 3000
CMD ["bun", "run", "start"]