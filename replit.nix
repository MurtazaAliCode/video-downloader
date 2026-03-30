{pkgs}: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.nodePackages.typescript-language-server
    pkgs.python3
    pkgs.yt-dlp
    pkgs.ffmpeg
  ];
}
