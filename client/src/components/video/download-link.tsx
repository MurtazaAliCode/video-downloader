import { useState } from "react";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setError(null);

    try {
      const downloadUrl = `/api/download/${jobId}`;
      
      // Native browser download (Best for Mobile Gallery/Downloads)
      // fetch+blob causes out-of-memory or stream errors on mobile networks.
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${fileName || 'video'}.mp4`;
      link.target = '_blank'; // Required for some iOS versions
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // We cannot know exactly when a native download finishes,
      // so we wait a few seconds and show success state.
      setTimeout(() => {
        setDownloaded(true);
        setIsDownloading(false);
      }, 2500);

    } catch (err) {
      console.error('Download error:', err);
      setError('Download failed. Please try again.');
      setIsDownloading(false);
    }
  };

  const handlePreview = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    } else {
      window.open(`/api/download/${jobId}`, '_blank');
    }
  };

  return (
    <Card className="border-green-500/50 shadow-lg shadow-green-500/10">
      <CardHeader>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all ${
            downloaded
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            {downloaded
              ? <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              : <Download className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            }
          </div>
          <CardTitle className={`text-2xl mb-2 ${
            downloaded ? 'text-green-600 dark:text-green-400' : 'text-foreground'
          }`}>
            {downloaded ? '✅ Video Downloaded!' : 'Your Video is Ready!'}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {downloaded
              ? 'Video has been saved to your Downloads folder.'
              : 'Click the Download button to save the video to your device.'}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">

        {/* ✅ Success Message */}
        {downloaded && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Download Complete!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  📁 Check your browser's <strong>Downloads bar</strong> (bottom of screen) or open your <strong>Downloads folder</strong> to find the video.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ⚠️ Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-600 dark:text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* ⬇️ Download Button */}
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold transition-all hover:scale-[1.02] disabled:opacity-70"
          data-testid="download-button"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Downloading... Please wait
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              {downloaded ? 'Download Again' : 'Download Video'}
            </>
          )}
        </Button>

        {/* 👁️ Preview Button (only shown after download) */}
        {downloaded && (
          <Button
            onClick={handlePreview}
            variant="outline"
            className="w-full py-4 font-medium border-blue-500/30 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400"
          >
            <Play className="w-4 h-4 mr-2" />
            Preview / Open Video
          </Button>
        )}

        {/* 🚀 Support + Another Video */}
        <div className="pt-1 space-y-3">
          <Button
            onClick={() => window.open('https://www.profitablecpmratenetwork.com/phb566a4t2?key=353d9eacad54473bb5e47ab851a76327', '_blank')}
            variant="secondary"
            className="w-full py-4 font-bold border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-700 dark:text-green-300 transition-all hover:scale-[1.02]"
          >
            🚀 Support Us (Click Here)
          </Button>

          <Button
            onClick={onProcessAnother}
            variant="outline"
            className="w-full py-3 font-medium border-primary/20 hover:bg-primary/5"
            data-testid="process-another-button"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Download Another Video
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
