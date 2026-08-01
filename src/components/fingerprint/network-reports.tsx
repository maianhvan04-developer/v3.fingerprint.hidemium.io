import { Button } from "@/components/ui/button";
import type { BrowserProfile, IpLookupResponse, WebRtcResult } from "@/types/fingerprint";

interface NetworkReportsProps {
  browser: BrowserProfile;
  ipInfo: IpLookupResponse;
  onRestartWebRtc: () => void;
  webRtc: WebRtcResult;
}

function TcpIpReport({ browser, ipInfo }: Pick<NetworkReportsProps, "browser" | "ipInfo">) {
  return (
    <section className="technical-block">
      <div className="technical-head">
        <h2>🛰 TCP/IP Fingerprint (p0f)</h2>
        <span className="hash-tag">LOCAL REPORT</span>
      </div>
      <div className="technical-grid">
        <div>
          <p>IP: <code>{ipInfo.ip || "—"}</code></p>
          <p>Network OS: <b>Requires server-side SYN inspection</b></p>
          <p>Browser OS: <b>{browser.os} {browser.osVersion}</b></p>
          <p>Match: <b>Not evaluated locally</b></p>
        </div>
        <div>
          <p>SYN signals: <b>Not visible to browser JavaScript</b></p>
          <p>TTL / Initial TTL: <code>—</code></p>
          <p>MSS / Window: <code>—</code></p>
          <p>DF / Timestamps / SACK: <code>—</code></p>
          <p>Window scale / IP ID: <code>—</code></p>
          <p>Options: <code>—</code></p>
        </div>
      </div>
    </section>
  );
}

function WebRtcReport({ ipInfo, onRestartWebRtc, webRtc }: Omit<NetworkReportsProps, "browser">) {
  return (
    <section className="technical-block">
      <div className="technical-head">
        <h2>WebRTC Check</h2>
        <Button className="restart-button" onClick={onRestartWebRtc}>Restart check</Button>
      </div>
      <p>Status: <span className={`rtc-status rtc-${webRtc.status}`}>{webRtc.status}</span></p>
      <div className="technical-grid">
        <div>
          <p>Session ID: <code>{webRtc.session || "Starting…"}</code></p>
          <p>UDP server: <code>Local ICE only</code></p>
          <p>TCP IP (lookup): <code>{ipInfo.ip || "—"}</code></p>
        </div>
        <div>
          <p><b>WebRTC addresses (browser-observed)</b></p>
          <div className="rtc-addresses">
            {webRtc.ips.length ? webRtc.ips.map((ip) => <code key={ip}>{ip}</code>) : <span>No address exposed</span>}
          </div>
        </div>
      </div>
      <details className="candidate-details">
        <summary>ICE candidates (browser-side)</summary>
        <pre>{webRtc.candidates.join("\n") || "No ICE candidate was exposed."}</pre>
      </details>
    </section>
  );
}

export function NetworkReports(props: NetworkReportsProps) {
  return (
    <>
      <TcpIpReport browser={props.browser} ipInfo={props.ipInfo} />
      <WebRtcReport ipInfo={props.ipInfo} onRestartWebRtc={props.onRestartWebRtc} webRtc={props.webRtc} />
    </>
  );
}
