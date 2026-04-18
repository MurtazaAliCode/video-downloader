#!/bin/bash

# FFmpeg static download script for Render (Linux)
# This ensures that high-quality video merging works perfectly.

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
  echo "--------------------------------------------------------"
  echo "⚠️ WINDOWS DETECTED"
  echo "Automated FFmpeg install is for Linux (Render) only."
  echo "Please download ffmpeg.exe manually for Windows:"
  echo "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
  echo "Place 'ffmpeg.exe' in: $(pwd)"
  echo "--------------------------------------------------------"
  
  # Still try to download yt-dlp.exe for windows if possible, or just skip
  if [ ! -f "./yt-dlp.exe" ] && [ ! -f "./yt-dlp" ]; then
    echo "Note: You might also need yt-dlp.exe for Windows."
  fi
  exit 0
fi

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

# yt-dlp static download
if [ ! -f "./yt-dlp" ]; then
  echo "Downloading yt-dlp binary..."
  curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./yt-dlp
  chmod +x ./yt-dlp
  echo "yt-dlp installed successfully."
else
  echo "yt-dlp already exists, skipping download."
fi

