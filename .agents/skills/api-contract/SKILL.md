---
name: api-contract
description: Review frontend Supabase API request and response compatibility.
---
# Procedure
1. Inventory company lookup and create/history/update/delete contracts.
2. Compare request fields and response handling with index.html.
3. Distinguish frontend checks from server-enforced authorization.
4. Flag site isolation, token scope, password validation, pending-only changes, and duplicate prevention as unverified without backend evidence.
5. Use synthetic data and mocks only. Report compatibility risks.
