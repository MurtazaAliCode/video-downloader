import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, Loader2, Play, FolderOpen, AlertTriangle, ExternalLink, Video, Heart } from "lucide-react";

interface DownloadLinkProps {
  jobId: string;
  fileName: string;
  platform?: string;
  downloadFormat?: string;
  downloadUrl?: string | null;
  onProcessAnother: () => void;
}

export function DownloadLink({ jobId, fileName, platform, downloadFormat = 'mp4', downloadUrl: dbDownloadUrl, onProcessAnother }: DownloadLinkProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  // Priority: Use downloadUrl from DB if provided and starts with http
  const [downloadUrl, setDownloadUrl] = useState<string | null>(dbDownloadUrl && dbDownloadUrl.startsWith('http') ? dbDownloadUrl : null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const autoDownloadedRef = useRef(false);

  const handleDownload = async (isManual = false) => {
    setIsDownloading(true);
    setError(null);

    const apiDownloadUrl = `/api/download/${jobId}`;

    try {
      console.log('🚀 Triggering direct download...', { isManual });
      
      if (isManual) {
        // For manual click, open in a new tab to guarantee the browser initiates download
        window.open(apiDownloadUrl, '_blank');
      } else {
        // For automatic on-mount download, use a hidden iframe to prevent popup blocks and empty tabs
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = apiDownloadUrl;
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 15000);
      }

      setDownloaded(true);
      setIsDownloading(false);

    } catch (err: any) {
      console.warn('Download trigger failed, falling back to direct navigation...', err);
      window.location.href = apiDownloadUrl;
      setDownloaded(true);
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (!autoDownloadedRef.current) {
      autoDownloadedRef.current = true;
      handleDownload();
    }
  }, []);

  const handlePreview = () => {
    const baseUrl = (dbDownloadUrl && dbDownloadUrl.startsWith('http')) ? dbDownloadUrl : `/api/download/${jobId}`;
    const previewTarget = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}preview=true`;
    window.open(previewTarget, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="relative overflow-hidden border-0 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 dark:ring-white/10 group">
        {/* Animated Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>

        <CardHeader className="relative pb-2">
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 shadow-lg ${downloaded
                ? 'bg-gradient-to-br from-green-400 to-green-600 rotate-0'
                : 'bg-gradient-to-br from-blue-400 to-blue-600 rotate-12'
              }`}>
              {downloaded
                ? <CheckCircle className="w-10 h-10 text-white" />
                : <Download className="w-10 h-10 text-white" />
              }
            </div>

            <CardTitle className="text-3xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              {downloaded ? (downloadFormat === 'mp3' ? 'Ready to Listen!' : 'Ready to Watch!') : 'Download Ready'}
            </CardTitle>
            <p className="text-muted-foreground text-sm font-medium">
              {downloaded
                ? (
                  <>
                    Your {downloadFormat === 'mp3' ? 'audio' : 'video'} has been saved successfully.
                    {platform === 'youtube' && (
                      <span className="block mt-1 text-xs text-blue-500 font-bold">
                        (Click the 3-dots ⋮ on {downloadFormat === 'mp3' ? 'audio' : 'video'} to download)
                      </span>
                    )}
                  </>
                )
                : 'High-speed secure connection established.'}
            </p>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4 pt-4 text-center">

          {/* ✅ Success Message & Alternative Instructions */}
          {downloaded && (
            <div className="space-y-3">
              <div className={`border rounded-xl p-4 text-center transition-all duration-300 ${platform === 'youtube'
                  ? 'bg-blue-500/10 border-blue-500/30 shadow-sm'
                  : 'bg-green-500/10 border-green-500/30'
                }`}>
                <p className={`text-sm font-bold ${platform === 'youtube' ? 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'
                  }`}>
                  ✅ {downloadFormat === 'mp3' ? 'Audio' : 'Video'} Processed Successfully!
                </p>

                {platform === 'youtube' && (
                  <div className="mt-4 space-y-3 animate-in fade-in zoom-in-95 duration-500 text-center">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-bold uppercase tracking-tight">
                      👇 Easy Instruction:
                    </p>
                    <p className="text-[14px] text-blue-600 dark:text-blue-400 leading-relaxed font-medium">
                      Please click the **"Preview Video"** button below.
                      Then click **3-dots**
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500/20 rounded-md mx-1 font-bold text-lg leading-none">⋮</span>
                      on the video and select **"Download"**.
                    </p>
                  </div>
                )}
              </div>

              {/* Platform Specific Instruction for YouTube/TikTok (Consolidated) */}

            </div>
          )}

          <Button
            onClick={() => handleDownload(true)}
            disabled={isDownloading}
            className={`w-full py-6 sm:py-8 text-lg sm:text-xl font-bold transition-all duration-300 shadow-xl border-0 h-auto ${downloaded
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
              } hover:scale-[1.02] active:scale-95 disabled:grayscale`}
          >
            {isDownloading ? (
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Downloading File...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Download className="w-6 h-6" />
                <span>{downloaded ? 'Download Again' : 'Download Now'}</span>
              </div>
            )}
          </Button>

          {/* Mirror / Alternative Link (Subtle but Professional) */}
          {hasTriedFallback && !downloaded && (
            <div className="text-center p-4 bg-muted/20 rounded-xl border border-dashed border-muted-foreground/30">
              <p className="text-xs text-muted-foreground mb-2 italic">
                Optimizing your connection based on server traffic...
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`/api/download/${jobId}`, '_blank')}
                className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 text-xs font-semibold uppercase tracking-widest"
              >
                Use Alternative Mirror
              </Button>
            </div>
          )}



          {/* Secondary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="py-4 sm:py-6 font-semibold border-white/20 bg-white/10 hover:bg-white/20 dark:bg-black/20 backdrop-blur-md transition-all text-sm sm:text-base"
            >
              <Play className="w-4 h-4 mr-2" />
              Preview Video
            </Button>

            <Button
              onClick={onProcessAnother}
              variant="outline"
              className="py-6 font-semibold border-white/20 bg-white/10 hover:bg-white/20 dark:bg-black/20 backdrop-blur-md transition-all"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Next Video
            </Button>
          </div>

          {/* Support Our Mission Call-to-Action */}
          <Link href="/support">
            <Button
              className="w-full mt-4 py-5 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-primary/10 hover:from-red-500/20 hover:via-pink-500/20 hover:to-primary/20 border border-red-500/20 hover:border-red-500/30 text-foreground text-xs sm:text-sm font-extrabold transition-all duration-300 rounded-xl flex items-center justify-center gap-2 group relative overflow-hidden shadow-sm hover:shadow-md cursor-pointer"
            >
              <span className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-500"></span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse group-hover:scale-125 transition-transform" />
              <span>SUPPORT OUR FREE SERVERS ❤️</span>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Help Link (Moved here, making it less disruptive) */}
      <div className="text-center">
        <a
          href="/contact"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4"
        >
          Experiencing issues? Contact Support
        </a>
      </div>
    </div>
  );
}
