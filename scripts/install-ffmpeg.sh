#!/bin/bash

# FFmpeg static download script for Render (Linux)
# This ensures that high-quality video merging works perfectly.

if [ ! -f "./ffmpeg" ]; then
  echo "Downloading FFmpeg static binary..."
  mkdir -p ./tmp_ffmpeg
  curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o ./tmp_ffmpeg/ffmpeg.tar.xz
  tar -xvf ./tmp_ffmpeg/ffmpeg.tar.xz -C ./tmp_ffmpeg --strip-components=1
  mv ./tmp_ffmpeg/ffmpeg ./ffmpeg
  mv ./tmp_ffmpeg/ffprobe ./ffprobe
  chmod +x ./ffmpeg ./ffprobe
  rm -rf ./tmp_ffmpeg
  echo "FFmpeg installed successfully."
else
  echo "FFmpeg already exists, skipping download."
fi

# yt-dlp static download (direct link to bypass API rate limit)
if [ ! -f "./yt-dlp" ]; then
  echo "Downloading yt-dlp binary..."
  curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./yt-dlp
  chmod +x ./yt-dlp
  echo "yt-dlp installed successfully."
else
  echo "yt-dlp already exists, skipping download."
fi
