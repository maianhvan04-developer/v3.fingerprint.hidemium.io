# CdiValidator specification

## Overview
- **Target file:** `src/components/fingerprint/cdi-validator.tsx`
- **Interaction model:** click-driven filtering

## Structure and styles
- Summary wraps verdict, five counters, and four filters on a 14px-radius surface.
- Desktop rows use `24px 62px 1fr auto`, 12px gaps, and status-specific left borders.
- Status uses mark, text, border, and severity tag—not color alone.

## States
- Filters display all, failed/warned, fatal, or skipped invariants in original order.
- Active filter is purple with white text.

## Responsive
- At 640px rows become `20px 1fr`; ID, body, and tags stack in column two.
