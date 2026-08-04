"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const SCRIPT_ID = "cf-turnstile-script";

function loadTurnstileScript() {
  if (document.getElementById(SCRIPT_ID)) {
    return;
  }
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = SCRIPT_SRC;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

export function Turnstile({
  siteKey,
  onVerify,
  onExpire,
}: {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
}) {
  const containerId = useId().replace(/:/g, "");
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pollInterval: ReturnType<typeof setInterval> | undefined;

    function render() {
      if (cancelled || !window.turnstile) {
        return;
      }
      widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
        sitekey: siteKey,
        callback: onVerify,
        "expired-callback": onExpire,
      });
    }

    if (window.turnstile) {
      render();
    } else {
      loadTurnstileScript();
      pollInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(pollInterval);
          render();
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey, onVerify, onExpire, containerId]);

  return <div id={containerId} />;
}
