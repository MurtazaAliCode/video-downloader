import { useState } from "react";
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
  const [selectedQualityToUnlock, setSelectedQualityToUnlock] = useState<string | null>(null);

  const smartlinkUrl = "https://www.profitablecpmratenetwork.com/phb566a4t2?key=353d9eacad54473bb5e47ab851a76327";

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
    setSelectedQualityToUnlock(null); // Reset unlock state when dialog opens
  };

  const handleQualitySelection = (qualityId: string) => {
    if (qualityId === 'high' || qualityId === 'highest') {
      setSelectedQualityToUnlock(qualityId);
    } else {
      startDownload(qualityId);
    }
  };

  const handleUnlockAndDownload = () => {
    if (selectedQualityToUnlock) {
      // Open Smartlink in new tab
      window.open(smartlinkUrl, '_blank');
      // Proceed with download in background
      startDownload(selectedQualityToUnlock);
      setSelectedQualityToUnlock(null);
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
      desc: 'Unlock with short ad',
      icon: <Monitor className="w-5 h-5" />,
      tag: 'Premium'
    },
    {
      id: 'high',
      label: 'High (720p)',
      desc: 'Unlock with short ad',
      icon: <Tablet className="w-5 h-5" />,
      tag: 'Popular'
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
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      <Header />
      <AdBanner />

      {/* Hero Section */}
      <section className="min-h-screen dark:gradient-bg-dark gradient-bg relative overflow-hidden flex items-center">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="absolute inset-0 bg-background/10 backdrop-blur-[2px]"></div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            >
              Download Videos
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-primary-foreground drop-shadow-sm">
                in MP4 Format
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
              <Card className="glass-card shadow-2xl border-white/30">
                <CardContent className="p-8 md:p-12">
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

                      {/* Platform Logos */}
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-3">Supported platforms:</p>
                        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8">
                          <div className="flex flex-col items-center space-y-2 min-w-[70px]">
                            <img src={youtubeLogo} alt="YouTube" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-transform hover:scale-110" />
                            <span className="text-[10px] sm:text-xs text-muted-foreground">YouTube</span>
                          </div>
                          <div className="flex flex-col items-center space-y-2 min-w-[70px]">
                            <img src={facebookLogo} alt="Facebook" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-transform hover:scale-110" />
                            <span className="text-[10px] sm:text-xs text-muted-foreground">Facebook</span>
                          </div>
                          <div className="flex flex-col items-center space-y-2 min-w-[70px]">
                            <img src={instagramLogo} alt="Instagram" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-transform hover:scale-110" />
                            <span className="text-[10px] sm:text-xs text-muted-foreground">Instagram</span>
                          </div>
                          <div className="flex flex-col items-center space-y-2 min-w-[70px]">
                            <img src={tiktokLogo} alt="TikTok" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain bg-white p-1 transition-transform hover:scale-110" />
                            <span className="text-[10px] sm:text-xs text-muted-foreground">TikTok</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleInitialClick}
                        disabled={isDownloading || !videoUrl.trim()}
                        className="w-full btn-gradient text-primary-foreground py-6 text-lg font-semibold hover:scale-[1.02] transition-all"
                        data-testid="download-button"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        {isDownloading ? "Processing..." : "Download MP4"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with Ads and Features */}
            <div className="lg:col-span-1 space-y-6">
              <AdSidebar />

              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg">Key Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "100% Free", desc: "No registration required", iconColor: "bg-green-500" },
                    { title: "High Quality", desc: "Download in MP4 format", iconColor: "bg-blue-500" },
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
            {!selectedQualityToUnlock ? (
              qualityOptions.map((opt) => (
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
                  {opt.tag ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-500/30">
                      {opt.tag}
                    </span>
                  ) : (
                    <div className="text-white/20 group-hover:text-white/60 transition-colors">
                      <Download className="w-5 h-5" />
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Unlock {selectedQualityToUnlock === 'highest' ? 'Ultra High' : 'High'} Quality</h3>
                  <p className="text-white/60">Click the button below to watch a short ad and unlock your high-quality download instantly!</p>
                </div>
                <div className="pt-4 space-y-3">
                  <Button
                    onClick={handleUnlockAndDownload}
                    className="w-full btn-gradient py-8 text-xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                  >
                    <Sparkles className="w-6 h-6 mr-3 text-yellow-300" />
                    WATCH AD & DOWNLOAD
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedQualityToUnlock(null)}
                    className="text-white/40 hover:text-white"
                  >
                    Back to options
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Native Ad Placement */}
      <div className="container mx-auto px-4 max-w-4xl pt-8">
        <AdInContent />
      </div>

      <div className="container mx-auto px-4 max-w-4xl mt-12">
        <div className="bg-muted p-3 rounded-lg flex flex-col items-center">
           <small className="text-muted-foreground/60 uppercase text-[9px] font-bold mb-2">Recommended Service</small>
           <AdRecommended />
        </div>
      </div>

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
                desc: "Download videos from YouTube in high quality MP4 format. Supports all video resolutions.",
                features: ["HD/4K quality", "Fast downloads", "Direct MP4 format"],
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
              {
                title: "Safe & Secure",
                desc: "No malware, no viruses, no data collection. Your privacy is our priority.",
                features: ["No malware", "Privacy focused", "Secure downloads"],
                color: "yellow",
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

      <Footer />
      <AdStickyFooter />
    </div>
  );
}
