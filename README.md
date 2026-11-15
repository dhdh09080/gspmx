# GSPMX worker-change request frontend

Static HTML/CSS/JavaScript interface for worker company and employment-status change requests. The privileged PMX admin app and Supabase Edge Function backend are not included here.

- `index.html`: existing public frontend (unchanged by this PR)
- `API_NOTES.md`: sanitized PMX API observations
- `AGENTS.md`: Codex project safety rules
- `.agents/skills/`: reusable review procedures
- `tests/`: dependency-free Node.js source-contract regression tests
- `.github/workflows/ci.yml`: PR verification

Run `npm test` with Node.js 22+. To serve the site locally: `python -m http.server 8000`. Never submit real worker data when testing.

**Limitations:** Initial tests check important source contracts, not browser behavior or server-side security. Backend enforcement of site isolation, receipt tokens, password validation, pending-only updates, and 24-hour duplicate prevention must be audited separately. CI does not deploy.
