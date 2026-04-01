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
