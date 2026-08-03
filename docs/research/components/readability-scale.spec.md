# Landing Readability Scale Specification

## Overview
- **Target files:** `src/components/landing/header-hero.module.css`, `src/components/landing/overview-footer.module.css`
- **Components:** `TrustFeatures`, `FingerprintOverview`
- **Screenshots:** `docs/design-references/readability-before-trust.png`, `docs/design-references/readability-before-overview.png`
- **Interaction model:** Static sizing update. Preserve the existing time-driven partner marquee, hover pause, category tabs, and all live fingerprint data.
- **User request:** Make the feature cards and fingerprint dashboard larger and clearly readable.

## Baseline Measurements at 1440px
- Feature card: `323.2px × 47px`; title `13px`; description `9.5px`.
- Fingerprint overview: `1376.8px × 265.6px`.
- Category button: `183.2px × 22px`; label `11px`.
- Workspace title: `15px`.
- Metric card: `206.2px × 30px`.
- Table header: `18px` high, `9px` text.
- Table row: `12px` high, `8px` text.
- No horizontal overflow: document scroll width `1425px` for a `1440px` browser viewport.

## Target Styles

### Trusted logos and feature cards
- Keep the current equal-width container and marquee behavior.
- Trust heading: `12px`, line-height `18px`.
- Partner strip: at least `28px` high; standard partner text `16px`; branded wordmarks may range from `17px` to `20px`.
- Feature grid: four columns at desktop, two columns below `1100px`, one column below `640px`.
- Feature card: `64px` high on desktop/tablet, `padding: 9px 16px`, `gap: 14px`.
- Feature icon tile: `40px × 40px`; icon approximately `27px`.
- Feature title: `16px`, weight `700`, line-height approximately `19px`.
- Feature description: `12px`, line-height approximately `15px`, maximum two lines.
- Mobile feature card: at least `82px` high and allow copy to remain readable.

### Fingerprint overview shell and category rail
- Desktop grid: `220px minmax(0, 1fr)`.
- Minimum height should grow naturally to approximately `390–430px` from readable rows.
- Top margin: `28px`.
- Category rail padding: `10px`; gap: `2px`.
- Category button: `31px` high; `13px` label; `18px` icon; `10px` gap.

### Workspace header and metadata
- Header: `52px` high; horizontal padding `18px`.
- Title: `18px`, line-height approximately `20px`.
- Subtitle: `13px`, line-height approximately `16px`.
- Analysis metadata: `11px`.

### Metrics
- Metrics padding: `7px 18px`; gap: `10px`.
- ID and metric cards: `40px` high; horizontal padding `12px`.
- Labels: `10.5px`; values: `13px`; auxiliary values: `10px`.
- Metric icons: approximately `18px`.

### Summary table
- Width: `calc(100% - 36px)` with `18px` side margins.
- Header: `26px` high; `10.5px` bold text.
- Rows: minimum `21px` high; `10.5px` text; line-height `1.25`.
- Cell padding: `10px` horizontal.
- Attribute icons: approximately `13px`; result dot: `6px`.

## Responsive Behavior
- **Desktop (1440px):** four feature cards; overview has a left category rail and data table; no horizontal page overflow.
- **Tablet (768px):** two feature cards; category rail becomes a horizontally scrollable row; readable metrics and table remain contained.
- **Mobile (390px):** one feature card per row; category rail remains horizontally scrollable; metrics stack as currently designed; table rows remain card-based with at least `11px` value text and no horizontal page overflow.
- On mobile, the workspace header must use natural height rather than retaining the desktop fixed height.

## States and Behaviors
- Preserve feature-card hover elevation and border transition.
- Preserve partner marquee speed, seamless duplication, hover/focus pause, masks, and reduced-motion fallback.
- Preserve category button hover/active colors and click-to-switch tab behavior.
- Preserve live data, truncation, title tooltips, colors, and status dots.

## Assets and Content
- No new assets.
- Keep all existing text, Lucide icons, API-backed values, and component structure.

## Revision 2 — Explicit Large-Type Pass
- **Reason:** User visual QA found the first readability pass still too small.
- Replace compact desktop typography rather than applying a small incremental bump.
- Trust heading: `14px`; partner names: `18px` base with branded wordmarks up to `22px`.
- Feature cards: `80px` high; title `18px`; description `14px` with an `18px` line-height; icon tile `46px` with a `31px` icon.
- Overview category rail: `240px`; tab labels `15px`; tab icons `20px`; buttons `38px` high.
- Workspace heading: `22px`; subtitle `15px`; analysis metadata `13px`.
- Metric labels: `12.5px`; metric values `15px`; auxiliary values `12px`; cards `48px` high.
- Table header: `13px` text and `32px` height.
- Table body: `13px` text and at least `26px` row height; attribute icons `15px`.
- Mobile card table: attribute `13px`, category `11.5px`, value `13px`, result `12.5px`.
- Increase container heights and spacing only as needed to avoid clipping; preserve responsive layouts and no horizontal page overflow.
- Lay out metric labels and values on two internal rows so large type never overlaps at `1440px`.
- Feature descriptions may use up to three lines; cards must be tall enough to avoid ellipsis for the existing copy.

## Revision 3 — Partner Heading Separation
- **Reason:** User visual QA found the trust heading and animated partner row visually attached.
- Current measured vertical gap between the heading box and partner scroller: `0px`.
- Add a `16px` bottom margin to the trust heading, producing a clear `16px` separation before the animated logo row.
- Preserve the existing trust container padding, partner sizes, horizontal distribution, marquee speed, masks, hover/focus pause, and reduced-motion behavior.

## Revision 4 — Fingerprint ID Icon Alignment
- **Reason:** User visual QA found the fingerprint icon detached from its value because it was pinned to the card's right edge.
- Current desktop layout uses `value | icon`; the icon begins at `x=515.2px` while the value begins at `x=298.6px` inside a `264.2px`-wide card.
- Change the second row to `icon | value`, keeping the label across the full first row.
- Use a `20px` icon column and an `8px` gap, with the icon and ID vertically centered on the same baseline.
- Preserve the current card size, ID truncation, live value, typography, colors, and responsive metric stacking.
- At desktop and mobile widths, the card must remain contained with no horizontal page overflow.
