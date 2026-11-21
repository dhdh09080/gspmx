# Testing roadmap

## Phase 1 — this PR
Dependency-free Node.js source-contract tests: controls, request types, API operations, receipt token references, pending-only UI and escaping. These tests do NOT prove runtime behavior or backend security.

## Phase 2 — separate PR
Playwright browser tests with mocked Supabase requests: company search, create, history, edit, delete, duplicate response, failures, mobile view. Never call live mutation endpoints.

## Phase 3 — separate backend audit
Inspect Edge Function and RLS to verify site isolation, token authorization, password validation, pending-only changes and 24-hour duplicate prevention in an isolated environment.

Production deployment requires manual approval.
