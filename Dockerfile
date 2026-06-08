# =====================================================
# Stage 1: Builder — Dependencies + Build
# =====================================================
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files first (cache optimization)
COPY package.json package-lock.json ./

# Install ALL deps (devDeps needed for build)
RUN npm ci --include=dev

# Copy source files
COPY . .

# Build:
# 1. Vite builds React → dist/public/
# 2. esbuild compiles server → dist/index.js
RUN YOUTUBE_DL_SKIP_DOWNLOAD=true npx vite build && \
    npx esbuild server/index.ts \
      --platform=node \
      --packages=external \
      --bundle \
      --format=esm \
      --outdir=dist

# =====================================================
# Stage 2: Runtime — Lean production image
# =====================================================
FROM node:20-slim AS runtime

WORKDIR /app

# Install system tools: ffmpeg, curl, etc.
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    ca-certificates \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Download yt-dlp Linux binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /app/yt-dlp && \
    chmod +x /app/yt-dlp

# Create symlinks so code finds ffmpeg at ./ffmpeg
RUN ln -sf /usr/bin/ffmpeg /app/ffmpeg && \
    ln -sf /usr/bin/ffprobe /app/ffprobe

# Copy package.json for production install
COPY package.json package-lock.json ./

# Install production deps only
RUN npm ci --omit=dev

# Copy built server from builder
COPY --from=builder /app/dist ./dist

# Copy shared schema (needed at runtime by drizzle)
COPY --from=builder /app/shared ./shared

# Copy cookies.txt (YouTube auth - optional)
# If cookies.txt doesn't exist, it's skipped gracefully
COPY --from=builder /app/cookies.txt* ./

# Create downloads folder
RUN mkdir -p /app/downloads

# Environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
