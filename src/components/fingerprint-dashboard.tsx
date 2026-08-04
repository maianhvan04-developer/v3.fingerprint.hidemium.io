"use client";

import { useEffect, useRef } from "react";
import { FingerprintOverview } from "@/components/landing/fingerprint-overview";
import { FullFingerprintJson } from "@/components/landing/full-fingerprint-json";
import { HeroAnalysis } from "@/components/landing/hero-analysis";
import { CdiValidator } from "@/components/fingerprint/cdi-validator";
import { DiagnosticsGrid } from "@/components/fingerprint/diagnostics-grid";
import { NetworkReports } from "@/components/fingerprint/network-reports";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { ProductFeatures, TrustFeatures } from "@/components/landing/trust-features";
import { useFingerprintDashboard } from "@/hooks/use-fingerprint-dashboard";

export function FingerprintDashboard() {
  const dashboard = useFingerprintDashboard();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const sections = Array.from(main.children)
      .slice(1)
      .filter((element): element is HTMLElement => element instanceof HTMLElement);
    sections.forEach((section) => section.classList.add("scroll-reveal-item"));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.06,
    });
    const frame = window.requestAnimationFrame(() => {
      sections.forEach((section) => observer.observe(section));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      sections.forEach((section) => {
        section.classList.remove("scroll-reveal-item", "is-visible");
      });
    };
  }, []);

  return (
    <div className="site-shell">
      <SiteHeader
        language={dashboard.language}
        languageOpen={dashboard.languageOpen}
        onSelectLanguage={dashboard.selectLanguage}
        onToggleLanguage={dashboard.toggleLanguageMenu}
        translation={dashboard.t}
      />
      <main className="scroll-page" ref={mainRef}>
        <HeroAnalysis
          browser={dashboard.browser}
          browserScore={dashboard.browserScore}
          copied={dashboard.copied}
          ipAddress={dashboard.ipAddress}
          ipInfo={dashboard.ipInfo}
          localTime={dashboard.localTime}
          onCopyIp={dashboard.copyIp}
          riskScore={dashboard.riskScore}
          webRtc={dashboard.webRtc}
        />
        <TrustFeatures />
        <DiagnosticsGrid
          cards={dashboard.diagnostics}
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
        <ProductFeatures />
        <FingerprintOverview modules={dashboard.modules} />
        <FullFingerprintJson
          collectedModuleCount={dashboard.collectedModuleCount}
          copied={dashboard.copied}
          fullJson={dashboard.fullJson}
          fullJsonReady={dashboard.fullJsonReady}
          onCopyJson={dashboard.copyJson}
          onDownloadJson={dashboard.downloadJson}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
