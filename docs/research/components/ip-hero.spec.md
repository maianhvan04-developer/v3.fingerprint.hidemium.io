# IpHero specification

## Overview
- **Target file:** `src/components/fingerprint/ip-hero.tsx`
- **Screenshot:** `docs/design-references/fingerprint-target-desktop.png`
- **Interaction model:** live/time-driven data with click-to-copy

## Structure and styles
- Centered hero begins 30px below the header and is 236.76px tall on desktop.
- Badge is an uppercase 14.5px purple pill.
- IP title is centered flex, 35px/600, and uses a 14px gap.
- IPv4/IPv6 chips, score, risk meter, and details link wrap without overflow.

## States
- Copy action changes its label to a success acknowledgement.
- IP and location show detecting/unavailable states without layout collapse.

## Responsive
- Title becomes 27px at 600px.
- Mobile hero is 342px wide and approximately 417px tall.
