import { useEffect } from "react";
import AdComponent from "./AdComponent";

export function AdBanner() {
  return (
    <div className="w-full bg-muted/30 border-b border-border overflow-hidden" data-testid="ad-banner">
      <div className="container mx-auto px-4 py-4 max-w-full overflow-hidden">
        <div className="flex justify-center flex-col items-center">
          <small className="text-muted-foreground/60 mb-2 uppercase text-[10px] tracking-wider">Advertisement</small>
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <AdComponent 
              id="17fabec5c7b61662844da4c1bb680fea"
              type="banner"
              placeholderText="Top Horizontal Banner (728x90)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdSidebar() {
  return (
    <div className="bg-card rounded-xl p-4 shadow-lg overflow-hidden" data-testid="ad-sidebar">
      <div className="flex justify-center flex-col items-center max-w-full overflow-hidden">
        <small className="text-muted-foreground/60 mb-2 uppercase text-[10px] tracking-wider">Advertisement</small>
        <div className="max-w-full overflow-x-auto">
          <AdComponent 
            id="3d467363c99234ac0985c4e819cf1f2b"
            type="sidebar"
            placeholderText="Sidebar Vertical Ad (300x250)"
          />
        </div>
      </div>
    </div>
  );
}

export function AdInContent() {
  return (
    <div className="my-8 w-full block overflow-hidden bg-muted/10 rounded-lg border border-border/50" data-testid="ad-in-content" style={{ maxWidth: "100%", contain: "paint" }}>
      <div className="flex justify-center max-w-full overflow-hidden" style={{ overflowX: "hidden", width: "100%" }}>
        <AdComponent 
          id="29fe2d5304bd54293737dac53bdf19de"
          type="native"
          placeholderText="In-Content Native Ad"
        />
      </div>
    </div>
  );
}

export function AdSocialBar() {
  useEffect(() => {
    // Only inject if it doesn't already exist to prevent duplicates
    if (!document.querySelector('script[src*="a6802f5cfc02b7c8d4821933c0525799.js"]')) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "//pl29050243.profitablecpmratenetwork.com/a6/80/2f/a6802f5cfc02b7c8d4821933c0525799.js";
      document.body.appendChild(script);
    }
  }, []);

  return null;
}

export function AdStickyFooter() {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] flex flex-col items-center py-2 animate-in slide-in-from-bottom duration-500">
      <div className="flex justify-between items-center w-full px-4 mb-1">
        <small className="text-muted-foreground/60 uppercase text-[9px] tracking-widest font-bold">Recommended for you</small>
        <button 
          onClick={(e) => {
            const el = e.currentTarget.parentElement?.parentElement;
            if (el) el.style.display = 'none';
          }}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-bold bg-muted px-2 py-0.5 rounded"
        >
          CLOSE
        </button>
      </div>
      <div className="w-full flex justify-center overflow-hidden">
        <AdComponent 
          id="17fabec5c7b61662844da4c1bb680fea" 
          type="banner"
          placeholderText="Sticky Footer Ad (728x90)"
        />
      </div>
    </div>
  );
}
