# Button specification

## Target

- **Target file:** `src/components/ui/button.tsx`
- **Role:** Shared native button primitive for consistent defaults and reusable button attributes.

## Behavior

- Defaults `type` to `button` to prevent accidental form submission.
- Accepts every native button attribute and forwards it without changing styling.
- Styling remains opt-in through the existing `className` contracts.
