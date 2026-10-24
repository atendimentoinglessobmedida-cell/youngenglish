# Dedicated Young backend

Confirmed on 2026-10-14: project `pttmctaxklaotdvnmjqc`, Inglês Sob Medida, São Paulo, PostgreSQL 17.11. Dedicated project; do not use Business.

Seven prepared SQL migrations applied and private seed imported (166 lesson IDs, 70 Premium lessons). Feedback SQL was applied manually in the official dashboard after connector request-state errors. Its automatic migration-history entry is absent: reconcile remote history before replaying local migrations. Remote hardening names `young_restrict_rls_trigger` and `young_private_rls_completion` additionally revoke public trigger execution and enable private-table RLS.

All nine tables have RLS. No anonymous table read or Young function execution. No guardian profiles, licenses or staff permissions provisioned. Remote no-identity role tests reject profile creation and teacher reads. No live Auth/contracting homologation completed. Frontend not deployed or connected in this step.

Integration next: Auth configuration, publishable key and trusted origin, account/profile UI, optional full progress sync, private Premium fetch and removal from public bundles. Refer to YOUNG-RUNTIME-DEPLOYMENT.md. Keep secrets and database passwords outside source/public output.
