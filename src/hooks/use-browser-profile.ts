"use client";

import { useEffect, useState } from "react";
import { collectBrowserProfile, emptyBrowser } from "@/lib/fingerprint/browser";
import { createModules } from "@/lib/fingerprint/modules";
import type { BrowserProfile, FingerprintModule } from "@/types/fingerprint";

export function useBrowserProfile() {
  const [browser, setBrowser] = useState<BrowserProfile>(emptyBrowser);
  const [browserReady, setBrowserReady] = useState(false);
  const [modules, setModules] = useState<FingerprintModule[]>([]);

  useEffect(() => {
    let active = true;
    void collectBrowserProfile().then(async (profile) => {
      if (!active) return;
      setBrowser(profile);
      setBrowserReady(true);
      const collectedModules = await createModules(profile);
      if (active) setModules(collectedModules);
    });
    return () => {
      active = false;
    };
  }, []);

  return { browser, browserReady, modules };
}
