---
name: safe-change
description: Safely change GSPMX public request frontend without regressions.
---
# Procedure
1. Read AGENTS.md and API_NOTES.md.
2. Identify affected handlers, API payloads, and failure paths.
3. Add tests, then make minimal changes.
4. Run npm test and inspect the diff.
5. Report unverified backend assumptions and manual checks.
Never mutate real worker records during testing.
