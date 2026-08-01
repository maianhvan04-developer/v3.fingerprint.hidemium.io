import type { BrowserProfile, IpLookupResponse, WebRtcResult } from "@/types/fingerprint";

interface InfoSectionProps {
  description: string;
  icon: string;
  items: Array<{ full?: boolean; label: string; value: string }>;
  title: string;
  tone?: "danger" | "warn";
}

function InfoSection({ description, icon, items, title, tone }: InfoSectionProps) {
  return (
    <section className={`info-row${tone ? ` info-row-${tone}` : ""}`}>
      <div className="info-head">
        <div className="info-icon" aria-hidden="true">{icon}</div>
        <div><h3>{title}</h3><p>{description}</p></div>
      </div>
      <div className="info-grid">
        {items.map((item) => (
          <div className={item.full ? "info-item info-item-full" : "info-item"} key={item.label}>
            <span>{item.label}</span><b>{item.value}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

interface InfoCardProps {
  automated: boolean;
  browser: BrowserProfile;
  ipInfo: IpLookupResponse;
  localTime: string;
  webRtc: WebRtcResult;
}

export function InfoCard({ automated, browser, ipInfo, localTime, webRtc }: InfoCardProps) {
  return (
    <section className="info-card">
      <InfoSection
        description="Get info about the IP address we have detected"
        icon="🌐"
        items={[
          { label: "📡 Provider:", value: ipInfo.connection?.isp || "Detecting…" },
          { label: "🌐 WebRTC IPv4:", value: webRtc.ips.find((ip) => /^\d+\.\d+/.test(ip)) || "Not exposed" },
          { label: "🌐 WebRTC IPv6:", value: webRtc.ips.find((ip) => ip.includes(":")) || "Not exposed" },
          { label: "🛰 Fake ISP:", value: "No mismatch detected" },
          { label: "🕵 Anonymizer:", value: ipInfo.security?.anonymous ? "Detected" : "Not detected" },
          { label: "☁ Cloud Provider:", value: ipInfo.security?.hosting ? "Detected" : "Not detected" },
          { label: "🪟 TCP/IP Fingerprint OS:", value: "Server probe unavailable" },
          { label: "💻 Browser OS:", value: `${browser.os} ${browser.osVersion}` },
        ]}
        title="General IP info"
      />
      <hr />
      <InfoSection
        description="Detailed breakdown of your browser User-Agent string and operating system"
        icon="🧭"
        items={[
          { full: true, label: "🧾 User-Agent:", value: browser.userAgent },
          { label: "🌐 Browser:", value: `${browser.browser} ${browser.browserVersion}` },
          { label: "⚙ Engine:", value: browser.engine },
          { label: "🏷 Release Channel:", value: automated ? "⚠️ headless (not a consumer release channel)" : "stable" },
          { label: "💻 Operating System:", value: browser.os },
          { label: "🔖 OS Version:", value: browser.osVersion },
          { label: "📱 Device Type:", value: browser.device },
          { label: "🏗 Architecture:", value: browser.architecture },
          { label: "🧩 Platform:", value: browser.platform },
        ]}
        tone={automated ? "danger" : undefined}
        title="User-Agent & OS"
      />
      <hr />
      <InfoSection
        description="Information about your location that is accessible from your IP"
        icon="📍"
        items={[
          { label: "🌍 Country:", value: ipInfo.country || "Detecting…" },
          { label: "🗺 Region:", value: ipInfo.region || "Detecting…" },
          { label: "🏙 City:", value: ipInfo.city || "Detecting…" },
          { label: "📮 ZIP:", value: ipInfo.postal || "—" },
          { label: "🖥 Host:", value: ipInfo.connection?.domain || "—" },
          { label: "📍 Lat / Lon:", value: ipInfo.latitude == null ? "—" : `${ipInfo.latitude}, ${ipInfo.longitude}` },
          { label: "🏢 Organization:", value: ipInfo.connection?.org || "—" },
          { label: "🏛 AS Organization:", value: ipInfo.connection?.org || "—" },
          { label: "📡 ISP:", value: ipInfo.connection?.isp || "—" },
          { label: "🔢 AS Number:", value: ipInfo.connection?.asn ? `AS${ipInfo.connection.asn}` : "—" },
        ]}
        title="Location"
      />
      <hr />
      <InfoSection
        description="Time information based on your detected location"
        icon="🕐"
        items={[
          { label: "🕐 Local time:", value: localTime },
          { label: "🌐 Time zone:", value: ipInfo.timezone?.id || browser.timezone },
        ]}
        title="Time"
      />
    </section>
  );
}
