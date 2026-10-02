## Metadata

- Status: In Progress
- Current Phase: 1 (Research + Plan)
- Date: 2026-10-02
- Topic: Admin books desk production hardening
- Package Manager: npm (via `package-lock.json`)
- Frontend Framework: React + Vite (via `vite.config.ts` + `react` dependency)

## Brainstorming Summary

- User intent: finish the admin books desk so publishing and editing books is production-ready without redesigning the site or breaking save, upload, reorder, auth return paths, or public library lookup.
- Codebase findings:
  - `src/routes/admin/index.tsx` currently renders create form, book list, and full editor together inside `BooksPanel`.
  - `BookEditor` already owns working metadata save, cover upload, page upload, page reorder, and page delete flows through existing server actions.
  - Admin workspace persistence already stores selected book, draft metadata, note, and restore request state in `src/lib/admin/workspace.ts`.
  - Continue-editing banner dismissal is transient-only today, so it can reappear forever after refresh.
- Constraint summary:
  - Keep `published=true` as the only “on shelf” state.
  - Reuse `adminCreateBook`, `adminUpdateBook`, `adminCreateBookPages`, `adminReorderBookPages`, `adminDeleteBookPage`, and existing Cloudinary upload flow.
  - Avoid drive-by refactors outside admin books UI and tiny helpers.

## Recommended Approach

Use one stateful books-desk shell inside `BooksPanel` with explicit modes: `hub`, `list`, `drafts`, `create`, and `edit`. Persist only the minimal workspace state needed for resume behavior and “open current editor,” then thread the existing book CRUD/upload/reorder actions through a create wizard and a page carousel instead of replacing backend contracts or splitting the admin area into new routes.

This is preferred because it preserves the current data flow and server actions while making the UI task-oriented. It avoids routing churn, avoids a risky editor rewrite, and keeps the PR centered on the exact admin books surfaces the user named.

## Alternatives Considered

- Alternative A: Nested admin routes for hub/list/create/edit.
  - Rejected because it adds routing, loader, and restore-state complexity that is unnecessary for a single admin panel change.
- Alternative B: Keep the current panel and hide/show sections conditionally.
  - Rejected because it still leaves the books tab as a crowded wall and does not clearly separate drafts flow from full-library editing.
- Alternative C: Full component extraction/refactor of the 2k-line admin file before feature work.
  - Rejected because it increases regression risk and violates the “no drive-by refactors” rule.

## Files To Modify

- `src/routes/admin/index.tsx`
  - Add books-desk hub/list/drafts/create/edit modes.
  - Add create wizard and review handoff into the editor.
  - Replace page grid with carousel controls while keeping current server actions.
  - Tighten list row metadata, editor slug helper, shelf actions, and toasts.
- `src/lib/admin/workspace.ts`
  - Add minimal persisted books-desk workspace fields needed for resume behavior and current-editor handoff.
  - Persist continue-banner dismissal so it does not reappear forever after Continue/Clear.

## Implementation Tasks

1. Workspace + mode contract
   - Add a persisted books-desk view/mode plus resume-banner dismissal state in the admin workspace helper.
   - Update admin banner actions so Continue and Clear dismiss correctly, and opening the books desk lands on the hub instead of reopening the full editor wall.
   - Verification: restore draft survives refresh; banner hides after Continue/Clear.
   - Risk: stale persisted state; mitigate with safe defaults and backward-compatible parsing.

2. Books hub and filtered pickers
   - Refactor `BooksPanel` so the default surface is a hub with four actions: edit all books, add new book, continue drafts, open current editor.
   - Add list and drafts picker views that reuse the existing loaded `adminBooks()` data, with drafts filtering on `published === false`.
   - Verification: hub appears first; drafts view only shows off-shelf books; selecting a book opens the editor.
   - Risk: selection drift after reload; mitigate by preserving current selected/draft ids through reload candidates.

3. Create wizard
   - Convert “add new book” into a step wizard with details, cover, pages, and review.
   - Create the book at the end of Details step via `adminCreateBook`, keep the created book id in wizard state, and keep the user inside the wizard for cover/pages/review.
   - Review step shows title, slug, page count, and shelf status, with actions for Save draft and Add to shelf.
   - Verification: after Details submit, the same created book continues through cover/pages/review and then opens in the editor.
   - Risk: duplicated upload logic; mitigate by extracting tiny shared helpers inside the admin file instead of changing backend APIs.

4. Editor clarity + page carousel
   - Update list rows to show title, page count, shelf status, and `/{slug}`.
   - Keep metadata save separate from explicit shelf toggle, with toasts that include the effective `/{slug}` path.
   - Replace the page grid with a one-page-at-a-time carousel plus previous/next, jump, move-to, swap-with, move up/down, delete, preview, and thumbnail/chip navigation.
   - Verification: reorder, swap, delete, preview, and upload still work; deleting the last page leaves a stable empty state.
   - Risk: page index drift after upload/delete/reorder; mitigate by clamping the active page index whenever the page array changes.

5. Verification and regression pass
   - Run TypeScript checks and a focused manual smoke of admin books flows.
   - Confirm public-library behavior is unaffected by only touching admin books UI and tiny workspace helpers.
   - Verification: `npm run typecheck`, targeted admin smoke, then build if code changed materially across shared surfaces.
   - Risk: hidden syntax/type regressions in `admin/index.tsx`; mitigate by validating immediately after edits.

## Verification Strategy

Use the existing admin flows as the regression baseline: create a draft, upload cover, upload pages, reorder pages, save metadata, toggle shelf status, and reopen the same book from the hub and continue banner. Then run `npm run typecheck` and, after implementation stabilizes, run the production build/smoke flow required by the workspace contract so the admin changes do not mask a deploy-time issue.

## Key Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Persisted workspace shape breaks old localStorage entries | HIGH | Parse new fields defensively and default missing values safely |
| Wizard and editor diverge on upload/save behavior | HIGH | Reuse existing server actions and extract only tiny shared helpers for upload/update |
| Carousel state points at the wrong page after reorder/delete/upload | MEDIUM | Derive active page from clamped index and reset predictably on page-array changes |

## Out Of Scope

- Public library page redesign or host/routing changes.
- Auth, cookie, or Deriv login return-path changes.
- Platform branding removal or admin-wide UI overhaul.
- Backend API redesign for books or pages unless a blocking bug appears.

## Open Questions

- None at plan time. If a blocking API limitation appears during wizard integration, resolve it with the smallest helper or server-call shape change needed and keep the scope inside admin books.
