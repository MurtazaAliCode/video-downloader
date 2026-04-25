import { useState, useEffect } from "react";
import { X, MoreVertical } from "lucide-react";

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    // Check if the user has dismissed the prompt previously
    const hasDismissed = localStorage.getItem("pwa-prompt-dismissed");

    if (!isStandalone && !hasDismissed) {
      // Small delay to not overwhelm the user immediately
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[350px] bg-card border shadow-xl rounded-xl p-4 z-50 flex items-start gap-3 animate-in slide-in-from-bottom-8 duration-500 fade-in">
      <div className="shrink-0 mt-0.5">
        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-md object-contain" />
      </div>
      <div className="flex-1 pt-0">
        <h3 className="font-semibold text-sm leading-none mb-1.5">Install App</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Install our app for a faster experience! Tap <MoreVertical size={14} className="inline bg-muted rounded-sm pb-0.5" /> and select <strong>Add to Home Screen</strong>.
        </p>
      </div>
      <button 
        onClick={dismissPrompt} 
        className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0 bg-transparent border-none cursor-pointer"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
