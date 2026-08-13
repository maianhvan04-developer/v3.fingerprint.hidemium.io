"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Toast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import type { FingerprintSnapshot } from "@/types/fingerprint";

interface SignalResult {
  detected: boolean;
  nameKey: string;
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
      nameKey: "bot",
      weight: 7,
    },
    {
      detected: smart.incognito ?? (headlessPossible || webDriverDetected),
      nameKey: "incognito",
      weight: 4,
    },
    { detected: snapshot.network.vpn === true, nameKey: "vpn", weight: 8 },
    {
      detected: smart.tampering ?? snapshot.scores.consistency < 80,
      nameKey: "tampering",
      weight: 8,
    },
    {
      detected: smart.virtualMachine ?? virtualMachine,
      nameKey: "virtualMachine",
      weight: 14,
    },
    {
      detected: smart.developerTools ?? false,
      nameKey: "developerTools",
      weight: 0,
    },
    {
      detected: smart.privacySettings ?? privacySettings,
      nameKey: "privacySettings",
      weight: 2,
    },
    {
      detected: smart.ipBlocklist ?? matches(
          snapshot.network.ipReputation,
          /bad|blocked|malicious|suspicious|high risk/i,
        ),
      nameKey: "ipBlocklist",
      weight: 12,
    },
    { detected: snapshot.network.tor === true, nameKey: "tor", weight: 20 },
    { detected: snapshot.network.hosting === true, nameKey: "dataCenter", weight: 8 },
    {
      detected: snapshot.network.proxy === true && snapshot.network.hosting !== true,
      nameKey: "residentialProxy",
      weight: 6,
    },
    {
      detected: smart.rareDevice ?? false,
      nameKey: "rareDevice",
      weight: 6,
    },
    {
      detected: smart.highActivityDevice ?? snapshot.scores.riskScore >= 60,
      nameKey: "highActivity",
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
  const { t } = useI18n();
  const [documentationToastOpen, setDocumentationToastOpen] = useState(false);
  const documentationToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signals = getSignalResults(snapshot).map((signal) => (
    showTrustedExample ? { ...signal, detected: false } : signal
  ));

  useEffect(() => () => {
    if (documentationToastTimer.current) {
      clearTimeout(documentationToastTimer.current);
    }
  }, []);

  const showDocumentationToast = () => {
    if (documentationToastTimer.current) {
      clearTimeout(documentationToastTimer.current);
    }
    setDocumentationToastOpen(true);
    documentationToastTimer.current = setTimeout(() => {
      setDocumentationToastOpen(false);
      documentationToastTimer.current = null;
    }, 2400);
  };

  const handleDocumentationClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    showDocumentationToast();
  };

  return (
    <section className="suspect-signal-table" aria-labelledby="suspect-signal-title">
      <header className="suspect-signal-table__header">
        <h3 id="suspect-signal-title">{t("signalTable.title")}</h3>
        <a
          href="#details"
          onClick={handleDocumentationClick}
        >
          {t("signalTable.documentation")}
        </a>
      </header>

      <div className="suspect-signal-table__grid suspect-signal-table__columns">
        <span>{t("signalTable.signal")}</span>
        <span>{t("signalTable.response")}</span>
        <span>{t("signalTable.weight")}</span>
      </div>

      {signals.map((signal) => (
        <div
          className="suspect-signal-table__grid suspect-signal-table__row"
          data-detected={signal.detected}
          key={signal.nameKey}
        >
          <span>{t(`signalTable.${signal.nameKey}`)}</span>
          <strong><i aria-hidden="true" />{signal.detected ? t("common.detected") : t("common.notDetected")}</strong>
          <em>{signal.detected ? signal.weight : 0}</em>
        </div>
      ))}
      <Toast open={documentationToastOpen}>{t("header.resources.comingSoonToast")}</Toast>
    </section>
  );
}

export default SuspectSignalTable;
