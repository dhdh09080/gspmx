# Architecture snapshot

Confirmed: single static index.html with inline CSS and vanilla JS; Supabase REST worker_change_companies lookup; Edge Function worker-change-site for create/history/update/delete; site URL parameter and site-scoped localStorage receipts.

Not present in repository: Supabase Edge Function source, RLS policies, database schema, privileged PMX admin update logic, deployment configuration.

Keep index.html unchanged during the quality foundation stage. Consider splitting CSS/JS only after browser regression coverage exists.
