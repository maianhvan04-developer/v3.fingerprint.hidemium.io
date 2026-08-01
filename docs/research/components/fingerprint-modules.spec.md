# FingerprintModules specification

## Overview
- **Target file:** `src/components/fingerprint/fingerprint-modules.tsx`
- **Interaction model:** click-driven accordions, copy, and download

## Structure and styles
- Thirty module rows use gradient surfaces, 12px radius, title/description, state, hash, and chevron.
- Clean rows use green borders; issue rows use red borders.
- Full JSON follows the list and is capped at 600px.

## States
- Opening rotates the chevron and reveals SHA-256 plus local JSON.
- Copy changes to `Copied!`; download creates a JSON Blob.

## Responsive
- Mobile summary stacks metadata beneath the title and keeps long values contained.
