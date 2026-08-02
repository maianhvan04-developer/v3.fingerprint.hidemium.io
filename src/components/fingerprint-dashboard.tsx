"use client";

import { FingerprintOverview } from "@/components/landing/fingerprint-overview";
import { HeroAnalysis } from "@/components/landing/hero-analysis";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { TrustFeatures } from "@/components/landing/trust-features";
import { useFingerprintDashboard } from "@/hooks/use-fingerprint-dashboard";

export function FingerprintDashboard() {
  const dashboard = useFingerprintDashboard();

  return (
    <div className="site-shell">
      <SiteHeader />
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
          diagnostics={dashboard.diagnostics}
          ipInfo={dashboard.ipInfo}
          modules={dashboard.modules}
          riskScore={dashboard.riskScore}
          webRtc={dashboard.webRtc}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
