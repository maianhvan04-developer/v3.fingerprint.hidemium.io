# Header Navigation and Language Switcher Specification

## Overview
- **Target files:** `src/components/landing/site-header.tsx`, `src/components/fingerprint-dashboard.tsx`, `src/components/landing/header-hero.module.css`, `src/locales/*.json`, `src/types/fingerprint.ts`, `src/hooks/use-fingerprint-dashboard.ts`
- **Interaction model:** Direct navigation links, click-driven language menu, click-driven mobile menu.
- **User request:** Replace the current five-item navigation with the three labels shown in the supplied reference and add file-backed language switching.

## Current Desktop Measurements
- Header height: `48px`.
- Navigation gap: `38px`.
- Current primary labels: Product, Use Cases, Docs, Pricing, Company.
- Current navigation includes dropdown submenus; the replacement reference shows three direct labels without dropdown chevrons.
- No horizontal page overflow at `1440px`.

## Target Navigation
- `Proxy` → `https://hideproxy.io/`
- `Antidetect Browser` → `https://hidemium.io/`
- `Contacts` → `https://t.me/hideproxyio`
- Render all three as direct links on desktop and mobile; remove navigation dropdown behavior and chevrons.
- Preserve the existing light header, `48px` desktop height, typography, hover color, brand, Log in, and Sign up actions.

## File-Backed Languages
- Reuse the existing locale files: `src/locales/en.json`, `vi.json`, `cn.json`, and `ru.json`.
- Add a typed `navigation` dictionary to every locale containing the three navigation labels, authentication labels, language-control label, and mobile menu aria labels.
- Default language: `EN`.
- Desktop selector displays the active language code and a menu containing the localized language names from the files.
- Mobile navigation displays four compact language buttons.
- Selection uses the existing `fpc.lang` local-storage key, closes the language menu, and updates the root document `lang` attribute.

## Language Selector Layout
- Place the desktop language control before Log in and Sign up.
- Use a compact bordered `28px`-high button consistent with the header controls.
- The menu opens below the button, is right-aligned, and clearly marks the active language.
- Support mouse, keyboard focus, Escape, and blur-to-close behavior.

## Responsive Behavior
- Desktop `1440px`: brand, centered three-link navigation, language selector, Log in, and Sign up remain on one line.
- Tablet/mobile below `960px`: preserve the hamburger flow; show the three direct links, language options, then auth actions in the expanded panel.
- No horizontal page overflow at desktop or `390px` mobile.

## States and Accessibility
- Language trigger exposes `aria-expanded`, `aria-haspopup="menu"`, and a localized label.
- Language options expose `role="menuitemradio"` and `aria-checked`.
- External navigation links keep their actual destination URLs.
- Preserve existing mobile menu open/close animation and focus styles.

## Assets
- No new raster or vector assets; use existing Lucide `Languages`, `ChevronDown`, `Menu`, and `X` icons.
