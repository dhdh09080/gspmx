# Testing roadmap

## Phase 1 — source-contract tests
Node.js tests check basic frontend form IDs, request types, API operations, receipt tokens, and escaping call sites. They do **not** prove runtime behavior.

## Phase 2 — Playwright browser tests (this PR)
Run `npm install`, `npx playwright install chromium`, then `npm run test:e2e`. The test suite serves the static `index.html` locally and intercepts **all** requests to the configured Supabase origin. It uses synthetic company and worker records. The suite checks:
- missing site code blocks form
- company selection and type UI
- create request payload, receipt storage, history
- duplicate response behavior
- pending request edit/delete payloads
- mobile horizontal overflow

The CI job starts a local Python static file server. No API mutations are sent to the production Supabase host.

## Known limitations
These tests do not prove real server authorization, 24-hour deduplication, non-pending mutation denial, or token validation. The browser suite tests current behavior and may reveal bugs; do not weaken assertions merely to make CI green.

## Phase 3 — backend security validation
Review Supabase Edge Function and RLS separately using isolated backend fixtures. Verify site isolation, token authorization, password handling, pending-only mutation rules, and duplicate request enforcement.

Merge and production deployment need human review.
