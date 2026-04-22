import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdBanner, AdInContent, AdSocialBar, AdStickyFooter } from "@/components/layout/AdSlots";
import AffiliateSmall from "@/components/layout/AffiliateSmall";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DownloadLink } from "@/components/video/download-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Job } from "@shared/schema";

interface ProcessingPageProps {
  params: {
    jobId: string;
  };
}

export default function Processing({ params }: ProcessingPageProps) {
  const [, setLocation] = useLocation();
  const { jobId } = params;
  
  const { data: job, isLoading } = useQuery<Job>({
    queryKey: ['/api/status', jobId],
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if job is completed or failed
      return data?.status === 'completed' || data?.status === 'failed' ? false : 2000;
    },
    enabled: !!jobId,
  });

  const handleProcessAnother = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Job not found</h1>
            <p className="text-muted-foreground mb-8">
              The processing job you're looking for doesn't exist or has expired.
            </p>
            <button
              onClick={handleProcessAnother}
              className="btn-gradient text-primary-foreground px-6 py-3 rounded-lg font-medium"
            >
              Go Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium Background Atmosphere */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <Header />
      <AdBanner />
      
      <div className="container relative z-10 mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white">
              {job.status === 'completed' ? 'Success!' : 'Processing...'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {job.status === 'completed' 
                ? 'Your video was processed by our high-speed engine.' 
                : job.status === 'failed'
                ? 'We encountered an issue, but don\'t worry!'
                : 'Our AI is extracting the best quality for you...'}
            </p>
          </div>

          {job.status === 'completed' ? (
            <DownloadLink
              jobId={jobId}
              fileName={job.title || 'video'} 
              platform={job.platform}
              onProcessAnother={handleProcessAnother}
            />
          ) : job.status === 'failed' ? (
            <Card className="border-0 bg-red-500/5 backdrop-blur-xl ring-1 ring-red-500/20 shadow-2xl overflow-hidden">
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-red-600 rotate-45" />
                </div>
                <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">Connection Interrupted</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pb-8 text-center px-8">
                <p className="text-muted-foreground leading-relaxed">
                  {job.errorMessage || 'The processing link expired or was interrupted. This can happen during peak traffic.'}
                </p>
                <div className="pt-2">
                  <Button
                    onClick={handleProcessAnother}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold shadow-lg shadow-red-500/20"
                  >
                    Try Alternative Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 bg-white/40 dark:bg-black/40 backdrop-blur-xl ring-1 ring-white/20 dark:ring-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
              <CardHeader className="text-center pt-12 pb-4">
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                  <div className="relative bg-gradient-to-br from-primary to-blue-600 w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Loader2 className="w-12 h-12 animate-spin text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-black tracking-tight mb-2">Analyzing Request</CardTitle>
                <p className="text-muted-foreground text-sm font-medium italic">
                  Fetching high-speed buffers from CDN...
                </p>
              </CardHeader>
              <CardContent className="space-y-8 px-10 pb-12">
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                     <span>Optimization</span>
                     <span>{Math.round(job.progress || 0)}%</span>
                   </div>
                   <ProgressBar 
                     value={job.progress || 0} 
                     className="h-3 bg-primary/10" 
                   />
                </div>
                
                <div className="pt-4 flex flex-col items-center">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">While you wait...</p>
                   <AffiliateSmall type="vpn" />
                </div>

                <div className="flex justify-center gap-4">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full ring-1 ring-black/5 dark:ring-white/5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Secure Proxy</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full ring-1 ring-black/5 dark:ring-white/5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-500"></div>
                    <span>CDN Ready</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 flex flex-col items-center">
            <small className="text-muted-foreground/60 uppercase text-[9px] font-bold mb-2 tracking-widest">Recommended for you</small>
            <AdInContent />
          </div>
        </div>
      </div>

      <Footer />
      <AdStickyFooter />
    </div>
  );
}
