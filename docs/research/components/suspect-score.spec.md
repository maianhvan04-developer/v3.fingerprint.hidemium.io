# SuspectScore Specification

## Overview
- **Target file:** `src/components/fingerprint-demo/suspect-score.tsx`
- **Screenshot:** `docs/design-references/fingerprint.com/demo-desktop.png`
- **Interaction model:** click-to-switch between live current-device data and trusted-device example
- **Theme override:** retain navy surfaces and existing cyan/purple/red/green state colors.

## DOM Structure
- Real/fake data eyebrow.
- Semicircle gauge with numeric suspect score and label.
- Risk headline, supporting sentence, calculation link.
- Two bottom tabs: current device and trusted-device example.
- Compact score badge variant below 900px.

## Computed Styles

### Desktop panel
- width: `306px`; height: `302px`
- top padding: `27.5px`
- gauge block centered; trust copy begins around `160px` from panel top
- headline: `16px/20px`, weight `500`, letter spacing `-0.48px`
- highlighted state word: JetBrains Mono, `15px/20px`, `4px` inline padding, `2px` radius
- bottom tabs: two equal columns, `39px` high

### Compact badge
- height: `41px`; padding: `6px`; border radius: `4px`
- label and score: `10px`
- mobile width: about `90px`; tablet width: about `161px`

## States & Behaviors
- Live state uses `snapshot.scores.riskScore` and changes copy based on risk.
- Clicking `Try trusted device` switches only the score panel to the original's fake-data state: score `4`, eyebrow `THIS IS FAKE DATA`, headline `This is how a trusted user looks`, support `No signs of fraud, bots, or spoofing.`
- Clicking `Your current device` restores live data.
- Compact badge toggles an accessible compact detail popover on click.
- Tab and link hover change foreground toward cyan over `160ms ease`.

## Assets
- Gauge and alert glyph are inline SVG; no remote assets.
- Compact detail icon may use `ShieldCheck` from `lucide-react`.

## Text Content
- `THIS IS REAL DATA`, `SUSPECT SCORE`
- `You look like a suspicious user`
- `We detected signals of fraud risk.`
- `See how this is calculated`
- `Your current device`, `Try trusted device`
- Trusted example copy listed above.

## Responsive Behavior
- **Desktop (>=900px):** full score panel visible at the right.
- **Tablet/mobile (<900px):** full panel hidden; compact score badge is rendered in the VisitSummary header.

