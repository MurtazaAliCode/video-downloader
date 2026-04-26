import { useState, useEffect } from "react";
import { X, MoreVertical } from "lucide-react";

const DISMISS_KEY = "pwa-prompt-v2-dismissed-at"; // Naya key taaki purana reset ho jaye
const DISMISS_DAYS = 3; // 3 din baad dobara dikhayega agar dismiss kiya toh

function isRunningAsInstalledPWA(): boolean {
  try {
    // iOS check
    if ((window.navigator as any).standalone === true) {
      return true;
    }
    // Android/Chrome check - Sirf standalone check karenge
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return true;
    }
  } catch (e) {
    // ignore
  }
  return false;
}

function hasDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    const dismissedAt = parseInt(ts, 10);
    const daysPassed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return daysPassed < DISMISS_DAYS;
  } catch (e) {
    return false;
  }
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if it's a mobile device (optional but recommended)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Installed app mein nahi dikhana
    if (isRunningAsInstalledPWA()) {
      console.log("PWA: Running in standalone mode, hiding prompt.");
      return;
    }

    // Agar haal hi mein close kiya toh nahi dikhana
    if (hasDismissedRecently()) {
      console.log("PWA: Recently dismissed, hiding prompt.");
      return;
    }

    // Show prompt after 3 seconds
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const dismissPrompt = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (e) {
      // ignore
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-4 md:w-[350px] bg-card border border-primary/20 shadow-[0_0_20px_rgba(0,0,0,0.3)] rounded-2xl p-4 z-[100] flex items-start gap-4 animate-in slide-in-from-bottom-10 duration-700">
      <div className="shrink-0">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/50 p-0.5 shadow-lg">
          <img src="/logo.png" alt="Logo" className="w-full h-full rounded-[10px] object-cover bg-background" />
        </div>
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h3 className="font-bold text-sm text-foreground mb-1">Install Our App</h3>
        <p className="text-[11px] text-muted-foreground leading-snug">
          Tap <MoreVertical size={12} className="inline-block mx-0.5 align-text-bottom bg-muted rounded p-0.5" /> then <strong>"Add to Home Screen"</strong> for a faster experience.
        </p>
      </div>
      <button
        onClick={dismissPrompt}
        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted/50"
      >
        <X size={18} />
      </button>
    </div>
  );
}
