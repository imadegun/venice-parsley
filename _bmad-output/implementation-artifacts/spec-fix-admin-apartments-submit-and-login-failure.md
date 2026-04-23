---
title: 'Fix admin apartment submit errors and login failure redirects'
type: 'bugfix'
created: '2026-04-14T14:21:30Z'
status: 'done'
baseline_commit: 'NO_VCS'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Submitting apartment create/update from the admin UI fails, and login appears to fail for users who should access admin because post-login role checks resolve to guest unexpectedly.

**Approach:** Correct form parsing and boolean coercion in apartment server actions, then align role lookup to use authenticated user context so `requireRole` correctly recognizes admin roles after successful sign-in.

## Boundaries & Constraints

**Always:** Keep existing admin CRUD UX unchanged, keep current Supabase auth flow, and preserve existing field schema and DB column usage for apartments.

**Ask First:** Any DB schema migration, role model change, or redirect behavior change beyond fixing incorrect guest fallback.

**Never:** Introduce client-side role bypasses, remove role checks, or switch auth providers.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_CREATE | Valid apartment payload from `DynamicForm` with `is_active` omitted | Apartment inserted with parsed numeric fields, image fields, and `is_active` defaulting safely | N/A |
| HAPPY_PATH_LOGIN_ADMIN | Valid admin credentials and matching profile role | Login redirects to admin route without bouncing due to guest fallback | N/A |
| ERROR_BAD_IMAGES_JSON | Invalid `unified_images` JSON in action payload | Action rejects with explicit validation error | Throw controlled error message |
| ERROR_PROFILE_QUERY_CONTEXT | Authenticated user exists but profile query would fail under wrong client context | Role fetch succeeds under auth-scoped client and returns stored role | Fallback to guest only when no profile exists |

</frozen-after-approval>

## Code Map

- `villa-spa/src/app/admin/apartments/actions.ts` -- apartment create/update/delete server actions with parsing and role-guarded writes.
- `villa-spa/src/lib/auth.ts` -- role resolution and admin gating used after login and in admin routes.
- `villa-spa/src/app/(auth)/login/actions.ts` -- sign-in action and redirect flow for authentication.

## Tasks & Acceptance

**Execution:**
- [x] `villa-spa/src/app/admin/apartments/actions.ts` -- fix `is_active` coercion and harden `unified_images` parsing so submit no longer silently forces true or crashes on malformed payload -- eliminates apartment submit failures from inconsistent form inputs.
- [x] `villa-spa/src/lib/auth.ts` -- fetch user role via auth-scoped server client and preserve safe fallback semantics -- ensures logged-in admins are not treated as guest due to client context mismatch.
- [x] `villa-spa/src/app/(auth)/login/actions.ts` -- keep sign-in flow but ensure error redirect behavior remains deterministic with existing form usage -- prevents perceived login failure loops.

**Acceptance Criteria:**
- Given valid apartment form values, when admin submits create or update, then the action writes records successfully and revalidates the apartments page.
- Given a valid authenticated admin user with profile role `admin` or `administrator`, when requesting guarded admin routes after login, then `requireRole` authorizes access without redirecting to `/`.
- Given invalid `unified_images` payload, when apartment action parses request data, then it returns a clear validation error instead of unhandled JSON parse failure.

## Spec Change Log

## Design Notes

Use explicit helper parsing for structured form fields (`unified_images`) and compute booleans without unconditional `|| true` so unchecked values are representable and defaults are applied only when input is absent.

For auth role lookup, use the cookie-aware auth client in role reads that are tied to current session identity; this keeps RLS/session context aligned with login state and avoids guest fallback caused by service-role/session mismatch.

## Verification

**Commands:**
- `npm run lint` -- expected: no new lint errors in modified files.

**Manual checks (if no CLI):**
- Sign in with admin account and verify redirect lands on admin pages without immediate bounce.
- Create and update an apartment from admin UI and confirm rows persist with expected `is_active`, `image_url`, and gallery values.

## Suggested Review Order

**Apartment submit parsing hardening**

- Replaces fragile JSON parse path with validated helpers and controlled errors.
  [`actions.ts:26`](../../../villa-spa/src/app/admin/apartments/actions.ts#L26)

- Ensures create path uses safe image parsing and deterministic boolean coercion.
  [`actions.ts:69`](../../../villa-spa/src/app/admin/apartments/actions.ts#L69)

- Mirrors parsing fix in update path to keep behavior consistent.
  [`actions.ts:127`](../../../villa-spa/src/app/admin/apartments/actions.ts#L127)

**Post-login role resolution correctness**

- Uses server-side privileged client for profile role reads in guard flow.
  [`auth.ts:41`](../../../villa-spa/src/lib/auth.ts#L41)
