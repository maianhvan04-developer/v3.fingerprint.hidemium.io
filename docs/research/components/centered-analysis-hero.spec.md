# Centered Analysis Hero Specification

## Overview
- **Target files:** `src/components/landing/hero-analysis.tsx`, `src/components/landing/header-hero.module.css`
- **Interaction model:** Live/time-driven data with click-to-copy.
- **User request:** Remove the promotional hero content shown on the left and center the live analysis card.

## DOM and Content
- Hide/remove the entire promotional copy column: eyebrow, headline, description, CTAs, and benefit list.
- Hide/remove the dotted decoration associated with the removed left column.
- Keep the live analysis card, its content, live values, risk rail, summary rows, and copy button unchanged.

## Layout
- Preserve the hero gradient and wave layers.
- Use a single centered layout at all widths.
- Desktop analysis card width: `min(100%, 920px)`.
- Keep the current desktop hero minimum height and card vertical stretch.

## Responsive Behavior
- Desktop `1440px`: centered `920px` card with equal left/right space.
- Tablet `768px`: card fills the available content width and remains centered.
- Mobile `390px`: keep existing `16px` side gutters and current single-column card internals.
- No horizontal page overflow.

## States and Assets
- Copy IP interaction remains unchanged.
- Live/detecting/unavailable states remain unchanged.
- No new assets.

## Revision — Full value visibility
- Increase the centered desktop card width to `min(100%, 1150px)`.
- Never use ellipsis for the primary IP, location, WebRTC IPs, provider, browser, operating system, or device values.
- Long values wrap with `overflow-wrap: anywhere` and grow their rows/card naturally.
- Allocate `64%` of the analysis header to fingerprint/IP details and `36%` to risk details.
- Preserve mobile wrapping and no horizontal overflow.

## Revision — Risk rail polish
- Preserve the existing score-to-position mapping and accessible risk score label.
- Use a `14px` rounded outer track with a soft neutral inset background and subtle border.
- Inset the colored rail by `2px` and use a smooth green-to-lime-to-yellow-to-orange-to-red gradient.
- Use a `20px` navy marker with a white outer ring, white center, and layered shadow.
- Animate marker position changes over `320ms` without introducing any continuous animation.

## Revision — Fingerprint globe emoji
- Replace the Lucide globe/earth SVG beside `Your Fingerprint` with the literal `🌐` emoji requested in the reference.
- Render it in a dedicated `27px × 27px` decorative span using a color-emoji font stack; do not render an SVG or inherit the label text styles.
- Preserve the existing grid alignment and keep the emoji hidden from assistive technology with `aria-hidden="true"`.

## Revision — Segmented Risk Meter
- **Reason:** User visual QA rejected the smooth rainbow rail and oversized circular marker.
- Current measured rail: `14px` high; current marker: `20px × 20px`, visually larger than the track.
- Replace the continuous gradient with five discrete, softly colored bands: green, lime, amber, orange, and red.
- Use a clean white outer capsule with an `18px` total height, subtle neutral border, `4px` internal padding, and `3px` gaps between bands.
- Replace the circular marker with a slim navy vertical capsule approximately `7px × 24px` including its white outline.
- Preserve the existing score-to-position mapping and `320ms` position transition.
- Expose the component as `role="meter"` with `aria-valuemin="0"`, `aria-valuemax="100"`, and the current score through `aria-valuenow`.
- Preserve the surrounding score typography, Browser Score badge, responsive widths, and no horizontal overflow.

## Revision — Neon IP Risk Pill
- **Reference:** User-supplied `379px × 60px` crop with a single dark risk capsule.
- **Reason:** User requested the complete risk presentation to match the supplied neon pill instead of the light segmented meter.
- **Interaction model:** Live/time-driven score only; no click, hover, scroll, or continuous animation.
- Group the label, score, and progress rail inside one `46px`-high rounded capsule.
- Cap the capsule at `370px` so the progress rail does not stretch wider than the supplied reference on stacked tablet layouts.
- Capsule: near-black gradient background, `1px` lime border, full pill radius, and a soft lime outer glow.
- Text content must read `IP risk score:` followed by the live score and `/ 100` on the same row.
- Label: approximately `17px`, near-white. Score: approximately `19px`, bold lime with a subtle matching glow.
- Progress rail: minimum `90px`, `8px` high, dark violet remainder, thin violet border, and a green-to-yellow-to-red filled segment proportional to the score.
- Remove the discrete five bands and vertical marker; preserve the semantic `role="meter"` and current ARIA values.
- Keep the separate Browser Score badge and all live data unchanged.
- Desktop `1440px`, tablet `768px`, and mobile `390px`: keep the pill itself in one row and prevent horizontal overflow.
- At `959px` and below, stack the fingerprint and risk blocks so the pill retains enough horizontal space; retain the existing divider between those blocks.
