import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, Sparkles, ShieldCheck, Video, ExternalLink, Zap, Lock, DollarSign, Gift } from "lucide-react";

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
  
  // Dynamic Script Loader for Adsterra Popunder & Social Bar (Mounted on `/support` only)
  useEffect(() => {
    // ---- A. Adsterra Popunder Script ----
    const popunderScript = document.createElement("script");
    popunderScript.type = "text/javascript";
    popunderScript.src = "https://pl29050241.effectivecpmnetwork.com/ec/a1/0d/eca10d8b4eada957b38f8cbebe427b29.js";
    popunderScript.async = true;
    document.body.appendChild(popunderScript);

    // ---- B. Adsterra Social Bar Script ----
    const socialBarScript = document.createElement("script");
    socialBarScript.type = "text/javascript";
    socialBarScript.src = "https://pl29050243.effectivecpmnetwork.com/a6/80/2f/a6802f5cfc02b7c8d4821933c0525799.js";
    socialBarScript.async = true;
    document.body.appendChild(socialBarScript);

    // CLEANUP HANDLER (Runs automatically when navigating away from /support)
    return () => {
      console.log("🧹 Cleaning up Adsterra background scripts...");
      try {
        if (document.body.contains(popunderScript)) document.body.removeChild(popunderScript);
        if (document.body.contains(socialBarScript)) document.body.removeChild(socialBarScript);
      } catch (err) {
        console.error("Script cleanup warning:", err);
      }
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
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <style>body { margin: 0; padding: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; }</style>
                        </head>
                        <body>
                          <div id="container-29fe2d5304bd54293737dac53bdf19de" style="width: 100%; min-height: 100px;"></div>
                          <script async="async" data-cfasync="false" src="https://pl29050240.effectivecpmnetwork.com/29fe2d5304bd54293737dac53bdf19de/invoke.js"></script>
                        </body>
                      </html>
                    `}
                    style={{ width: '100%', height: '140px', border: 'none' }}
                    title="Native Ad Banner"
                  />
                </div>
              </Card>

            </div>

            {/* Right Column: Square Banner Ads and Support Information */}
            <div className="space-y-6">
              
              {/* Adsterra 300x250 Banner Card (Isolated Iframe) */}
              <Card className="glass-card border-white/20 p-4 overflow-hidden flex flex-col items-center justify-center min-h-[320px]">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Sponsor Zone</h4>
                <div className="w-[300px] h-[250px] bg-muted/5 border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <style>body { margin: 0; padding: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; }</style>
                        </head>
                        <body>
                          <script type="text/javascript">
                            atOptions = {
                              'key' : '3d467363c99234ac0985c4e819cf1f2b',
                              'format' : 'iframe',
                              'height' : 250,
                              'width' : 300,
                              'params' : {}
                            };
                          </script>
                          <script type="text/javascript" src="https://www.highperformanceformat.com/3d467363c99234ac0985c4e819cf1f2b/invoke.js"></script>
                        </body>
                      </html>
                    `}
                    style={{ width: '300px', height: '250px', border: 'none' }}
                    title="Square Banner Ad"
                  />
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

          {/* Banner 728x90 (Horizontal Leaderboard at the bottom - Isolated Iframe) */}
          <div className="max-w-4xl mx-auto mt-12 flex justify-center">
            <Card className="glass-card border-white/10 p-4 w-full flex flex-col items-center justify-center overflow-hidden">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Sponsor Leaderboard</h4>
              <div className="w-[728px] h-[90px] bg-muted/5 border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <style>body { margin: 0; padding: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; }</style>
                      </head>
                      <body>
                        <script type="text/javascript">
                          atOptions = {
                            'key' : '17fabec5c7b61662844da4c1bb680fea',
                            'format' : 'iframe',
                            'height' : 90,
                            'width' : 728,
                            'params' : {}
                          };
                        </script>
                        <script type="text/javascript" src="https://www.highperformanceformat.com/17fabec5c7b61662844da4c1bb680fea/invoke.js"></script>
                      </body>
                    </html>
                  `}
                  style={{ width: '728px', height: '90px', border: 'none' }}
                  title="Leaderboard Banner Ad"
                />
              </div>
            </Card>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
