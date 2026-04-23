# Blind Hunter Review Prompt

You are the **Blind Hunter** reviewer using the `bmad-review-adversarial-general` method.

## Constraints
- You receive **diff-only** context below.
- You have **no access** to project files, specs, or repository history.
- Find defects, regressions, UX breakpoints, accessibility risks, and implementation inconsistencies from diff evidence only.
- Return concise, actionable findings.

## Story Context (minimal)
Mobile optimization for homepage under 768px with:
- single fixed mobile header
- floating pod hero shape
- persistent bottom BOOK NOW CTA
- centered intro typography and improved mobile readability

## Diff Summary (best-effort, NO_VCS)

### 1) `villa-spa/src/components/layout/header.tsx`
- Added **mobile-only** fixed top nav (`md:hidden`) with navy background (`#10223f`), logo left, `Menu` button right.
- Wrapped previous desktop two-wing header inside `hidden md:block`.
- Increased desktop header z-index values to `z-[100]`.
- Mobile BOOK NOW top tab removed implicitly by desktop-only wrapping.

### 2) `villa-spa/src/components/hero/hero-section.tsx`
- Hero wrapper changed from full-screen section to responsive rounded pod container:
  - mobile: `mt-[10px]`, `aspect-[4/5]`, `h-[min(80vh,700px)]`, `rounded-bl/br-[60px]`, `z-[1]`
  - desktop: `md:h-screen`, `md:aspect-auto`, `md:rounded-bl/br-[40px]`
- Background, overlay, top fade rounded corners adjusted to match mobile/desktop radii.
- Arrow controls tightened for mobile spacing and icon size.
- Hero text size reduced on mobile (`text-[30px]`), subtitle reduced to `text-base` with horizontal padding.
- Indicator row moved up on mobile (`bottom-16` vs desktop `bottom-24`).

### 3) `villa-spa/src/app/page.tsx`
- Added root bottom padding `pb-24 md:pb-0`.
- Added new intro section under hero:
  - kicker: `SHORELINE VIBES`
  - headline: `Life at Shoreline, wrapped in artful calm and cinematic sea light.`
  - centered wave-like separator line
  - body paragraph with mobile side padding `px-[30px]`
- Added mobile-only fixed bottom CTA:
  - class `mobile-bottom-cta`
  - pink background, rounded top corners, drop shadow
  - links to `/apartments`

### 4) `villa-spa/src/app/globals.css`
- Added utility classes:
  - `.mobile-header { z-index: 100; }`
  - `.mobile-bottom-cta { z-index: 100; }`
  - `.hero-content-layer { z-index: 1; }`

## Known Validation State
- `npm run lint` executed and failed due large pre-existing lint issues, mainly in `.next` generated files and unrelated warnings.

## Output Format Required
Return findings as a table:

| ID | Severity (low/med/high) | Category | Finding | Evidence from Diff | Suggested Fix |
|----|--------------------------|----------|---------|--------------------|---------------|

Then append:
- `Patch-ready findings:` bullet list (only issues trivially fixable)
- `Needs spec clarification:` bullet list
- `Likely false positives:` bullet list
