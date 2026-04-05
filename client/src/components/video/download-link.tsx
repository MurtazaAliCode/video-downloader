import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, Loader2, Play, FolderOpen } from "lucide-react";

interface DownloadLinkProps {
  jobId: string;
  fileName: string;
  onProcessAnother: () => void;
}

export function DownloadLink({ jobId, fileName, onProcessAnother }: DownloadLinkProps) {
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
            <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 shadow-lg ${
              downloaded 
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
                ? 'Your video has been saved successfully.' 
                : 'High-speed secure connection established.'}
            </p>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4 pt-6">
          {/* Main Action Button */}
          <Button
            onClick={() => handleDownload(true)}
            disabled={isDownloading}
            className={`w-full py-8 text-xl font-bold transition-all duration-300 shadow-xl border-0 h-auto ${
              downloaded
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
          <div className="grid grid-cols-2 gap-3">
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

          {/* Support Ad Section */}
          <div 
            onClick={() => window.open('https://www.profitablecpmratenetwork.com/phb566a4t2?key=353d9eacad54473bb5e47ab851a76327', '_blank')}
            className="mt-6 p-4 rounded-xl bg-gradient-to-br from-yellow-400/10 to-orange-500/10 border border-yellow-500/20 cursor-pointer hover:border-yellow-500/40 transition-all text-center group/ad"
          >
            <div className="flex items-center justify-center space-x-2 text-yellow-600 dark:text-yellow-400 font-bold text-sm">
              <span className="animate-bounce">🚀</span>
              <span className="group-hover/ad:underline">Support Our Platform (Click to Unlock Speed)</span>
            </div>
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
