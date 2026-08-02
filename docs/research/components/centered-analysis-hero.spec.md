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
