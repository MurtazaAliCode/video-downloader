import { useState, useEffect } from "react";
import { X, MoreVertical } from "lucide-react";

const DISMISS_KEY = "pwa-prompt-dismissed-at";
const DISMISS_DAYS = 7; // Show again after 7 days

function isRunningAsInstalledPWA(): boolean {
  try {
    // iOS Safari: navigator.standalone is strictly true when launched from home screen
    if ((window.navigator as any).standalone === true) {
      return true;
    }
    // Android Chrome / other browsers: display-mode changes to standalone when installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches
    ) {
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
    // If more than DISMISS_DAYS days have passed, treat as not dismissed
    return daysPassed < DISMISS_DAYS;
  } catch (e) {
    return false;
  }
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Never show if already running as installed PWA (home screen app)
    if (isRunningAsInstalledPWA()) {
      return;
    }

    // Don't show if user dismissed recently (within 7 days)
    if (hasDismissedRecently()) {
      return;
    }

    // Listen for install event mid-session (user installs while browsing)
    const mqStandalone = window.matchMedia("(display-mode: standalone)");
    const handleMqChange = (e: MediaQueryListEvent) => {
      if (e.matches) setShowPrompt(false);
    };
    mqStandalone.addEventListener("change", handleMqChange);

    // Show after a short delay so page loads first
    const timer = setTimeout(() => {
      if (!isRunningAsInstalledPWA()) {
        setShowPrompt(true);
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
      mqStandalone.removeEventListener("change", handleMqChange);
    };
  }, []);

  const dismissPrompt = () => {
    setShowPrompt(false);
    try {
      // Save timestamp so it reappears after 7 days
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
      // Also clear old key if it exists
      localStorage.removeItem("pwa-prompt-dismissed");
    } catch (e) {
      // ignore
    }
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
          Install our app for a faster experience! Tap{" "}
          <MoreVertical size={14} className="inline bg-muted rounded-sm pb-0.5" /> and select{" "}
          <strong>Add to Home Screen</strong>.
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
