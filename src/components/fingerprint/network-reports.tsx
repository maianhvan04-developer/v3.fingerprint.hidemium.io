"use client";

import {
  CircleCheck,
  RadioTower,
  RotateCcw,
  Satellite,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type { BrowserProfile, IpLookupResponse, WebRtcResult } from "@/types/fingerprint";

interface NetworkReportsProps {
  browser: BrowserProfile;
  ipInfo: IpLookupResponse;
  onRestartWebRtc: () => void;
  webRtc: WebRtcResult;
}

function readable(value: string | undefined, fallback = "Unavailable") {
  if (!value || value === "Unknown" || value === "Detecting…") return fallback;
  return value;
}

function isPublicAddress(address: string) {
  const normalized = address.toLowerCase();
  if (normalized.endsWith(".local")) return false;
  if (normalized.includes(":")) {
    return !/^(::1|fe80:|fc|fd)/i.test(normalized);
  }
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalized)) return false;
  return !/^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(normalized);
}

function TcpIpReport({ browser, ipInfo }: Pick<NetworkReportsProps, "browser" | "ipInfo">) {
  const ipAddress = ipInfo.ip || ipInfo.ipv4 || ipInfo.ipv6 || "Detecting…";
  const browserOs = [readable(browser.os), readable(browser.osVersion, "")]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="nr-reportBlock">
      <header className="nr-reportHeader">
        <div>
          <span className="nr-eyebrow">Server-side network signature</span>
          <h2><Satellite aria-hidden="true" /> TCP/IP Fingerprint (p0f)</h2>
        </div>
        <span className="nr-neutralBadge">Server required</span>
      </header>

      <div className="nr-technicalGrid">
        <dl className="nr-dataList">
          <div><dt>IP</dt><dd><code>{ipAddress}</code></dd></div>
          <div><dt>Network OS</dt><dd>Unavailable without SYN inspection</dd></div>
          <div><dt>Browser OS</dt><dd>{browserOs}</dd></div>
          <div><dt>OS match</dt><dd className="nr-neutralText">Not evaluated</dd></div>
        </dl>
        <dl className="nr-dataList">
          <div><dt>SYN signals</dt><dd>Not visible to browser JavaScript</dd></div>
          <div><dt>TTL / Initial TTL</dt><dd><code>— / —</code></dd></div>
          <div><dt>MSS / Window</dt><dd><code>— / —</code></dd></div>
          <div><dt>DF / Timestamps / SACK</dt><dd><code>Server required</code></dd></div>
          <div><dt>Window scale / IP ID</dt><dd><code>Server required</code></dd></div>
          <div><dt>Options</dt><dd><code>Server required</code></dd></div>
        </dl>
      </div>
    </div>
  );
}

function WebRtcReport({ ipInfo, onRestartWebRtc, webRtc }: Omit<NetworkReportsProps, "browser">) {
  const referenceIps = new Set(
    [ipInfo.ip, ipInfo.ipv4, ipInfo.ipv6].filter((value): value is string => Boolean(value)),
  );
  const publicObservedIps = webRtc.ips.filter(isPublicAddress);
  const unexpectedIps = publicObservedIps.filter((ip) => !referenceIps.has(ip));
  const complete = webRtc.status === "complete";
  const unavailable = webRtc.status === "unavailable";
  const leakDetected = complete && unexpectedIps.length > 0;
  const statusLabel = webRtc.status === "checking"
    ? "checking"
    : unavailable ? "unavailable" : leakDetected ? "review" : "success";
  const statusTone = unavailable || leakDetected ? "warning" : complete ? "good" : "neutral";
  const calloutTitle = unavailable
    ? "WebRTC is unavailable"
    : leakDetected ? "Potential WebRTC leak" : complete
      ? "No public WebRTC leak detected"
      : "Checking browser-side ICE candidates";
  const calloutDescription = unavailable
    ? "This browser does not expose RTCPeerConnection, so the check cannot run."
    : leakDetected
      ? `Unexpected public address${unexpectedIps.length === 1 ? "" : "es"}: ${unexpectedIps.join(", ")}.`
      : complete && publicObservedIps.length
        ? "All browser-observed public addresses match the current public IP lookup."
        : complete
          ? "No public address was exposed by browser-side ICE candidates."
          : "Collecting candidates locally. This usually completes in under two seconds.";

  return (
    <div className="nr-reportBlock nr-webRtcBlock">
      <header className="nr-reportHeader">
        <div>
          <span className="nr-eyebrow">Browser-side address exposure</span>
          <h2><RadioTower aria-hidden="true" /> WebRTC Check</h2>
        </div>
        <button
          className="nr-restartButton"
          disabled={webRtc.status === "checking"}
          onClick={onRestartWebRtc}
          type="button"
        >
          <RotateCcw aria-hidden="true" />
          Restart check
        </button>
      </header>

      <div className="nr-statusLine">
        <span>Status:</span>
        <strong className={`nr-${statusTone}`}>{statusLabel}</strong>
        {complete && !leakDetected ? <span className="nr-goodBadge">✓ no leak</span> : null}
      </div>

      <div className="nr-technicalGrid">
        <dl className="nr-dataList">
          <div><dt>Session ID</dt><dd><code>{webRtc.session || "Starting…"}</code></dd></div>
          <div><dt>UDP server</dt><dd><code>Public STUN discovery</code></dd></div>
          <div><dt>TCP IP (lookup)</dt><dd><code>{ipInfo.ip || ipInfo.ipv4 || ipInfo.ipv6 || "Detecting…"}</code></dd></div>
        </dl>
        <div className="nr-addressPanel">
          <strong>WebRTC addresses (browser-observed)</strong>
          <div className="nr-addresses">
            {webRtc.ips.length
              ? webRtc.ips.map((ip) => <code key={ip}>{ip}</code>)
              : <span>{webRtc.status === "checking" ? "Collecting…" : "No address exposed"}</span>}
          </div>
        </div>
      </div>

      <div className={`nr-callout nr-callout-${statusTone}`}>
        {statusTone === "warning"
          ? <TriangleAlert aria-hidden="true" />
          : complete ? <ShieldCheck aria-hidden="true" /> : <CircleCheck aria-hidden="true" />}
        <div>
          <strong>{calloutTitle}</strong>
          <p>{calloutDescription}</p>
        </div>
      </div>

      <details className="nr-candidateDetails">
        <summary>ICE candidates (browser-side) · {webRtc.candidates.length}</summary>
        <pre>{webRtc.candidates.join("\n") || "No ICE candidate was exposed."}</pre>
      </details>
    </div>
  );
}

export function NetworkReports(props: NetworkReportsProps) {
  return (
    <section className="nr-networkReports" id="network-reports" aria-label="Network fingerprint reports">
      <div className="nr-reportCard">
        <TcpIpReport browser={props.browser} ipInfo={props.ipInfo} />
        <WebRtcReport
          ipInfo={props.ipInfo}
          onRestartWebRtc={props.onRestartWebRtc}
          webRtc={props.webRtc}
        />
      </div>
    </section>
  );
}
