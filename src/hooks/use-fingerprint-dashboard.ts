"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBrowserProfile } from "@/hooks/use-browser-profile";
import { useWebRtcCheck } from "@/hooks/use-webrtc-check";
import { createAudits, createDiagnostics } from "@/lib/fingerprint/audits";
import { getFlag, translations } from "@/lib/fingerprint/presentation";
import type {
  AuditCounts,
  AuditFilter,
  CopyKind,
  IpLookupResponse,
  Language,
} from "@/types/fingerprint";

const emptyIp: IpLookupResponse = {};

interface IpheyResponse {
  asn?: number;
  city?: string;
  country?: string;
  countryName?: string;
  ip?: string;
  latitude?: string;
  longitude?: string;
  org?: string;
  region?: string;
  timezone?: { name?: string };
  zipCode?: string;
}

function normalizeIpheyResponse(data: IpheyResponse): IpLookupResponse {
  return {
    success: Boolean(data.ip),
    ip: data.ip,
    type: data.ip?.includes(":") ? "IPv6" : "IPv4",
    country: data.countryName,
    country_code: data.country,
    region: data.region,
    city: data.city,
    postal: data.zipCode,
    latitude: data.latitude ? Number(data.latitude) : undefined,
    longitude: data.longitude ? Number(data.longitude) : undefined,
    connection: {
      asn: data.asn,
      org: data.org,
      isp: data.org,
    },
    timezone: { id: data.timezone?.name },
    security: {
      anonymous: false,
      hosting: false,
      proxy: false,
      tor: false,
      vpn: false,
    },
  };
}

export function useFingerprintDashboard() {
  const { browser, browserReady, modules } = useBrowserProfile();
  const { runWebRtc, webRtc } = useWebRtcCheck();
  const [copied, setCopied] = useState<CopyKind | null>(null);
  const [filter, setFilter] = useState<AuditFilter>("all");
  const [ipError, setIpError] = useState(false);
  const [ipInfo, setIpInfo] = useState<IpLookupResponse>(emptyIp);
  const [ipLoading, setIpLoading] = useState(true);
  const [language, setLanguage] = useState<Language>("EN");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openCards, setOpenCards] = useState<string[]>([]);
  const [time, setTime] = useState(() => new Date(0));
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("fpc.lang")?.toUpperCase();
    if (saved !== "EN" && saved !== "VI" && saved !== "CN" && saved !== "RU") return;
    const frame = window.requestAnimationFrame(() => setLanguage(saved));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 9000);
    const fetchIp = async () => {
      try {
        const liveResponse = await fetch("https://ipgeo.iphey.com/", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!liveResponse.ok) throw new Error("Live IP lookup failed");
        return normalizeIpheyResponse(await liveResponse.json() as IpheyResponse);
      } catch (error) {
        if (controller.signal.aborted) throw error;
        const fallbackResponse = await fetch("/api/ip", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!fallbackResponse.ok) throw new Error("IP lookup failed");
        return fallbackResponse.json() as Promise<IpLookupResponse>;
      }
    };

    void fetchIp()
      .then((data) => {
        if (data.success === false) throw new Error("IP lookup unavailable");
        setIpInfo(data);
      })
      .catch(() => setIpError(true))
      .finally(() => {
        window.clearTimeout(timer);
        setIpLoading(false);
      });
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => setTime(new Date());
    const frame = window.requestAnimationFrame(updateTime);
    const timer = window.setInterval(updateTime, 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const audits = useMemo(
    () => (browserReady ? createAudits(browser) : []),
    [browser, browserReady],
  );
  const diagnostics = useMemo(
    () => createDiagnostics(browser, browserReady),
    [browser, browserReady],
  );

  const visibleAudits = audits.filter((audit) => {
    if (filter === "all") return true;
    if (filter === "fail") return audit.status === "warn" || audit.status === "fatal";
    if (filter === "fatal") return audit.status === "fatal";
    return audit.status === "skip";
  });
  const auditCounts = audits.reduce<AuditCounts>((counts, audit) => {
    counts[audit.status] += 1;
    return counts;
  }, { fatal: 0, pass: 0, skip: 0, warn: 0 });

  const browserScore = useMemo(() => {
    if (!browserReady) return "—";
    const checks = [
      !browser.webdriver,
      browser.cookies,
      browser.storage,
      browser.webgl,
      browser.hardwareConcurrency > 0,
      browser.languages.length > 0,
      browser.canvasHash.length > 8,
      browser.timezone !== "Unknown",
    ];
    return String(Math.round((checks.filter(Boolean).length / checks.length) * 100));
  }, [browser, browserReady]);

  const riskScore = useMemo(() => {
    const security = ipInfo.security;
    if (!security) return 8;
    return Math.min(99, 8 +
      (security.hosting ? 18 : 0) +
      (security.proxy ? 35 : 0) +
      (security.vpn ? 25 : 0) +
      (security.tor ? 50 : 0));
  }, [ipInfo.security]);

  const fullJson = useMemo(() => JSON.stringify({
    audit: audits,
    browser,
    generatedAt: time.toISOString(),
    ip: ipInfo,
    modules: Object.fromEntries(modules.map((module) => [module.name, module.result])),
    webRTC: webRtc,
  }, null, 2), [audits, browser, ipInfo, modules, time, webRtc]);

  const copyValue = useCallback(async (value: string, kind: CopyKind) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }, []);

  const copyIp = useCallback(() => copyValue(ipInfo.ip || "", "ip"), [copyValue, ipInfo.ip]);
  const copyJson = useCallback(() => copyValue(fullJson, "json"), [copyValue, fullJson]);
  const downloadJson = useCallback(() => {
    const blob = new Blob([fullJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fingerprint-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [fullJson]);

  const selectLanguage = useCallback((nextLanguage: Language) => {
    setLanguage(nextLanguage);
    localStorage.setItem("fpc.lang", nextLanguage.toLowerCase());
    setLanguageOpen(false);
  }, []);
  const toggleCard = useCallback((name: string) => {
    setOpenCards((current) => current.includes(name)
      ? current.filter((card) => card !== name)
      : [...current, name]);
  }, []);

  const ipAddress = ipLoading ? "Detecting…" : ipInfo.ip || "Unavailable";
  const preferredTimezone = ipInfo.timezone?.id ||
    (["Detecting…", "Unknown"].includes(browser.timezone) ? undefined : browser.timezone);
  const localTime = time.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: preferredTimezone,
  });
  const auditVerdict = auditCounts.fatal
    ? `FAIL — ${auditCounts.fatal} fatal`
    : auditCounts.warn ? "REVIEW — warning" : audits.length ? "PASS — coherent" : "RUNNING";

  return {
    auditCounts,
    auditVerdict,
    audits,
    automated: browser.webdriver || /HeadlessChrome/i.test(browser.userAgent),
    browser,
    browserReady,
    browserScore,
    copied,
    copyIp,
    copyJson,
    diagnostics,
    downloadJson,
    filter,
    flag: ipInfo.flag?.emoji || getFlag(ipInfo.country_code),
    fullJson,
    ipAddress,
    ipError,
    ipInfo,
    ipLoading,
    language,
    languageOpen,
    localTime,
    menuOpen,
    modules,
    openCards,
    riskScore,
    runWebRtc,
    selectLanguage,
    setFilter,
    t: translations[language],
    toggleCard,
    toggleLanguageMenu: () => setLanguageOpen((open) => !open),
    toggleMenu: () => setMenuOpen((open) => !open),
    visibleAudits,
    webRtc,
  };
}
