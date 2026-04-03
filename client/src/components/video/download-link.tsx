import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle } from "lucide-react";

interface DownloadLinkProps {
  jobId: string;
  fileName: string;
  onProcessAnother: () => void;
}

export function DownloadLink({ jobId, fileName, onProcessAnother }: DownloadLinkProps) {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const downloadTriggered = useRef(false);

  const handleDownload = () => {
    const downloadUrl = `/api/download/${jobId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `processed_${fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadStarted(true);
  };

  // Auto-download on mount
  useEffect(() => {
    if (!downloadTriggered.current) {
      handleDownload();
      downloadTriggered.current = true;
    }
  }, [jobId]);

  return (
    <Card className="border-green-500/50 shadow-lg shadow-green-500/10">
      <CardHeader>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl mb-2 text-green-600 dark:text-green-400">Saved to your device!</CardTitle>
          <p className="text-muted-foreground">Download has started automatically. If it didn't, click the button below.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Button */}
        <Button
          onClick={handleDownload}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold transition-all hover:scale-[1.02]"
          data-testid="download-button"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Again
        </Button>

        {/* Messaging */}
        <div className="bg-muted/30 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            ✓ Your video is now in your device's gallery/downloads.
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">
            The temporary file on our server will be cleared in 12 hours for security.
          </p>
        </div>

        {/* Process Another Video */}
        <div className="pt-4 space-y-3">
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
