# RedesignFooter specification

## Overview
- **Target:** `src/components/landing/site-footer.tsx`
- **Reference:** user-supplied screenshot
- **Interaction model:** link/button hover and local newsletter confirmation

## Removed section
- Delete the complete `How it works` process/CTA strip and its component.
- Remove its page assembly import/render and the matching `#how-it-works` navigation item.
- Remove process-only responsive and component styles.

## Footer
- White background; 1480px inner grid with brand plus Product, Resources, Company, Stay updated.
- Brand shield repeats header; body links are 11–12px.
- Newsletter input/button are 220px/78px by 34px desktop.
- Bottom legal row has copyright left and Privacy Policy, Terms of Service, Cookie Policy right.
- Add a full-width `1px solid #cbd8e8` top border so the footer is clearly separated from the page content.

## Responsive
- Footer grid becomes 2 columns on tablet and 1 column on mobile; legal links wrap below copyright.
