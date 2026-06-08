# =====================================================
# Stage 1: Builder — Dependencies + Build
# =====================================================
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install ALL deps
RUN npm ci --include=dev

# Copy source files
COPY . .

# Build frontend & backend
RUN YOUTUBE_DL_SKIP_DOWNLOAD=true npx vite build && \
    npx esbuild server/index.ts \
      --platform=node \
      --packages=external \
      --bundle \
      --format=esm \
      --outdir=dist

# =====================================================
# Stage 2: Runtime — Hugging Face Spec (Port 7860 + User 1000)
# =====================================================
FROM node:20-slim AS runtime

WORKDIR /app

# Install system tools
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

# Create symlinks for ffmpeg
RUN ln -sf /usr/bin/ffmpeg /app/ffmpeg && \
    ln -sf /usr/bin/ffprobe /app/ffprobe

# Copy package.json for production
COPY package.json package-lock.json ./

# Install production deps
RUN npm ci --omit=dev

# Copy built server from builder
COPY --from=builder /app/dist ./dist

# Copy shared schema
COPY --from=builder /app/shared ./shared

# Copy cookies.txt (optional)
COPY --from=builder /app/cookies.txt* ./

# Create downloads folder and set ownership to 'node' user (UID 1000)
RUN mkdir -p /app/downloads && \
    chown -R node:node /app

# Switch to non-root 'node' user (Hugging Face requirement)
USER node

# Environment (Hugging Face expects port 7860)
ENV NODE_ENV=production
ENV PORT=7860

EXPOSE 7860

# Start server
CMD ["node", "dist/index.js"]
