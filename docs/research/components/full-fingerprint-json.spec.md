# Full Fingerprint JSON Specification

## Overview

- **Target files:** `src/components/landing/full-fingerprint-json.tsx`, `src/components/landing/overview-footer.module.css`, `src/components/fingerprint-dashboard.tsx`, `src/hooks/use-fingerprint-dashboard.ts`, `src/lib/fingerprint/modules.ts`, `src/types/fingerprint.ts`
- **Source screenshots:** `docs/design-references/target-full-fingerprint-json-desktop.png`, `docs/design-references/target-full-fingerprint-json-mobile.png`
- **Current UI reference:** `docs/design-references/readability-large-final-overview.png`
- **Interaction model:** standalone section immediately above the footer with Copy and Download actions
- **Customization:** retain source data semantics only; use the current light-blue Fingerprint Overview UI, not the source's purple module UI

## Data Contract

The JSON root is an object containing these stable keys in source order:

`workerScope`, `navigator`, `browserVersion`, `windowFeatures`, `headless`, `htmlElementVersion`, `cssMedia`, `css`, `screen`, `voices`, `media`, `canvas2d`, `cpuScaling`, `canvasWebgl`, `maths`, `consoleErrors`, `timezone`, `clientRects`, `offlineAudioContext`, `fonts`, `capturedErrors`, `svg`, `resistance`, `intl`, `features`, `proxyLies`, `network`, `battery`, `storage`, `automation`.

Each key maps to the corresponding live module result with an additional `$hash` property containing the module's full SHA-256 hash. Copy, visible content, and downloaded content must be byte-for-byte equivalent after UTF-8 encoding.

## DOM Structure

- Standalone `FullFingerprintJson` section after the product feature row and immediately before `SiteFooter`
- Section header
  - Title: `Full Fingerprint JSON`
  - Subtitle: `Complete live payload from all collected fingerprint modules.`
  - Metadata: module readiness, payload size, analyzed time
- JSON viewer panel
  - Toolbar with payload label and Copy/Download buttons
  - Scrollable `<pre><code>` containing the formatted JSON
  - Empty/loading state while modules are being collected

## Computed Styles / Existing UI Tokens

These values are inherited from the current overview workspace and are the visual authority:

### Section shell

- width: `min(1536px, calc(100% - 48px))`
- background: `#ffffff`
- border: `1px solid #d5e1f0`
- border radius: `12px`
- box shadow: `0 8px 28px rgb(50 78 125 / 8%)`

### Header

- min-height: `64px`
- padding: `4px 20px`
- border bottom: `1px solid #e3eaf4`
- heading: display font, `22px/24px`, weight `700`, color inherited navy
- subtitle: `15px/18px`, color `#6f7f98`
- metadata: `13px`, color `#566985`

### JSON toolbar and actions

- panel margin: `0 20px 12px`
- panel border: `1px solid #e0e8f2`
- panel radius: `6px`
- toolbar min-height: `42px`
- toolbar background: `#f5f8fc`
- toolbar label: `13px`, weight `700`, color `#30435f`
- action height: `30px`
- action border: `1px solid #cddcf0`
- action radius: `6px`
- primary action color: `#1768f2`
- action hover background/border: `#eaf3ff` / `#9ebcec`
- copied state color: `#159541`

### JSON code viewport

- max height: `520px` desktop
- margin: `0`
- padding: `16px 18px 20px`
- overflow: `auto`
- background: `#f9fbfe`
- color: `#263b5d`
- font family: current `var(--mono)`
- font size/line-height: `12px/1.6`
- white-space: `pre`
- tab size: `2`
- scrollbar must remain usable in both axes

## States & Behaviors

### Collection

- **Collecting:** show a compact status message; disable Copy and Download; display live collected count out of 30
- **Ready:** formatted JSON is visible and both actions are enabled

### Copy

- **Trigger:** click Copy JSON
- Write the exact formatted JSON through `navigator.clipboard.writeText`
- Label/icon changes to `Copied` for about 1.6 seconds, then resets

### Download

- **Trigger:** click Download JSON
- Create an `application/json` Blob using the exact formatted payload
- Filename: `fingerprint-YYYY-MM-DD.json`
- Revoke the object URL after triggering the download

### Hover and focus

- Buttons use the existing blue tint hover treatment
- All buttons show a visible keyboard focus ring consistent with existing controls
- The standalone section is labelled by its heading and does not participate in the overview tablist

## Text Content

- Heading: `Full Fingerprint JSON`
- Subtitle: `Complete live payload from all collected fingerprint modules.`
- Toolbar: `JSON`
- Buttons: `Copy JSON`, `Copied`, `Download JSON`
- Loading: `Collecting fingerprint modules…`

## Responsive Behavior

- **Desktop (1440px):** standalone card spans the current content container; actions align at the toolbar's right edge; code max-height `520px`.
- **Tablet (768px):** section remains full-width within the current content container; toolbar remains one row when space permits.
- **Mobile (390px):** section width remains `calc(100% - 28px)`; header and toolbar wrap; action buttons remain at least 36px tall; code font becomes `11px`, max-height `420px`, and retains horizontal scroll.
- **Breakpoint:** use the existing overview breakpoints at `980px`, `700px`, and `520px`.

## Assets

- No downloaded visual assets.
- Use Lucide icons already installed in the project.
