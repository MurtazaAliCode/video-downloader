import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, Sparkles, ShieldCheck, Video, ExternalLink, Zap, Lock, DollarSign, Gift, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 25, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

export default function Support() {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarLoaded, setSidebarLoaded] = useState(false);
  const [sponsoredLoaded, setSponsoredLoaded] = useState(false);
  const [leaderboardLoaded, setLeaderboardLoaded] = useState(false);

  const [useSidebarFallback, setUseSidebarFallback] = useState(false);
  const [useSponsoredFallback, setUseSponsoredFallback] = useState(false);
  const [useLeaderboardFallback, setUseLeaderboardFallback] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast({
        variant: "destructive",
        title: "Required Field",
        description: "Please enter a comment for your review.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim() || "Anonymous Supporter",
          rating,
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast({
          title: "Thank You ❤️",
          description: "Your rating was submitted! It will appear after a quick quality check.",
        });
        setName("");
        setComment("");
      } else {
        throw new Error("Failed to submit");
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Could not submit review. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Dynamic Handshake Listener to detect Adblock / DNS Blocking & Unmount Broken Iframes
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'AD_TEMPLATE_LOADED') {
        const key = event.data.key;
        if (key === 'sidebar') setSidebarLoaded(true);
        if (key === 'sponsored') setSponsoredLoaded(true);
        if (key === 'leaderboard') setLeaderboardLoaded(true);
      }
    };

    window.addEventListener('message', handleMessage);

    const timer = setTimeout(() => {
      setSidebarLoaded(current => {
        if (!current) setUseSidebarFallback(true);
        return current;
      });
      setSponsoredLoaded(current => {
        if (!current) setUseSponsoredFallback(true);
        return current;
      });
      setLeaderboardLoaded(current => {
        if (!current) setUseLeaderboardFallback(true);
        return current;
      });
    }, 1800);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timer);
    };
  }, []);

  const handleSmartlinkClick = () => {
    // Open the smartlink in a new tab safely
    window.open("https://www.effectivecpmnetwork.com/phb566a4t2?key=353d9eacad54473bb5e47ab851a76327", "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="w-full dark:gradient-bg-dark gradient-bg relative overflow-hidden pt-28 sm:pt-32 pb-20">
        
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="absolute inset-0 bg-background/10 backdrop-blur-[2px]"></div>

        <div className="relative w-full container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6">
              <Heart className="w-4 h-4 text-primary fill-current animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Support Our Mission</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight"
            >
              Keep VidDownloader
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-accent drop-shadow-sm">
                100% Free Forever
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-white/80 font-medium leading-relaxed"
            >
              We run fast, high-performance dedicated servers to fetch 4K videos and process 320kbps MP3s. 
              Running this free tool costs real money. You can support us for free by visiting our trusted sponsors below!
            </motion.p>
          </motion.div>

          {/* Main Grid: Left Column (Smartlink, Native Banner) & Right Column (300x250 Banner, Stats) */}
          <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8 mb-16">
            
            {/* Left/Middle Columns: Primary Sponsorship Buttons & Info */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Premium Direct Support Button Card */}
              <Card className="glass-card shadow-2xl border-white/20 overflow-hidden relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <CardContent className="p-6 sm:p-10 relative space-y-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-card-foreground">
                    Support Free Servers
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Clicking the button below helps us earn a micro-donation. 
                    <span className="block font-bold mt-2 text-foreground/80 text-xs sm:text-sm">
                      ⚠️ NOTE: This button will open our trusted sponsor's website in a new browser window. 
                      You can visit their site for a few seconds to help us, and close any ad tabs afterward.
                    </span>
                  </p>

                  <Button
                    onClick={handleSmartlinkClick}
                    className="w-full btn-gradient text-primary-foreground py-6 sm:py-8 text-lg sm:text-xl font-extrabold shadow-xl hover:scale-[1.03] transition-all duration-300 rounded-2xl"
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    VISIT SPONSOR LINK
                  </Button>
                  
                  <div className="text-[10px] text-muted-foreground/60 leading-normal bg-muted/20 p-3 rounded-lg border border-border/30">
                    <strong>Transparency Pledge:</strong> We believe in 100% honesty. This link redirects you to an Adsterra Smartlink domain. This is not malware, but standard promotional landing pages that fund our high-speed server bandwidth. We appreciate your kind support!
                  </div>
                </CardContent>
              </Card>

              {/* Native Banner Placement (Isolated Iframe for 100% Reliable Render) */}
              <Card className="glass-card border-white/10 p-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center">Sponsored Content</h4>
                <div className="flex justify-center w-full min-h-[140px] overflow-hidden rounded-xl bg-muted/5 border border-white/5">
                  {useSponsoredFallback ? (
                    <div 
                      onClick={handleSmartlinkClick} 
                      className="cursor-pointer w-full h-[140px] bg-gradient-to-r from-blue-900/30 to-slate-900/30 border border-white/10 rounded-xl p-6 flex items-center justify-between hover:scale-[1.01] transition-all duration-300 relative group overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/30 shadow-md">
                          <Gift className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex flex-col text-left max-w-[70%]">
                          <h5 className="font-extrabold text-sm text-white tracking-tight">Sponsored Native Offer</h5>
                          <p className="text-[11px] text-white/60 font-medium leading-relaxed mt-0.5 line-clamp-2">
                            Access premium sponsor deals, unlock exclusive converting discounts, and support our server infrastructure.
                          </p>
                        </div>
                      </div>
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs py-5 px-6 rounded-xl shadow-lg relative z-10 transition-transform duration-200 active:scale-95">
                        Explore Offer ⚡
                      </Button>
                    </div>
                  ) : (
                    <iframe
                      src="/partners/sponsored-widget.html"
                      style={{ width: '100%', height: '140px', border: 'none' }}
                      title="Native Ad Banner"
                    />
                  )}
                </div>
              </Card>

            </div>

            {/* Right Column: Square Banner Ads and Support Information */}
            <div className="space-y-6">
              
              {/* Adsterra 300x250 Banner Card (Isolated Iframe) */}
              <Card className="glass-card border-white/20 p-4 overflow-hidden flex flex-col items-center justify-center min-h-[320px]">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Sponsor Zone</h4>
                <div className="w-[300px] h-[250px] bg-muted/5 border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                  {useSidebarFallback ? (
                    <div 
                      onClick={handleSmartlinkClick} 
                      className="cursor-pointer w-[300px] h-[250px] bg-gradient-to-br from-indigo-900/40 to-purple-950/40 border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 relative group overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="flex items-center gap-2 relative z-10 text-left">
                        <Lock className="w-5 h-5 text-purple-400" />
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Sponsor Partner</span>
                      </div>
                      <div className="text-left relative z-10 mt-2">
                        <h5 className="font-extrabold text-base text-white tracking-tight leading-snug">Protect Your Downloads</h5>
                        <p className="text-[11.5px] text-white/60 font-medium leading-relaxed mt-1">
                          Get up to 82% off our premium SSL VPN partner to secure your connection and unlock faster speeds.
                        </p>
                      </div>
                      <Button className="w-full bg-white hover:bg-white/95 text-indigo-950 font-extrabold text-xs py-5 rounded-xl shadow-lg relative z-10 transition-transform duration-200 active:scale-95 mt-2">
                        Secure My Connection ⚡
                      </Button>
                    </div>
                  ) : (
                    <iframe
                      src="/partners/sidebar-widget.html"
                      style={{ width: '300px', height: '250px', border: 'none' }}
                      title="Square Banner Ad"
                    />
                  )}
                </div>
              </Card>

              {/* Secure Donation Info */}
              <Card className="glass-card border-white/10 p-6 space-y-4">
                <div className="flex items-center space-x-2 text-primary">
                  <DollarSign className="w-5 h-5" />
                  <h4 className="font-bold text-sm">Where does the funding go?</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  VidDownloader uses high-end server APIs and decoders to convert links. 
                  Every ad impression and click helps pay for:
                </p>
                <ul className="text-xs space-y-2 text-muted-foreground font-medium pl-1">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                    Fast video conversion servers
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                    Decoder APIs maintenance
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                    Clean UI, completely ad-free homepage
                  </li>
                </ul>
              </Card>

              {/* Thank you note */}
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-white/10 p-6 text-center space-y-3">
                <Heart className="w-8 h-8 text-red-500 fill-current mx-auto animate-pulse" />
                <h4 className="font-bold text-sm text-foreground">You are amazing!</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By visiting this page, you are actively helping us keep this service free for millions of creators around the world. We appreciate your kindness!
                </p>
              </Card>

            </div>

          </div> {/* End of Grid */}

          {/* Centered Premium Affiliate Partnerships Section (Perfect Alignment Outside Grid) */}
          <div className="max-w-4xl mx-auto mt-16 mb-16 space-y-8 flex flex-col items-center">
            
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-1.5 bg-accent/10 border border-accent/20 px-3 py-1 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">
                <Gift className="w-3.5 h-3.5" />
                <span>Exclusive Direct Deals</span>
              </div>
              <h3 className="text-3xl font-extrabold text-white">Premium Affiliate Partnerships</h3>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Purchasing through these safe direct links yields high commissions to fund this project!
              </p>
            </div>

            {/* Centered Cards Container with Gap */}
            <div className="grid sm:grid-cols-2 gap-6 w-full max-w-3xl mx-auto px-4 justify-center items-center">
              
              {/* PureVPN Sponsor Card */}
              <Card className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm group hover:border-primary/40 transition-all duration-300 flex flex-col h-full shadow-lg">
                <div className="bg-gradient-to-br from-[#602D91] to-[#3B1B5A] p-6 flex flex-col items-center text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform duration-500">
                    <Lock className="w-16 h-16" />
                  </div>
                  <ShieldCheck className="w-10 h-10 mb-2 drop-shadow-md" />
                  <h3 className="text-lg font-extrabold">PureVPN</h3>
                  <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest mt-1">SSL Privacy</span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center text-xs text-muted-foreground">
                      <Zap className="w-3.5 h-3.5 mr-2 text-primary" /> 100% Secure No-Log VPN
                    </li>
                    <li className="flex items-center text-xs text-muted-foreground">
                      <Zap className="w-3.5 h-3.5 mr-2 text-primary" /> Unlocks streaming speeds
                    </li>
                    <li className="flex items-center text-xs text-muted-foreground">
                      <Zap className="w-3.5 h-3.5 mr-2 text-primary" /> 10+ multi-device support
                    </li>
                  </ul>
                  <a 
                    href="https://billing.purevpn.com/aff.php?aff=49387687" 
                    target="_blank" 
                    rel="nofollow noopener sponsored"
                    className="w-full mt-auto"
                  >
                    <Button className="w-full bg-[#602D91] hover:bg-[#4E2476] text-white text-xs font-bold py-5 rounded-xl group" variant="default">
                      Claim 80% Discount
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </a>
                </div>
              </Card>

              {/* Movavi Editor Sponsor Card */}
              <Card className="overflow-hidden border-accent/20 bg-card/50 backdrop-blur-sm group hover:border-accent/40 transition-all duration-300 flex flex-col h-full shadow-lg">
                <div className="bg-gradient-to-br from-purple-600 to-pink-700 p-6 flex flex-col items-center text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform duration-500">
                    <Video className="w-16 h-16" />
                  </div>
                  <Video className="w-10 h-10 mb-2 drop-shadow-md" />
                  <h3 className="text-lg font-extrabold">Movavi Studio</h3>
                  <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest mt-1">Creator Suite</span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center text-xs text-muted-foreground">
                      <Zap className="w-3.5 h-3.5 mr-2 text-accent" /> Edit Reels & TikToks in minutes
                    </li>
                    <li className="flex items-center text-xs text-muted-foreground">
                      <Zap className="w-3.5 h-3.5 mr-2 text-accent" /> Premium transitions & effects
                    </li>
                    <li className="flex items-center text-xs text-muted-foreground">
                      <Zap className="w-3.5 h-3.5 mr-2 text-accent" /> Direct 4K & MP3 exports
                    </li>
                  </ul>
                  <a 
                    href="https://www.movavi.com/video-editor/" 
                    target="_blank" 
                    rel="nofollow noopener sponsored"
                    className="w-full mt-auto"
                  >
                    <Button className="w-full bg-accent hover:bg-accent/90 text-white text-xs font-bold py-5 rounded-xl group" variant="default">
                      Try Video Editor Free
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </a>
                </div>
              </Card>
            </div>
          </div>

          {/* Interactive Supporter Review Widget */}
          <div className="max-w-3xl mx-auto mt-16 mb-8 px-4">
            <Card className="glass-card shadow-2xl border-white/20 overflow-hidden relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/10 to-pink-500/10 rounded-2xl blur opacity-25"></div>
              
              <CardHeader className="relative text-center pb-2 pt-8">
                <div className="inline-flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full mb-3 animate-in fade-in zoom-in-95 duration-500">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current animate-pulse" />
                  <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Share Your Experience</span>
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-extrabold text-card-foreground">
                  Drop Us a Star Rating! ⭐
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-2">
                  Happy with VidDownloader? Rate us! Your feedback will be managed securely and featured on our home page after moderation.
                </p>
              </CardHeader>

              <CardContent className="relative p-6 sm:p-10">
                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-4"
                  >
                    <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto text-green-400 border border-green-500/30">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-green-400">Review Submitted Successfully!</h4>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Thank you so much for your kind support. Once approved by our team, your review will showcase automatically on the front page.
                    </p>
                    <Button 
                      onClick={() => setSubmitted(false)}
                      variant="outline" 
                      className="mt-2 border-white/20 bg-white/5 hover:bg-white/10"
                    >
                      Write Another Review
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    {/* Star Selector */}
                    <div className="flex flex-col items-center space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Star Count</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none"
                          >
                            <Star 
                              className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                                star <= (hoverRating ?? rating) 
                                  ? "text-yellow-400 fill-current drop-shadow-md" 
                                  : "text-white/20 fill-none"
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Name input */}
                      <div className="space-y-2">
                        <label htmlFor="supporter-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Name</label>
                        <input
                          id="supporter-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. John Doe (Optional)"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                        />
                      </div>
                      
                      {/* Star selection indicator text */}
                      <div className="space-y-2 flex flex-col justify-end">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Selected Rating</span>
                        <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-yellow-400 flex items-center gap-2">
                          ⭐ {rating} Out of 5 Stars
                        </div>
                      </div>
                    </div>

                    {/* Comment text */}
                    <div className="space-y-2">
                      <label htmlFor="supporter-comment" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Experience / Feedback</label>
                      <textarea
                        id="supporter-comment"
                        rows={3}
                        required
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Love the downloader! Quick, easy, and completely free server..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 text-white font-bold py-6 text-base rounded-xl transition-all duration-300 shadow-xl cursor-pointer"
                    >
                      {isSubmitting ? "Submitting Review..." : "Submit My Rating ❤️"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Banner 728x90 (Horizontal Leaderboard at the bottom - Isolated Iframe) */}
          <div className="max-w-4xl mx-auto mt-12 flex justify-center">
            <Card className="glass-card border-white/10 p-4 w-full flex flex-col items-center justify-center overflow-hidden">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Sponsor Leaderboard</h4>
              <div className="w-[728px] h-[90px] bg-muted/5 border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                {useLeaderboardFallback ? (
                  <div 
                    onClick={handleSmartlinkClick} 
                    className="cursor-pointer w-[728px] h-[90px] bg-gradient-to-r from-slate-900/30 to-violet-950/30 border border-white/10 rounded-xl px-8 py-3 flex items-center justify-between hover:scale-[1.01] transition-all duration-300 relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex items-center gap-4 relative z-10 text-left">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/15 flex items-center justify-center border border-yellow-500/30 shadow-md">
                        <Star className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="flex flex-col">
                        <h5 className="font-extrabold text-sm text-white tracking-tight leading-snug">Help Keep VidDownloader 100% Free</h5>
                        <p className="text-[11px] text-white/50 font-medium leading-relaxed mt-0.5">
                          Support our high-speed server bandwidth by completing a quick visit to our trusted partner deal.
                        </p>
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 text-white font-extrabold text-xs py-5 px-6 rounded-xl shadow-lg relative z-10 transition-transform duration-200 active:scale-95">
                      Support Free Servers ⚡
                    </Button>
                  </div>
                ) : (
                  <iframe
                    src="/partners/leaderboard-widget.html"
                    style={{ width: '728px', height: '90px', border: 'none' }}
                    title="Leaderboard Banner Ad"
                  />
                )}
              </div>
            </Card>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
