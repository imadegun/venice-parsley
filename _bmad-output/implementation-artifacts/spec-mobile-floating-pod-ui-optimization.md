---
title: 'Mobile floating pod UI optimization for homepage'
type: 'feature'
created: '2026-04-11T10:08:00Z'
status: 'done'
baseline_commit: 'NO_VCS'
context: ['{project-root}/_bmad-output/planning-artifacts/architecture.md', '{project-root}/_bmad-output/planning-artifacts/prd.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The current homepage mobile layout keeps desktop-oriented header/hero patterns that consume vertical space, reduce clarity, and weaken conversion visibility for primary booking actions on screens under 768px.

**Approach:** Implement a mobile-specific “Floating Pod” treatment by collapsing header chrome, reshaping the hero into a rounded U-shape container, centering key messaging, and introducing a persistent bottom booking CTA while preserving desktop behavior and existing cinematic hero motion.

## Boundaries & Constraints

**Always:** Preserve desktop/tablet behavior at and above 768px; enforce z-index layering with header and bottom CTA above content; keep cinematic hero image animation active in mobile container; keep typography family aligned with Montserrat/Mulish system; ensure mobile spacing/readability improves without changing page IA.

**Ask First:** Introducing any new design tokens/colors beyond existing palette conventions; changing desktop copy or section ordering; replacing current navigation interaction model with a full drawer system.

**Never:** Re-enable the top mobile “BOOK NOW” tab; disable hero animation on mobile; make desktop regressions; implement a non-persistent mobile booking CTA.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| MOBILE_HEADER | Viewport width < 768px on homepage | Single fixed full-width navy header with left logo and right MENU + hamburger; no top BOOK NOW tab | If nav action is not yet wired, keep visual affordance only without runtime errors |
| MOBILE_HERO_POD | Viewport width < 768px, hero rendered | Hero appears with top peek margin, constrained mobile aspect ratio, pronounced bottom radii (~60px), active zoom/pan animation clipped within pod | If image fails to load, maintain pod container shape and overlay so layout does not collapse |
| MOBILE_STICKY_CTA | Viewport width < 768px while scrolling | Fixed bottom vibrant pink BOOK NOW bar with rounded top corners and subtle shadow persists above content | If target route/action unavailable, CTA remains visually rendered as non-breaking button/link |
| MOBILE_TYPOS | Viewport width < 768px in intro content | Kicker, headline, and wave separator centered; headline size reduced (~28–32px effective); body text has generous side padding (~30px) | If translated copy is long, text wraps without overflow/cutoff |

</frozen-after-approval>

## Code Map

- `villa-spa/src/components/layout/header.tsx` -- Convert header to responsive split behavior, mobile single-bar variant, remove mobile top BOOK NOW tab.
- `villa-spa/src/components/hero/hero-section.tsx` -- Apply mobile pod geometry, aspect-ratio control, top peek spacing, and retain clipped cinematic animation.
- `villa-spa/src/app/page.tsx` -- Add/adjust homepage content section structure/classes for mobile center alignment, body padding, and sticky mobile BOOK NOW CTA.
- `villa-spa/src/app/globals.css` -- Add utility/class refinements for mobile-specific floating pod styling, z-index consistency, and CTA polish.

## Tasks & Acceptance

**Execution:**
- [x] `villa-spa/src/components/layout/header.tsx` -- Implement mobile-only fixed navy bar (logo left, MENU + icon right), remove top BOOK NOW tab on mobile, keep existing desktop dual-wing composition -- Enforces compact mobile navigation.
- [x] `villa-spa/src/components/hero/hero-section.tsx` -- Refactor hero wrapper for mobile aspect ratio (1:1 to 4:5), stronger bottom radii (~60px), and top peek gap (~10px); keep overlay, controls, and animation clipped within pod -- Delivers floating pod aesthetic without behavior loss.
- [x] `villa-spa/src/app/page.tsx` -- Add mobile-only persistent bottom BOOK NOW bar and adjust first content block typography alignment/padding targets for mobile readability -- Keeps conversion action thumb-reachable and improves text legibility.
- [x] `villa-spa/src/app/globals.css` -- Add/adjust responsive utility styles for z-index stack (header 100, sticky footer 100, content 1), CTA corner/shadow polish, and mobile typography scale guardrails -- Centralizes responsive styling rules and avoids class duplication.
- [x] `villa-spa/src/app/page.tsx` -- Add semantic hook/classes for “SHORELINE VIBES / Life at Shoreline…” block and centered wave-line separator behavior under mobile breakpoint -- Aligns implementation with requested brand composition.

**Acceptance Criteria:**
- Given a viewport width below 768px, when the page loads, then the header is a fixed full-width navy bar with logo left, MENU + hamburger right, and no top BOOK NOW tab visible.
- Given a viewport width below 768px, when the hero renders, then it shows a floating pod treatment with a small top gap, strong bottom radii around 60px, constrained ratio close to 1:1–4:5, and active cinematic image motion contained within the pod bounds.
- Given a viewport width below 768px, when the user scrolls through main content, then a fixed bottom BOOK NOW CTA remains visible with vibrant pink background, rounded top corners (~20px), subtle elevation shadow, and no overlap that hides critical content.
- Given a viewport width below 768px, when intro copy is displayed, then the kicker/headline/wave separator are centered, headline scale remains approximately 28–32px, and body text keeps generous horizontal padding around 30px.
- Given a viewport width at or above 768px, when navigating homepage sections, then current desktop layout and interactions remain visually/functionally consistent.

## Spec Change Log

## Design Notes

Use responsive utility overrides directly where behavior differs by breakpoint, but keep complex repeated mobile shape behavior in shared class names for maintainability.

Example mobile pod shape constraints:

```tsx
<section className="relative mt-[10px] aspect-[4/5] sm:aspect-auto overflow-hidden rounded-b-[60px] md:mt-0 md:rounded-b-[40px]">
```

Example z-index intent:

```css
.mobile-header { z-index: 100; }
.mobile-bottom-cta { z-index: 100; }
.hero-content-layer { z-index: 1; }
```

## Verification

**Commands:**
- `npm run lint` -- expected: no new lint errors in modified files.
- `npm run build` -- expected: production build succeeds with no type/runtime compile errors.

**Manual checks (if no CLI):**
- Resize to 375x812 and 767x1024: verify header/hero/CTA composition and non-overlap.
- Resize to 768px and above: verify desktop header and hero presentation remain unchanged.
- Scroll through homepage on mobile width: verify bottom CTA persistence and readable content spacing.

## Suggested Review Order

**Mobile navigation shell**

- Establishes mobile-first header while preserving desktop dual-wing behavior.
  [`header.tsx:10`](../../villa-spa/src/components/layout/header.tsx#L10)

- Ensures desktop header remains isolated to md+ breakpoints.
  [`header.tsx:29`](../../villa-spa/src/components/layout/header.tsx#L29)

**Floating pod hero behavior**

- Defines pod geometry, top peek spacing, and mobile clipping boundaries.
  [`hero-section.tsx:45`](../../villa-spa/src/components/hero/hero-section.tsx#L45)

- Keeps image/overlay radii synchronized across breakpoints.
  [`hero-section.tsx:47`](../../villa-spa/src/components/hero/hero-section.tsx#L47)

- Tunes mobile title/subtitle scale for narrow viewport readability.
  [`hero-section.tsx:101`](../../villa-spa/src/components/hero/hero-section.tsx#L101)

**Conversion and content readability**

- Adds centered SHORELINE VIBES intro block and wave separator.
  [`page.tsx:14`](../../villa-spa/src/app/page.tsx#L14)

- Introduces persistent mobile bottom BOOK NOW CTA with thumb-reach placement.
  [`page.tsx:161`](../../villa-spa/src/app/page.tsx#L161)

- Reserves bottom scroll space to avoid CTA overlap with page content.
  [`page.tsx:9`](../../villa-spa/src/app/page.tsx#L9)

**Layering utilities**

- Centralizes z-index utility intent for header, CTA, and content layers.
  [`globals.css:146`](../../villa-spa/src/app/globals.css#L146)
