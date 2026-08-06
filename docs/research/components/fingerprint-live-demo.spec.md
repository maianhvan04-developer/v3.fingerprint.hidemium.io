# FingerprintLiveDemo Specification

## Overview
- **Target file:** `src/components/fingerprint-demo/fingerprint-live-demo.tsx`
- **Screenshot:** `docs/design-references/fingerprint.com/demo-desktop.png`
- **Interaction model:** data-driven, click navigation, click trusted-device example
- **Integration:** replaces only the current HeroConsole workspace content; terminal titlebar/statusbar and global dark design remain.

## DOM Structure
- Two-column demo row: `VisitSummary` and `SuspectScore`.
- Receives the current `FingerprintSnapshot`, derived weekly visits, and scanning status.
- Owns selected-visit index and trusted-example state.

## Computed Styles
- Fingerprint live reference row: `795.5px × 302px`, display `flex`, overflow `hidden`.
- Outer reference radius: `8px`; product adaptation uses existing `7–9px` console radii.
- Desktop split: `489.5px` + `306px` (61.5% / 38.5%).
- No gap; a shared 1px divider separates panels.

## States & Behaviors
- When collecting, placeholder values remain aligned and the terminal action says `Analyzing…`.
- The latest scan is appended to a local seven-day history once per collection.
- Summary counts are derived from real stored visits: visits, incognito sessions, unique IPs, unique locations.
- Visitor ID is a deterministic 20-character representation of the real composite fingerprint hash.
- Statusbar copy changes to `LOCAL DIAGNOSTIC · 7-DAY VISIT HISTORY`.

## Assets
- No new remote assets.
- Uses the two sibling components and existing icon library.

## Text Content
- Verbatim visible labels are defined in the child specs.
- Product terminal mode labels and analyze button remain unchanged.

## Responsive Behavior
- **Desktop (>=900px):** two columns with full score panel.
- **Tablet/mobile (<900px):** one full-width VisitSummary with compact score badge; full score panel hidden.
- **Mobile (<540px):** height grows naturally to contain the 2×2 summary and active visit; no horizontal page overflow.
