# FingerprintLocationMap Specification

## Overview
- **Target file:** `src/components/fingerprint-demo/visit-summary.tsx`
- **Screenshot:** `docs/design-references/fingerprint.com/location-map-reference.png`
- **Interaction model:** Static map image that updates when the selected visit changes.
- **Source inspected:** `https://fingerprint.com/` at 1440px and 390px viewports on 2026-08-08.

## DOM Structure
- Relative map wrapper.
- Static location map centered on the visit longitude/latitude.
- Center marker rendered as a wrapper `::after` circle, independent of the map image.
- No zoom buttons, iframe footer, donation text, or interactive controls.

## Computed Styles (exact values from getComputedStyle)

### Map wrapper — desktop
- position: `relative`
- display: `block`
- width: `228.734px`
- height: `84px`
- padding: `0px`
- margin: `0px`
- border: `0px none`
- border-radius: `0px`
- background: `transparent`
- overflow: `visible`

### Map image — desktop
- Source pattern: Mapbox Static Images API, `mapbox/light-v11`
- Center: `<longitude>,<latitude>` from the current visit
- Zoom: `12.00`
- Bearing: `0`
- Requested size: `350x200`
- displayed width: `228.734px`
- displayed height: `84px`
- object-fit: `cover`
- object-position: `50% 50%`
- border: `0px none`
- border-radius: `0px`
- filter: `none`
- opacity: `1`

### Center marker
- implementation on source: wrapper `::after`
- position: `absolute`
- width: `13px`
- height: `13px`
- border-radius: `50%`
- background: `rgb(255, 94, 36)` / `#ff5e24`
- content: `""`
- centered horizontally and vertically
- box-shadow: `none`

## States & Behaviors

### Selected visit changes
- Trigger: carousel previous/next control.
- The map center changes to the selected visit longitude/latitude.
- The marker remains visually centered.
- No pan, zoom, hover, or click behavior.

### Loading
- First map uses eager loading; later visit maps use lazy loading.

### Hover states
- N/A.

## Assets
- Dynamic map reference: `docs/design-references/fingerprint.com/location-map-reference.png`
- Production implementation must use the current visit coordinates and must not hardcode the reference location.
- Do not reuse Fingerprint.com's public Mapbox token. Match the light map appearance with the project's configured map provider.

## Text Content (verbatim)
- Image alt: `Location map`
- No visible text or controls inside the map.

## Responsive Behavior
- **Desktop (1440px):** map occupies the right half of the `457px × 84px` visit overview row; measured map size `228.734px × 84px`.
- **Tablet:** retain the desktop two-column location/map composition while sufficient width remains.
- **Mobile (390px):** the map element is not rendered; the location row becomes full width and `63px` high.
- **Breakpoint:** use the existing project visit-summary mobile breakpoint so behavior remains synchronized with the surrounding card.
