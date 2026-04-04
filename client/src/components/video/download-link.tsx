import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, Loader2 } from "lucide-react";

interface DownloadLinkProps {
  jobId: string;
  fileName: string;
  onProcessAnother: () => void;
}

export function DownloadLink({ jobId, fileName, onProcessAnother }: DownloadLinkProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const downloadUrl = `/api/download/${jobId}`;

      // Use fetch to get the file as blob (works with Content-Disposition: attachment)
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Check if it's a redirect to external URL (fallback case)
      const contentDisposition = response.headers.get('content-disposition');
      
      if (contentDisposition && contentDisposition.includes('attachment')) {
        // Server gave us the file directly with attachment header
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        // Get filename from header or use default
        const match = contentDisposition.match(/filename="?([^";\n]*)"?/);
        link.download = match?.[1] || `${fileName || 'video'}.mp4`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      } else {
        // Fallback: direct link download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${fileName || 'video'}.mp4`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloaded(true);
    } catch (error) {
      console.error('Download error:', error);
      // Last resort: open in new tab
      window.open(`/api/download/${jobId}`, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="border-green-500/50 shadow-lg shadow-green-500/10">
      <CardHeader>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl mb-2 text-green-600 dark:text-green-400">
            {downloaded ? 'Download Started! ✓' : 'Your Video is Ready!'}
          </CardTitle>
          <p className="text-muted-foreground">
            {downloaded
              ? 'Check your Downloads folder.'
              : 'Click the button below to save the video to your device.'}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold transition-all hover:scale-[1.02]"
          data-testid="download-button"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              {downloaded ? 'Download Again' : 'Download Video'}
            </>
          )}
        </Button>

        {downloaded && (
          <div className="bg-green-500/10 rounded-lg p-4 text-center border border-green-500/20">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              ✓ Video saved to your Downloads folder
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Check your browser's download bar or Downloads folder
            </p>
          </div>
        )}

        {/* Process Another Video */}
        <div className="pt-2 space-y-3">
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
            Download Another Video
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
