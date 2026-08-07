import type { FingerprintSnapshot } from "@/types/fingerprint";

interface SignalResult {
  detected: boolean;
  name: string;
  weight: number;
}

function matches(value: string, pattern: RegExp) {
  return pattern.test(value);
}

function getSignalResults(snapshot: FingerprintSnapshot): SignalResult[] {
  const smart = snapshot.smartSignals;
  const automationDetected = snapshot.privacy.automationFlags === "Detected";
  const webDriverDetected = snapshot.privacy.webDriver === "Detected";
  const headlessPossible = snapshot.privacy.headless === "Possible";
  const virtualMachine = matches(
    `${snapshot.system.gpu} ${snapshot.system.cpu}`,
    /virtual|vmware|virtualbox|vbox|parallels|qemu/i,
  );
  const privacySettings = !snapshot.browser.cookies
    || !snapshot.browser.localStorage
    || !snapshot.browser.sessionStorage
    || matches(snapshot.browser.doNotTrack, /^(1|yes|enabled)$/i);

  return [
    {
      detected: smart.bot ?? (automationDetected || webDriverDetected || headlessPossible),
      name: "Bot detection",
      weight: 7,
    },
    {
      detected: smart.incognito ?? (headlessPossible || webDriverDetected),
      name: "Incognito detection",
      weight: 4,
    },
    { detected: snapshot.network.vpn === true, name: "VPN detection", weight: 8 },
    {
      detected: smart.tampering ?? snapshot.scores.consistency < 80,
      name: "Tampering detection",
      weight: 8,
    },
    {
      detected: smart.virtualMachine ?? virtualMachine,
      name: "Virtual machine detection",
      weight: 14,
    },
    {
      detected: smart.developerTools ?? false,
      name: "Developer tools detection",
      weight: 0,
    },
    {
      detected: smart.privacySettings ?? privacySettings,
      name: "Privacy-focused settings",
      weight: 2,
    },
    {
      detected: smart.ipBlocklist ?? matches(
          snapshot.network.ipReputation,
          /bad|blocked|malicious|suspicious|high risk/i,
        ),
      name: "IP blocklist",
      weight: 12,
    },
    { detected: snapshot.network.tor === true, name: "Tor exit node", weight: 20 },
    { detected: snapshot.network.hosting === true, name: "Data center proxy", weight: 8 },
    {
      detected: snapshot.network.proxy === true && snapshot.network.hosting !== true,
      name: "Residential proxy",
      weight: 6,
    },
    {
      detected: smart.rareDevice ?? false,
      name: "Rare device",
      weight: 6,
    },
    {
      detected: smart.highActivityDevice ?? snapshot.scores.riskScore >= 60,
      name: "High-Activity Device",
      weight: 6,
    },
  ];
}

export function SuspectSignalTable({
  showTrustedExample = false,
  snapshot,
}: {
  showTrustedExample?: boolean;
  snapshot: FingerprintSnapshot;
}) {
  const signals = getSignalResults(snapshot).map((signal) => (
    showTrustedExample ? { ...signal, detected: false } : signal
  ));

  return (
    <section className="suspect-signal-table" aria-labelledby="suspect-signal-title">
      <header className="suspect-signal-table__header">
        <h3 id="suspect-signal-title">How is this calculated?</h3>
        <a
          href="https://dev.fingerprint.com/docs/smart-signals-reference"
          rel="noreferrer"
          target="_blank"
        >
          See Documentation
        </a>
      </header>

      <div className="suspect-signal-table__grid suspect-signal-table__columns">
        <span>Signal</span>
        <span>Response</span>
        <span>Weight</span>
      </div>

      {signals.map((signal) => (
        <div
          className="suspect-signal-table__grid suspect-signal-table__row"
          data-detected={signal.detected}
          key={signal.name}
        >
          <span>{signal.name}</span>
          <strong><i aria-hidden="true" />{signal.detected ? "Detected" : "Not Detected"}</strong>
          <em>{signal.detected ? signal.weight : 0}</em>
        </div>
      ))}
    </section>
  );
}
