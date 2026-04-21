import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdBanner, AdSidebar, AdInContent, AdSocialBar, AdStickyFooter, AdRecommended } from "@/components/layout/AdSlots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Download, Link, Monitor, Tablet, Smartphone, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import youtubeLogo from "@/assets/youtube.jpg";
import facebookLogo from "@/assets/facebook.png";
import instagramLogo from "@/assets/instagram.jpg";
import tiktokLogo from "@/assets/tiktok.png";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("mp4");
  const [isQualityDialogOpen, setIsQualityDialogOpen] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<string>("");
  const [metadata, setMetadata] = useState<{ title: string, thumbnail: string, duration?: string } | null>(null);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);



  const detectPlatform = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('tiktok.com')) return 'tiktok';
    return 'unknown';
  };

  const validateUrl = (url: string) => {
    const platform = detectPlatform(url);
    if (platform === 'unknown') {
      return { valid: false, message: 'Please enter a valid YouTube, Facebook, Instagram, or TikTok video URL' };
    }
    try {
      new URL(url);
      return { valid: true, platform };
    } catch {
      return { valid: false, message: 'Please enter a valid URL' };
    }
  };

  // Automatic metadata fetching
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (videoUrl && validateUrl(videoUrl).valid) {
        setIsFetchingMetadata(true);
        try {
          const res = await fetch(`/api/fetch-metadata?url=${encodeURIComponent(videoUrl)}`);
          const data = await res.json();
          if (data.success) {
            setMetadata(data);
          }
        } catch (err) {
          console.error("Metadata fetch error:", err);
          setMetadata(null);
        } finally {
          setIsFetchingMetadata(false);
        }
      } else {
        setMetadata(null);
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [videoUrl]);

  // Track page visit
  useEffect(() => {
    fetch('/api/track-visit', { method: 'POST' }).catch(err => console.error("Tracking error:", err));
  }, []);

  const handleInitialClick = () => {
    if (!videoUrl.trim()) {
      toast({
        variant: "destructive",
        title: "URL Required",
        description: "Please enter a video URL to download.",
      });
      return;
    }

    const validation = validateUrl(videoUrl);
    if (!validation.valid) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: validation.message,
      });
      return;
    }

    setDetectedPlatform(validation.platform || "unknown");
    setIsQualityDialogOpen(true);
  };

  const handleQualitySelection = (qualityId: string) => {
    if (qualityId === 'mp3') {
      setDownloadFormat('mp3');
      startDownload('high'); // Default audio quality
    } else {
      // TEMPORARY: Clean Launch Mode (All downloads start directly)
      setDownloadFormat('mp4');
      startDownload(qualityId);
    }
  };

  const startDownload = async (selectedQuality: string) => {
    setIsQualityDialogOpen(false);
    setIsDownloading(true);

    try {
      const response = await apiRequest('POST', '/api/download-video', {
        url: videoUrl,
        format: downloadFormat,
        platform: detectedPlatform,
        options: { quality: selectedQuality }
      });

      const result = await response.json();
      setLocation(`/processing/${result.jobId}`);

    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Please check the URL and try again.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const qualityOptions = [
    {
      id: 'highest',
      label: 'Ultra High (1080p)',
      desc: 'High resolution digital copy',
      icon: <Monitor className="w-5 h-5" />,
    },
    {
      id: 'high',
      label: 'High (720p)',
      desc: 'Standard HD quality',
      icon: <Tablet className="w-5 h-5" />,
    },
    {
      id: 'medium',
      label: 'Standard (480p)',
      desc: 'Direct download',
      icon: <Smartphone className="w-5 h-5" />,
    },
    {
      id: 'low',
      label: 'Low (360p)',
      desc: 'Smallest file size',
      icon: <Smartphone className="w-5 h-5" />,
    },
    {
      id: 'mp3',
      label: 'MP3 Audio Only',
      desc: 'Extract high quality audio',
      icon: <Monitor className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      <Header />
      {/* <AdBanner /> */}

      {/* Hero Section */}
      <section className="min-h-screen dark:gradient-bg-dark gradient-bg relative overflow-hidden flex items-center">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="absolute inset-0 bg-background/10 backdrop-blur-[2px]"></div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28 sm:pt-32">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            >
              Download Videos
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-primary-foreground drop-shadow-sm">
                in MP4 or MP3
              </span>
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8 font-medium"
            >
              Download videos from YouTube, Facebook, Instagram, and TikTok. Fast, free, and designed for your privacy.
            </motion.p>
          </motion.div>

          <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
            {/* URL Input and Download Area */}
            <div className="lg:col-span-3 space-y-8">
              {/* URL Input Box */}
              <Card className="glass-card shadow-2xl border-white/30 overflow-hidden">
                <CardContent className="p-4 sm:p-8 md:p-12">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Link className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-card-foreground mb-2">
                        Enter Video URL
                      </h3>
                      <p className="text-muted-foreground">
                        Paste the URL of the video you want to download
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="text-lg py-6"
                        data-testid="video-url-input"
                      />

                      {/* Metadata Preview Card */}
                      {isFetchingMetadata ? (
                        <div className="w-full h-24 bg-white/5 rounded-xl animate-pulse flex items-center justify-center border border-white/10">
                          <p className="text-sm text-muted-foreground">Fetching video details...</p>
                        </div>
                      ) : metadata && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-md"
                        >
                          <img 
                            src={metadata.thumbnail} 
                            alt={metadata.title} 
                            className="w-full sm:w-32 h-20 object-cover rounded-lg shadow-md"
                          />
                          <div className="flex-1 text-center sm:text-left overflow-hidden">
                            <h4 className="font-bold text-white truncate">{metadata.title}</h4>
                            <p className="text-xs text-white/60 mt-1 uppercase tracking-wider">{metadata.duration ? `Duration: ${metadata.duration}` : 'Connected'}</p>
                          </div>
                        </motion.div>
                      )}

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-4 uppercase tracking-widest font-semibold opacity-60">Compatible Platforms</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
                          {[
                            { name: "YouTube", logo: youtubeLogo, color: "hover:bg-red-500/10 hover:border-red-500/30" },
                            { name: "Facebook", logo: facebookLogo, color: "hover:bg-blue-500/10 hover:border-blue-500/30" },
                            { name: "Instagram", logo: instagramLogo, color: "hover:bg-pink-500/10 hover:border-pink-500/30" },
                            { name: "TikTok", logo: tiktokLogo, color: "hover:bg-black/10 hover:border-black/30", extraClass: "bg-white p-1" },
                          ].map((platform) => (
                            <div 
                              key={platform.name}
                              className={`flex flex-col items-center p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all duration-300 group cursor-default ${platform.color}`}
                            >
                              <img 
                                src={platform.logo} 
                                alt={platform.name} 
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${platform.extraClass || ""}`} 
                              />
                              <span className="text-[10px] sm:text-xs font-bold mt-3 text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-tight">
                                {platform.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={handleInitialClick}
                        disabled={isDownloading || !videoUrl.trim()}
                        className="w-full btn-gradient text-primary-foreground py-6 text-lg font-semibold hover:scale-[1.02] transition-all"
                        data-testid="download-button"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        {isDownloading ? "Processing..." : "Start Download"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with Ads and Features */}
            <div className="lg:col-span-1 space-y-6">
              {/* <AdSidebar /> */}

              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg">Key Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "100% Free", desc: "No registration required", iconColor: "bg-green-500" },
                    { title: "High Quality", desc: "Supports MP4 & MP3 format", iconColor: "bg-blue-500" },
                    { title: "Fast Downloads", desc: "Direct download links", iconColor: "bg-purple-500" },
                    { title: "Safe & Secure", desc: "No malware or ads", iconColor: "bg-yellow-500" },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 group">
                      <div className={`w-6 h-6 ${feature.iconColor} rounded-full flex items-center justify-center mt-0.5 shadow-sm group-hover:scale-110 transition-transform`}>
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-card border-white/20 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    {[
                      { value: "100,000+", label: "Videos Downloaded", sub: "Global users" },
                      { value: "25,000+", label: "Happy Users", sub: "Daily active" },
                      { value: "MP4", label: "Output Format", sub: "High compatibility" },
                    ].map((stat, index) => (
                      <div key={index} className="text-center relative py-2">
                        <div className="text-3xl font-extrabold text-foreground dark:text-white drop-shadow-md">{stat.value}</div>
                        <div className="text-sm font-semibold text-muted-foreground dark:text-white/80">{stat.label}</div>
                        <div className="text-[10px] text-muted-foreground/60 dark:text-white/40 uppercase tracking-tighter">{stat.sub}</div>
                        {index < 2 && <div className="hidden lg:block absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-px bg-white/10"></div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Selection Dialog */}
      <Dialog open={isQualityDialogOpen} onOpenChange={setIsQualityDialogOpen}>
        <DialogContent className="sm:max-w-md glass-card backdrop-blur-2xl border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-white">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              Select Video Quality
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {qualityOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleQualitySelection(opt.id)}
                className="flex items-center justify-between p-4 rounded-2xl border border-white/10 hover:border-white/40 hover:bg-white/10 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    {opt.icon}
                  </div>
                  <div>
                    <p className="font-bold text-white">{opt.label}</p>
                    <p className="text-xs text-white/60">{opt.desc}</p>
                  </div>
                </div>
                <div className="text-white/20 group-hover:text-white/60 transition-colors">
                  <Download className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* <div className="container mx-auto px-4 max-w-4xl pt-8">
        <AdInContent />
      </div> */}

      {/* <div className="container mx-auto px-4 max-w-4xl mt-12">
        <div className="bg-muted p-3 rounded-lg flex flex-col items-center">
           <small className="text-muted-foreground/60 uppercase text-[9px] font-bold mb-2">Recommended Service</small>
           <AdRecommended />
        </div>
      </div> */}

      {/* Features Section */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Powerful Video Downloading
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Everything you need to save your favorite content from any major platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "YouTube Downloads",
                desc: "Download videos and audio from YouTube in high quality MP4 or MP3 format.",
                features: ["HD/4K MP4", "320kbps MP3", "Direct conversion"],
                color: "red",
              },
              {
                title: "Facebook Videos",
                desc: "Download videos from Facebook posts and pages. Get your favorite videos offline.",
                features: ["Public videos", "Page content", "Story downloads"],
                color: "blue",
              },
              {
                title: "Instagram Content",
                desc: "Download Instagram videos, reels, and IGTV content in original quality.",
                features: ["Reels & IGTV", "Stories & posts", "Original quality"],
                color: "pink",
              },
              {
                title: "TikTok Videos",
                desc: "Download TikTok videos without watermark in high quality MP4 format. Direct and fast download.",
                features: ["Watermark free", "Viral content", "Easy sharing"],
                color: "cyan",
              },
              {
                title: "High Quality",
                desc: "All downloads maintain original video quality and are provided in MP4 format.",
                features: ["Original resolution", "MP4 format", "No quality loss"],
                color: "green",
              },
              {
                title: "Fast & Free",
                desc: "Quick download processing with no registration required. Completely free to use.",
                features: ["No registration", "Unlimited downloads", "Fast processing"],
                color: "purple",
              },
            ].map((feature, index) => (
              <div key={index}>
                <Card className="card-hover border-border/50 group h-full">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 bg-${feature.color}-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <div className={`w-7 h-7 text-${feature.color}-500`}>
                        <CheckCircle />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-card-foreground mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{feature.desc}</p>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${feature.color}-500`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section (Better Alternative) */}
      <section className="py-24 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Vid-Downloader-Pro?
            </h2>
            <p className="text-muted-foreground">The safer, faster, and more private alternative to legacy downloaders.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-red-500 flex items-center gap-2">
                  Legacy Tools (e.g. Y2Mate)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm opacity-70">
                <p className="flex items-center gap-2 text-red-600 dark:text-red-400">❌ Intrusive pop-up ads & malware risks</p>
                <p className="flex items-center gap-2 text-red-600 dark:text-red-400">❌ Forces redirects to suspicious sites</p>
                <p className="flex items-center gap-2 text-red-600 dark:text-red-400">❌ No privacy protection (tracking enabled)</p>
                <p className="flex items-center gap-2 text-red-600 dark:text-red-400">❌ Slow processing speeds for HD videos</p>
              </CardContent>
            </Card>

            <Card className="border-primary/40 bg-primary/5 backdrop-blur-md shadow-xl scale-105">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  Vid-Downloader-Pro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold">✅ Clean, ad-free experience (No pop-ups)</p>
                <p className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold">✅ Direct processing on secure servers</p>
                <p className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold">✅ 100% Private - No user tracking</p>
                <p className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold">✅ Ultra-fast 4K & MP3 extraction</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent border border-white/10 text-center">
            <h3 className="text-xl font-bold mb-4">Ready for a Better Experience?</h3>
            <p className="text-sm text-muted-foreground mb-6">Join thousands of users who have switched to a more reliable way to save content.</p>
            <Button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="btn-gradient px-8 py-6 rounded-full font-bold shadow-lg shadow-primary/20"
            >
                START DOWNLOADING NOW
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      {/* <AdStickyFooter /> */}
    </div>
  );
}
