"use client";

import { type KeyboardEvent, useMemo, useState } from "react";
import {
  Boxes,
  Braces,
  Cpu,
  Database,
  Image as ImageIcon,
  LayoutDashboard,
  Monitor,
  Network,
  Radio,
  ScanLine,
  Type,
} from "lucide-react";
import {
  type FingerprintModule,
  type FingerprintModuleKey,
} from "@/types/fingerprint";

interface FingerprintOverviewProps {
  modules: FingerprintModule[];
}

const categories = [
  { icon: LayoutDashboard, key: "overview", label: "Overview" },
  { icon: Braces, key: "runtime", label: "Runtime" },
  { icon: Monitor, key: "browser", label: "Browser" },
  { icon: ScanLine, key: "screen", label: "Screen" },
  { icon: Cpu, key: "hardware", label: "Hardware" },
  { icon: ImageIcon, key: "canvas", label: "Canvas" },
  { icon: Boxes, key: "webgl", label: "WebGL" },
  { icon: Type, key: "fonts", label: "Fonts" },
  { icon: Radio, key: "media", label: "Media" },
  { icon: Database, key: "storage", label: "Storage" },
  { icon: Network, key: "network", label: "Network" },
] as const;

type CategoryKey = (typeof categories)[number]["key"];
type ModuleCategory = Exclude<CategoryKey, "overview">;

const moduleCategoryByKey: Record<FingerprintModuleKey, ModuleCategory> = {
  workerScope: "runtime",
  navigator: "browser",
  browserVersion: "browser",
  windowFeatures: "browser",
  headless: "browser",
  htmlElementVersion: "runtime",
  cssMedia: "screen",
  css: "screen",
  screen: "screen",
  voices: "media",
  media: "media",
  canvas2d: "canvas",
  cpuScaling: "hardware",
  canvasWebgl: "webgl",
  maths: "hardware",
  consoleErrors: "runtime",
  timezone: "network",
  clientRects: "screen",
  offlineAudioContext: "media",
  fonts: "fonts",
  capturedErrors: "runtime",
  svg: "screen",
  resistance: "runtime",
  intl: "network",
  features: "runtime",
  proxyLies: "runtime",
  network: "network",
  battery: "hardware",
  storage: "storage",
  automation: "browser",
};

const moduleCategoryLabels: Record<ModuleCategory, string> = {
  runtime: "Runtime",
  browser: "Browser",
  screen: "Screen",
  hardware: "Hardware",
  canvas: "Canvas",
  webgl: "WebGL",
  fonts: "Fonts",
  media: "Media",
  storage: "Storage",
  network: "Network",
};

const moduleCategoryIcons: Record<ModuleCategory, typeof Braces> = {
  runtime: Braces,
  browser: Monitor,
  screen: ScanLine,
  hardware: Cpu,
  canvas: ImageIcon,
  webgl: Boxes,
  fonts: Type,
  media: Radio,
  storage: Database,
  network: Network,
};

function formatModuleResult(module: FingerprintModule) {
  try {
    return JSON.stringify(module.result);
  } catch {
    return "Unable to serialize module result";
  }
}

export function FingerprintOverview({ modules }: FingerprintOverviewProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("overview");
  const fingerprintId = modules.find((module) => module.key === "workerScope")?.hash.slice(0, 14) ||
    "collecting-data";
  const activeCategoryLabel = categories.find((category) => category.key === activeCategory)?.label ||
    "Overview";
  const activeModules = useMemo(
    () => activeCategory === "overview"
      ? modules
      : modules.filter((module) => moduleCategoryByKey[module.key] === activeCategory),
    [activeCategory, modules],
  );

  const handleCategoryKeyDown = (event: KeyboardEvent<HTMLButtonElement>, key: CategoryKey) => {
    const currentIndex = categories.findIndex((category) => category.key === key);
    let nextIndex: number | undefined;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = categories.length - 1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % categories.length;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + categories.length) % categories.length;
    }
    if (nextIndex === undefined) return;
    event.preventDefault();
    const nextCategory = categories[nextIndex];
    setActiveCategory(nextCategory.key);
    window.requestAnimationFrame(() => {
      document.getElementById(`fingerprint-tab-${nextCategory.key}`)?.focus();
    });
  };

  return (
    <section className="of-overview" id="overview" aria-labelledby="fingerprint-overview-title">
      <h2 className="of-tableTitle" id="fingerprint-overview-title">
        CreepJS Fingerprint Modules
      </h2>
      <nav className="of-categoryRail" aria-label="CreepJS module categories" role="tablist">
        {categories.map(({ icon: Icon, key, label }) => (
          <button
            aria-controls="fingerprint-category-panel"
            aria-selected={activeCategory === key}
            className={activeCategory === key ? "of-categoryActive" : "of-categoryButton"}
            id={`fingerprint-tab-${key}`}
            key={key}
            onClick={() => setActiveCategory(key)}
            onKeyDown={(event) => handleCategoryKeyDown(event, key)}
            role="tab"
            tabIndex={activeCategory === key ? 0 : -1}
            type="button"
          >
            <Icon aria-hidden="true" size={14} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
        <div className="of-railFingerprint">
          <span>Fingerprint ID</span>
          <code>{fingerprintId}</code>
        </div>
      </nav>

      <div
        aria-labelledby={`fingerprint-tab-${activeCategory}`}
        className="of-workspace"
        id="fingerprint-category-panel"
        role="tabpanel"
        tabIndex={0}
      >
        <div
          className="of-summaryTable"
          role="table"
          aria-label={`${activeCategoryLabel} CreepJS module data`}
        >
          <div className="of-tableHeader" role="row">
            <span role="columnheader">Module</span>
            <span role="columnheader">Category</span>
            <span role="columnheader">JSON result</span>
            <span role="columnheader">SHA-256 / Result</span>
          </div>
          <div className="of-tableBody">
            {activeModules.map((module) => {
              const moduleCategory = moduleCategoryByKey[module.key];
              const Icon = moduleCategoryIcons[moduleCategory];
              const resultValue = formatModuleResult(module);
              const hashResult = module.hash || "Hashing…";
              const resultLabel = module.issues
                ? `Warning / Error (${module.issues}) · ${hashResult}`
                : hashResult;

              return (
                <div className="of-tableRow" key={module.key} role="row">
                  <span className="of-attributeCell" role="cell">
                    <Icon aria-hidden="true" size={11} strokeWidth={1.8} />
                    <span>{module.name}</span>
                  </span>
                  <span className="of-categoryCell" role="cell">
                    {moduleCategoryLabels[moduleCategory]}
                  </span>
                  <span
                    className="of-valueCell of-moduleValueCell"
                    role="cell"
                    title={resultValue}
                  >
                    {resultValue}
                  </span>
                  <span
                    className={`of-resultCell ${module.issues ? "of-warn" : "of-good"}`}
                    role="cell"
                    title={module.hash ? `SHA-256: ${module.hash}` : "Hashing module result"}
                  >
                    {resultLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
