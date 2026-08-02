# RedesignSiteHeader specification

## Overview
- **Target:** `src/components/landing/site-header.tsx`
- **Reference:** user-supplied 1680×940 screenshot
- **Interaction model:** click/hover dropdowns and mobile menu

## Structure and image-derived styles
- White 48px desktop bar, 1px `#e8eef7` bottom border.
- Inner max-width 1480px; horizontal padding 24px.
- Brand icon 34×26px blue hex/shield with white fingerprint lines; brand text 16px/700 navy.
- Center nav 14px/600, gaps 34–42px; chevrons are 14px.
- Right actions: text login and 76×28px blue sign-up button, 6px radius.

## States
- Dropdown: absolute white panel, 8px radius, 1px blue-gray border, soft shadow.
- Hover/focus: text changes navy → primary blue.
- Mobile: brand remains left; menu button right; expanded panel stacks links and actions.

## Responsive
- Desktop shown at ≥ 960px.
- Mobile menu replaces center/right navigation below 960px.
