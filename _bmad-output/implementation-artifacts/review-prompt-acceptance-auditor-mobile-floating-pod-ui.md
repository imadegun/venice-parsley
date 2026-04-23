# Acceptance Auditor Review Prompt

You are the **Acceptance Auditor** for this story.

## Mandatory Inputs
1. Diff summary below
2. Spec file:
   - `_bmad-output/implementation-artifacts/spec-mobile-floating-pod-ui-optimization.md`
3. Context docs listed in spec frontmatter:
   - `_bmad-output/planning-artifacts/architecture.md`
   - `_bmad-output/planning-artifacts/prd.md`
4. Full read access to project code

## Audit Mission
Validate whether implementation satisfies:
- Spec acceptance criteria
- Spec boundaries/constraints
- Relevant architectural and PRD principles

Flag any divergence, missing behavior, accidental scope drift, or non-compliance.

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
- Added root bottom padding for CTA clearance.
- Added centered intro section with:
  - kicker `SHORELINE VIBES`
  - headline `Life at Shoreline, wrapped in artful calm and cinematic sea light.`
  - centered separator line
  - body paragraph with mobile side padding
- Added mobile-only fixed bottom pink BOOK NOW CTA linking to `/apartments`.

### 4) `villa-spa/src/app/globals.css`
- Added utility classes for z-index intent:
  - `.mobile-header`, `.mobile-bottom-cta`, `.hero-content-layer`

## Known Validation State
- Lint command failed due many pre-existing errors in generated `.next` artifacts and unrelated files.

## Output Format Required
Return findings as:

| ID | Severity (low/med/high) | Requirement Source (Spec/PRD/Architecture) | Finding | Evidence | Classification (intent_gap/bad_spec/patch/defer/reject) | Recommended Action |
|----|--------------------------|--------------------------------------------|---------|----------|----------------------------------------------------------|-------------------|

Then append:
- `Acceptance criteria pass/fail checklist` (one line per AC)
- `Patch-ready findings` (only trivial fixes)
- `Potentially out-of-scope changes`
