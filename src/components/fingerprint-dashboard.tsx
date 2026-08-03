"use client";

import { FingerprintOverview } from "@/components/landing/fingerprint-overview";
import { HeroAnalysis } from "@/components/landing/hero-analysis";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { ProductFeatures, TrustFeatures } from "@/components/landing/trust-features";
import { useFingerprintDashboard } from "@/hooks/use-fingerprint-dashboard";

export function FingerprintDashboard() {
  const dashboard = useFingerprintDashboard();

  return (
    <div className="site-shell">
      <SiteHeader
        language={dashboard.language}
        languageOpen={dashboard.languageOpen}
        onSelectLanguage={dashboard.selectLanguage}
        onToggleLanguage={dashboard.toggleLanguageMenu}
        translation={dashboard.t}
      />
      <main>
        <HeroAnalysis
          browser={dashboard.browser}
          browserScore={dashboard.browserScore}
          copied={dashboard.copied}
          ipAddress={dashboard.ipAddress}
          ipInfo={dashboard.ipInfo}
          onCopyIp={dashboard.copyIp}
          riskScore={dashboard.riskScore}
          webRtc={dashboard.webRtc}
        />
        <TrustFeatures />
        <FingerprintOverview
          browser={dashboard.browser}
          browserReady={dashboard.browserReady}
          browserScore={dashboard.browserScore}
          collectedModuleCount={dashboard.collectedModuleCount}
          copied={dashboard.copied}
          diagnostics={dashboard.diagnostics}
          fullJson={dashboard.fullJson}
          fullJsonReady={dashboard.fullJsonReady}
          httpHeaders={dashboard.httpHeaders}
          ipInfo={dashboard.ipInfo}
          ipRisk={dashboard.ipRisk}
          modules={dashboard.modules}
          onCopyJson={dashboard.copyJson}
          onDownloadJson={dashboard.downloadJson}
          riskScore={dashboard.riskScore}
          webRtc={dashboard.webRtc}
        />
        <ProductFeatures />
      </main>
      <SiteFooter />
    </div>
  );
}
