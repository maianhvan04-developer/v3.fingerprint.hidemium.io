"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBrowserProfile } from "@/hooks/use-browser-profile";
import { useWebRtcCheck } from "@/hooks/use-webrtc-check";
import { createAudits, createDiagnostics } from "@/lib/fingerprint/audits";
import { getFlag, translations } from "@/lib/fingerprint/presentation";
import {
  fingerprintModuleKeys,
  type AuditCounts,
  type AuditFilter,
  type CopyKind,
  type HttpHeadersSnapshot,
  type IpLookupResponse,
  type IpRiskProfile,
  type Language,
} from "@/types/fingerprint";

const emptyIp: IpLookupResponse = {};
const emptyHeaders: HttpHeadersSnapshot = { headers: {}, status: "loading" };
const emptyRisk: IpRiskProfile = { status: "loading" };

const languageTags: Record<Language, string> = {
  CN: "zh-CN",
  EN: "en",
  RU: "ru",
  VI: "vi",
};

interface IpheyResponse {
  airport?: string;
  asn?: number;
  city?: string;
  continent?: string;
  country?: string;
  countryName?: string;
  ip?: string;
  languages?: string | string[];
  latitude?: string;
  longitude?: string;
  org?: string;
  region?: string;
  regionCode?: string;
  timezone?: { name?: string };
  zipCode?: string;
}

interface IpifyResponse {
  ip?: string;
}

interface IpRiskResponse {
  code?: number;
  data?: {
    risk_english?: string;
    score?: number;
  };
}

function normalizeIpheyResponse(data: IpheyResponse): IpLookupResponse {
  const languages = Array.isArray(data.languages)
    ? data.languages
    : data.languages?.split(",").map((language) => language.trim()).filter(Boolean);
  return {
    success: Boolean(data.ip),
    ip: data.ip,
    ipv4: data.ip && !data.ip.includes(":") ? data.ip : undefined,
    ipv6: data.ip?.includes(":") ? data.ip : undefined,
    type: data.ip?.includes(":") ? "IPv6" : "IPv4",
    country: data.countryName,
    country_code: data.country,
    continent: data.continent,
    region: data.region,
    region_code: data.regionCode,
    city: data.city,
    postal: data.zipCode,
    airport: data.airport,
    languages,
    latitude: data.latitude ? Number(data.latitude) : undefined,
    longitude: data.longitude ? Number(data.longitude) : undefined,
    connection: {
      asn: data.asn,
      org: data.org,
      isp: data.org,
    },
    timezone: { id: data.timezone?.name },
  };
}

export function useFingerprintDashboard() {
  const { browser, browserReady, modules } = useBrowserProfile();
  const { runWebRtc, webRtc } = useWebRtcCheck();
  const [copied, setCopied] = useState<CopyKind | null>(null);
  const [filter, setFilter] = useState<AuditFilter>("all");
  const [httpHeaders, setHttpHeaders] = useState<HttpHeadersSnapshot>(emptyHeaders);
  const [ipError, setIpError] = useState(false);
  const [ipInfo, setIpInfo] = useState<IpLookupResponse>(emptyIp);
  const [ipLoading, setIpLoading] = useState(true);
  const [ipRisk, setIpRisk] = useState<IpRiskProfile>(emptyRisk);
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
    document.documentElement.lang = languageTags[language];
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 12000);
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

    const fetchIpv4 = async () => {
      const response = await fetch("https://api4.ipify.org?format=json", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("IPv4 lookup failed");
      const data = await response.json() as IpifyResponse;
      if (!data.ip || data.ip.includes(":")) throw new Error("IPv4 unavailable");
      return data.ip;
    };

    void Promise.allSettled([fetchIp(), fetchIpv4()])
      .then(async ([ipResult, ipv4Result]) => {
        if (ipResult.status === "rejected" && ipv4Result.status === "rejected") {
          throw new Error("IP lookup unavailable");
        }
        const data = ipResult.status === "fulfilled" ? ipResult.value : {};
        const ipv4 = ipv4Result.status === "fulfilled"
          ? ipv4Result.value
          : data.ipv4 || (data.ip && !data.ip.includes(":") ? data.ip : undefined);
        const ipv6 = data.ipv6 || (data.ip?.includes(":") ? data.ip : undefined);
        const merged: IpLookupResponse = {
          ...data,
          ip: data.ip || ipv6 || ipv4,
          ipv4,
          ipv6,
          success: Boolean(data.ip || ipv4 || ipv6),
          type: data.ip?.includes(":") || (!data.ip && ipv6) ? "IPv6" : "IPv4",
        };
        setIpInfo(merged);

        const riskIp = ipv4 || merged.ip;
        if (!riskIp) {
          setIpRisk({ status: "unavailable" });
          return;
        }
        try {
          const response = await fetch(
            `https://ip234.in/fraud_check?ip=${encodeURIComponent(riskIp)}`,
            { cache: "no-store", signal: controller.signal },
          );
          if (!response.ok) throw new Error("Risk lookup failed");
          const riskData = await response.json() as IpRiskResponse;
          const score = riskData.data?.score;
          if (typeof score !== "number") throw new Error("Risk score unavailable");
          setIpRisk({
            score: Math.max(0, Math.min(100, Math.round(score))),
            status: "complete",
            verdict: riskData.data?.risk_english,
          });
        } catch {
          setIpRisk({ status: "unavailable" });
        }
      })
      .catch(() => {
        setIpError(true);
        setIpRisk({ status: "unavailable" });
      })
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
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 7000);
    void fetch("/api/headers", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Header inspection failed");
        const data = await response.json() as { headers?: Record<string, string> };
        setHttpHeaders({ headers: data.headers ?? {}, status: "complete" });
      })
      .catch(() => setHttpHeaders({ headers: {}, status: "unavailable" }))
      .finally(() => window.clearTimeout(timer));
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
    if (typeof ipRisk.score === "number") return ipRisk.score;
    const security = ipInfo.security;
    if (!security) return 8;
    return Math.min(99, 8 +
      (security.hosting ? 18 : 0) +
      (security.proxy ? 35 : 0) +
      (security.vpn ? 25 : 0) +
      (security.tor ? 50 : 0));
  }, [ipInfo.security, ipRisk.score]);

  const { collectedModuleCount, fullJson, fullJsonReady } = useMemo(() => {
    const modulesByKey = new Map(modules.map((module) => [module.key, module]));
    const collectedCount = fingerprintModuleKeys.filter((key) => modulesByKey.has(key)).length;
    if (collectedCount !== fingerprintModuleKeys.length) {
      return { collectedModuleCount: collectedCount, fullJson: "", fullJsonReady: false };
    }

    const payload = fingerprintModuleKeys.reduce<Record<string, Record<string, unknown>>>(
      (result, key) => {
        const module = modulesByKey.get(key);
        if (module) result[key] = { ...module.result, $hash: module.hash };
        return result;
      },
      {},
    );
    return {
      collectedModuleCount: collectedCount,
      fullJson: JSON.stringify(payload, null, 2),
      fullJsonReady: true,
    };
  }, [modules]);

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
  const copyJson = useCallback(() => {
    if (!fullJsonReady) return;
    void copyValue(fullJson, "json");
  }, [copyValue, fullJson, fullJsonReady]);
  const downloadJson = useCallback(() => {
    if (!fullJsonReady) return;
    const blob = new Blob([fullJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fingerprint-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [fullJson, fullJsonReady]);

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
    collectedModuleCount,
    copied,
    copyIp,
    copyJson,
    diagnostics,
    downloadJson,
    filter,
    flag: ipInfo.flag?.emoji || getFlag(ipInfo.country_code),
    fullJson,
    fullJsonReady,
    httpHeaders,
    ipAddress,
    ipError,
    ipInfo,
    ipLoading,
    ipRisk,
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
