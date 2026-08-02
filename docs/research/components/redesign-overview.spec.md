# RedesignFingerprintOverview Specification

## Overview
- **Target file:** `src/components/landing/fingerprint-overview.tsx`
- **Screenshot:** `docs/design-references/fingerprint-overview-tabs-before.png`
- **Interaction model:** click-driven category tabs with live browser data; no scroll-driven state changes.

## DOM Structure
- `section#overview` contains the category rail and one workspace panel.
- The rail contains 11 buttons: Overview, HTTP Headers, Browser, Screen, Hardware, Canvas, WebGL, Fonts, Media, Storage, Network.
- The workspace contains its category-specific heading/subtitle, shared fingerprint metrics, and a four-column data table.
- Clicking a category must replace the table rows and explanatory copy. It must not only change the selected-button appearance.

## Computed Styles (exact values from getComputedStyle)

### Container at 1440px
- display: `grid`
- grid-template-columns: `200px 1fr`
- width: `calc(100% - 48px)` up to `1536px`
- min-height: `264px`
- margin: `20px auto 0`
- background: `#fff`
- border: `1px solid #d5e1f0`
- border-radius: `12px`
- overflow: `hidden`

### Category rail
- width: `200px`
- height: `264px`
- display: `flex`
- flex-direction: `column`
- gap: `1px`
- padding: `6px 8px`
- background: `#fbfdff`

### Category buttons
- width: `100%`
- height: `22px`
- display: `flex`
- align-items: `center`
- gap: `9px`
- padding: `0 10px`
- font: `600 11px/11px SF Pro Text`
- color: `rgb(53, 72, 102)`
- border-radius: `6px`
- transition: `color 0.16s, background 0.16s`
- cursor: `pointer`
- active/hover color: `rgb(23, 104, 242)`
- active/hover background: `rgb(234, 243, 255)`

### Workspace and table
- workspace desktop width: remaining column (`771.2px` at the inspected 1024px content viewport)
- title: `700 15px/16.5px SF Pro Display`
- table margin: `0 16px 8px`
- table border: `1px solid rgb(224, 232, 242)`
- table border-radius: `6px`
- table overflow: `hidden`
- desktop row height: `12px`
- desktop row grid: `19% 12% 45% 24%`
- row font: `400 8px/10px SF Pro Text`

## States & Behaviors

### Category selection
- **Trigger:** click a category button.
- **Before:** inactive text `#354866`, transparent background, `aria-selected=false`.
- **After:** selected text `#1768f2`, background `#eaf3ff`, `aria-selected=true`.
- **Content update:** title, subtitle, column rows, values, and results all update to the selected category.
- **Transition:** button color/background `160ms`; table content may fade in without delaying interaction.
- **Implementation:** React local state with typed category keys and derived live row arrays.

### Hover
- Inactive category changes to the same color/background as selected using the existing `160ms` transition.

## Per-State Content

### Overview
- IP address, location, provider, WebRTC IPs, leak status, TCP/IP heuristic, proxy/VPN, browser, OS, device, screen, audio and platform.

### HTTP Headers
- User-Agent, Accept-Language, Sec-CH-UA platform/mobile equivalents, DNT, cookies, online state and platform.

### Browser
- Browser name/version, rendering engine, User-Agent, language(s), cookies, DNT and WebDriver state.

### Screen
- Screen resolution, viewport, color depth, device pixel ratio and touch points.

### Hardware
- Device type, platform, architecture, memory, logical processors, touch points, GPU vendor and renderer.

### Canvas
- Full Canvas SHA-256 signature, algorithm, render/readability status and color surface information.

### WebGL
- Availability, GPU vendor, GPU renderer and collected WebGL module hash/status.

### Fonts
- Detected font count and one row for every detected font; show an explicit unavailable record when enumeration is blocked.

### Media
- AudioContext, MediaSource, MediaRecorder and SpeechSynthesis capability/status from live modules.

### Storage
- Local Storage, IndexedDB, StorageManager, cookies and Do Not Track state.

### Network
- Public IP, IP family, location, provider/ASN, connection status, timezone, WebRTC IPs and leak result.

## Assets
- Existing Lucide icons only; no image or video assets.

## Text Content
- Category labels are verbatim from the supplied sidebar screenshot.
- Titles use `<Category> Details`, except Overview which remains `Fingerprint Overview`.
- Subtitles describe the live signal family being shown.

## Responsive Behavior
- **Desktop (1440px):** two columns; 200px vertical category rail and compact table.
- **Tablet (768px):** rail becomes a horizontal scroller above the workspace.
- **Mobile (390px):** measured client width `375px`; outer section `347.2px` with equal ~`14px` margins, rail `345.6px` and horizontal scrolling, workspace `345.6px`, table `325.6px`; no page-level horizontal overflow.
- **Breakpoint:** rail switches to horizontal at `980px`; metric cards form two columns and table rows become stacked records below `700px`.
