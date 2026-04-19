import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Share } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_DAYS = 7;

function isInIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-ignore iOS Safari
    window.navigator.standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    if (isInIframe() || isStandalone()) return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const days = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (days < DISMISS_DAYS) return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS doesn't fire beforeinstallprompt — show manual hint after a delay
    if (isIOS() && !isStandalone()) {
      const t = setTimeout(() => setShowIOSHint(true), 4000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
    setShowIOSHint(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      toast.success("App installed! Find it on your home screen.");
    }
    setDeferred(null);
    setShow(false);
  };

  if (!show && !showIOSHint) return null;

  return (
    <div
      className="fixed left-3 right-3 bottom-20 md:bottom-6 md:left-auto md:right-6 md:max-w-sm z-50 animate-fade-in"
      role="dialog"
      aria-label="Install app"
    >
      <div className="bg-card border border-border rounded-2xl shadow-xl p-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
          <Download className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">
            Install PrepPath
          </p>
          {showIOSHint ? (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 flex-wrap">
              Tap <Share className="h-3 w-3 inline" /> Share, then "Add to Home Screen"
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Add to your home screen for quick access and offline use.
            </p>
          )}
          {!showIOSHint && (
            <Button size="sm" onClick={install} className="mt-3 h-8">
              Install
            </Button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-foreground p-1 -mt-1 -mr-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
