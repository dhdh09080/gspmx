# GSPMX Codex engineering rules

## Scope
This repository contains the public worker-change request frontend. The administrator PMX application and Supabase Edge Function implementation are **not** in this repository. Do not assume server-side authorization or validation is verified.

## Before changing code
1. Read `README.md`, `API_NOTES.md`, and the relevant `index.html` logic.
2. Describe the current behavior, affected API contract, and rollback strategy.
3. Work on a feature branch; never push directly to `main`.
4. Keep changes narrowly scoped. Do not rewrite the static HTML application or introduce a framework without explicit approval.

## Invariants
- Public frontend creates worker change requests; it must never execute privileged PMX updates.
- Preserve the `site` query parameter validation and per-site receipt storage.
- Preserve request types: `company_change`, `retired_to_active`, `active_to_retired`.
- Preserve receipt-token usage and pending-only edit/delete UI.
- Preserve 4-digit password input and 24-hour duplicate-request messaging.
- Do not claim client-side checks enforce authorization, duplicate prevention, or status transitions: verify those in the backend separately.
- Never use real worker data or live mutation endpoints in tests.
- Do not commit cookies, PMX credentials, service-role keys, or production personal information.
- Do not modify production Supabase tables, policies, functions, or deployment without approval.

## Quality gates
- Add tests for behavior changed, including failure paths.
- Run `npm test` and report actual outcomes.
- Keep production requests mocked in tests.
- Never silence failing tests to obtain a green build.
- Report any server-side behavior not verifiable from this repository.

## Completion report
Summarize files changed, behavior preserved, commands/tests executed, limitations, deployment status, and any follow-up work.
