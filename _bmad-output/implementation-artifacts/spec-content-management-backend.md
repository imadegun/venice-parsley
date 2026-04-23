---
title: 'Content Management Backend APIs and Persistence'
type: 'feature'
created: '2026-04-12T06:24:00Z'
status: 'in-progress'
baseline_commit: '41acf163b0ec11c982c92650c93d247f76ed61c4'
context: ['{project-root}/_bmad-output/planning-artifacts/prd.md', '{project-root}/_bmad-output/planning-artifacts/architecture.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Website content is currently stored in memory and mock values, so admin content updates are not persisted and cannot be managed safely through backend APIs.

**Approach:** Implement database-backed content storage with admin-only Next.js API routes for read/update/publish and revision history, then switch runtime content reads to DB-backed access with safe fallback behavior.

## Boundaries & Constraints

**Always:** Keep scope limited to content management only; require admin/administrator role for write operations; validate payloads with Zod before DB writes; preserve existing bilingual content shape (`en`/`it`); keep public reads safe and cache-friendly.

**Ask First:** Any schema changes that break existing homepage rendering contract; introducing external CMS products; deleting legacy in-memory module without a rollback path.

**Never:** Implement image upload/storage in this scope; implement user management in this scope; expose admin write endpoints without role checks; write raw unvalidated JSON directly to DB.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Get section (admin) | `GET /api/admin/content/homepage` and section exists | 200 + normalized section payload with metadata | N/A |
| Upsert draft content | `PATCH /api/admin/content/homepage` with valid bilingual payload | 200 + saved draft version increment | Validation errors return 400 with field details |
| Publish content | `POST /api/admin/content/publish` for existing draft | 200 + status set to published + revision record | Missing section returns 404 |
| Unauthorized write | Non-admin user calls admin write endpoint | 403 + standardized error body | No DB mutation |
| Invalid schema | Missing required `hero.title.en` or wrong type | 400 + validation issue list | No DB mutation |
| Read fallback | DB unavailable on public page read | Existing UI still renders using in-memory fallback | Log error and return fallback content |

</frozen-after-approval>

## Code Map

- `_bmad-output/planning-artifacts/prd.md` -- FR-25 and admin management context for content operations.
- `_bmad-output/planning-artifacts/architecture.md` -- backend stack, API style, auth/role constraints.
- `villa-spa/src/lib/content.ts` -- current in-memory source to be converted into DB-backed read facade.
- `villa-spa/src/lib/auth.ts` -- role guard and user role lookup for admin API protection.
- `villa-spa/src/lib/supabase.ts` -- server-side Supabase client used by API route handlers.
- `villa-spa/src/types/database.ts` -- generated DB typings to extend with content tables.
- `villa-spa/src/app/(admin)/content/home/page.tsx` -- admin content UI currently using mock values.
- `villa-spa/src/components/hero/hero-section.tsx` -- runtime hero read path that must continue to work after persistence.

## Tasks & Acceptance

**Execution:**
- [x] `villa-spa/database-schema.sql` -- add `content_sections` and `content_revisions` tables with indexes and updated timestamp triggers -- establish persistent content model.
- [x] `villa-spa/src/types/database.ts` -- extend `Database` type with `content_sections` and `content_revisions` row/insert/update contracts -- keep strict typed DB access.
- [x] `villa-spa/src/lib/content-schema.ts` -- add Zod schemas for content keys (`homepage`, `about`, `contact`) and bilingual payload validation -- ensure trusted input.
- [x] `villa-spa/src/lib/content-service.ts` -- implement DB content read/write/publish helpers and revision creation -- centralize business logic.
- [x] `villa-spa/src/app/api/admin/content/[key]/route.ts` -- implement `GET` and `PATCH` admin endpoints with admin-role checks and schema validation -- enable secure management.
- [x] `villa-spa/src/app/api/admin/content/publish/route.ts` -- implement publish endpoint to move draft to published state and append revision record -- complete editorial flow.
- [x] `villa-spa/src/lib/content.ts` -- refactor public getters to read published content from DB with fallback to existing in-memory defaults -- preserve UX during migration.
- [x] `villa-spa/src/app/(admin)/content/home/page.tsx` and `villa-spa/src/app/(admin)/content/home/actions.ts` -- replace mock content fetch path with real DB-backed save/publish server actions -- make admin page functional.
- [x] `villa-spa` targeted verification -- run ESLint against all changed content/backend files and confirm zero errors in touched scope.

**Acceptance Criteria:**
- Given an admin updates homepage content with valid bilingual payload, when `PATCH /api/admin/content/homepage` is called, then the section is persisted and returned with updated version metadata.
- Given a non-admin user calls any admin content write endpoint, when authorization runs, then response is 403 and no content data changes.
- Given draft content exists, when `POST /api/admin/content/publish` is called, then section status becomes published and a revision entry is created.
- Given public homepage render requests content, when DB content is available, then published content is used; otherwise fallback content is served without page crash.

## Spec Change Log

## Design Notes

Use key-based content sections to avoid hard-coding many columns and to support future pages without migrations:

```ts
type ContentSection = {
  key: 'homepage' | 'about' | 'contact'
  locale: 'multi'
  payload: Record<string, unknown>
  status: 'draft' | 'published'
  version: number
}
```

Publishing snapshots the draft payload into `content_revisions` so rollback can be implemented without schema redesign.

## Verification

**Commands:**
- `npm run lint` -- expected: no new lint errors in API/content modules
- `npm run test -- content` -- expected: content route tests pass
- `npx eslint src/lib/content-schema.ts src/lib/content-service.ts src/app/api/admin/content/[key]/route.ts src/app/api/admin/content/publish/route.ts src/lib/content.ts src/components/hero/hero-section.tsx src/app/page.tsx src/app/(admin)/content/home/actions.ts src/app/(admin)/content/home/page.tsx src/types/database.ts` -- expected: 0 errors for changed scope (warnings may remain from pre-existing code)

**Manual checks (if no CLI):**
- Open admin content home and save content; verify reload shows persisted values.
- Call publish endpoint and verify published content appears on homepage hero text.

