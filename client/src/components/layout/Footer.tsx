import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Heart, BarChart3, ShieldCheck, Lock, Zap, ShieldAlert } from "lucide-react";
import logoUrl from "@/assets/viddownloader-logo-new.png";

interface ApiUsageStats {
  count: number;
  limit: number;
  monthYear: string;
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  // Fetch API usage stats
  const { data: usage } = useQuery<ApiUsageStats>({
    queryKey: ["/api/usage"],
    refetchInterval: 30000,
  });

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-5">
              <img src={logoUrl} alt="VidDownloader Logo" className="w-12 h-12 drop-shadow-md" />
              <span className="text-xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
                VidDownloader
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Premium ad-free downloader for YouTube, TikTok, and more. We prioritize your privacy and security.
            </p>
            
            {/* Trust Badges Section */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="flex items-center space-x-1 bg-primary/5 border border-primary/20 px-2 py-1 rounded text-[10px] font-bold text-primary">
                <ShieldCheck className="w-3 h-3" />
                <span>CLEAN & SAFE</span>
              </div>
              <div className="flex items-center space-x-1 bg-accent/5 border border-accent/20 px-2 py-1 rounded text-[10px] font-bold text-accent">
                <Lock className="w-3 h-3" />
                <span>NO TRACKING</span>
              </div>
              <div className="flex items-center space-x-1 bg-green-500/5 border border-green-500/20 px-2 py-1 rounded text-[10px] font-bold text-green-500">
                <Zap className="w-3 h-3" />
                <span>SSL SECURED</span>
              </div>
            </div>

            {/* API USAGE TRACKER (Moved and Styled) */}
            {usage && (
              <div className="mb-6 p-3 bg-muted/20 rounded-lg border border-border/30">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Server Capacity</span>
                  </div>
                  <span className="text-[10px] font-bold text-foreground">
                    {usage.count.toLocaleString()} / {usage.limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                    style={{ width: `${Math.min(100, (usage.count / usage.limit) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              © {currentYear} VidDownloader Pro. All rights reserved.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-card-foreground mb-4 uppercase text-xs tracking-widest">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/">
                  <a className="hover:text-primary transition-colors">YouTube Downloader</a>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <a className="hover:text-primary transition-colors">TikTok (No Watermark)</a>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <a className="hover:text-primary transition-colors">Facebook HD Downloader</a>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <a className="hover:text-primary transition-colors">Instagram Video Save</a>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <a className="hover:text-primary transition-colors">High Quality MP3</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-bold text-card-foreground mb-4 uppercase text-xs tracking-widest">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/contact">
                  <a className="hover:text-primary transition-colors">Contact Us</a>
                </Link>
              </li>
              <li>
                <Link href="/report">
                  <a className="hover:text-primary transition-colors">Safety Report</a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="hover:text-primary transition-colors">Documentation</a>
                </Link>
              </li>
              <li>
                <Link href="/status">
                  <a className="hover:text-primary transition-colors">Service Status</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-card-foreground mb-4 uppercase text-xs tracking-widest">Trust & Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy">
                  <a className="hover:text-primary transition-colors font-bold">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="hover:text-primary transition-colors">Terms of Service</a>
                </Link>
              </li>
              <li>
                <Link href="/dmca">
                  <a className="hover:text-primary transition-colors">DMCA Compliance</a>
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy">
                  <a className="hover:text-primary transition-colors">Cookie Usage</a>
                </Link>
              </li>
              <li>
                <Link href="/disclaimer">
                  <a className="hover:text-primary transition-colors">Legal Disclaimer</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center bg-muted/5 p-4 rounded-xl">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <ShieldAlert className="w-5 h-5 text-primary/40" />
            <p className="text-[11px] leading-relaxed text-muted-foreground max-w-2xl">
              <span className="font-bold text-foreground/70">DISCLAIMER:</span> VidDownloader does not host or store any videos on its servers. We only provide a technical service to link to publicly available media. We do not track user downloads or store personal information. Not affiliated with YouTube, TikTok, or Facebook.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-background/50 px-3 py-1.5 rounded-full border border-border/50">
              <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
              <span className="text-[11px] font-bold text-muted-foreground">Privacy Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

