"use client";

import { useCallback, useEffect, useState } from "react";
import type { WebRtcResult } from "@/types/fingerprint";

const initialWebRtc: WebRtcResult = {
  candidates: [],
  ips: [],
  session: "",
  status: "checking",
};

export function useWebRtcCheck() {
  const [webRtc, setWebRtc] = useState<WebRtcResult>(initialWebRtc);

  const runWebRtc = useCallback(() => {
    if (!("RTCPeerConnection" in window)) {
      setWebRtc({ candidates: [], ips: [], session: "Unavailable", status: "unavailable" });
      return;
    }

    const session = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const peer = new RTCPeerConnection({ iceServers: [] });
    const candidates: string[] = [];
    const ips = new Set<string>();
    setWebRtc({ candidates: [], ips: [], session, status: "checking" });
    peer.createDataChannel("fingerprint-check");
    peer.onicecandidate = (event) => {
      if (!event.candidate) return;
      const candidate = event.candidate.candidate;
      candidates.push(candidate);
      const address = candidate.split(" ")[4];
      if (address) ips.add(address);
    };
    void peer.createOffer()
      .then((offer) => peer.setLocalDescription(offer))
      .catch(() => undefined);
    window.setTimeout(() => {
      peer.close();
      setWebRtc({ candidates, ips: [...ips], session, status: "complete" });
    }, 1600);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(runWebRtc);
    return () => window.cancelAnimationFrame(frame);
  }, [runWebRtc]);

  return { runWebRtc, webRtc };
}
