import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, Loader2, Play, FolderOpen, AlertTriangle, ExternalLink, Video } from "lucide-react";

interface DownloadLinkProps {
  jobId: string;
  fileName: string;
  platform?: string;
  onProcessAnother: () => void;
}

export function DownloadLink({ jobId, fileName, platform, onProcessAnother }: DownloadLinkProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const autoDownloadedRef = useRef(false);

  const handleDownload = async (isManual = false) => {
    if (isDownloading && !isManual) return;
    setIsDownloading(true);
    setError(null);

    const apiDownloadUrl = `/api/download/${jobId}`;
    const targetFileName = `${fileName || 'video'}.mp4`;

    try {
      // First, try the proxy download via our server
      console.log('🚀 Attempting download via proxy...');
      const response = await fetch(apiDownloadUrl);

      // If we get a redirect (301, 302) or a block (403), handle it
      if (response.redirected) {
        console.log('↩️ Server redirected to direct URL. User browser will handle it.');
        window.location.href = response.url;
        setDownloaded(true);
        setIsDownloading(false);
        return;
      }

      if (!response.ok) {
        console.warn(`Proxy failed with status ${response.status}`);
        // If it's a 403, we should have been redirected by the server already. 
        // If not, we'll try a manual fallback in the catch block.
        throw new Error('primary_failed');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = targetFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);

      setDownloaded(true);
      setIsDownloading(false);

    } catch (err: any) {
      console.warn('Primary download failed, attempting browser-direct fallback...', err);

      // Fallback: Just let the browser handle the redirect directly
      const mirrorLink = document.createElement('a');
      mirrorLink.href = apiDownloadUrl;
      mirrorLink.target = '_blank'; // Open in new tab to avoid losing current page if it's a direct file
      document.body.appendChild(mirrorLink);
      mirrorLink.click();
      document.body.removeChild(mirrorLink);

      setHasTriedFallback(true);
      setTimeout(() => {
        setDownloaded(true);
        setIsDownloading(false);
      }, 2000);
    }
  };

  useEffect(() => {
    if (!autoDownloadedRef.current) {
      autoDownloadedRef.current = true;
      handleDownload();
    }
  }, []);

  const handlePreview = () => {
    window.open(`/api/download/${jobId}`, '_blank');
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
              {downloaded ? 'Ready to Watch!' : 'Download Ready'}
            </CardTitle>
            <p className="text-muted-foreground text-sm font-medium">
              {downloaded
                ? (
                  <>
                    Your video has been saved successfully.
                    {platform === 'youtube' && (
                      <span className="block mt-1 text-xs text-blue-500 font-bold">
                        (Click the 3-dots ⋮ on video to download)
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
                  ✅ Video Processed Successfully!
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
              {platform === 'youtube' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 font-bold" />
                    </div>
                    <div className="text-left text-[13px] font-bold text-yellow-800 dark:text-yellow-400 leading-tight">
                      <p>Important: Normal download might be blocked. **Always use "Preview Video" mode.**</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={() => handleDownload(true)}
            disabled={isDownloading}
            className={`w-full py-8 text-xl font-bold transition-all duration-300 shadow-xl border-0 h-auto ${downloaded
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

          {/* ✨ High-Conversion Affiliate: Edit Video */}
          {downloaded && (
            <div className="pt-2 animate-in fade-in zoom-in-95 duration-500 delay-300">
              <a 
                href="https://www.mvvitrk.com/click?pid=6156&offer_id=9" 
                target="_blank" 
                rel="nofollow sponsored"
                className="w-full"
              >
                <Button className="w-full py-7 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-bold shadow-xl border-0 h-auto group transition-all">
                  <div className="flex items-center space-x-3">
                    <Video className="w-6 h-6 animate-pulse" />
                    <span>Edit like a Pro (1-Click)</span>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
              </a>
              <p className="text-[10px] text-muted-foreground mt-2 font-medium italic">
                *Recommended for creating high-quality Reels & TikToks from your downloads
              </p>
            </div>
          )}

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="py-6 font-semibold border-white/20 bg-white/10 hover:bg-white/20 dark:bg-black/20 backdrop-blur-md transition-all"
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
