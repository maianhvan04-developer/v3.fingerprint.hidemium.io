# CopyButton specification

## Target

- **Target file:** `src/components/ui/copy-button.tsx`
- **Role:** Shared copy-action button used by IP and full fingerprint JSON controls.

## Behavior

- Uses the common `Button` primitive.
- Displays the copy icon and normal label before copying.
- Displays the check mark and supplied success label after copying.
- Preserves the existing `copy-button` visual class by default.
