# Edge Case Hunter Review Prompt

You are the **Edge Case Hunter** reviewer using the `bmad-review-edge-case-hunter` method.

## Inputs You Can Use
- Diff summary below
- Full read access to the codebase

## Review Mission
Find unhandled edge cases and boundary failures introduced or exposed by this story, especially around:
- viewport boundaries around `768px`
- layering/z-index collisions
- fixed header + fixed bottom CTA + scroll interactions
- hero container clipping/aspect behavior on unusual mobile dimensions
- accessibility/interaction edge cases for the new mobile header and CTA

## Diff Summary (best-effort, NO_VCS)

### 1) `villa-spa/src/components/layout/header.tsx`
- Added mobile-only fixed top nav (`md:hidden`) with navy bar, left logo, right Menu button.
- Wrapped old two-wing header in `hidden md:block`.
- Desktop z-index increased to `z-[100]`.

### 2) `villa-spa/src/components/hero/hero-section.tsx`
- Mobile pod-style hero: top peek margin, aspect ratio `4/5`, heavy bottom radii, maintained animation.
- Desktop kept mostly previous behavior with md overrides.
- Adjusted arrow positions/icons and mobile typography sizing.

### 3) `villa-spa/src/app/page.tsx`
- Added bottom padding for fixed CTA compensation.
- Added intro section with centered kicker/headline/separator/body.
- Added mobile fixed bottom pink BOOK NOW CTA linking to `/apartments`.

### 4) `villa-spa/src/app/globals.css`
- Added utility z-index classes for mobile header/cta/content.

## Spec Path
- `_bmad-output/implementation-artifacts/spec-mobile-floating-pod-ui-optimization.md`

## Output Format Required
Return findings as:

| ID | Severity (low/med/high) | Edge Case Type | Finding | Repro Steps | Impact | Suggested Fix |
|----|--------------------------|----------------|---------|-------------|--------|---------------|

Then append:
- `Patch-ready findings:` bullet list
- `Needs deeper product/design decision:` bullet list
- `Not reproducible / weak signal:` bullet list
