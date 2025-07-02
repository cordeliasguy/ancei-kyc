# syntax = docker/dockerfile:1

# Use slim Bun base image
ARG BUN_VERSION=1.2.17
FROM oven/bun:${BUN_VERSION}-slim AS base

WORKDIR /app
ENV NODE_ENV=production

# === Build Stage ===
FROM base AS build

# Install native build dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Copy everything
COPY --link . .

# Install backend deps
RUN bun install --ci --frozen-lockfile

# Build frontend
WORKDIR /app/frontend
RUN bun install --ci --frozen-lockfile && bun run build

# Move frontend build output to a safer place
RUN mv dist /app/frontend-dist && rm -rf /app/frontend

# === Final Runtime Image ===
FROM base

# Copy only what is needed
COPY --from=build /app /app

# Restore the frontend dist output to /app/frontend/dist
RUN mkdir -p /app/frontend && mv /app/frontend-dist /app/frontend/dist

# Expose the backend port (adjust if needed)
EXPOSE 3000

# Run your Bun server
CMD ["bun", "run", "start"]