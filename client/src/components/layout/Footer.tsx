import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Folder, Heart, BarChart3 } from "lucide-react";

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
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Folder className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                VidDownloader
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Free online video processing tool for personal use. Safe, secure, and privacy-focused.
            </p>
            
            {/* API USAGE TRACKER (Added) */}
            {usage && (
              <div className="mb-6 p-3 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">API Credits</span>
                  </div>
                  <span className="text-[11px] font-bold text-foreground">
                    {usage.count.toLocaleString()} / {usage.limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-border/20">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                    style={{ width: `${Math.min(100, (usage.count / usage.limit) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5 text-right italic">
                  Resets monthly: {usage.monthYear}
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              © {currentYear} VidDownloader. All rights reserved.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/features/compression">
                  <a className="hover:text-primary transition-colors">Video Compression</a>
                </Link>
              </li>
              <li>
                <Link href="/features/conversion">
                  <a className="hover:text-primary transition-colors">Format Conversion</a>
                </Link>
              </li>
              <li>
                <Link href="/features/trimming">
                  <a className="hover:text-primary transition-colors">Video Trimming</a>
                </Link>
              </li>
              <li>
                <Link href="/features/audio">
                  <a className="hover:text-primary transition-colors">Audio Extraction</a>
                </Link>
              </li>
              <li>
                <Link href="/features/watermarks">
                  <a className="hover:text-primary transition-colors">Add Watermarks</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/contact">
                  <a className="hover:text-primary transition-colors">Contact Us</a>
                </Link>
              </li>
              <li>
                <Link href="/report">
                  <a className="hover:text-primary transition-colors">Report Issues</a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="hover:text-primary transition-colors">Help Center</a>
                </Link>
              </li>
              <li>
                <Link href="/feature-requests">
                  <a className="hover:text-primary transition-colors">Feature Requests</a>
                </Link>
              </li>
              <li>
                <Link href="/status">
                  <a className="hover:text-primary transition-colors">Status Page</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy">
                  <a className="hover:text-primary transition-colors">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="hover:text-primary transition-colors">Terms of Service</a>
                </Link>
              </li>
              <li>
                <Link href="/dmca">
                  <a className="hover:text-primary transition-colors">DMCA Notice</a>
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy">
                  <a className="hover:text-primary transition-colors">Cookie Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/disclaimer">
                  <a className="hover:text-primary transition-colors">Disclaimer</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Not affiliated with any social media platforms. For personal use only.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-muted-foreground">Made with</span>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-sm text-muted-foreground">and React</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
