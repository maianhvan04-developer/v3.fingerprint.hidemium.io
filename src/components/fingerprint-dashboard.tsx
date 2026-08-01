"use client";

import { CdiValidator } from "@/components/fingerprint/cdi-validator";
import { DiagnosticsGrid } from "@/components/fingerprint/diagnostics-grid";
import { FinalCta } from "@/components/fingerprint/final-cta";
import { FingerprintModules } from "@/components/fingerprint/fingerprint-modules";
import { InfoCard } from "@/components/fingerprint/info-card";
import { IpHero } from "@/components/fingerprint/ip-hero";
import { NetworkReports } from "@/components/fingerprint/network-reports";
import { SiteHeader } from "@/components/layout/site-header";
import { useFingerprintDashboard } from "@/hooks/use-fingerprint-dashboard";

export function FingerprintDashboard() {
  const dashboard = useFingerprintDashboard();

  return (
    <div className="site-shell">
      <SiteHeader
        language={dashboard.language}
        languageOpen={dashboard.languageOpen}
        menuOpen={dashboard.menuOpen}
        onSelectLanguage={dashboard.selectLanguage}
        onToggleLanguage={dashboard.toggleLanguageMenu}
        onToggleMenu={dashboard.toggleMenu}
      />

      <main id="top">
        <IpHero
          browserScore={dashboard.browserScore}
          copied={dashboard.copied}
          flag={dashboard.flag}
          ipAddress={dashboard.ipAddress}
          ipError={dashboard.ipError}
          ipInfo={dashboard.ipInfo}
          ipLoading={dashboard.ipLoading}
          onCopyIp={dashboard.copyIp}
          riskScore={dashboard.riskScore}
          text={dashboard.t}
        />
        <InfoCard
          automated={dashboard.automated}
          browser={dashboard.browser}
          ipInfo={dashboard.ipInfo}
          localTime={dashboard.localTime}
          webRtc={dashboard.webRtc}
        />
        <DiagnosticsGrid
          cards={dashboard.diagnostics}
          onToggleCard={dashboard.toggleCard}
          openCards={dashboard.openCards}
          text={dashboard.t}
        />
        <CdiValidator
          auditCounts={dashboard.auditCounts}
          auditVerdict={dashboard.auditVerdict}
          audits={dashboard.audits}
          browserReady={dashboard.browserReady}
          filter={dashboard.filter}
          onFilterChange={dashboard.setFilter}
          visibleAudits={dashboard.visibleAudits}
        />
        <NetworkReports
          browser={dashboard.browser}
          ipInfo={dashboard.ipInfo}
          onRestartWebRtc={dashboard.runWebRtc}
          webRtc={dashboard.webRtc}
        />
        <FingerprintModules
          copied={dashboard.copied}
          fullJson={dashboard.fullJson}
          modules={dashboard.modules}
          onCopyJson={dashboard.copyJson}
          onDownloadJson={dashboard.downloadJson}
        />
        <FinalCta />
      </main>

      <footer aria-label="Site footer" />
    </div>
  );
}
