How to remove unusable events, starting from a compressed backup of the database.

```sh
gzip -d postgres-backup-2026-04-17.sql.gz
psql -h localhost -U pytamaro < postgres-backup-2026-04-17.sql
psql -h localhost -U pytamaro < ~/repos/pytamaro-web/tools/export-db/remove_unusable_events.sql
pg_dump -h localhost -U pytamaro export > ~/Desktop/dump20251211-20260417.sql
gzip -9 ~/Desktop/dump20251211-20260417.sql
```
