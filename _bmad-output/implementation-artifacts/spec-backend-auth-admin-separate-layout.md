---
title: 'Backend auth/admin uses separate UI shells from frontend'
type: 'bugfix'
created: '2026-04-12T10:26:03.176Z'
status: 'done'
baseline_commit: 'db3cee4'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Backend routes still inherit frontend shell behavior, causing login/admin pages to show frontend header/footer instead of backend-specific UI expectations.

**Approach:** Isolate route-group layouts so auth pages render a simple login-only shell without header/footer and admin pages consistently render the admin sidebar/topbar shell.

## Boundaries & Constraints

**Always:** Keep frontend pages using existing global header/footer; keep login UI simple and elegant; keep admin UI using dedicated admin navigation/shell only.

**Ask First:** Any redesign beyond shell separation (new branding system, major visual overhaul, or new navigation architecture).

**Never:** Break role-protection redirects; mix frontend header/footer into auth/admin routes; introduce duplicate conflicting admin layout behavior.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| AUTH_HAPPY_PATH | User visits `/login` | Page renders only login form container in auth shell, no frontend header/footer | N/A |
| ADMIN_HAPPY_PATH | Authenticated admin visits `/admin` or subpages | Page renders admin shell (sidebar/top admin bar), no frontend header/footer | N/A |
| ADMIN_UNAUTH | Non-admin or unauthenticated visits admin route | Redirects to `/login` before rendering admin content | Existing redirect behavior preserved |

</frozen-after-approval>

## Code Map

- `villa-spa/src/app/layout.tsx` -- Root shell currently conditionally injects frontend header/footer and can unintentionally affect route groups.
- `villa-spa/src/app/(auth)/layout.tsx` -- Auth-only shell for login/register experience.
- `villa-spa/src/app/(admin)/layout.tsx` -- Primary admin route-group shell with access control and admin frame.
- `villa-spa/src/app/(auth)/login/page.tsx` -- Login form presentation requiring simple/elegant standalone UI.

## Tasks & Acceptance

**Execution:**
- [x] `villa-spa/src/app/layout.tsx` -- Remove pathname-based backend detection and ensure root layout is frontend-shell only for normal routes -- prevents accidental cross-shell leakage.
- [x] `villa-spa/src/app/(auth)/layout.tsx` -- Keep/adjust minimal auth shell to guarantee no header/footer appears for auth pages -- enforces login-only presentation.
- [x] `villa-spa/src/app/(admin)/layout.tsx` -- Ensure admin shell owns admin header/sidebar/footer decisions without inheriting frontend shell -- keeps backend UX distinct.
- [x] `villa-spa/src/app/(auth)/login/page.tsx` -- Refine classes/content for simple elegant login form and remove broken/irrelevant UI paths -- aligns with requested login UX.

**Acceptance Criteria:**
- Given a user opens `/login`, when the page renders, then no frontend header/footer is visible and a simple standalone login form is shown.
- Given an authenticated admin opens `/admin`, when the page renders, then the admin-specific shell is shown and frontend header/footer are not shown.
- Given a non-admin user opens an admin route, when authorization is evaluated, then redirect to `/login` still occurs.
- Given a user opens frontend routes like `/` or `/about`, when the page renders, then existing frontend header/footer still appear.

## Spec Change Log

## Design Notes

Route groups should own shell responsibility: root for public frontend only, `(auth)` for standalone auth pages, and `(admin)` for protected backend workspace. This avoids brittle pathname-header hacks and makes shell behavior deterministic in App Router.

## Verification

**Commands:**
- `npm run lint` -- expected: no new lint errors from updated layout/login files

**Manual checks (if no CLI):**
- Visit `/`, `/about`, `/login`, and `/admin` in dev server and verify shell separation behavior matches acceptance criteria.

## Suggested Review Order

**Shell-routing separation**

- Root layout now delegates shell choice into a dedicated route-aware component.
  [`layout.tsx:4`](../../villa-spa/src/app/layout.tsx#L4)

- Route-based frontend shell gating prevents header/footer on backend auth/admin paths.
  [`route-shell.tsx:7`](../../villa-spa/src/components/layout/route-shell.tsx#L7)

**Admin shell ownership**

- Admin route group now owns backend frame without nested document markup conflicts.
  [`layout.tsx:16`](../../villa-spa/src/app/(admin)/layout.tsx#L16)

- Admin chrome remains explicit via sidebar and top admin bar container.
  [`layout.tsx:28`](../../villa-spa/src/app/(admin)/layout.tsx#L28)

**Login simplification**

- Login page copy/styling simplified for standalone elegant admin-auth entrypoint.
  [`page.tsx:29`](../../villa-spa/src/app/(auth)/login/page.tsx#L29)

- Removed extra guest/register/forgot blocks to keep focused minimal login UX.
  [`page.tsx:38`](../../villa-spa/src/app/(auth)/login/page.tsx#L38)
