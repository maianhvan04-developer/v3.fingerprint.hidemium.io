"use client";

import { useCallback, useEffect, useState } from "react";
import { collectFingerprint } from "@/lib/fingerprint/collector";
import type { FingerprintSnapshot, ScanStatus } from "@/types/fingerprint";

interface FingerprintScanState {
  error: string | null;
  snapshot: FingerprintSnapshot | null;
  status: ScanStatus;
}

export function useFingerprintScan() {
  const [state, setState] = useState<FingerprintScanState>({
    error: null,
    snapshot: null,
    status: "collecting",
  });

  const scan = useCallback(async () => {
    setState((current) => ({ ...current, error: null, status: "collecting" }));
    try {
      const snapshot = await collectFingerprint();
      setState({ error: null, snapshot, status: snapshot.status });
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Fingerprint collection failed",
        status: "partial",
      }));
    }
  }, []);

  useEffect(() => {
    void scan();
  }, [scan]);

  return { ...state, scan };
}
